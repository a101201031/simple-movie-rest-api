import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from 'aws-lambda';
import type { FromSchema } from 'json-schema-to-ts';

interface ValidatedAPIGatewayProxyEvent<T>
  extends Omit<APIGatewayProxyEvent, 'body'> {
  body: FromSchema<T>;
}

export interface ValidatedEventAPIGatewayProxyEvent<T>
  extends Handler<ValidatedAPIGatewayProxyEvent<T>, APIGatewayProxyResult> {}

export const formatJSONResponse = (response: Record<string, unknown>) => ({
  statusCode: 200,
  body: JSON.stringify(response),
});
