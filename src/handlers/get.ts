import { APIGatewayProxyHandler } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';

import { dynamoDB } from '../db/client';
import { config } from '../config';
import { Agent } from '../models/Agent';
import { logger } from '../utils/logger';
import { errorHandler } from '../utils/errorHandler';
import { NotFoundError } from '../utils/errors';
import { validateAgentId } from '../utils/validation';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    logger.info({
      message: 'Fetching agent',
      agentId: event.pathParameters?.id,
    });

    const validatedId = validateAgentId(event);

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
