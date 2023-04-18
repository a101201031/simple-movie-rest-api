import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from 'aws-lambda';
import type { InferType, ISchema } from 'yup';

export interface ValidatedAPIGatewayProxyEvent<
  Body extends ISchema<any, any, any, any> = any,
  PathParameters extends ISchema<any, any, any, any> = any,
  QueryStringParameters extends ISchema<any, any, any, any> = any,
> extends Omit<
    APIGatewayProxyEvent,
    'body' | 'queryStringParameters' | 'pathParameters'
  > {
  body: InferType<Body>;
  pathParameters: InferType<PathParameters>;
  queryStringParameters: InferType<QueryStringParameters>;
}

export interface ValidatedEventAPIGatewayProxyEvent<
  Body extends ISchema<any, any, any, any> = any,
  PathParameters extends ISchema<any, any, any, any> = any,
  QueryStringParameters extends ISchema<any, any, any, any> = any,
> extends Handler<
    ValidatedAPIGatewayProxyEvent<Body, PathParameters, QueryStringParameters>,
    APIGatewayProxyResult
  > {}

export const formatJSONResponse = (
  response: Record<string, unknown>,
  statusCode = 200,
) => ({
  statusCode,
  body: JSON.stringify(response),
});
