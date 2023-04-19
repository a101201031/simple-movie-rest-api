import type {
  ISchemaAny,
  ValidatedEventAPIGatewayProxyEvent,
} from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { cursorAll, cursorRun, databaseConnector } from '@libs/database';
import { middyfy } from '@libs/lambda';
import type {
  MovieActorModel,
  MovieCrewModel,
  MovieGenreModel,
  MovieModel,
} from '@model/movie';
import {
  movieCreateBodySchema,
  movieListReadQuerySchema,
  moviePathSchema,
  movieUpdateBodySchema,
} from '@schema/movie';
import cuid from 'cuid';
import createHttpError from 'http-errors';
import forEach from 'lodash/forEach';
import isEqual from 'lodash/isEqual';
import join from 'lodash/join';
import map from 'lodash/map';
import type { Database } from 'sqlite3';

const selectMovie = async (db: Database, movieId: string) => {
  const movieSelect = await cursorAll<
    Array<Omit<MovieModel, 'movieId'> & { id: string }>
  >(db, {
    sql: `
      SELECT
        id,
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
        type
      FROM movie_genre
      WHERE
        movie_id = ?
    `,
    values: [movieId],
  });

  const movieCrewSelect = await cursorAll<Array<MovieCrewModel>>(db, {
    sql: `
      SELECT
        type,
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
        type,
        person_name AS personName,
        character
      FROM movie_actor
      WHERE
        movie_id = ?
    `,
    values: [movieId],
  });

  return {
    ...movieSelect[0],
    genres: movieGenreSelect,
    crews: movieCrewSelect,
    actors: movieActorSelect,
  };
};

const movieListReadFunction: ValidatedEventAPIGatewayProxyEvent<
  ISchemaAny,
  ISchemaAny,
  typeof movieListReadQuerySchema
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
        id,
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

const movieCreateFunction: ValidatedEventAPIGatewayProxyEvent<
  typeof movieCreateBodySchema
> = async (event) => {
  const db = await databaseConnector.getCursor();
  const { title, rating, releasedAt, runningTime, genres, crews, actors } =
    event.body;
  const movieId = cuid();

  try {
    await cursorRun(db, { sql: `BEGIN` });
    await cursorRun(db, {
      sql: `
        INSERT INTO movie
        (
          id,
          title,
          rating,
          released_at,
          running_time
        ) values
        (
          ?, ?, ?, ?, ?
        )
      `,
      values: [movieId, title, rating, releasedAt.toISOString(), runningTime],
    });
    await Promise.all(
      map(genres, (v) => {
        cursorRun(db, {
          sql: `
            INSERT INTO movie_genre
            (
              movie_id,
              type
            ) values
            (
              ?, ?
            )
          `,
          values: [movieId, v.type],
        });
      }),
    );
    await Promise.all(
      map(crews, (v) => {
        cursorRun(db, {
          sql: `
            INSERT INTO movie_crew
            (
              movie_id,
              type,
              person_name
            ) values
            (
              ?, ?, ?
            )
          `,
          values: [movieId, v.type, v.personName],
        });
      }),
    );
    await Promise.all(
      map(actors, async (v) => {
        await cursorRun(db, {
          sql: `
            INSERT INTO movie_actor
            (
              movie_id,
              type,
              person_name,
              character
            ) values
            (
              ?, ?, ?, ?
            )
          `,
          values: [movieId, v.type, v.personName, v.character],
        });
      }),
    );
    await cursorRun(db, { sql: `COMMIT` });
  } catch (err) {
    await cursorRun(db, { sql: `ROLLBACK` });
    throw err;
  }

  const movie = await selectMovie(db, movieId);
  return formatJSONResponse({
    movie: {
      ...movie,
      runningTime: Math.floor(movie.runningTime / 60 / 1000),
    },
  });
};

const movieReadFunction: ValidatedEventAPIGatewayProxyEvent<
  ISchemaAny,
  ISchemaAny,
  typeof moviePathSchema
