import { handler } from '../src/handlers/delete';
import { dynamoDB } from '../src/db/client';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
  Callback,
  APIGatewayEventRequestContext,
} from 'aws-lambda';

// Mock the dynamodb client
jest.mock('../src/db/client', () => ({
  dynamoDB: {
    send: jest.fn(),
  },
}));

describe('delete handler', () => {
  const mockTableName = 'test-agents-table';
  const validUuid = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; // A valid UUID for testing

  beforeAll(() => {
    process.env.AGENTS_TABLE = mockTableName;
  });

  beforeEach(() => {
    (dynamoDB.send as jest.Mock).mockClear();
  });

  it('should delete an agent successfully', async () => {
    (dynamoDB.send as jest.Mock).mockResolvedValueOnce({});

    const mockEvent: APIGatewayProxyEvent = {
      pathParameters: { id: validUuid },
      body: null,
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'DELETE',
      isBase64Encoded: false,
      path: `/agents/${validUuid}`,
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext: {} as APIGatewayEventRequestContext,
      resource: '',
    };

    const response: APIGatewayProxyResult = (await handler(
      mockEvent,
      {} as Context,
      {} as Callback,
    )) as APIGatewayProxyResult;

    expect(dynamoDB.send).toHaveBeenCalledTimes(1);
    expect(dynamoDB.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          TableName: mockTableName,
          Key: { id: validUuid },
          ConditionExpression: 'attribute_exists(id)',
        },
      }),
    );

    expect(response.statusCode).toBe(204);
    expect(response.body).toBe('');
  });

  it('should return 404 if agent not found for deletion', async () => {
    (dynamoDB.send as jest.Mock).mockRejectedValueOnce(
      Object.assign(new Error('ConditionalCheckFailedException'), {
        name: 'ConditionalCheckFailedException',
      }),
    );

    const mockEvent: APIGatewayProxyEvent = {
      pathParameters: { id: validUuid },
      body: null,
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'DELETE',
      isBase64Encoded: false,
      path: `/agents/${validUuid}`,
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext: {} as APIGatewayEventRequestContext,
      resource: '',
    };

    const response: APIGatewayProxyResult = (await handler(
      mockEvent,
      {} as Context,
      {} as Callback,
    )) as APIGatewayProxyResult;

    expect(dynamoDB.send).toHaveBeenCalledTimes(1);
    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body)).toEqual({ message: 'Agent not found' });
  });

  it('should return 400 if ID is missing from path parameters', async () => {
    const mockEvent: APIGatewayProxyEvent = {
      pathParameters: null,
      body: null,
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'DELETE',
      isBase64Encoded: false,
      path: '/agents/',
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext: {} as APIGatewayEventRequestContext,
      resource: '',
    };

    const response: APIGatewayProxyResult = (await handler(
      mockEvent,
      {} as Context,
      {} as Callback,
    )) as APIGatewayProxyResult;

    expect(dynamoDB.send).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toHaveProperty(
      'message',
      'Invalid agent ID',
    );
    expect(JSON.parse(response.body)).toHaveProperty('details.fieldErrors.id');
  });

  it('should return 400 if ID is not a valid UUID', async () => {
    const mockEvent: APIGatewayProxyEvent = {
      pathParameters: { id: 'invalid-uuid' },
      body: null,
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'DELETE',
      isBase64Encoded: false,
      path: '/agents/invalid-uuid',
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext: {} as APIGatewayEventRequestContext,
      resource: '',
    };

    const response: APIGatewayProxyResult = (await handler(
      mockEvent,
      {} as Context,
      {} as Callback,
    )) as APIGatewayProxyResult;

    expect(dynamoDB.send).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toHaveProperty(
      'message',
      'Invalid agent ID',
    );
    expect(JSON.parse(response.body).details.fieldErrors.id[0]).toEqual(
      'Invalid uuid',
    );
  });

  it('should return 500 if DynamoDB operation fails', async () => {
    (dynamoDB.send as jest.Mock).mockRejectedValueOnce(
      new Error('DynamoDB error'),
    );

    const mockEvent: APIGatewayProxyEvent = {
      pathParameters: { id: validUuid },
      body: null,
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'DELETE',
      isBase64Encoded: false,
      path: `/agents/${validUuid}`,
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext: {} as APIGatewayEventRequestContext,
      resource: '',
    };

    const response: APIGatewayProxyResult = (await handler(
      mockEvent,
      {} as Context,
      {} as Callback,
    )) as APIGatewayProxyResult;

    expect(dynamoDB.send).toHaveBeenCalledTimes(1);
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Internal Server Error',
    });
  });
});
