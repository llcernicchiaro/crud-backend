import { APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { logger } from './logger';
import { HttpError, InternalServerError } from './errors';

export const errorHandler = (error: unknown): APIGatewayProxyResult => {
  if (error instanceof z.ZodError) {
    logger.error('Validation Error', { error, validationErrors: error.errors });
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Validation Error',
        errors: error.errors,
      }),
    };
  }

  if (
    error &&
    typeof error === 'object' &&
    'statusCode' in error &&
    typeof (error as HttpError).statusCode === 'number'
  ) {
    const httpError = error as HttpError;
    logger.error(httpError.message, { error: httpError });
    return {
      statusCode: httpError.statusCode,
      body: JSON.stringify({
        message: httpError.message,
        details: httpError.details,
      }),
    };
  }

  const internalServerError = new InternalServerError();
  logger.error(internalServerError.message, { error });
  return {
    statusCode: internalServerError.statusCode,
    body: JSON.stringify({ message: internalServerError.message }),
  };
};
