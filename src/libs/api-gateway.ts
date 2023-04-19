import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from 'aws-lambda';
import type { InferType, ISchema } from 'yup';

export interface ISchemaAny extends ISchema<any, any, any, any> {}

export interface ValidatedAPIGatewayProxyEvent<
  Body extends ISchema<any, any, any, any> = ISchemaAny,
  PathParameters extends ISchema<any, any, any, any> = ISchemaAny,
  QueryStringParameters extends ISchema<any, any, any, any> = ISchemaAny,
> extends Omit<
    APIGatewayProxyEvent,
    'body' | 'queryStringParameters' | 'pathParameters'
  > {
  body: InferType<Body>;
  pathParameters: InferType<PathParameters>;
  queryStringParameters: InferType<QueryStringParameters>;
}

export interface ValidatedEventAPIGatewayProxyEvent<
  Body extends ISchema<any, any, any, any> = ISchemaAny,
  PathParameters extends ISchema<any, any, any, any> = ISchemaAny,
  QueryStringParameters extends ISchema<any, any, any, any> = ISchemaAny,
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
