"use client";

import type { UserRole } from "@/types";
import { useAuth } from "@/hooks/use-auth";

export function useRole() {
  const { user, hasPermission } = useAuth();

  return {
    role: (user?.role ?? null) as UserRole | null,
    hasPermission,
    isAdmin: user?.role === "ADMIN",
    isManager: user?.role === "MANAGER",
    isEmployee: user?.role === "EMPLOYEE",
  };
}
