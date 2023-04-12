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
};
