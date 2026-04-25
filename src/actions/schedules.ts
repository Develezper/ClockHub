"use server";

import type { ScheduleStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { getSessionActor } from "@/lib/session";
import { cancelScheduleSchema, createScheduleSchema, updateScheduleSchema } from "@/schemas/schedule";
import type { ApiResponse, Schedule } from "@/types";

function toScheduleModel(schedule: {
  id: number;
  title: string;
  description: string | null;
  startAt: Date;
  endAt: Date;
  status: ScheduleStatus;
  userId: number;
  createdById: number;
  createdAt: Date;
  updatedAt: Date;
}): Schedule {
  return {
    id: String(schedule.id),
    title: schedule.title,
    description: schedule.description ?? undefined,
    startTime: schedule.startAt,
    endTime: schedule.endAt,
    status: schedule.status === "CANCELLED" ? "CANCELLED" : "SCHEDULED",
    userId: String(schedule.userId),
    createdBy: String(schedule.createdById),
    createdAt: schedule.createdAt,
    updatedAt: schedule.updatedAt,
  };
}

const UNAUTHORIZED = { success: false as const, message: "No autenticado", code: "UNAUTHORIZED" };
const FORBIDDEN = { success: false as const, message: "No autorizado", code: "FORBIDDEN" };

async function requireActor() {
  const actor = await getSessionActor();
  if (!actor) return null;
  return actor;
}

async function canManagerAccessUser(actorId: number, actorTeamId: string | undefined, targetUserId: number) {
  if (targetUserId === actorId) {
    return true;
  }

  if (!actorTeamId) {
    return false;
  }

  const target = await db.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, teamId: true, status: true },
  });

  return Boolean(target && target.status === "ACTIVE" && target.teamId === actorTeamId);
}

async function assertUserCanBeScheduled(actor: { id: number; role: string; teamId?: string }, targetUserId: number) {
  const target = await db.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, status: true, teamId: true },
  });

  if (!target || target.status !== "ACTIVE") {
    return { ok: false as const, response: { success: false, message: "Usuario inválido", code: "INVALID_USER" } };
  }

  if (actor.role === "MANAGER") {
    const managerAllowed = await canManagerAccessUser(actor.id, actor.teamId, target.id);
    if (!managerAllowed) {
      return { ok: false as const, response: { success: false, message: "No autorizado", code: "FORBIDDEN" } };
    }
  }

  return { ok: true as const };
}

async function assertManagerCanAccessSchedule(
  actor: { id: number; role: string; teamId?: string },
  scheduleUserId: number,
) {
  if (actor.role !== "MANAGER") {
    return { ok: true as const };
  }

  const managerAllowed = await canManagerAccessUser(actor.id, actor.teamId, scheduleUserId);
  if (!managerAllowed) {
    return { ok: false as const, response: { success: false, message: "No autorizado", code: "FORBIDDEN" } };
  }

  return { ok: true as const };
}

async function hasConflict(userId: number, startAt: Date, endAt: Date, excludeId?: number) {
  const conflict = await db.schedule.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
      AND: [{ startAt: { lt: endAt } }, { endAt: { gt: startAt } }],
    },
    select: { id: true },
  });

  return Boolean(conflict);
}

export async function getSchedulesAction(): Promise<ApiResponse<Schedule[]>> {
  const actor = await requireActor();
  if (!actor) return UNAUTHORIZED;

  const where =
    actor.role === "ADMIN"
      ? undefined
      : actor.role === "MANAGER" && actor.teamId
        ? { OR: [{ userId: actor.id }, { user: { teamId: actor.teamId } }] }
        : { userId: actor.id };

  const schedules = await db.schedule.findMany({ where, orderBy: { startAt: "desc" } });

  return { success: true, message: "Horarios cargados", data: schedules.map(toScheduleModel) };
}

