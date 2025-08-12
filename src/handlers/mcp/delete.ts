import { APIGatewayProxyHandler } from 'aws-lambda';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';

import { dynamoDB } from '../db/client';
import { config } from '../config';
import { logger } from '../utils/logger';
import { errorHandler } from '../utils/errorHandler';
import { handleConditionalCheckFailedException } from '../utils/errors';
import { validateAgentId } from '../utils/validation';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    logger.info({ message: 'Deleting agent' });

    const validatedId = validateAgentId(event);

    logger.info({
      message: 'Agent ID validated',
      agentId: validatedId,
    });

    try {
      await dynamoDB.send(
        new DeleteCommand({
          TableName: config.agentsTable,
          Key: {
            id: validatedId,
          },
          ConditionExpression: 'attribute_exists(id)', // Ensure item exists
        }),
      );

      logger.info({
        message: 'Agent deleted successfully',
        agentId: validatedId,
      });

      return {
        statusCode: 204,
        body: '',
      };
    } catch (error: unknown) {
      handleConditionalCheckFailedException(error);
      throw error; // Re-throw other unexpected errors
    }
  } catch (error: unknown) {
    return errorHandler(error);
  }
};
