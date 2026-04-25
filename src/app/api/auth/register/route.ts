import { NextRequest } from "next/server";
import { Role, UserStatus } from "@prisma/client";
import { fail, ok } from "@/lib/api-response";
import { db } from "@/lib/db";
import { sanitizeEmail, setAuthCookies, hashPassword, issueTokenPair, toSafeAuthUser } from "@/lib/auth";
import { registerSchema } from "@/schemas/auth";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Datos de registro inválidos", 400, "VALIDATION_ERROR");
    }

    const email = sanitizeEmail(parsed.data.email);
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return fail("El correo ya está registrado", 409, "EMAIL_TAKEN");
    }

    const password = await hashPassword(parsed.data.password);
    const user = await db.user.create({
      data: {
        name: parsed.data.name,
        email,
        password,
        role: Role.EMPLOYEE,
        status: UserStatus.ACTIVE,
      },
    });

    const tokens = await issueTokenPair(user);

    await writeAuditLog({
      action: "CREATE",
      userId: user.id,
      entity: "USER",
      entityId: String(user.id),
      message: "Registro de usuario completado",
      meta: { email: user.email },
    });

    await writeAuditLog({
      action: "LOGIN",
      userId: user.id,
      entity: "AUTH",
      entityId: String(user.id),
      message: "Inicio de sesión tras registro",
    });

    const response = ok("Registro exitoso", { user: toSafeAuthUser(user) }, { status: 201 });
    setAuthCookies(response, tokens);
    return response;
  } catch {
    return fail("No se pudo completar el registro", 500, "REGISTER_ERROR");
  }
}
