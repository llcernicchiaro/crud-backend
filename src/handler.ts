import { APIGatewayProxyHandler } from 'aws-lambda';

export const hello: APIGatewayProxyHandler = async (event) => {
  const stage = process.env.STAGE || 'unknown';
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Hello from CRUD Backend!`,
      stage,
      input: event,
    }),
  };
};
