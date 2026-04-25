import { NextRequest } from "next/server";
import { UserStatus } from "@prisma/client";
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME, setAuthCookies } from "@/lib/auth";
import { fail, ok } from "@/lib/api-response";
import { verifyToken } from "@/lib/jwt";
import { db } from "@/lib/db";
import { issueTokenPair, toSafeAuthUser } from "@/lib/auth-service";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
    if (!refreshToken) {
      return fail("Refresh token no proporcionado", 401, "MISSING_REFRESH_TOKEN");
    }

    const payload = await verifyToken(refreshToken, "refresh");
    const userId = Number(payload.sub);
    if (!Number.isInteger(userId) || userId <= 0) {
      return fail("Refresh token inválido", 401, "INVALID_REFRESH_TOKEN");
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || user.status !== UserStatus.ACTIVE) {
      return fail("Sesión inválida", 401, "INVALID_SESSION");
    }

    const tokens = await issueTokenPair(user);
    const response = ok("Sesión renovada", { user: toSafeAuthUser(user) });
    setAuthCookies(response, tokens);

    // Ensure any stale access cookie gets replaced consistently.
    if (!response.cookies.get(ACCESS_COOKIE_NAME)?.value) {
      return fail("No se pudo renovar la sesión", 500, "TOKEN_ROTATION_ERROR");
    }

    return response;
  } catch {
    return fail("Refresh token inválido o expirado", 401, "INVALID_REFRESH_TOKEN");
  }
}
