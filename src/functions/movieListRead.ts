import type {
  ISchemaAny,
  ValidatedEventAPIGatewayProxyEvent,
} from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import type { MovieModel } from '@model/movie';
import { selectMovieList } from '@query/movie';
import map from 'lodash/map';
import { date, number, object, string } from 'yup';

const moiveOption: Array<keyof MovieModel> = [
  'id',
  'title',
  'rating',
  'releasedAt',
  'runningTime',
];

export const movieListReadQuerySchema = object({
  title: string().default(''),
  rating: number().min(0).max(100).default(0),
  runningTimeStart: number().min(0).max(864000000).default(0),
  runningTimeEnd: number().min(0).max(864000000).default(864000000),
  releasedAtStart: date()
    .min(new Date('1900-01-01T00:00:00Z'))
    .default(() => new Date('1900-01-01T00:00:00Z')),
  releasedAtEnd: date()
    .min(new Date('1900-01-01T00:00:00Z'))
    .default(() => new Date()),
  limit: number().default(20),
  offset: number().default(0),
  sortBy: string().oneOf(moiveOption).default('id'),
  orderBy: string().oneOf(['asc', 'desc']).default('asc'),
});

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

export const movieListRead = middyfy({
  handler: movieListReadFunction,
  eventSchema: { queryParameterSchema: movieListReadQuerySchema },
});
