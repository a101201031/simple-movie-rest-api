import type {
  ISchemaAny,
  ValidatedEventAPIGatewayProxyEvent,
} from '@libs/apiGateway';
import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import { moviePathSchema, selectMovie } from '@query/movie';
import createHttpError from 'http-errors';
import isObject from 'lodash/isObject';

const movieReadFunction: ValidatedEventAPIGatewayProxyEvent<
  ISchemaAny,
  typeof moviePathSchema,
  ISchemaAny
> = async (event) => {
  const { movieId } = event.pathParameters;

  let movie;
  try {
    movie = await selectMovie({ movieId });
  } catch (err) {
    if (isObject(err) && 'message' in err && err.message === 'movie not found')
      throw createHttpError(404, {
        code: 'entitiy_not_found',
        message: 'movie is not found.',
      });
    else throw err;
  }

  return formatJSONResponse({
    movie: {
      ...movie,
      runningTime: Math.floor(movie.runningTime / 60 / 1000),
    },
  });
};

export const movieRead = middyfy({
  handler: movieReadFunction,
  eventSchema: { pathParameterSchema: moviePathSchema },
});
