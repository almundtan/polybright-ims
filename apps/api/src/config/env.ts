import { z } from 'zod';

type Env = z.infer<typeof envSchema>;

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  ORIGIN: z.string().optional(),
  SESSION_COOKIE_NAME: z.string().default('polybright.sid'),
  TIMEZONE: z.string().default('Asia/Manila'),
  CURRENCY: z.string().default('PHP')
});

const parsed = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  ORIGIN: process.env.ORIGIN,
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
  TIMEZONE: process.env.TIMEZONE,
  CURRENCY: process.env.CURRENCY
});

if (!parsed.success) {
  console.error('❌ Invalid environment configuration', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration');
}

export const env: Env = parsed.data;
