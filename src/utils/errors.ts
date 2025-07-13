export class HttpError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
  }
}

export class BadRequestError extends HttpError {
  constructor(message = 'Bad Request', details?: unknown) {
    super(400, message, details);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Not Found') {
    super(404, message);
  }
}

export class InternalServerError extends HttpError {
  constructor(message = 'Internal Server Error') {
    super(500, message);
  }
}

export function handleConditionalCheckFailedException(error: unknown): void {
  if (
    error instanceof Error &&
    'name' in error &&
    error.name === 'ConditionalCheckFailedException'
  ) {
    throw new NotFoundError('Agent not found');
  }
  throw error; // Re-throw other unexpected errors
}
