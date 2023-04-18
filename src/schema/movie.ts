import type { MovieModel } from '@model/movie';
import { date, number, object, string } from 'yup';

type MovieOption = keyof Omit<MovieModel, 'movieId'> | 'id';

const moiveOption: MovieOption[] = [
  'id',
  'title',
  'rating',
  'releasedAt',
  'runningTime',
];

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
