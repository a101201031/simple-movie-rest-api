import middy from '@middy/core';
import middyCors from '@middy/http-cors';
import middyErrorHandler from '@middy/http-error-handler';
import middyJsonBodyParser from '@middy/http-json-body-parser';
import middyValidator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile';
import type { Handler } from 'aws-lambda';

interface MiddfyParams {
  handler: Handler;
  eventSchema?: object;
}

export const middyfy = ({ handler, eventSchema }: MiddfyParams) => {
  const middyfyFunction = middy(handler)
    .use(middyCors())
    .use(middyJsonBodyParser())
    .use(middyErrorHandler());

  return eventSchema
    ? middyfyFunction.use(
        middyValidator({ eventSchema: transpileSchema(eventSchema) }),
      )
    : middyfyFunction;
};
