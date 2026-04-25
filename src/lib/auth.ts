import type { NextResponse } from "next/server";
import type { Role, User } from "@prisma/client";
import { compare, hash } from "bcryptjs";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { env, isProduction } from "@/lib/env";

// ── Cookie names ──

export const ACCESS_COOKIE_NAME = "clockhub_access_token";
export const REFRESH_COOKIE_NAME = "clockhub_refresh_token";

// ── Password hashing ──

const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return compare(password, passwordHash);
}

// ── Cookie helpers ──

function cookieBase(maxAge: number) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  };
}

export function setAuthCookies(response: NextResponse, tokens: { accessToken: string; refreshToken: string }) {
  response.cookies.set(ACCESS_COOKIE_NAME, tokens.accessToken, cookieBase(env.ACCESS_TOKEN_TTL_SECONDS));
  response.cookies.set(REFRESH_COOKIE_NAME, tokens.refreshToken, cookieBase(env.REFRESH_TOKEN_TTL_SECONDS));
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE_NAME, "", { ...cookieBase(0), maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE_NAME, "", { ...cookieBase(0), maxAge: 0 });
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// ── Safe user serialization ──

export type SafeAuthUser = {
  id: number;
  name: string;
  email: string;
  teamId: string | null;
  role: Role;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
};

export function toSafeAuthUser(user: User): SafeAuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    teamId: user.teamId,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

// ── Token pair ──

export async function issueTokenPair(user: Pick<User, "id" | "email" | "role">) {
  const payload = { sub: String(user.id), email: user.email, role: user.role };

  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(payload),
    signRefreshToken(payload),
  ]);

  return { accessToken, refreshToken };
}
