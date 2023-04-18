import type middy from '@middy/core';
import { normalizeHttpResponse } from '@middy/util';
import type createHttpError from 'http-errors';

interface ApiErrorTypes extends Partial<createHttpError.HttpError> {
  code: string;
  headers?: any;
}

interface OptionTypes {
  logger?: ((error: any) => void) | boolean;
  fallbackCode?: string;
  fallbackMessage?: string;
}

const defaults: OptionTypes = {
  logger: console.error,
  fallbackCode: 'internal_server_error',
  fallbackMessage: 'internal server error',
};

export const errorHandler = (opts: OptionTypes = {}): middy.MiddlewareObj => {
  const options = {
    ...defaults,
    ...opts,
  };
  const onError: middy.MiddlewareFn = async (request) => {
    let error = request.error as unknown as ApiErrorTypes;
    if (request.response !== undefined) return;
    if (typeof options.logger === 'function') {
      options.logger(error);
    }
    if (error.statusCode && error.expose === undefined) {
      error.expose = error.statusCode < 500;
    }
    if (options.fallbackCode && (!error.statusCode || !error.expose)) {
      error = {
        statusCode: 500,
        code: options.fallbackCode,
        message: options.fallbackMessage,
        expose: true,
      };
    }
    if (error.expose) {
      normalizeHttpResponse(request);
      const { statusCode, code, message, headers } = error;
      request.response = {
        ...request.response,
        statusCode,
        body: JSON.stringify({
          error: {
            code,
            message,
          },
          success: false,
        }),
        headers: {
          ...headers,
          ...request.response.headers,
          'Content-Type': 'application/json',
        },
      };
    }
  };
  return {
    onError,
  };
};
