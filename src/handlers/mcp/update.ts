import { APIGatewayProxyHandler } from 'aws-lambda';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ReturnValue } from '@aws-sdk/client-dynamodb';

import { config } from '../config';
import { dynamoDB } from '../db/client';
import {
  Mcp,
  UpdateMcpInput,
  updateMcpInputSchema,
} from '../models/MCP';
import { logger } from '../utils/logger';
import { errorHandler } from '../utils/errorHandler';
import {
  BadRequestError,
  handleMcpNotFound,
} from '../utils/errors';
import { validateMcpId, validateBody } from '../utils/validation';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    logger.info({ message: 'Updating mcp' });

    const validatedId = validateMcpId(event);

    logger.info({ message: 'Mcp ID validated', mcpId: validatedId });

    const validatedData: UpdateMcpInput = validateBody(
      event,
      updateMcpInputSchema,
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
      TableName: config.mcpsTable,
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
      const updatedMcp: Mcp = Attributes as Mcp;

      logger.info({
        message: 'Mcp updated successfully',
        mcpId: validatedId,
        updatedFields: validatedData,
      });

      return {
        statusCode: 200,
        body: JSON.stringify(updatedMcp),
      };
    } catch (error: unknown) {
      handleMcpNotFound(error);
      throw error; // Re-throw other unexpected errors
    }
  } catch (error: unknown) {
    return errorHandler(error);
  }
};

