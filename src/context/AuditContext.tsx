"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { AuditLog, AuditAction, AuditEntity } from "@/types";

interface AuditContextType {
  auditLogs: AuditLog[];
  isLoading: boolean;
  getAuditLogs: (filters?: AuditFilters) => AuditLog[];
  addAuditLog: (log: Omit<AuditLog, "id" | "createdAt">) => void;
}

interface AuditFilters {
  entity?: AuditEntity;
  action?: AuditAction;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

// Datos de demostración
const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "1",
    action: "LOGIN",
    entity: "AUTH",
    entityId: "1",
    userId: "1",
    metadata: { ip: "192.168.1.1", userAgent: "Chrome" },
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: "2",
    action: "CREATE",
    entity: "SCHEDULE",
    entityId: "1",
    userId: "2",
    changes: {
      title: { old: null, new: "Turno Mañana" },
      status: { old: null, new: "CONFIRMED" },
    },
    createdAt: new Date(Date.now() - 7200000),
  },
  {
    id: "3",
    action: "UPDATE",
    entity: "USER",
    entityId: "3",
    userId: "1",
    changes: {
      role: { old: "EMPLOYEE", new: "MANAGER" },
    },
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: "4",
    action: "ROLE_CHANGE",
    entity: "USER",
    entityId: "4",
    userId: "1",
    changes: {
      role: { old: "EMPLOYEE", new: "MANAGER" },
    },
    createdAt: new Date(Date.now() - 172800000),
  },
  {
    id: "5",
    action: "DELETE",
    entity: "SCHEDULE",
    entityId: "5",
    userId: "2",
    changes: {
      status: { old: "SCHEDULED", new: "CANCELLED" },
    },
    createdAt: new Date(Date.now() - 259200000),
  },
  {
    id: "6",
    action: "CREATE",
    entity: "USER",
    entityId: "6",
    userId: "1",
    changes: {
      name: { old: null, new: "Laura Martínez" },
      email: { old: null, new: "laura.martinez@clockhub.com" },
      role: { old: null, new: "MANAGER" },
    },
    createdAt: new Date(Date.now() - 345600000),
  },
  {
    id: "7",
    action: "STATUS_CHANGE",
    entity: "USER",
    entityId: "5",
    userId: "1",
    changes: {
      status: { old: "ACTIVE", new: "INACTIVE" },
    },
    createdAt: new Date(Date.now() - 432000000),
  },
  {
    id: "8",
    action: "LOGOUT",
    entity: "AUTH",
    entityId: "2",
    userId: "2",
    metadata: { reason: "user_initiated" },
    createdAt: new Date(Date.now() - 518400000),
  },
  {
    id: "9",
    action: "UPDATE",
    entity: "SCHEDULE",
    entityId: "2",
    userId: "1",
    changes: {
      startTime: { old: "08:00", new: "09:00" },
      endTime: { old: "14:00", new: "15:00" },
    },
    createdAt: new Date(Date.now() - 604800000),
  },
  {
    id: "10",
    action: "LOGIN",
    entity: "AUTH",
    entityId: "3",
    userId: "3",
    metadata: { ip: "192.168.1.50", userAgent: "Firefox" },
    createdAt: new Date(Date.now() - 691200000),
  },
];

export function AuditProvider({ children }: { children: ReactNode }) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [isLoading] = useState(false);

  const getAuditLogs = useCallback(
    (filters?: AuditFilters) => {
      let filtered = [...auditLogs];

      if (filters?.entity) {
        filtered = filtered.filter((log) => log.entity === filters.entity);
      }

      if (filters?.action) {
        filtered = filtered.filter((log) => log.action === filters.action);
      }

      if (filters?.userId) {
        filtered = filtered.filter((log) => log.userId === filters.userId);
      }

      if (filters?.startDate) {
        filtered = filtered.filter((log) => new Date(log.createdAt) >= filters.startDate!);
      }

      if (filters?.endDate) {
        filtered = filtered.filter((log) => new Date(log.createdAt) <= filters.endDate!);
      }

      return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    [auditLogs]
  );

  const addAuditLog = useCallback((log: Omit<AuditLog, "id" | "createdAt">) => {
    const newLog: AuditLog = {
      ...log,
      id: String(Date.now()),
      createdAt: new Date(),
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  }, []);

  return (
    <AuditContext.Provider
      value={{
        auditLogs,
        isLoading,
        getAuditLogs,
        addAuditLog,
      }}
    >
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit() {
  const context = useContext(AuditContext);
  if (context === undefined) {
    throw new Error("useAudit debe usarse dentro de un AuditProvider");
  }
  return context;
}