export async function createScheduleAction(input: unknown): Promise<ApiResponse<Schedule>> {
  const actor = await requireActor();
  if (!actor) return UNAUTHORIZED;
  if (actor.role === "EMPLOYEE") return FORBIDDEN;

  const parsed = createScheduleSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Datos inválidos", code: "VALIDATION_ERROR" };

  const userId = Number(parsed.data.userId);
  if (!Number.isInteger(userId) || userId <= 0) return { success: false, message: "Usuario inválido", code: "INVALID_USER" };

  const allowedUser = await assertUserCanBeScheduled(actor, userId);
  if (!allowedUser.ok) return allowedUser.response;

  const startAt = new Date(parsed.data.startTime);
  const endAt = new Date(parsed.data.endTime);

  if (await hasConflict(userId, startAt, endAt)) {
    return { success: false, message: "Existe un conflicto de horario", code: "SCHEDULE_CONFLICT" };
  }

  const schedule = await db.schedule.create({
    data: { title: parsed.data.title, description: parsed.data.description, startAt, endAt, userId, createdById: actor.id, status: "ACTIVE" },
  });

  await writeAuditLog({ action: "CREATE", userId: actor.id, entity: "SCHEDULE", entityId: String(schedule.id), message: "Horario creado", meta: { assignedUserId: userId, startAt, endAt } });

  return { success: true, message: "Horario creado exitosamente", data: toScheduleModel(schedule) };
}

export async function updateScheduleAction(input: unknown): Promise<ApiResponse<Schedule>> {
  const actor = await requireActor();
  if (!actor) return UNAUTHORIZED;
  if (actor.role === "EMPLOYEE") return FORBIDDEN;

  const parsed = updateScheduleSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Datos inválidos", code: "VALIDATION_ERROR" };

  const scheduleId = Number(parsed.data.id);
  const userId = Number(parsed.data.userId);
  if (!Number.isInteger(scheduleId) || scheduleId <= 0) return { success: false, message: "Horario inválido", code: "INVALID_SCHEDULE" };
  if (!Number.isInteger(userId) || userId <= 0) return { success: false, message: "Usuario inválido", code: "INVALID_USER" };

  const existing = await db.schedule.findUnique({ where: { id: scheduleId } });
  if (!existing) return { success: false, message: "Horario no encontrado", code: "SCHEDULE_NOT_FOUND" };

  const accessCheck = await assertManagerCanAccessSchedule(actor, existing.userId);
  if (!accessCheck.ok) return accessCheck.response;

  const allowedTarget = await assertUserCanBeScheduled(actor, userId);
  if (!allowedTarget.ok) return allowedTarget.response;

  const startAt = new Date(parsed.data.startTime);
  const endAt = new Date(parsed.data.endTime);

  if (await hasConflict(userId, startAt, endAt, scheduleId)) {
    return { success: false, message: "Existe un conflicto de horario", code: "SCHEDULE_CONFLICT" };
  }

  const updated = await db.schedule.update({
    where: { id: scheduleId },
    data: { title: parsed.data.title, description: parsed.data.description, startAt, endAt, userId, status: "ACTIVE" },
  });

  await writeAuditLog({
    action: "UPDATE", userId: actor.id, entity: "SCHEDULE", entityId: String(scheduleId), message: "Horario actualizado",
    meta: { before: { startAt: existing.startAt, endAt: existing.endAt, userId: existing.userId }, after: { startAt: updated.startAt, endAt: updated.endAt, userId: updated.userId } },
  });

  return { success: true, message: "Horario actualizado exitosamente", data: toScheduleModel(updated) };
}

export async function cancelScheduleAction(input: unknown): Promise<ApiResponse<{ id: string }>> {
  const actor = await requireActor();
  if (!actor) return UNAUTHORIZED;
  if (actor.role === "EMPLOYEE") return FORBIDDEN;

  const parsed = cancelScheduleSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Horario inválido", code: "VALIDATION_ERROR" };

  const scheduleId = Number(parsed.data.id);
  if (!Number.isInteger(scheduleId) || scheduleId <= 0) return { success: false, message: "Horario inválido", code: "INVALID_SCHEDULE" };

  const existing = await db.schedule.findUnique({ where: { id: scheduleId } });
  if (!existing) return { success: false, message: "Horario no encontrado", code: "SCHEDULE_NOT_FOUND" };

  const accessCheck = await assertManagerCanAccessSchedule(actor, existing.userId);
  if (!accessCheck.ok) return accessCheck.response;

  await db.schedule.update({ where: { id: scheduleId }, data: { status: "CANCELLED" } });

  await writeAuditLog({ action: "DELETE", userId: actor.id, entity: "SCHEDULE", entityId: String(scheduleId), message: "Horario cancelado (soft delete)", meta: { oldStatus: existing.status, newStatus: "CANCELLED" } });

  return { success: true, message: "Horario cancelado exitosamente", data: { id: String(scheduleId) } };
}
