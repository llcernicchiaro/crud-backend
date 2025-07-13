import { APIGatewayProxyHandler } from 'aws-lambda';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ReturnValue } from '@aws-sdk/client-dynamodb';

import { config } from '../config';
import { dynamoDB } from '../db/client';
import {
  Agent,
  UpdateAgentInput,
  updateAgentInputSchema,
} from '../models/Agent';
import { logger } from '../utils/logger';
import { errorHandler } from '../utils/errorHandler';
import {
  BadRequestError,
  handleConditionalCheckFailedException,
} from '../utils/errors';
import { validateAgentId, validateBody } from '../utils/validation';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    logger.info({ message: 'Updating agent' });

    const validatedId = validateAgentId(event);

    logger.info({ message: 'Agent ID validated', agentId: validatedId });

    const validatedData: UpdateAgentInput = validateBody(
      event,
      updateAgentInputSchema,
    );

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
      TableName: config.agentsTable,
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
      handleConditionalCheckFailedException(error);
      throw error; // Re-throw other unexpected errors
    }
  } catch (error: unknown) {
    return errorHandler(error);
  }
};
