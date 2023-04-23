import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import { insertMovie, movieCreateBodySchema, selectMovie } from '@query/movie';
import cuid from 'cuid';

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

export const movieCreate = middyfy({
  handler: movieCreateFunction,
  eventSchema: { bodyParameterSchema: movieCreateBodySchema },
});
