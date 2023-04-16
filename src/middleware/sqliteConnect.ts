import { databaseConnector } from '@libs/database';
import type middy from '@middy/core';

export const sqliteConnect = (): middy.MiddlewareObj => {
  const before: middy.MiddlewareFn = async () => {
    await databaseConnector.isConnected();
  };
  const after: middy.MiddlewareFn = () => {
    databaseConnector.dispose();
  };
  return { before, after };
};
