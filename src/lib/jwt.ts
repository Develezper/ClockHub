import { jwtVerify, SignJWT, type JWTPayload } from "jose";
import { env } from "@/lib/env";

export type AppUserRole = "ADMIN" | "MANAGER" | "EMPLOYEE";
export type TokenType = "access" | "refresh";

export interface AuthTokenPayload extends JWTPayload {
  sub: string;
  role: AppUserRole;
  type: TokenType;
  email?: string;
}

export type TokenSubjectPayload = {
  sub: string;
  role: AppUserRole;
  email?: string;
};

const encoder = new TextEncoder();

function getSecret(type: TokenType): Uint8Array {
  return encoder.encode(type === "access" ? env.JWT_ACCESS_SECRET : env.JWT_REFRESH_SECRET);
}

function baseClaims(payload: TokenSubjectPayload, type: TokenType) {
  return {
    sub: payload.sub,
    role: payload.role,
    email: payload.email,
    type,
  } satisfies Pick<AuthTokenPayload, "sub" | "role" | "email" | "type">;
}

export async function signAccessToken(payload: TokenSubjectPayload): Promise<string> {
  return new SignJWT(baseClaims(payload, "access"))
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(env.JWT_ISSUER)
    .setAudience(env.JWT_AUDIENCE)
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${env.ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(getSecret("access"));
}

export async function signRefreshToken(payload: TokenSubjectPayload): Promise<string> {
  return new SignJWT(baseClaims(payload, "refresh"))
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(env.JWT_ISSUER)
    .setAudience(env.JWT_AUDIENCE)
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${env.REFRESH_TOKEN_TTL_SECONDS}s`)
    .sign(getSecret("refresh"));
}

export async function verifyToken(token: string, type: TokenType): Promise<AuthTokenPayload> {
  const { payload } = await jwtVerify<AuthTokenPayload>(token, getSecret(type), {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  });

  if (payload.type !== type || !payload.sub || !payload.role) {
    throw new Error("Invalid token payload");
  }

  return payload;
}
