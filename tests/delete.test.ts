import { handler } from '../src/handlers/delete';
import { dynamoDB } from '../src/db/client';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
  Callback,
  APIGatewayEventRequestContext,
} from 'aws-lambda';
import { mocked } from 'jest-mock';
import * as errorHandlerModule from '../src/utils/errorHandler';

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

describe('delete handler', () => {
  const validUuid = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; // A valid UUID for testing
  const mockedDynamoDBSend = mocked(dynamoDB.send);

  beforeEach(() => {
    mockedDynamoDBSend.mockClear();
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
          TableName: 'test-agents-table',
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
    const errorResponse = JSON.parse(response.body) as ErrorResponse;
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
    const dynamoDBError = new Error('DynamoDB error');
    (dynamoDB.send as jest.Mock).mockRejectedValueOnce(dynamoDBError);

    const errorHandlerSpy = jest.spyOn(errorHandlerModule, 'errorHandler');

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

    await handler(mockEvent, {} as Context, {} as Callback);

    expect(dynamoDB.send).toHaveBeenCalledTimes(1);
    expect(errorHandlerSpy).toHaveBeenCalledWith(dynamoDBError);

    errorHandlerSpy.mockRestore();
  });

  it('should re-throw unexpected errors from DynamoDB', async () => {
    const unexpectedError = new Error('Unexpected DynamoDB error');
    (dynamoDB.send as jest.Mock).mockRejectedValueOnce(unexpectedError);

    // Temporarily mock errorHandler to re-throw for this specific test
    const errorHandlerSpy = jest.spyOn(errorHandlerModule, 'errorHandler');
    errorHandlerSpy.mockImplementationOnce((error) => {
      throw error;
    });

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

    await expect(
      handler(mockEvent, {} as Context, {} as Callback),
    ).rejects.toThrow(unexpectedError);
    expect(dynamoDB.send).toHaveBeenCalledTimes(1);

    errorHandlerSpy.mockRestore(); // Clean up the spy
  });
});
