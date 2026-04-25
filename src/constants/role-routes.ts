import type { UserRole } from "@/types";

type ProtectedPrefix = `/${string}`;

export const ROLE_ALLOWED_PREFIXES: Record<UserRole, ProtectedPrefix[]> = {
  ADMIN: [
    "/dashboard",
    "/dashboard/usuarios",
    "/dashboard/horarios",
    "/dashboard/auditoria",
    "/dashboard/configuracion",
  ],
  MANAGER: [
    "/dashboard",
    "/dashboard/horarios",
    "/dashboard/auditoria",
    "/dashboard/configuracion",
  ],
  EMPLOYEE: [
    "/dashboard",
    "/dashboard/horarios",
    "/dashboard/configuracion",
  ],
};

export function isPathAllowedByRole(pathname: string, role: UserRole): boolean {
  const allowedPrefixes = ROLE_ALLOWED_PREFIXES[role] ?? [];
  return allowedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
