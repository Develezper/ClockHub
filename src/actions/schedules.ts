"use server";

import { ScheduleStatus } from "@prisma/client";
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

async function requireActor() {
  const actor = await getSessionActor();
  if (!actor) {
    return { ok: false as const, response: { success: false, message: "No autenticado", code: "UNAUTHORIZED" } };
  }

  return { ok: true as const, actor };
}

function canMutateSchedules(role: string): boolean {
  return role === "ADMIN" || role === "MANAGER";
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
  const auth = await requireActor();
  if (!auth.ok) return auth.response;

  const schedules = await db.schedule.findMany({
    orderBy: { startAt: "desc" },
  });

  return {
    success: true,
    message: "Horarios cargados",
    data: schedules.map(toScheduleModel),
  };
}

export async function createScheduleAction(input: unknown): Promise<ApiResponse<Schedule>> {
  const auth = await requireActor();
  if (!auth.ok) return auth.response;

  if (!canMutateSchedules(auth.actor.role)) {
    return { success: false, message: "No autorizado", code: "FORBIDDEN" };
  }

  const parsed = createScheduleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Datos inválidos", code: "VALIDATION_ERROR" };
  }

  const userId = Number(parsed.data.userId);
  if (!Number.isInteger(userId) || userId <= 0) {
    return { success: false, message: "Usuario inválido", code: "INVALID_USER" };
  }

  const startAt = new Date(parsed.data.startTime);
  const endAt = new Date(parsed.data.endTime);

  if (await hasConflict(userId, startAt, endAt)) {
    return { success: false, message: "Existe un conflicto de horario", code: "SCHEDULE_CONFLICT" };
  }

  const schedule = await db.schedule.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      startAt,
      endAt,
      userId,
      createdById: auth.actor.id,
      status: parsed.data.status === "CANCELLED" ? "CANCELLED" : "ACTIVE",
    },
  });

  await writeAuditLog({
    action: "CREATE",
    userId: auth.actor.id,
    entity: "SCHEDULE",
    entityId: String(schedule.id),
    message: "Horario creado",
    meta: { assignedUserId: userId, startAt, endAt },
  });

  return {
    success: true,
    message: "Horario creado exitosamente",
    data: toScheduleModel(schedule),
  };
}

export async function updateScheduleAction(input: unknown): Promise<ApiResponse<Schedule>> {
  const auth = await requireActor();
  if (!auth.ok) return auth.response;

  if (!canMutateSchedules(auth.actor.role)) {
    return { success: false, message: "No autorizado", code: "FORBIDDEN" };
  }

  const parsed = updateScheduleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Datos inválidos", code: "VALIDATION_ERROR" };
  }

  const scheduleId = Number(parsed.data.id);
  const userId = Number(parsed.data.userId);

  if (!Number.isInteger(scheduleId) || scheduleId <= 0) {
    return { success: false, message: "Horario inválido", code: "INVALID_SCHEDULE" };
  }

  if (!Number.isInteger(userId) || userId <= 0) {
    return { success: false, message: "Usuario inválido", code: "INVALID_USER" };
  }

  const existing = await db.schedule.findUnique({ where: { id: scheduleId } });
  if (!existing) {
    return { success: false, message: "Horario no encontrado", code: "SCHEDULE_NOT_FOUND" };
  }

  const startAt = new Date(parsed.data.startTime);
  const endAt = new Date(parsed.data.endTime);

  if (await hasConflict(userId, startAt, endAt, scheduleId)) {
    return { success: false, message: "Existe un conflicto de horario", code: "SCHEDULE_CONFLICT" };
  }

  const updated = await db.schedule.update({
    where: { id: scheduleId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      startAt,
      endAt,
      userId,
      status: parsed.data.status === "CANCELLED" ? "CANCELLED" : "ACTIVE",
    },
  });

  await writeAuditLog({
    action: "UPDATE",
    userId: auth.actor.id,
    entity: "SCHEDULE",
    entityId: String(scheduleId),
    message: "Horario actualizado",
    meta: {
      before: {
        startAt: existing.startAt,
        endAt: existing.endAt,
        userId: existing.userId,
      },
      after: {
        startAt: updated.startAt,
        endAt: updated.endAt,
        userId: updated.userId,
      },
    },
  });

  return {
    success: true,
    message: "Horario actualizado exitosamente",
    data: toScheduleModel(updated),
  };
}

export async function cancelScheduleAction(input: unknown): Promise<ApiResponse<{ id: string }>> {
  const auth = await requireActor();
  if (!auth.ok) return auth.response;

  if (!canMutateSchedules(auth.actor.role)) {
    return { success: false, message: "No autorizado", code: "FORBIDDEN" };
  }

  const parsed = cancelScheduleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Horario inválido", code: "VALIDATION_ERROR" };
  }

  const scheduleId = Number(parsed.data.id);
  if (!Number.isInteger(scheduleId) || scheduleId <= 0) {
    return { success: false, message: "Horario inválido", code: "INVALID_SCHEDULE" };
  }

  const existing = await db.schedule.findUnique({ where: { id: scheduleId } });
  if (!existing) {
    return { success: false, message: "Horario no encontrado", code: "SCHEDULE_NOT_FOUND" };
  }

  await db.schedule.update({
    where: { id: scheduleId },
    data: { status: "CANCELLED" },
  });

  await writeAuditLog({
    action: "DELETE",
    userId: auth.actor.id,
    entity: "SCHEDULE",
    entityId: String(scheduleId),
    message: "Horario cancelado (soft delete)",
    meta: { oldStatus: existing.status, newStatus: "CANCELLED" },
  });

  return {
    success: true,
    message: "Horario cancelado exitosamente",
    data: { id: String(scheduleId) },
  };
}
