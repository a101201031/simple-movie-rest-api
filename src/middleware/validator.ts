import type middy from '@middy/core';
import createHttpError from 'http-errors';
import type { ObjectSchema } from 'yup';
import { ValidationError } from 'yup';

interface OptionTypes {
  eventSchema?: {
    bodyParameterSchema?: ObjectSchema<any>;
    pathParameterSchema?: ObjectSchema<any>;
    queryParameterSchema?: ObjectSchema<any>;
  };
}

const defaults: OptionTypes = {
  eventSchema: {
    bodyParameterSchema: undefined,
    pathParameterSchema: undefined,
    queryParameterSchema: undefined,
  },
};

export const validator = (opts: OptionTypes = {}): middy.MiddlewareObj => {
  const options = {
    ...defaults,
    ...opts,
  };

  const before: middy.MiddlewareFn = async (request) => {
    const { eventSchema } = options;
    try {
      if (eventSchema?.bodyParameterSchema) {
        const validateBody = await eventSchema.bodyParameterSchema.validate(
          request.event.body ?? {},
        );
        request.event.body = validateBody;
      }
      if (eventSchema?.pathParameterSchema) {
        await eventSchema.pathParameterSchema.validate(
          request.event.pathParameters ?? {},
        );
      }
      if (eventSchema?.queryParameterSchema) {
        const validateQueryStringParameters =
          await eventSchema.queryParameterSchema.validate(
            request.event.queryStringParameters ?? {},
          );
        request.event.queryStringParameters = validateQueryStringParameters;
      }
    } catch (err) {
      if (ValidationError.isError(err))
        throw createHttpError(400, {
          code: 'invalid_parameter',
          message: err.errors.join('\n'),
        });
    }
  };

  return { before };
};
