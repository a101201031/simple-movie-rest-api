import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import type {
  MovieActorModel,
  MovieCrewModel,
  MovieGenreModel,
} from '@model/movie';
import { insertMovie, selectMovie } from '@query/movie';
import cuid from 'cuid';
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

export const movieCreateBodySchema = object({
  title: string().required().trim(),
  rating: number().min(0).max(100).default(0),
  releasedAt: date().min(new Date('1900-01-01T00:00:00Z')).required(),
  runningTime: number().required().min(0).max(864000000),
  genres: array()
    .of(
      object({
        type: string().oneOf(movieGenreTypes).required(),
      }),
    )
    .test(uniqueTest.name, uniqueTest.message, uniqueTest.test)
    .required(),
  crews: array()
    .of(
      object({
        type: string().oneOf(movieCrewTypes).required(),
        personName: string().required(),
      }),
    )
    .test(uniqueTest.name, uniqueTest.message, uniqueTest.test)
    .required(),
  actors: array()
    .of(
      object({
        type: string().oneOf(movieActorTypes).required(),
        personName: string().required(),
        character: string().required(),
      }),
    )
    .test(uniqueTest.name, uniqueTest.message, uniqueTest.test)
    .required(),
}).required();

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
