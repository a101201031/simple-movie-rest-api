import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import type { APIGatewayProxyResult } from 'aws-lambda';

const helloFunction = async (): Promise<APIGatewayProxyResult> =>
  formatJSONResponse({
    message: 'success',
    result: {
      message: 'hello!',
    },
  });

export const hello = middyfy({ handler: helloFunction });
