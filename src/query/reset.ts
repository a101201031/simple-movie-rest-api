import { cursorRun, databaseConnector } from '@libs/database';
import type {
  MovieActorModel,
  MovieCrewModel,
  MovieGenreModel,
  MovieModel,
} from '@model/movie';
import map from 'lodash/map';

interface InsertDataParamTypes {
  movies?: MovieModel[];
  movieGenres?: MovieGenreModel[];
  movieCrews?: MovieCrewModel[];
  movieActors?: MovieActorModel[];
}

export const resetTable = async () => {
  const db = await databaseConnector.getCursor();
  await cursorRun(db, {
    sql: `
    CREATE TABLE IF NOT EXISTS movie
    (
      id TEXT PRIMARY KEY,
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
      type TEXT
    ) 
  `,
  });
  await cursorRun(db, {
    sql: `
    CREATE TABLE IF NOT EXISTS movie_crew
    (
      movie_id TEXT NOT NULL,
      type TEXT,
      person_name TEXT
    ) 
  `,
  });
  await cursorRun(db, {
    sql: `
    CREATE TABLE IF NOT EXISTS movie_actor
    (
      movie_id TEXT NOT NULL,
      type TEXT,
      person_name TEXT,
      character TEXT
    ) 
  `,
  });

  await Promise.all(
    map(['movie', 'movie_genre', 'movie_crew', 'movie_actor'], async (v) => {
      await cursorRun(db, {
        sql: `
          DELETE FROM ${v}
        `,
      });
    }),
  );
};

export const insertData = async ({
  movies,
  movieGenres,
  movieCrews,
  movieActors,
}: InsertDataParamTypes) => {
  const db = await databaseConnector.getCursor();
  try {
    await cursorRun(db, { sql: `BEGIN` });
    if (movies)
      await Promise.all(
        map(movies, (v) => {
          cursorRun(db, {
            sql: `
            INSERT INTO movie
            (
              id,
              title,
              rating,
              released_at,
              running_time
            ) values
            (
              ?, ?, ?, ?, ?
            )
          `,
            values: [v.id, v.title, v.rating, v.releasedAt, v.runningTime],
          });
        }),
      );
    if (movieGenres)
      await Promise.all(
        map(movieGenres, (v) => {
          cursorRun(db, {
            sql: `
            INSERT INTO movie_genre
            (
              movie_id,
              type
            ) values
            (
              ?, ?
            )
          `,
            values: [v.movieId, v.type],
          });
        }),
      );
    if (movieCrews)
      await Promise.all(
        map(movieCrews, (v) => {
          cursorRun(db, {
            sql: `
            INSERT INTO movie_crew
            (
              movie_id,
              type,
              person_name
            ) values
            (
              ?, ?, ?
            )
          `,
            values: [v.movieId, v.type, v.personName],
          });
        }),
      );
    if (movieActors)
      await Promise.all(
        map(movieActors, async (v) => {
          await cursorRun(db, {
            sql: `
            INSERT INTO movie_actor
            (
              movie_id,
              type,
              person_name,
              character
            ) values
            (
              ?, ?, ?, ?
            )
          `,
            values: [v.movieId, v.type, v.personName, v.character],
          });
        }),
      );
    await cursorRun(db, { sql: `COMMIT` });
  } catch (err) {
    await cursorRun(db, { sql: `ROLLBACK` });
    throw err;
  }
};
