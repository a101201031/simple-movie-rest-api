import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { cursorAll, databaseConnector } from '@libs/database';
import { middyfy } from '@libs/lambda';
import { movieListReadSchema } from '@schema/movie';
import map from 'lodash/map';

const movieListReadFunction: ValidatedEventAPIGatewayProxyEvent<
  any,
  typeof movieListReadSchema
> = async (event) => {
  const db = await databaseConnector.getCursor();

  const {
    title,
    rating,
    limit,
    offset,
    runningTimeStart,
    runningTimeEnd,
    releasedAtStart,
    releasedAtEnd,
    sortBy,
    orderBy,
  } = event.queryStringParameters;

  const orderByQuery = `${sortBy} ${orderBy}`;

  const movieSelect = await cursorAll(db, {
    sql: `
      SELECT
        movie_id AS id,
        title,
        rating,
        released_at AS releasedAt,
        running_time AS runningTime,
        COUNT(*) OVER () AS total
      FROM movie
      WHERE
        title LIKE ?
        and rating >= ?
        and releasedAt BETWEEN ? AND ?
        and runningTime BETWEEN ? AND ?
      ORDER BY ${orderByQuery}
      LIMIT ? OFFSET ?
    `,
    values: [
      `%${title}%`,
      rating,
      releasedAtStart.toISOString(),
      releasedAtEnd.toISOString(),
      runningTimeStart,
      runningTimeEnd,
      limit,
      offset,
    ],
  });

  const total = movieSelect[0]?.total || 0;
  const movies = map(movieSelect, (v) => ({
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
  eventSchema: { queryParameterSchema: movieListReadSchema },
});
