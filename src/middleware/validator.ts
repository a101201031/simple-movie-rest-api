import type { ValidatedAPIGatewayProxyEvent } from '@libs/api-gateway';
import type middy from '@middy/core';
import { movieListReadSchema } from '@schema/movie';
import createHttpError from 'http-errors';
import type { ObjectSchema } from 'yup';
import { ValidationError } from 'yup';

interface OptionTypes {
  eventSchema: {
    bodyParameterSchema?: ObjectSchema<any>;
    pathParameterSchema?: ObjectSchema<any>;
    queryParameterSchema?: ObjectSchema<any>;
  };
}

export const validator = ({
  eventSchema: {
    bodyParameterSchema,
    pathParameterSchema,
    queryParameterSchema,
  },
}: OptionTypes): middy.MiddlewareObj<
  ValidatedAPIGatewayProxyEvent<any, typeof movieListReadSchema>
> => {
  const before: middy.MiddlewareFn<
    ValidatedAPIGatewayProxyEvent<any, typeof movieListReadSchema>
  > = async (request) => {
    try {
      if (bodyParameterSchema) {
        const validateBody = await bodyParameterSchema.validate(
          request.event.body ?? {},
        );
        request.event.body = validateBody;
      }
      if (pathParameterSchema) {
        await pathParameterSchema.validate(request.event.pathParameters ?? {});
      }
      if (queryParameterSchema) {
        const validateQueryStringParameters =
          await movieListReadSchema.validate(
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
