import { z } from 'zod';

const envSchema = z.object({
  AGENTS_TABLE: z.string(),
});

const env = envSchema.parse(process.env);

export const config = {
  agentsTable: env.AGENTS_TABLE,
};
