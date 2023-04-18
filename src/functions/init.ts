import { formatJSONResponse } from '@libs/api-gateway';
import { cursorRun, databaseConnector } from '@libs/database';
import { fakeData } from '@libs/fakeData';
import { middyfy } from '@libs/lambda';
import type { APIGatewayProxyResult } from 'aws-lambda';
import map from 'lodash/map';

const initFunction = async (): Promise<APIGatewayProxyResult> => {
  const db = await databaseConnector.getCursor();

  await cursorRun(db, {
    sql: `
      CREATE TABLE IF NOT EXISTS movie
      (
        movie_id TEXT PRIMARY KEY,
        title TEXT,
        rating INTEGER,
        released_at TEXT,
        running_time INTEGER
      ) 
    `,
  });
  await cursorRun(db, {
    sql: `
      CREATE TABLE IF NOT EXISTS movie_genre
      (
        movie_id TEXT NOT NULL,
        genre_type TEXT
      ) 
    `,
  });
  await cursorRun(db, {
    sql: `
      CREATE TABLE IF NOT EXISTS movie_crew
      (
        movie_id TEXT NOT NULL,
        crew_type TEXT,
        person_name TEXT
      ) 
    `,
  });
  await cursorRun(db, {
    sql: `
      CREATE TABLE IF NOT EXISTS movie_actor
      (
        movie_id TEXT NOT NULL,
        actor_type TEXT,
        person_name TEXT,
        character TEXT
      ) 
    `,
  });

  try {
    await Promise.all(
      map(['movie', 'movie_genre', 'movie_crew', 'movie_actor'], async (v) => {
        await cursorRun(db, {
          sql: `
            DELETE FROM ${v}
          `,
        });
      }),
    );
  } catch (err) {
    console.error(err);
  }

  try {
    await Promise.all(
      map(fakeData.movies, (v) => {
        cursorRun(db, {
          sql: `
            INSERT INTO movie
            (
              movie_id,
              title,
              rating,
              released_at,
              running_time
            ) values
            (
              ?, ?, ?, ?, ?
            )
          `,
          values: [
            v.movie_id,
            v.title,
            v.rating,
            v.released_at,
            v.running_time,
          ],
        });
      }),
    );
    await Promise.all(
      map(fakeData.movieGenres, (v) => {
        cursorRun(db, {
          sql: `
            INSERT INTO movie_genre
            (
              movie_id,
              genre_type
            ) values
            (
              ?, ?
            )
          `,
          values: [v.movie_id, v.genre_type],
        });
      }),
    );
    await Promise.all(
      map(fakeData.movieCrews, (v) => {
        cursorRun(db, {
          sql: `
            INSERT INTO movie_crew
            (
              movie_id,
              crew_type,
              person_name
            ) values
            (
              ?, ?, ?
            )
          `,
          values: [v.movie_id, v.crew_type, v.person_name],
        });
      }),
    );
    await Promise.all(
      map(fakeData.movieActors, async (v) => {
        await cursorRun(db, {
          sql: `
            INSERT INTO movie_actor
            (
              movie_id,
              actor_type,
              person_name,
              character
            ) values
            (
              ?, ?, ?, ?
            )
          `,
          values: [v.movie_id, v.actor_type, v.person_name, v.character],
        });
      }),
    );
  } catch (err) {
    console.error(err);
    throw err;
  }

  return formatJSONResponse({});
};

export const init = middyfy({ handler: initFunction });
