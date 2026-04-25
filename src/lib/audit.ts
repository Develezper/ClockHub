import { db } from "@/lib/db";

export async function writeAuditLog(input: {
  action: "LOGIN" | "LOGOUT" | "CREATE" | "UPDATE" | "DELETE" | "ROLE_CHANGE";
  userId?: number;
  entity: string;
  entityId?: string;
  message: string;
  meta?: Record<string, unknown>;
}) {
  try {
    await db.auditLog.create({
      data: {
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        message: input.message,
        userId: input.userId,
        meta: input.meta,
      },
    });
  } catch {
    // Keep mutations/auth flow resilient even if audit persistence fails.
  }
}
