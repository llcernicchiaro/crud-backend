import { handler } from '../src/handlers/get';
import { dynamoDB } from '../src/db/client';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
  Callback,
  APIGatewayEventRequestContext,
} from 'aws-lambda';
import { mocked } from 'jest-mock';

interface ErrorResponse {
  message: string;
  details?: {
    code: string;
    expected?: string;
    received?: string;
    path: string[];
    message: string;
  }[];
}

// Mock the dynamodb client
jest.mock('../src/db/client', () => ({
  dynamoDB: {
    send: jest.fn(),
  },
}));

jest.mock('../src/config', () => ({
  config: {
    agentsTable: 'test-agents-table',
  },
}));

describe('get handler', () => {
  const validUuid = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; // A valid UUID for testing
  const mockedDynamoDBSend = mocked(dynamoDB.send);

  beforeEach(() => {
    mockedDynamoDBSend.mockClear();
    jest.spyOn(dynamoDB, 'send');
    // No need to mock uuidv4 here as it's not directly used in the handler logic for get
  });

  it('should return an agent successfully', async () => {
    const mockAgent = {
      id: validUuid,
      name: 'Test Agent',
      description: 'A test agent',
      model: 'gpt-4',
      status: 'active',
      temperature: 0.7,
      createdAt: new Date().toISOString(),
    };

    (dynamoDB.send as jest.Mock).mockResolvedValueOnce({ Item: mockAgent });

    const mockEvent: APIGatewayProxyEvent = {
      pathParameters: { id: validUuid },
      body: null,
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'GET',
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
          TableName: 'test-agents-table',
          Key: { id: validUuid },
        },
      }),
    );

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual(mockAgent);
  });

  it('should return 404 if agent not found', async () => {
    (dynamoDB.send as jest.Mock).mockResolvedValueOnce({ Item: undefined });

    const mockEvent: APIGatewayProxyEvent = {
      pathParameters: { id: validUuid },
      body: null,
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'GET',
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
          TableName: 'test-agents-table',
          Key: { id: validUuid },
        },
      }),
    );
    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body)).toEqual({ message: 'Agent not found' });
  });

  it('should return 400 if ID is missing from path parameters', async () => {
    const mockEvent: APIGatewayProxyEvent = {
      pathParameters: null,
      body: null,
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'GET',
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
    const errorResponse = JSON.parse(response.body) as ErrorResponse;
    expect(errorResponse).toHaveProperty('message', 'Invalid agent ID');
    expect(errorResponse.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['id'],
          message: 'Invalid input: expected string, received undefined',
        }),
      ]),
    );
  });

  it('should return 400 if ID is not a valid UUID', async () => {
    const mockEvent: APIGatewayProxyEvent = {
      pathParameters: { id: 'invalid-uuid' },
      body: null,
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'GET',
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
    const errorResponse = JSON.parse(response.body) as ErrorResponse;
    expect(errorResponse).toHaveProperty('message', 'Invalid agent ID');
    expect(errorResponse.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['id'],
          message: 'Invalid UUID',
        }),
      ]),
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
      httpMethod: 'GET',
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
