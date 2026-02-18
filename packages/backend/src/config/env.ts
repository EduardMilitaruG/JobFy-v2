import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  INFOJOBS_USERNAME: z.string().optional(),
  INFOJOBS_PASSWORD: z.string().optional(),
  LINKEDIN_USERNAME: z.string().optional(),
  LINKEDIN_PASSWORD: z.string().optional(),
});

export const env = envSchema.parse(process.env);
