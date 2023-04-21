import type {
  ISchemaAny,
  ValidatedEventAPIGatewayProxyEvent,
} from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { deleteMovie, selectMovie } from '@query/movie';
import createHttpError from 'http-errors';
import isObject from 'lodash/isObject';
import { object, string } from 'yup';

const moviePathSchema = object({
  movieId: string().required(),
});

const movieDeleteFunction: ValidatedEventAPIGatewayProxyEvent<
  ISchemaAny,
  typeof moviePathSchema,
  ISchemaAny
> = async (event) => {
  const { movieId } = event.pathParameters;

  try {
    await selectMovie({ movieId });
  } catch (err) {
    if (isObject(err) && 'message' in err && err.message === 'movie not found')
      throw createHttpError(404, {
        code: 'entitiy_not_found',
        message: 'movie is not found.',
      });
    else throw err;
  }
  await deleteMovie({ movieId });

  return formatJSONResponse({}, 204);
};

export const movieDelete = middyfy({
  handler: movieDeleteFunction,
  eventSchema: { pathParameterSchema: moviePathSchema },
});
