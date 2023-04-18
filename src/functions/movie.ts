import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { cursorAll, databaseConnector } from '@libs/database';
import { middyfy } from '@libs/lambda';
import type {
  MovieActorModel,
  MovieCrewModel,
  MovieGenreModel,
  MovieModel,
} from '@model/movie';
import type { movieReadSchema } from '@schema/movie';
import { movieListReadSchema } from '@schema/movie';
import createHttpError from 'http-errors';
import map from 'lodash/map';

const movieListReadFunction: ValidatedEventAPIGatewayProxyEvent<
  any,
  any,
  typeof movieListReadSchema
> = async (event) => {
  const db = await databaseConnector.getCursor();

  const {
    title,
    rating,
    limit,
    offset,
    runningTimeStart,
    runningTimeEnd,
    releasedAtStart,
    releasedAtEnd,
    sortBy,
    orderBy,
  } = event.queryStringParameters;

  const orderByQuery = `${sortBy} ${orderBy}`;

  const movieSelect = await cursorAll(db, {
    sql: `
      SELECT
        movie_id AS id,
        title,
        rating,
        released_at AS releasedAt,
        running_time AS runningTime,
        COUNT(*) OVER () AS total
      FROM movie
      WHERE
        title LIKE ?
        and rating >= ?
        and releasedAt BETWEEN ? AND ?
        and runningTime BETWEEN ? AND ?
      ORDER BY ${orderByQuery}
      LIMIT ? OFFSET ?
    `,
    values: [
      `%${title}%`,
      rating,
      releasedAtStart.toISOString(),
      releasedAtEnd.toISOString(),
      runningTimeStart,
      runningTimeEnd,
      limit,
      offset,
    ],
  });

  const total = movieSelect[0]?.total || 0;
  const movies = map(movieSelect, (v) => ({
    id: v.id,
    title: v.title,
    rating: v.rating,
    releasedAt: v.releasedAt,
    runningTime: Math.floor(v.runningTime / 60 / 1000),
  }));

  return formatJSONResponse({
    movies,
    paging: {
      limit,
      offset,
      total,
    },
  });
};

const movieReadFunction: ValidatedEventAPIGatewayProxyEvent<
  any,
  any,
  typeof movieReadSchema
> = async (event) => {
  const db = await databaseConnector.getCursor();

  const { movieId } = event.pathParameters;

  const movieSelect = await cursorAll<
    Array<Omit<MovieModel, 'movieId'> & { id: string }>
  >(db, {
    sql: `
      SELECT
        movie_id AS id,
        title,
        rating,
        released_at AS releasedAt,
        running_time AS runningTime
      FROM movie
      WHERE
        id = ?
    `,
    values: [movieId],
  });

  if (!movieSelect.length) {
    throw createHttpError(404, {
      code: 'entitiy_not_found',
      message: 'movie is not found.',
    });
  }

  const movieGenreSelect = await cursorAll<Array<MovieGenreModel>>(db, {
    sql: `
      SELECT
        genre_type AS genreType
      FROM movie_genre
      WHERE
        movie_id = ?
    `,
    values: [movieId],
  });

  const movieCrewSelect = await cursorAll<Array<MovieCrewModel>>(db, {
    sql: `
      SELECT
        crew_type AS crewType,
        person_name AS personName
      FROM movie_crew
      WHERE
        movie_id = ?
    `,
    values: [movieId],
  });

  const movieActorSelect = await cursorAll<Array<MovieActorModel>>(db, {
    sql: `
      SELECT
        actor_type AS actorType,
        person_name AS personName,
        character
      FROM movie_actor
      WHERE
        movie_id = ?
    `,
    values: [movieId],
  });

  const movie = {
    ...movieSelect[0],
    genres: movieGenreSelect,
    crews: movieCrewSelect,
    actors: movieActorSelect,
  };

  return formatJSONResponse({
    movie,
  });
};

export const movieListRead = middyfy({
  handler: movieListReadFunction,
  eventSchema: { queryParameterSchema: movieListReadSchema },
});

export const movieRead = middyfy({
  handler: movieReadFunction,
});
