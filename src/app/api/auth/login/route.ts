import { NextRequest } from "next/server";
import { UserStatus } from "@prisma/client";
import { fail, ok } from "@/lib/api-response";
import { db } from "@/lib/db";
import { sanitizeEmail, setAuthCookies, verifyPassword, issueTokenPair, toSafeAuthUser } from "@/lib/auth";
import { loginSchema } from "@/schemas/auth";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Credenciales inválidas", 400, "VALIDATION_ERROR");
    }

    const email = sanitizeEmail(parsed.data.email);
    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      return fail("Credenciales inválidas", 401, "INVALID_CREDENTIALS");
    }

    if (user.status !== UserStatus.ACTIVE) {
      return fail("Usuario inactivo o suspendido", 403, "USER_INACTIVE");
    }

    const validPassword = await verifyPassword(parsed.data.password, user.password);
    if (!validPassword) {
      return fail("Credenciales inválidas", 401, "INVALID_CREDENTIALS");
    }

    const tokens = await issueTokenPair(user);

    await writeAuditLog({
      action: "LOGIN",
      userId: user.id,
      entity: "AUTH",
      entityId: String(user.id),
      message: "Inicio de sesión exitoso",
    });

    const response = ok("Inicio de sesión exitoso", { user: toSafeAuthUser(user) });
    setAuthCookies(response, tokens);
    return response;
  } catch {
    return fail("No se pudo iniciar sesión", 500, "LOGIN_ERROR");
  }
}
