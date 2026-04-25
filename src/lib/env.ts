export type AppEnv = {
  NODE_ENV: string;
  DATABASE_URL?: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ISSUER: string;
  JWT_AUDIENCE: string;
  ACCESS_TOKEN_TTL_SECONDS: number;
  REFRESH_TOKEN_TTL_SECONDS: number;
  COOKIE_DOMAIN?: string;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
};

function readEnv(key: string): string | undefined {
  const bun = (globalThis as typeof globalThis & { Bun?: { env?: Record<string, string | undefined> } }).Bun;
  return bun?.env?.[key];
}

function requireEnv(key: string): string {
  const value = readEnv(key);
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

function readNumber(key: string, defaultValue: number): number {
  const raw = readEnv(key);
  if (!raw) return defaultValue;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid numeric env var: ${key}`);
  }
  return value;
}

export const env: AppEnv = {
  NODE_ENV: readEnv("NODE_ENV") ?? "development",
  DATABASE_URL: readEnv("DATABASE_URL"),
  JWT_ACCESS_SECRET: requireEnv("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: requireEnv("JWT_REFRESH_SECRET"),
  JWT_ISSUER: readEnv("JWT_ISSUER") ?? "clockhub-auth",
  JWT_AUDIENCE: readEnv("JWT_AUDIENCE") ?? "clockhub-web",
  ACCESS_TOKEN_TTL_SECONDS: readNumber("ACCESS_TOKEN_TTL_SECONDS", 900),
  REFRESH_TOKEN_TTL_SECONDS: readNumber("REFRESH_TOKEN_TTL_SECONDS", 60 * 60 * 24 * 7),
  COOKIE_DOMAIN: readEnv("COOKIE_DOMAIN"),
  ADMIN_EMAIL: readEnv("ADMIN_EMAIL"),
  ADMIN_PASSWORD: readEnv("ADMIN_PASSWORD"),
};

export const isProduction = env.NODE_ENV === "production";

export function getOptionalEnv(key: string): string | undefined {
  return readEnv(key);
}
