import { cookies } from "next/headers";
import { UserStatus } from "@prisma/client";
import { ACCESS_COOKIE_NAME } from "@/lib/auth";
import { fail, ok } from "@/lib/api-response";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { toSafeAuthUser } from "@/lib/auth-service";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

    if (!token) {
      return fail("No autenticado", 401, "UNAUTHORIZED");
    }

    const payload = await verifyToken(token, "access");
    const userId = Number(payload.sub);
    if (!Number.isInteger(userId) || userId <= 0) {
      return fail("Token inválido", 401, "INVALID_TOKEN");
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || user.status !== UserStatus.ACTIVE) {
      return fail("Sesión inválida", 401, "INVALID_SESSION");
    }

    return ok("Sesión activa", { user: toSafeAuthUser(user) });
  } catch {
    return fail("No autenticado", 401, "UNAUTHORIZED");
  }
}
