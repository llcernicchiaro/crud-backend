import { APIGatewayProxyHandler } from 'aws-lambda';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';

import { dynamoDB } from '../db/client';
import { agentSchema } from '../models/Agent';
import { logger } from '../utils/logger';
import { errorHandler } from '../utils/errorHandler';
import { NotFoundError, BadRequestError } from '../utils/errors';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    logger.info({ message: 'Deleting agent' });

    const { id } = event.pathParameters || {};

    const idParam = z.object({ id: agentSchema.shape.id });
    const validationResult = idParam.safeParse({ id });

    if (!validationResult.success) {
      throw new BadRequestError(
        'Invalid agent ID',
        validationResult.error.flatten(),
      );
    }

    logger.info({
      message: 'Agent ID validated',
      agentId: validationResult.data.id,
    });

    const validatedId = validationResult.data.id;

    try {
      await dynamoDB.send(
        new DeleteCommand({
          TableName: process.env.AGENTS_TABLE!,
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
      if (
        error instanceof Error &&
        'name' in error &&
        error.name === 'ConditionalCheckFailedException'
      ) {
        throw new NotFoundError('Agent not found');
      }
      throw error; // Re-throw other unexpected errors
    }
  } catch (error: unknown) {
    return errorHandler(error);
  }
};
