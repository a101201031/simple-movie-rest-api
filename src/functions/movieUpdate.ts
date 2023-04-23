import type {
  ISchemaAny,
  ValidatedEventAPIGatewayProxyEvent,
} from '@libs/apiGateway';
import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import {
  moviePathSchema,
  movieUpdateBodySchema,
  selectMovie,
  updateMovie,
} from '@query/movie';
import createHttpError from 'http-errors';
import isObject from 'lodash/isObject';

const movieUpdateFunction: ValidatedEventAPIGatewayProxyEvent<
  typeof movieUpdateBodySchema,
  typeof moviePathSchema,
  ISchemaAny
> = async (event) => {
  const { movieId } = event.pathParameters;

  try {
    await updateMovie({ ...event.body, movieId });
  } catch (err) {
    if (isObject(err) && 'message' in err && err.message === 'movie not found')
      throw createHttpError(404, {
        code: 'entitiy_not_found',
        message: 'movie is not found.',
      });
    else throw err;
  }

  const movie = await selectMovie({ movieId });

  return formatJSONResponse({
    movie: {
      ...movie,
      runningTime: Math.floor(movie.runningTime / 60 / 1000),
    },
  });
};

export const movieUpdate = middyfy({
  handler: movieUpdateFunction,
  eventSchema: {
    bodyParameterSchema: movieUpdateBodySchema,
    pathParameterSchema: moviePathSchema,
  },
});
