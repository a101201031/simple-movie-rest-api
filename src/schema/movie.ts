import type {
  MovieActorModel,
  MovieCrewModel,
  MovieGenreModel,
  MovieModel,
} from '@model/movie';
import { array, date, number, object, string } from 'yup';

type MovieOption = keyof Omit<MovieModel, 'movieId'> | 'id';

const moiveOption: MovieOption[] = [
  'id',
  'title',
  'rating',
  'releasedAt',
  'runningTime',
];

const movieGenreTypes: MovieGenreModel['genreType'][] = [
  'action',
  'comedy',
  'horror',
  'musical',
  'horror',
  'romance',
  'war',
];

const movieCrewTypes: MovieCrewModel['crewType'][] = ['director'];

const movieActorTypes: MovieActorModel['actorType'][] = ['main', 'sub'];

export const movieListReadSchema = object({
  title: string().default(''),
  rating: number().min(0).max(100).default(0),
  runningTimeStart: number().min(0).max(864000000).default(0),
  runningTimeEnd: number().min(0).max(864000000).default(864000000),
  releasedAtStart: date()
    .min(new Date('1900-01-01T00:00:01Z'))
    .default(() => new Date('1900-01-01T00:00:01Z')),
  releasedAtEnd: date()
    .min(new Date('1900-01-01T00:00:01Z'))
    .default(() => new Date()),
  limit: number().default(20),
  offset: number().default(0),
  sortBy: string().oneOf(moiveOption).default('id'),
  orderBy: string().oneOf(['asc', 'desc']).default('asc'),
});

export const movieReadSchema = object({
  movieId: string(),
});

export const movieCreateSchema = object({
  title: string().required().trim(),
  rating: number().min(0).max(100).default(0),
  releasedAt: date().required(),
  runningTime: number().required().min(0).max(864000000),
  genres: array()
    .of(
      object({
        type: string().oneOf(movieGenreTypes).required(),
      }),
    )
    .required(),
  crews: array()
    .of(
      object({
        type: string().oneOf(movieCrewTypes).required(),
        personName: string().required(),
      }),
    )
    .required(),
  actors: array()
    .of(
      object({
        type: string().oneOf(movieActorTypes).required(),
        personName: string().required(),
        character: string().required(),
      }),
    )
    .required(),
}).required();
