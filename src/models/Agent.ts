import { z } from 'zod';

export const agentSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  model: z.enum(['gpt-4', 'claude', 'mistral', 'custom']),
  status: z.enum(['active', 'inactive']).default('active').optional(),
  temperature: z.number().min(0).max(1).default(0.7).optional(),
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional(),
});

export const createAgentInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  model: z.enum(['gpt-4', 'claude', 'mistral', 'custom']),
  status: z.enum(['active', 'inactive']).default('active').optional(),
  temperature: z.number().min(0).max(1).default(0.7).optional(),
});

export const updateAgentInputSchema = z
  .object({
    name: z.string().min(1),
    description: z.string(),
    model: z.enum(['gpt-4', 'claude', 'mistral', 'custom']),
    status: z.enum(['active', 'inactive']),
    temperature: z.number().min(0).max(1),
  })
  .partial();

export type Agent = z.infer<typeof agentSchema>;
export type CreateAgentInput = z.infer<typeof createAgentInputSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentInputSchema>;
