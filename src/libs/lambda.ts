import { errorHandler } from '@middleware/errorHandler';
import { sqliteConnector } from '@middleware/sqliteConnector';
import { validator } from '@middleware/validator';
import middy from '@middy/core';
import middyCors from '@middy/http-cors';
import middyJsonBodyParser from '@middy/http-json-body-parser';
import type { Handler } from 'aws-lambda';
import type { ObjectSchema } from 'yup';

interface MiddfyParams {
  handler: Handler;
  eventSchema?: {
    bodyParameterSchema?: ObjectSchema<any>;
    pathParameterSchema?: ObjectSchema<any>;
    queryParameterSchema?: ObjectSchema<any>;
  };
}

export const middyfy = ({ handler, eventSchema }: MiddfyParams) =>
  eventSchema
    ? middy(handler)
        .use(middyCors())
        .use(middyJsonBodyParser())
        .use(validator({ eventSchema }))
        .use(sqliteConnector())
        .use(errorHandler())
    : middy(handler)
        .use(middyCors())
        .use(middyJsonBodyParser())
        .use(sqliteConnector())
        .use(errorHandler());
