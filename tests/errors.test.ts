import {
  BadRequestError,
  NotFoundError,
  InternalServerError,
  HttpError,
} from '../src/utils/errors';

describe('Custom Errors', () => {
  it('BadRequestError should have correct properties', () => {
    const error = new BadRequestError('Test Bad Request', {
      detail: 'some detail',
    });
    expect(error).toBeInstanceOf(BadRequestError);
    expect(error).toBeInstanceOf(HttpError);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Test Bad Request');
    expect(error.details).toEqual({ detail: 'some detail' });
    expect(error.name).toBe('BadRequestError');
  });

  it('BadRequestError should have default message if not provided', () => {
    const error = new BadRequestError();
    expect(error.message).toBe('Bad Request');
  });

  it('NotFoundError should have correct properties', () => {
    const error = new NotFoundError('Test Not Found');
    expect(error).toBeInstanceOf(NotFoundError);
    expect(error).toBeInstanceOf(HttpError);
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Test Not Found');
    expect(error.name).toBe('NotFoundError');
  });

  it('NotFoundError should have default message if not provided', () => {
    const error = new NotFoundError();
    expect(error.message).toBe('Not Found');
  });

  it('InternalServerError should have correct properties', () => {
    const error = new InternalServerError('Test Internal Server Error');
    expect(error).toBeInstanceOf(InternalServerError);
    expect(error).toBeInstanceOf(HttpError);
    expect(error.statusCode).toBe(500);
    expect(error.message).toBe('Test Internal Server Error');
    expect(error.name).toBe('InternalServerError');
  });

  it('InternalServerError should have default message if not provided', () => {
    const error = new InternalServerError();
    expect(error.message).toBe('Internal Server Error');
  });
});
