import { z } from 'zod';

const optionalText = z.preprocess(
  (value) => (typeof value !== 'string' || value.trim() === '' ? undefined : value),
  z.string().min(1).optional(),
);

const optionalPort = z.preprocess(
  (value) => (value === undefined || value === '' ? undefined : value),
  z.coerce.number().int().positive().optional(),
);

const positiveSeconds = z.coerce.number().int().positive();

export const envSchema = z.object({
  DATABASE_URL: z.string().trim().min(1),
  DIRECT_URL: optionalText,
  SHADOW_DATABASE_URL: optionalText,
  JWT_SECRET: z.string().trim().min(1),
  ACCESS_TOKEN_TTL_SECONDS: positiveSeconds,
  REFRESH_TOKEN_TTL_SECONDS: positiveSeconds,
  CLIENT_ORIGIN: optionalText,
  PORT: optionalPort,
  OBSERVE_APP_KEY: optionalText,
  OBSERVE_APP_SECRET: optionalText,
  RESEND_API_KEY: optionalText,
  RESEND_FROM: optionalText,
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(source: Record<string, unknown> = process.env): Env {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment\n${details}`);
  }
  return parsed.data;
}

export function accessTokenTtlSeconds() {
  return envSchema
    .pick({ ACCESS_TOKEN_TTL_SECONDS: true })
    .parse({ ACCESS_TOKEN_TTL_SECONDS: process.env.ACCESS_TOKEN_TTL_SECONDS })
    .ACCESS_TOKEN_TTL_SECONDS;
}

export function refreshTokenTtlSeconds() {
  return envSchema
    .pick({ REFRESH_TOKEN_TTL_SECONDS: true })
    .parse({ REFRESH_TOKEN_TTL_SECONDS: process.env.REFRESH_TOKEN_TTL_SECONDS })
    .REFRESH_TOKEN_TTL_SECONDS;
}
