import { APIGatewayProxyHandler } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';

import { dynamoDB } from '../db/client';
import { config } from '../config';
import { agentSchema, Agent } from '../models/Agent';
import { logger } from '../utils/logger';
import { errorHandler } from '../utils/errorHandler';
import { NotFoundError } from '../utils/errors';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    logger.info({
      message: 'Fetching agent',
      agentId: event.pathParameters?.id,
    });

    const { id } = event.pathParameters ?? {};

    let validatedId: string;
    try {
      const idParam = z.object({ id: agentSchema.shape.id }).parse({ id });
      validatedId = idParam.id;
    } catch (error) {
      return errorHandler(error); // Pass ZodError to errorHandler
    }

    const { Item } = await dynamoDB.send(
      new GetCommand({
        TableName: config.agentsTable,
        Key: {
          id: validatedId,
        },
      }),
    );

    if (!Item) {
      throw new NotFoundError('Agent not found');
    }

    const agent: Agent = Item as Agent;

    logger.info({
      message: 'Agent fetched successfully',
      agentId: agent.id,
    });

    return {
      statusCode: 200,
      body: JSON.stringify(agent),
    };
  } catch (error) {
    return errorHandler(error);
  }
};
