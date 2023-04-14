import { errorHandler } from '@middleware/errorHandler';
import middy from '@middy/core';
import middyCors from '@middy/http-cors';
import middyJsonBodyParser from '@middy/http-json-body-parser';
import middyValidator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile';
import type { Handler } from 'aws-lambda';

interface MiddfyParams {
  handler: Handler;
  eventSchema?: object;
}

export const middyfy = ({ handler, eventSchema }: MiddfyParams) =>
  eventSchema
    ? middy(handler)
        .use(middyCors())
        .use(middyJsonBodyParser())
        .use(middyValidator({ eventSchema: transpileSchema(eventSchema) }))
        .use(errorHandler())
    : middy(handler)
        .use(middyCors())
        .use(middyJsonBodyParser())
        .use(errorHandler());
