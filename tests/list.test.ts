import { handler } from '../src/handlers/list';
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

describe('list handler', () => {
  const mockedDynamoDBSend = mocked(dynamoDB.send);

  beforeEach(() => {
    mockedDynamoDBSend.mockClear();
    jest.spyOn(dynamoDB, 'send');
  });

  it('should return an empty list of agents when Items is an empty array', async () => {
    (dynamoDB.send as jest.Mock).mockResolvedValueOnce({ Items: [] });

    const mockEvent: APIGatewayProxyEvent = {
      body: null,
      pathParameters: null,
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'GET',
      isBase64Encoded: false,
      path: '/agents',
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
        },
      }),
    );

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual([]);
  });

  it('should return an empty list of agents when Items is undefined', async () => {
    (dynamoDB.send as jest.Mock).mockResolvedValueOnce({}); // Items is undefined

    const mockEvent: APIGatewayProxyEvent = {
      body: null,
      pathParameters: null,
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'GET',
      isBase64Encoded: false,
      path: '/agents',
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
        },
      }),
    );

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual([]);
  });

  it('should return a list of agents successfully', async () => {
    const mockAgents = [
      {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        name: 'Test Agent 1',
        description: 'A test agent 1',
        model: 'gpt-4',
        status: 'active',
        temperature: 0.7,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        name: 'Test Agent 2',
        description: 'A test agent 2',
        model: 'claude',
        status: 'inactive',
        temperature: 0.5,
        createdAt: new Date().toISOString(),
      },
    ];

    (dynamoDB.send as jest.Mock).mockResolvedValueOnce({ Items: mockAgents });

    const mockEvent: APIGatewayProxyEvent = {
      body: null,
      pathParameters: null,
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'GET',
      isBase64Encoded: false,
      path: '/agents',
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
        },
      }),
    );

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual(mockAgents);
  });

  it('should return 500 if DynamoDB operation fails', async () => {
    (dynamoDB.send as jest.Mock).mockRejectedValueOnce(
      new Error('DynamoDB error'),
    );

    const mockEvent: APIGatewayProxyEvent = {
      body: null,
      pathParameters: null,
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'GET',
      isBase64Encoded: false,
      path: '/agents',
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
    const errorResponse = JSON.parse(response.body) as ErrorResponse;
    expect(errorResponse).toEqual({
      message: 'Internal Server Error',
    });
  });
});
