import { z } from 'zod';

export const agentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  model: z.enum(['gpt-4', 'claude', 'mistral', 'custom']),
  status: z.enum(['active', 'inactive']).default('active').optional(),
  temperature: z.number().min(0).max(1).default(0.7).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const createAgentInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  model: z.enum(['gpt-4', 'claude', 'mistral', 'custom']),
  status: z.enum(['active', 'inactive']).default('active').optional(),
  temperature: z.number().min(0).max(1).default(0.7).optional(),
});

export type Agent = z.infer<typeof agentSchema>;
export type CreateAgentInput = z.infer<typeof createAgentInputSchema>;
