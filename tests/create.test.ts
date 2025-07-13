import { handler } from '../src/handlers/create';
import { dynamoDB } from '../src/db/client';
import { v4 as uuidv4 } from 'uuid';
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
  details?: { fieldErrors: { name?: string[] } };
}

// Mock the dynamodb client and uuid
jest.mock('../src/db/client', () => ({
  dynamoDB: {
    send: jest.fn(),
  },
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

jest.mock('../src/config', () => ({
  config: {
    agentsTable: 'test-agents-table',
  },
}));

describe('create handler', () => {
  const mockUuid = 'test-uuid';
  const mockedDynamoDBSend = mocked(dynamoDB.send);

  beforeEach(() => {
    (uuidv4 as jest.Mock<string, []>).mockReturnValue(mockUuid);
    mockedDynamoDBSend.mockClear();
  });

  it('should create an agent successfully with default status and temperature', async () => {
    const mockEvent: APIGatewayProxyEvent = {
      body: JSON.stringify({
        name: 'Test Agent',
        description: 'A test agent',
        model: 'gpt-4',
      }),
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'POST',
      isBase64Encoded: false,
      path: '/agents',
      pathParameters: null,
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext: {} as APIGatewayEventRequestContext,
      resource: '',
    };

    const expectedAgent = {
      id: mockUuid,
      name: 'Test Agent',
      description: 'A test agent',
      model: 'gpt-4',
      status: 'active',
      temperature: 0.7,
      createdAt: expect.any(String),
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
          Item: expectedAgent,
        },
      }),
    );

    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body)).toEqual(expectedAgent);
  });

  it('should create an agent successfully with provided status and temperature', async () => {
    const mockEvent: APIGatewayProxyEvent = {
      body: JSON.stringify({
        name: 'Another Agent',
        description: 'Another test agent',
        model: 'gpt-4',
        status: 'inactive',
        temperature: 0.9,
      }),
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'POST',
      isBase64Encoded: false,
      path: '/agents',
      pathParameters: null,
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext: {} as APIGatewayEventRequestContext,
      resource: '',
    };

    const expectedAgent = {
      id: mockUuid,
      name: 'Another Agent',
      description: 'Another test agent',
      model: 'gpt-4',
      status: 'inactive',
      temperature: 0.9,
      createdAt: expect.any(String),
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
          Item: expectedAgent,
        },
      }),
    );

    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body)).toEqual(expectedAgent);
  });

  it('should return 400 if event body is missing', async () => {
    const mockEvent: APIGatewayProxyEvent = {
      body: null,
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'POST',
      isBase64Encoded: false,
      path: '/agents',
      pathParameters: null,
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
    expect(JSON.parse(response.body)).toEqual({
      message: 'Missing request body',
    });
  });

  it('should return 400 if JSON parsing fails', async () => {
    const mockEvent: APIGatewayProxyEvent = {
      body: 'invalid json',
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'POST',
      isBase64Encoded: false,
      path: '/agents',
      pathParameters: null,
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
    expect(JSON.parse(response.body)).toEqual({
      message: 'Invalid JSON in request body',
    });
  });

  it('should return 400 if validation fails', async () => {
    const mockEvent: APIGatewayProxyEvent = {
      body: JSON.stringify({
        description: 'A test agent',
        model: 'gpt-4',
      }),
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'POST',
      isBase64Encoded: false,
      path: '/agents',
      pathParameters: null,
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
    expect(errorResponse).toHaveProperty('message', 'Invalid request body');
    expect(errorResponse).toHaveProperty('details.fieldErrors.name');
    expect(errorResponse.details?.fieldErrors.name?.[0]).toEqual('Required');
  });

  it('should return 500 if DynamoDB operation fails', async () => {
    (dynamoDB.send as jest.Mock).mockRejectedValueOnce(
      new Error('DynamoDB error'),
    );

    const mockEvent: APIGatewayProxyEvent = {
      body: JSON.stringify({
        name: 'Failing Agent',
        description: 'This agent will fail',
        model: 'gpt-4',
      }),
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'POST',
      isBase64Encoded: false,
      path: '/agents',
      pathParameters: null,
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
