import { APIGatewayProxyEvent } from 'aws-lambda';
import { z } from 'zod';
import { agentSchema } from '../models/Agent';
import { BadRequestError } from './errors';

export function validateAgentId(event: APIGatewayProxyEvent): string {
  const { id } = event.pathParameters ?? {};

  const idParam = z.object({ id: agentSchema.shape.id });
  const validationResult = idParam.safeParse({ id });

  if (!validationResult.success) {
    throw new BadRequestError(
      'Invalid agent ID',
      validationResult.error.issues,
    );
  }

  return validationResult.data.id;
}

export function validateBody<T>(
  event: APIGatewayProxyEvent,
  schema: z.ZodType<T>,
): T {
  if (!event.body) {
    throw new BadRequestError('Missing request body');
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(event.body);
  } catch {
    throw new BadRequestError('Invalid JSON in request body');
  }

  const validationResult = schema.safeParse(parsedBody);

  if (!validationResult.success) {
    throw new BadRequestError(
      'Invalid request body',
      validationResult.error.issues,
    );
  }

  return validationResult.data;
}
