import { cursorAll, cursorRun, databaseConnector } from '@libs/database';
import type {
  MovieActorModel,
  MovieCrewModel,
  MovieGenreModel,
  MovieModel,
} from '@model/movie';
import type {
  movieCreateBodySchema,
  movieListReadQuerySchema,
  movieUpdateBodySchema,
} from '@schema/movie';
import createHttpError from 'http-errors';
import forEach from 'lodash/forEach';
import isEqual from 'lodash/isEqual';
import join from 'lodash/join';
import map from 'lodash/map';
import type { InferType } from 'yup';

interface MovieListSelectParamTypes
  extends InferType<typeof movieListReadQuerySchema> {}

interface MovieInsertParamTypes
  extends InferType<typeof movieCreateBodySchema> {
  movieId: string;
}

interface MovieUpdateParamTypes
  extends InferType<typeof movieUpdateBodySchema> {
  movieId: string;
}

export const selectMovie = async ({ movieId }: { movieId: string }) => {
  const db = await databaseConnector.getCursor();
  const movieSelect = await cursorAll<
    Array<Omit<MovieModel, 'movieId'> & { id: string }>
  >(db, {
    sql: `
      SELECT
        id,
        title,
        rating,
        released_at AS releasedAt,
        running_time AS runningTime
      FROM movie
      WHERE
        id = ?
    `,
    values: [movieId],
  });

  if (!movieSelect.length) {
    throw createHttpError(404, {
      code: 'entitiy_not_found',
      message: 'movie is not found.',
    });
  }

  const movieGenreSelect = await cursorAll<Array<MovieGenreModel>>(db, {
    sql: `
      SELECT
        type
      FROM movie_genre
      WHERE
        movie_id = ?
    `,
    values: [movieId],
  });

  const movieCrewSelect = await cursorAll<Array<MovieCrewModel>>(db, {
    sql: `
      SELECT
        type,
        person_name AS personName
      FROM movie_crew
      WHERE
        movie_id = ?
    `,
    values: [movieId],
  });

  const movieActorSelect = await cursorAll<Array<MovieActorModel>>(db, {
    sql: `
      SELECT
        type,
        person_name AS personName,
        character
      FROM movie_actor
      WHERE
        movie_id = ?
    `,
    values: [movieId],
  });

  return {
    ...movieSelect[0],
    genres: movieGenreSelect,
    crews: movieCrewSelect,
    actors: movieActorSelect,
  };
};

export const selectMovieList = async ({
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
}: MovieListSelectParamTypes) => {
  const db = await databaseConnector.getCursor();
  const orderByQuery = `${sortBy} ${orderBy}`;

  const movieListSelect = await cursorAll<
    Array<MovieModel & { total: number }>
  >(db, {
    sql: `
      SELECT
        id,
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

  return movieListSelect;
};

export const insertMovie = async ({
  movieId,
  title,
  rating,
  releasedAt,
  runningTime,
  genres,
  crews,
  actors,
}: MovieInsertParamTypes) => {
  const db = await databaseConnector.getCursor();

  try {
    await cursorRun(db, { sql: `BEGIN` });
    await cursorRun(db, {
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
      values: [movieId, title, rating, releasedAt.toISOString(), runningTime],
    });
    await Promise.all(
      map(genres, (v) => {
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
          values: [movieId, v.type],
        });
      }),
    );
    await Promise.all(
      map(crews, (v) => {
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
          values: [movieId, v.type, v.personName],
        });
      }),
    );
    await Promise.all(
      map(actors, async (v) => {
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
          values: [movieId, v.type, v.personName, v.character],
        });
      }),
    );
    await cursorRun(db, { sql: `COMMIT` });
  } catch (err) {
    await cursorRun(db, { sql: `ROLLBACK` });
    throw err;
  }
};

export const updateMovie = async (params: MovieUpdateParamTypes) => {
  const db = await databaseConnector.getCursor();
  const { movieId } = params;

  const originMovie: { [key: string]: any } = await selectMovie({ movieId });

  const paramMovie = {
    runningTime: params.runningTime,
    releasedAt: params.releasedAt?.toISOString(),
    rating: params.rating,
    title: params.title,
  };

  const modify: { [key: string]: any } = {};
  forEach(paramMovie, (v, k) => {
    if (v && v !== originMovie[k]) modify[k] = v;
  });

  try {
    await cursorRun(db, { sql: `BEGIN` });

    if (!isEqual(modify, {})) {
      const updateQuery: { sql: string; values: any[] } = {
        sql: `
          UPDATE movie
          SET `,
        values: [],
      };
      const columnList: string[] = [];

      forEach(modify, (v, k) => {
        columnList.push(
          `${k.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)} = ? `,
        );
        updateQuery.values.push(v);
      });
      updateQuery.sql += `
        ${join(columnList, ',')} 
        WHERE id = ?
      `;
      updateQuery.values.push(movieId);

      await cursorRun(db, updateQuery);
    }

    if (params.genres) {
      await cursorRun(db, {
        sql: `DELETE FROM movie_genre WHERE movie_id = ?`,
        values: [movieId],
      });
      await Promise.all(
        map(params.genres, (v) => {
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
            values: [movieId, v.type],
          });
        }),
      );
    }
    if (params.crews) {
      await cursorRun(db, {
        sql: `DELETE FROM movie_crew WHERE movie_id = ?`,
        values: [movieId],
      });
      await Promise.all(
        map(params.crews, (v) => {
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
            values: [movieId, v.type, v.personName],
          });
        }),
      );
    }

    if (params.actors) {
      await cursorRun(db, {
        sql: `DELETE FROM movie_actor WHERE movie_id = ?`,
        values: [movieId],
      });
      await Promise.all(
        map(params.actors, async (v) => {
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
            values: [movieId, v.type, v.personName, v.character],
          });
        }),
      );
    }

    await cursorRun(db, { sql: `COMMIT` });
  } catch (err) {
    await cursorRun(db, { sql: `ROLLBACK` });
    throw err;
  }
};

export const deleteMovie = async ({ movieId }: { movieId: string }) => {
  const db = await databaseConnector.getCursor();
  try {
    await cursorRun(db, { sql: `BEGIN` });
    await cursorRun(db, {
      sql: `DELETE FROM movie WHERE id = ?`,
      values: [movieId],
    });
    await cursorRun(db, {
      sql: `DELETE FROM movie_genre WHERE movie_id = ?`,
      values: [movieId],
    });
    await cursorRun(db, {
      sql: `DELETE FROM movie_crew WHERE movie_id = ?`,
      values: [movieId],
    });
    await cursorRun(db, {
      sql: `DELETE FROM movie_actor WHERE movie_id = ?`,
      values: [movieId],
    });
    await cursorRun(db, { sql: `COMMIT` });
  } catch (err) {
    await cursorRun(db, { sql: `ROLLBACK` });
    throw err;
  }
};
