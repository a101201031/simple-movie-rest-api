import type {
  ISchemaAny,
  ValidatedEventAPIGatewayProxyEvent,
} from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import {
  deleteMovie,
  insertMovie,
  selectMovie,
  selectMovieList,
  updateMovie,
} from '@query/movie';
import {
  movieCreateBodySchema,
  movieListReadQuerySchema,
  moviePathSchema,
  movieUpdateBodySchema,
} from '@schema/movie';
import cuid from 'cuid';
import map from 'lodash/map';

const movieListReadFunction: ValidatedEventAPIGatewayProxyEvent<
  ISchemaAny,
  ISchemaAny,
  typeof movieListReadQuerySchema
> = async (event) => {
  const { limit, offset } = event.queryStringParameters;

  const movieListSelect = await selectMovieList(event.queryStringParameters);

  const total = movieListSelect[0]?.total || 0;
  const movies = map(movieListSelect, (v) => ({
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
  const movieId = cuid();
  await insertMovie({ ...event.body, movieId });

  const movie = await selectMovie({ movieId });
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
  const { movieId } = event.pathParameters;

  const movie = await selectMovie(movieId);
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
  const { movieId } = event.pathParameters;
  await updateMovie({ ...event.body, movieId });

  const movie = await selectMovie({ movieId });
  return formatJSONResponse({
    movie: {
      ...movie,
      runningTime: Math.floor(movie.runningTime / 60 / 1000),
    },
  });
};

const movieDeleteFunction: ValidatedEventAPIGatewayProxyEvent<
  ISchemaAny,
  typeof moviePathSchema,
  ISchemaAny
> = async (event) => {
  const { movieId } = event.pathParameters;

  await selectMovie({ movieId });
  await deleteMovie({ movieId });

  return formatJSONResponse({}, 204);
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

export const movieDelete = middyfy({
  handler: movieDeleteFunction,
  eventSchema: { pathParameterSchema: moviePathSchema },
});
