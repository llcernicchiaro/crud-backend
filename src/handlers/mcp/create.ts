import { APIGatewayProxyHandler } from 'aws-lambda';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

import { dynamoDB } from '../db/client';
import { config } from '../config';
import { Agent, createAgentInputSchema } from '../models/Agent';
import { logger } from '../utils/logger';
import { errorHandler } from '../utils/errorHandler';
import { validateBody } from '../utils/validation';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    logger.info({ message: 'Creating new agent' });

    const validatedData = validateBody(event, createAgentInputSchema);

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
        TableName: config.agentsTable,
        Item: agent,
      }),
    );

    logger.info({
      message: 'Agent created successfully',
      agentId: agent.id,
    });

    return {
      statusCode: 201,
      body: JSON.stringify(agent),
    };
  } catch (error) {
    return errorHandler(error);
  }
};