> = async (event) => {
  const db = await databaseConnector.getCursor();
  const { movieId } = event.pathParameters;

  const movie = await selectMovie(db, movieId);
  return formatJSONResponse({
    movie: {
      ...movie,
      runningTime: Math.floor(movie.runningTime / 60 / 1000),
    },
  });
};

const movieUpdateFunction: ValidatedEventAPIGatewayProxyEvent<
  typeof movieUpdateBodySchema,
  typeof moviePathSchema,
  ISchemaAny
> = async (event) => {
  const db = await databaseConnector.getCursor();
  const { movieId } = event.pathParameters;
  const { body } = event;

  const originMovie: { [key: string]: any } = await selectMovie(db, movieId);

  const bodyMovie = {
    runningTime: body.runningTime,
    releasedAt: body.releasedAt?.toISOString(),
    rating: body.rating,
    title: body.title,
  };

  const modify: { [key: string]: any } = {};
  forEach(bodyMovie, (v, k) => {
    if (v && v !== originMovie[k]) modify[k] = v;
  });

  try {
    await cursorRun(db, { sql: `BEGIN` });

    if (!isEqual(modify, {})) {
      const updateQuery: { sql: string; values: any[] } = {
        sql: `
          UPDATE movie
          SET `,
        values: [],
      };
      const columnList: string[] = [];

      forEach(modify, (v, k) => {
        columnList.push(
          `${k.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)} = ? `,
        );
        updateQuery.values.push(v);
      });
      updateQuery.sql += `
        ${join(columnList, ',')} 
        WHERE id = ?
      `;
      updateQuery.values.push(movieId);

      await cursorRun(db, updateQuery);
    }

    if (body.genres) {
      await cursorRun(db, {
        sql: `DELETE FROM movie_genre WHERE movie_id = ?`,
        values: [movieId],
      });
      await Promise.all(
        map(body.genres, (v) => {
          cursorRun(db, {
            sql: `
              INSERT INTO movie_genre
              (
                movie_id,
                type
              ) values
              (
                ?, ?
              )
            `,
            values: [movieId, v.type],
          });
        }),
      );
    }
    if (body.crews) {
      await cursorRun(db, {
        sql: `DELETE FROM movie_crew WHERE movie_id = ?`,
        values: [movieId],
      });
      await Promise.all(
        map(body.crews, (v) => {
          cursorRun(db, {
            sql: `
              INSERT INTO movie_crew
              (
                movie_id,
                type,
                person_name
              ) values
              (
                ?, ?, ?
              )
            `,
            values: [movieId, v.type, v.personName],
          });
        }),
      );
    }

    if (body.actors) {
      await cursorRun(db, {
        sql: `DELETE FROM movie_actor WHERE movie_id = ?`,
        values: [movieId],
      });
      await Promise.all(
        map(body.actors, async (v) => {
          await cursorRun(db, {
            sql: `
              INSERT INTO movie_actor
              (
                movie_id,
                type,
                person_name,
                character
              ) values
              (
                ?, ?, ?, ?
              )
            `,
            values: [movieId, v.type, v.personName, v.character],
          });
        }),
      );
    }

    await cursorRun(db, { sql: `COMMIT` });
  } catch (err) {
    await cursorRun(db, { sql: `ROLLBACK` });
    throw err;
  }

  const movie = await selectMovie(db, movieId);
  return formatJSONResponse({
    movie: {
      ...movie,
      runningTime: Math.floor(movie.runningTime / 60 / 1000),
    },
  });
};

export const movieListRead = middyfy({
  handler: movieListReadFunction,
  eventSchema: { queryParameterSchema: movieListReadQuerySchema },
});

export const movieCreate = middyfy({
  handler: movieCreateFunction,
  eventSchema: { bodyParameterSchema: movieCreateBodySchema },
});

export const movieRead = middyfy({
  handler: movieReadFunction,
  eventSchema: { pathParameterSchema: moviePathSchema },
});

export const movieUpdate = middyfy({
  handler: movieUpdateFunction,
  eventSchema: {
    bodyParameterSchema: movieUpdateBodySchema,
    pathParameterSchema: moviePathSchema,
  },
});
