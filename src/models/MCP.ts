import { z } from 'zod';

export const mcpSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  model: z.enum(['gpt-4', 'claude', 'mistral', 'custom']),
  status: z.enum(['active', 'inactive']).default('active').optional(),
  temperature: z.number().min(0).max(1).default(0.7).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const createMcpInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  model: z.enum(['gpt-4', 'claude', 'mistral', 'custom']),
  status: z.enum(['active', 'inactive']).default('active').optional(),
  temperature: z.number().min(0).max(1).default(0.7).optional(),
});

export const updateMcpInputSchema = z
  .object({
    name: z.string().min(1),
    description: z.string(),
    model: z.enum(['gpt-4', 'claude', 'mistral', 'custom']),
    status: z.enum(['active', 'inactive']),
    temperature: z.number().min(0).max(1),
  })
  .partial();

export type Mcp = z.infer<typeof mcpSchema>;
export type CreateMcpInput = z.infer<typeof createMcpInputSchema>;
export type UpdateMcpInput = z.infer<typeof updateMcpInputSchema>;

