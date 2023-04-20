import { formatJSONResponse } from '@libs/api-gateway';
import { fakeData } from '@libs/fakeData';
import { middyfy } from '@libs/lambda';
import { insertData, resetTable } from '@query/reset';
import type { APIGatewayProxyResult } from 'aws-lambda';

const initFunction = async (): Promise<APIGatewayProxyResult> => {
  await resetTable();
  await insertData(fakeData);

  return formatJSONResponse({});
};

export const init = middyfy({ handler: initFunction });
