import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(10).default('fintech-ai-coach-super-secure-jwt-secret-key-upay-2026'),
  JWT_REFRESH_SECRET: z.string().min(10).default('fintech-ai-coach-super-secure-refresh-secret-upay-2026'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  GEMINI_API_KEY: z.string().optional().default(''),
  AI_PROVIDER: z.enum(['gemini', 'fallback']).default('fallback'),
  DEFAULT_CURRENCY: z.string().default('BDT'),
  DEFAULT_LOCALE: z.string().default('en-BD'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  throw new Error('Invalid environment configuration');
}

export const env = parsedEnv.data;
