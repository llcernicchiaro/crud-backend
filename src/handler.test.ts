import { hello } from './handler';
import type {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyResult,
} from 'aws-lambda';

describe('hello handler', () => {
  const context = {} as Context;
  const callback = () => {};

  it('returns 200 and correct message with stage', async () => {
    process.env.STAGE = 'test-stage';
    const event = {} as APIGatewayProxyEvent;
    const result = (await hello(
      event,
      context,
      callback,
    )) as APIGatewayProxyResult;
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.message).toMatch(/Hello from CRUD Backend/);
    expect(body.stage).toBe('test-stage');
    expect(body.input).toEqual(event);
  });

  it('defaults stage to unknown if not set', async () => {
    delete process.env.STAGE;
    const event = {} as APIGatewayProxyEvent;
    const result = (await hello(
      event,
      context,
      callback,
    )) as APIGatewayProxyResult;
    const body = JSON.parse(result.body);
    expect(body.stage).toBe('unknown');
  });
});
