import { APIGatewayProxyHandler } from 'aws-lambda';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';
import { ReturnValue } from '@aws-sdk/client-dynamodb';

import { dynamoDB } from '../db/client';
import {
  agentSchema,
  Agent,
  UpdateAgentInput,
  updateAgentInputSchema,
} from '../models/Agent';
import { logger } from '../utils/logger';
import { errorHandler } from '../utils/errorHandler';
import { NotFoundError, BadRequestError } from '../utils/errors';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    logger.info({ message: 'Updating agent' });

    const { id } = event.pathParameters || {};

    const idParam = z.object({ id: agentSchema.shape.id });
    const idValidationResult = idParam.safeParse({ id });

    if (!idValidationResult.success) {
      throw new BadRequestError(
        'Invalid agent ID',
        idValidationResult.error.flatten(),
      );
    }

    const validatedId = idValidationResult.data.id;

    logger.info({ message: 'Agent ID validated', agentId: validatedId });

    if (!event.body) throw new BadRequestError('Missing request body');

    let parsedBody;
    try {
      parsedBody = JSON.parse(event.body);
    } catch {
      throw new BadRequestError('Invalid JSON in request body');
    }

    const validationResult = updateAgentInputSchema.safeParse(parsedBody);

    if (!validationResult.success) {
      throw new BadRequestError(
        'Invalid request body',
        validationResult.error.flatten(),
      );
    }

    const validatedData: UpdateAgentInput = validationResult.data;

    const updateExpressionParts: string[] = [];
    const expressionAttributeValues: Record<string, unknown> = {};
    const expressionAttributeNames: Record<string, string> = {};

    for (const key in validatedData) {
      if (Object.prototype.hasOwnProperty.call(validatedData, key)) {
        updateExpressionParts.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = (
          validatedData as Record<string, unknown>
        )[key];
      }
    }

    if (updateExpressionParts.length === 0) {
      throw new BadRequestError('No fields to update');
    }

    logger.info({
      message: 'Update expression parts created',
      updateExpressionParts,
      expressionAttributeValues,
    });

    const updateExpression = 'SET ' + updateExpressionParts.join(', ');

    const params = {
      TableName: process.env.AGENTS_TABLE!,
      Key: {
        id: validatedId,
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: ReturnValue.ALL_NEW,
      ConditionExpression: 'attribute_exists(id)', // Ensure item exists
    };

    logger.info({ message: 'DynamoDB update params created', params });

    try {
      const { Attributes } = await dynamoDB.send(new UpdateCommand(params));
      const updatedAgent: Agent = Attributes as Agent;

      logger.info({
        message: 'Agent updated successfully',
        agentId: validatedId,
        updatedFields: validatedData,
      });

      return {
        statusCode: 200,
        body: JSON.stringify(updatedAgent),
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
