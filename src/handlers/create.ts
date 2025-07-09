import { APIGatewayProxyHandler } from 'aws-lambda';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import { dynamoDB } from '../db/client';
import { Agent, createAgentInputSchema } from '../models/Agent';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing request body' }),
      };
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(event.body);
    } catch (error) {
      console.error('JSON parsing error:', error);
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid JSON in request body' }),
      };
    }

    let validatedData;
    try {
      validatedData = createAgentInputSchema.parse(parsedBody);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: 'Validation Error',
            errors: error.errors,
          }),
        };
      }
      throw error; // Re-throw other unexpected errors
    }

    const agent: Agent = {
      id: uuidv4(),
      name: validatedData.name,
      description: validatedData.description,
      model: validatedData.model,
      status: validatedData.status ?? 'active',
      temperature: validatedData.temperature ?? 0.7,
      createdAt: new Date().toISOString(),
    };

    await dynamoDB.send(
      new PutCommand({
        TableName: process.env.AGENTS_TABLE!,
        Item: agent,
      }),
    );

    return {
      statusCode: 201,
      body: JSON.stringify(agent),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
