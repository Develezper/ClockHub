import { NextRequest } from "next/server";
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME, clearAuthCookies } from "@/lib/auth";
import { fail, ok } from "@/lib/api-response";
import { verifyToken } from "@/lib/jwt";
import { writeAuditLog } from "@/lib/audit";

async function resolveUserIdFromTokens(request: NextRequest): Promise<number | undefined> {
  const accessToken = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

  if (accessToken) {
    try {
      const accessPayload = await verifyToken(accessToken, "access");
      const id = Number(accessPayload.sub);
      if (Number.isInteger(id) && id > 0) return id;
    } catch {
      // Continue with refresh token fallback.
    }
  }

  if (refreshToken) {
    try {
      const refreshPayload = await verifyToken(refreshToken, "refresh");
      const id = Number(refreshPayload.sub);
      if (Number.isInteger(id) && id > 0) return id;
    } catch {
      return undefined;
    }
  }

  return undefined;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await resolveUserIdFromTokens(request);

    if (userId) {
      await writeAuditLog({
        action: "LOGOUT",
        userId,
        entity: "AUTH",
        entityId: String(userId),
        message: "Cierre de sesión",
      });
    }

    const response = ok("Sesión cerrada correctamente");
    clearAuthCookies(response);
    return response;
  } catch {
    return fail("No se pudo cerrar la sesión", 500, "LOGOUT_ERROR");
  }
}
