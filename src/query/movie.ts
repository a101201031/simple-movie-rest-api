import { cursorAll, cursorRun, databaseConnector } from '@libs/database';
import type {
  MovieActorModel,
  MovieCrewModel,
  MovieGenreModel,
  MovieModel,
} from '@model/movie';
import forEach from 'lodash/forEach';
import isEqual from 'lodash/isEqual';
import join from 'lodash/join';
import map from 'lodash/map';
import type { InferType } from 'yup';
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

const moiveOption: Array<keyof MovieModel> = [
  'id',
  'title',
  'rating',
  'releasedAt',
  'runningTime',
];

const uniqueTest = {
  name: 'unique',
  message: ({ path }: { path: string }) => `${path} must be unique`,
  test: (arr: any[] | undefined) =>
    !arr
      ? true
      : arr.length ===
        new Map(map(arr, (item) => [JSON.stringify(item), null])).size,
};

export const moviePathSchema = object({
  movieId: string().required(),
});

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
    throw new Error('movie not found');
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
