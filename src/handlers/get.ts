import { APIGatewayProxyHandler } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';

import { dynamoDB } from '../db/client';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { id } = event.pathParameters || {};

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing agent ID' }),
      };
    }

    const { Item } = await dynamoDB.send(
      new GetCommand({
        TableName: process.env.AGENTS_TABLE!,
        Key: {
          id,
        },
      }),
    );

    if (!Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Agent not found' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(Item),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
