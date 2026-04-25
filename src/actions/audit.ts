"use server";

import { writeAuditLog } from "@/lib/audit";

export async function registerAuditAction(input: {
  action: "LOGIN" | "LOGOUT" | "CREATE" | "UPDATE" | "DELETE" | "ROLE_CHANGE";
  userId?: number;
  entity: string;
  entityId?: string;
  message: string;
  meta?: Record<string, unknown>;
}) {
  await writeAuditLog(input);
}
