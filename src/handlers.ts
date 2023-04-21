import { handlerPath } from '@libs/handler-resolver';

export default {
  init: {
    handler: `${handlerPath(__dirname)}/functions/init.init`,
    events: [
      {
        http: {
          method: 'post',
          path: 'init',
          cors: true,
        },
      },
    ],
  },
  movieListRead: {
    handler: `${handlerPath(__dirname)}/functions/movieListRead.movieListRead`,
    events: [
      {
        http: {
          method: 'get',
          path: 'movies',
          cors: true,
        },
      },
    ],
  },
  movieCreate: {
    handler: `${handlerPath(__dirname)}/functions/movieCreate.movieCreate`,
    events: [
      {
        http: {
          method: 'post',
          path: 'movies',
          cors: true,
        },
      },
    ],
  },
  movieRead: {
    handler: `${handlerPath(__dirname)}/functions/movieRead.movieRead`,
    events: [
      {
        http: {
          method: 'get',
          path: 'movies/{movieId}',
          cors: true,
        },
      },
    ],
  },
  movieUpdate: {
    handler: `${handlerPath(__dirname)}/functions/movieUpdate.movieUpdate`,
    events: [
      {
        http: {
          method: 'put',
          path: 'movies/{movieId}',
          cors: true,
        },
      },
    ],
  },
  movieDelete: {
    handler: `${handlerPath(__dirname)}/functions/movieDelete.movieDelete`,
    events: [
      {
        http: {
          method: 'delete',
          path: 'movies/{movieId}',
          cors: true,
        },
      },
    ],
  },
};
