import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from 'aws-lambda';
import type { InferType, ISchema } from 'yup';

export interface ValidatedAPIGatewayProxyEvent<
  Body extends ISchema<any, any, any, any> = any,
  QueryStringParameters extends ISchema<any, any, any, any> = any,
> extends Omit<APIGatewayProxyEvent, 'body' | 'queryStringParameters'> {
  body: InferType<Body>;
  queryStringParameters: InferType<QueryStringParameters>;
}

export interface ValidatedEventAPIGatewayProxyEvent<
  Body extends ISchema<any, any, any, any> = any,
  QueryStringParameters extends ISchema<any, any, any, any> = any,
> extends Handler<
    ValidatedAPIGatewayProxyEvent<Body, QueryStringParameters>,
    APIGatewayProxyResult
  > {}

export const formatJSONResponse = (
  response: Record<string, unknown>,
  statusCode = 200,
) => ({
  statusCode,
  body: JSON.stringify(response),
});
