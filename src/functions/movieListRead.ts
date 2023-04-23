import type {
  ISchemaAny,
  ValidatedEventAPIGatewayProxyEvent,
} from '@libs/apiGateway';
import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import { movieListReadQuerySchema, selectMovieList } from '@query/movie';
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

export const movieListRead = middyfy({
  handler: movieListReadFunction,
  eventSchema: { queryParameterSchema: movieListReadQuerySchema },
});
