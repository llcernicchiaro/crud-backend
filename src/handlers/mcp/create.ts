import { APIGatewayProxyHandler } from 'aws-lambda';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

import { dynamoDB } from '../db/client';
import { config } from '../config';
import { Mcp, createMcpInputSchema } from '../models/MCP';
import { logger } from '../utils/logger';
import { errorHandler } from '../utils/errorHandler';
import { validateBody } from '../utils/validation';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    logger.info({ message: 'Creating new mcp' });

    const validatedData = validateBody(event, createMcpInputSchema);

    const mcp: Mcp = {
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
        TableName: config.mcpsTable,
        Item: mcp,
      }),
    );

    logger.info({
      message: 'Mcp created successfully',
      mcpId: mcp.id,
    });

    return {
      statusCode: 201,
      body: JSON.stringify(mcp),
    };
  } catch (error) {
    return errorHandler(error);
  }
};

