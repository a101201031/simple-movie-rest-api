import { handlerPath } from '@libs/handler-resolver';

export default {
  hello: {
    handler: `${handlerPath(__dirname)}/functions/hello.hello`,
    events: [
      {
        http: {
          method: 'get',
          path: 'hello',
          cors: true,
        },
      },
    ],
  },
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
    handler: `${handlerPath(__dirname)}/functions/movie.movieListRead`,
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
    handler: `${handlerPath(__dirname)}/functions/movie.movieCreate`,
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
    handler: `${handlerPath(__dirname)}/functions/movie.movieRead`,
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
};
