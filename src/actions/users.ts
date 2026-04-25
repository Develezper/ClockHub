"use server";

import { Role, UserStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/hash";
import { writeAuditLog } from "@/lib/audit";
import { getSessionActor } from "@/lib/session";
import { createUserSchema, updateUserRoleSchema, updateUserSchema, updateUserStatusSchema } from "@/schemas/user";
import type { ApiResponse, User } from "@/types";

function toUserModel(user: {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}): User {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function requireAuthenticatedActor() {
  const actor = await getSessionActor();
  if (!actor) {
    return { ok: false as const, response: { success: false, message: "No autenticado", code: "UNAUTHORIZED" } };
  }
  return { ok: true as const, actor };
}

async function requireAdminActor() {
  const auth = await requireAuthenticatedActor();
  if (!auth.ok) return auth;

  if (auth.actor.role !== "ADMIN") {
    return {
      ok: false as const,
      response: { success: false, message: "No autorizado", code: "FORBIDDEN" } satisfies ApiResponse,
    };
  }

  return auth;
}

export async function getUsersAction(): Promise<ApiResponse<User[]>> {
  const auth = await requireAuthenticatedActor();
  if (!auth.ok) return auth.response;

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return {
    success: true,
    message: "Usuarios cargados",
    data: users.map(toUserModel),
  };
}

export async function createUserAction(input: unknown): Promise<ApiResponse<User>> {
  const auth = await requireAdminActor();
  if (!auth.ok) return auth.response;

  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Datos inválidos", code: "VALIDATION_ERROR" };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, message: "El correo ya está registrado", code: "EMAIL_TAKEN" };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      email,
      password: passwordHash,
      role: parsed.data.role,
      status: parsed.data.status,
    },
  });

  await writeAuditLog({
    action: "CREATE",
    userId: auth.actor.id,
    entity: "USER",
    entityId: String(user.id),
    message: "Usuario creado desde panel de administración",
    meta: { createdEmail: user.email, role: user.role },
  });

  return {
    success: true,
    message: "Usuario creado exitosamente",
    data: toUserModel(user),
  };
}

export async function updateUserAction(input: unknown): Promise<ApiResponse<User>> {
  const auth = await requireAdminActor();
  if (!auth.ok) return auth.response;

  const parsed = updateUserSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Datos inválidos", code: "VALIDATION_ERROR" };
  }

  const userId = Number(parsed.data.id);
  if (!Number.isInteger(userId) || userId <= 0) {
    return { success: false, message: "Usuario inválido", code: "INVALID_USER" };
  }

  const existing = await db.user.findUnique({ where: { id: userId } });
  if (!existing) {
    return { success: false, message: "Usuario no encontrado", code: "USER_NOT_FOUND" };
  }

  const email = parsed.data.email.toLowerCase();
  const emailInUse = await db.user.findFirst({
    where: {
      email,
      NOT: { id: userId },
    },
  });

  if (emailInUse) {
    return { success: false, message: "El correo ya está registrado", code: "EMAIL_TAKEN" };
  }

  const password = parsed.data.password ? await hashPassword(parsed.data.password) : undefined;

  const updated = await db.user.update({
    where: { id: userId },
    data: {
      name: parsed.data.name,
      email,
      role: parsed.data.role,
      status: parsed.data.status,
      ...(password ? { password } : {}),
    },
  });

  await writeAuditLog({
    action: "UPDATE",
    userId: auth.actor.id,
    entity: "USER",
    entityId: String(updated.id),
    message: "Usuario actualizado",
    meta: {
      before: { role: existing.role, status: existing.status },
      after: { role: updated.role, status: updated.status },
    },
  });

  return {
    success: true,
    message: "Usuario actualizado exitosamente",
    data: toUserModel(updated),
  };
}

export async function deleteUserAction(id: string): Promise<ApiResponse<{ id: string }>> {
  const auth = await requireAdminActor();
  if (!auth.ok) return auth.response;

  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) {
    return { success: false, message: "Usuario inválido", code: "INVALID_USER" };
  }

  if (userId === auth.actor.id) {
    return { success: false, message: "No puedes eliminar tu propio usuario", code: "SELF_DELETE_FORBIDDEN" };
  }

  const existing = await db.user.findUnique({ where: { id: userId } });
  if (!existing) {
    return { success: false, message: "Usuario no encontrado", code: "USER_NOT_FOUND" };
  }

  await db.user.delete({ where: { id: userId } });

  await writeAuditLog({
    action: "DELETE",
    userId: auth.actor.id,
    entity: "USER",
    entityId: String(userId),
    message: "Usuario eliminado",
    meta: { deletedEmail: existing.email },
  });

  return {
    success: true,
    message: "Usuario eliminado exitosamente",
    data: { id: String(userId) },
  };
}

export async function changeUserRoleAction(input: unknown): Promise<ApiResponse<User>> {
  const auth = await requireAdminActor();
  if (!auth.ok) return auth.response;

  const parsed = updateUserRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Datos inválidos", code: "VALIDATION_ERROR" };
  }

  const userId = Number(parsed.data.id);
  if (!Number.isInteger(userId) || userId <= 0) {
    return { success: false, message: "Usuario inválido", code: "INVALID_USER" };
  }

  const existing = await db.user.findUnique({ where: { id: userId } });
  if (!existing) {
    return { success: false, message: "Usuario no encontrado", code: "USER_NOT_FOUND" };
  }

  const updated = await db.user.update({
    where: { id: userId },
    data: { role: parsed.data.role },
  });

  await writeAuditLog({
    action: "ROLE_CHANGE",
    userId: auth.actor.id,
    entity: "USER",
    entityId: String(userId),
    message: "Cambio de rol de usuario",
    meta: { old: existing.role, new: updated.role },
  });

  return {
    success: true,
    message: "Rol actualizado exitosamente",
    data: toUserModel(updated),
  };
}

export async function changeUserStatusAction(input: unknown): Promise<ApiResponse<User>> {
  const auth = await requireAdminActor();
  if (!auth.ok) return auth.response;

  const parsed = updateUserStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Datos inválidos", code: "VALIDATION_ERROR" };
  }

  const userId = Number(parsed.data.id);
  if (!Number.isInteger(userId) || userId <= 0) {
    return { success: false, message: "Usuario inválido", code: "INVALID_USER" };
  }

  const existing = await db.user.findUnique({ where: { id: userId } });
  if (!existing) {
    return { success: false, message: "Usuario no encontrado", code: "USER_NOT_FOUND" };
  }

  const updated = await db.user.update({
    where: { id: userId },
    data: { status: parsed.data.status },
  });

  await writeAuditLog({
    action: "UPDATE",
    userId: auth.actor.id,
    entity: "USER",
    entityId: String(userId),
    message: "Cambio de estado de usuario",
    meta: { old: existing.status, new: updated.status },
  });

  return {
    success: true,
    message: "Estado actualizado exitosamente",
    data: toUserModel(updated),
  };
}
