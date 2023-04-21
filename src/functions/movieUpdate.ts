import type {
  ISchemaAny,
  ValidatedEventAPIGatewayProxyEvent,
} from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import type {
  MovieActorModel,
  MovieCrewModel,
  MovieGenreModel,
} from '@model/movie';
import { selectMovie, updateMovie } from '@query/movie';
import createHttpError from 'http-errors';
import isObject from 'lodash/isObject';
import map from 'lodash/map';
import { array, date, number, object, string } from 'yup';

const movieGenreTypes: MovieGenreModel['type'][] = [
  'action',
  'comedy',
  'horror',
  'musical',
  'horror',
  'romance',
  'war',
];

const movieCrewTypes: MovieCrewModel['type'][] = ['director'];

const movieActorTypes: MovieActorModel['type'][] = ['main', 'sub'];

const uniqueTest = {
  name: 'unique',
  message: ({ path }: { path: string }) => `${path} must be unique`,
  test: (arr: any[] | undefined) =>
    !arr
      ? true
      : arr.length ===
        new Map(map(arr, (item) => [JSON.stringify(item), null])).size,
};

export const movieUpdateBodySchema = object({
  title: string().trim(),
  rating: number().min(0).max(100),
  releasedAt: date().min(new Date('1900-01-01T00:00:00Z')),
  runningTime: number().min(0).max(864000000),
  genres: array()
    .of(
      object({
        type: string().oneOf(movieGenreTypes).required(),
      }),
    )
    .test(uniqueTest.name, uniqueTest.message, uniqueTest.test),
  crews: array()
    .of(
      object({
        type: string().oneOf(movieCrewTypes).required(),
        personName: string().required(),
      }),
    )
    .test(uniqueTest.name, uniqueTest.message, uniqueTest.test),
  actors: array()
    .of(
      object({
        type: string().oneOf(movieActorTypes).required(),
        personName: string().required(),
        character: string().required(),
      }),
    )
    .test(uniqueTest.name, uniqueTest.message, uniqueTest.test),
}).required();

const moviePathSchema = object({
  movieId: string().required(),
});

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
