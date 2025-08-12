import { APIGatewayProxyHandler } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';

import { dynamoDB } from '../db/client';
import { config } from '../config';
import { Mcp } from '../models/MCP';
import { logger } from '../utils/logger';
import { errorHandler } from '../utils/errorHandler';
import { NotFoundError } from '../utils/errors';
import { validateMcpId } from '../utils/validation';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    logger.info({
      message: 'Fetching mcp',
      mcpId: event.pathParameters?.id,
    });

    const validatedId = validateMcpId(event);

    const { Item } = await dynamoDB.send(
      new GetCommand({
        TableName: config.mcpsTable,
        Key: {
          id: validatedId,
        },
      }),
    );

    if (!Item) {
      throw new NotFoundError('Mcp not found');
    }

    const mcp: Mcp = Item as Mcp;

    logger.info({
      message: 'Mcp fetched successfully',
      mcpId: mcp.id,
    });

    return {
      statusCode: 200,
      body: JSON.stringify(mcp),
    };
  } catch (error) {
    return errorHandler(error);
  }
};
