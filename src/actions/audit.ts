"use server";

import { db } from "@/lib/db";
import { getSessionActor } from "@/lib/session";
import type { ApiResponse, AuditLog } from "@/types";

function toAuditModel(log: {
  id: number;
  action: "LOGIN" | "LOGOUT" | "CREATE" | "UPDATE" | "DELETE" | "ROLE_CHANGE";
  entity: string;
  entityId: string | null;
  userId: number | null;
  meta: unknown;
  createdAt: Date;
}): AuditLog {
  const metadata = typeof log.meta === "object" && log.meta ? (log.meta as Record<string, unknown>) : undefined;

  return {
    id: String(log.id),
    action: log.action,
    entity: (log.entity === "AUTH" || log.entity === "USER" || log.entity === "SCHEDULE" ? log.entity : "AUTH") as
      | "AUTH"
      | "USER"
      | "SCHEDULE",
    entityId: log.entityId ?? "",
    userId: log.userId ? String(log.userId) : "",
    metadata,
    createdAt: log.createdAt,
  };
}

export async function getAuditLogsAction(): Promise<ApiResponse<AuditLog[]>> {
  const actor = await getSessionActor();
  if (!actor) {
    return { success: false, message: "No autenticado", code: "UNAUTHORIZED" };
  }

  if (actor.role !== "ADMIN" && actor.role !== "MANAGER") {
    return { success: false, message: "No autorizado", code: "FORBIDDEN" };
  }

  const where =
    actor.role === "ADMIN"
      ? undefined
      : {
          OR: [
            { userId: actor.id },
            actor.teamId
              ? {
                  user: {
                    teamId: actor.teamId,
                  },
                }
              : { userId: actor.id },
          ],
        };

  const logs = await db.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return {
    success: true,
    message: "Auditoría cargada",
    data: logs.map(toAuditModel),
  };
}
