import type { NextResponse } from "next/server";
import { env, isProduction } from "@/lib/env";

export const ACCESS_COOKIE_NAME = "clockhub_access_token";
export const REFRESH_COOKIE_NAME = "clockhub_refresh_token";

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
