import { APIGatewayProxyHandler } from 'aws-lambda';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';

import { dynamoDB } from '../db/client';
import { config } from '../config';
import { logger } from '../utils/logger';
import { errorHandler } from '../utils/errorHandler';

export const handler: APIGatewayProxyHandler = async () => {
  try {
    logger.info({ message: 'Listing agents' });

    const { Items } = await dynamoDB.send(
      new ScanCommand({
        TableName: config.agentsTable,
      }),
    );

    logger.info({
      message: 'Agents listed successfully',
      count: Items ? Items.length : 0,
    });

    return {
      statusCode: 200,
      body: JSON.stringify(Items ?? []),
    };
  } catch (error) {
    return errorHandler(error);
  }
};
