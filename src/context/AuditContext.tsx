"use client";

import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from "react";
import { getAuditLogsAction } from "@/actions/audit";
import type { AuditLog, AuditAction, AuditEntity } from "@/types";

interface AuditContextType {
  auditLogs: AuditLog[];
  isLoading: boolean;
  getAuditLogs: (filters?: AuditFilters) => AuditLog[];
  addAuditLog: (log: Omit<AuditLog, "id" | "createdAt">) => void;
  refreshAuditLogs: () => Promise<void>;
}

interface AuditFilters {
  entity?: AuditEntity;
  action?: AuditAction;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

type AuditState = {
  auditLogs: AuditLog[];
  isLoading: boolean;
};

type AuditActionType =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; payload: AuditLog[] }
  | { type: "LOAD_END" }
  | { type: "APPEND"; payload: AuditLog };

const initialState: AuditState = {
  auditLogs: [],
  isLoading: false,
};

function auditReducer(state: AuditState, action: AuditActionType): AuditState {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, isLoading: true };
    case "LOAD_SUCCESS":
      return { auditLogs: action.payload, isLoading: false };
    case "LOAD_END":
      return { ...state, isLoading: false };
    case "APPEND":
      return { ...state, auditLogs: [action.payload, ...state.auditLogs] };
    default:
      return state;
  }
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export function AuditProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(auditReducer, initialState);

  const refreshAuditLogs = useCallback(async () => {
    dispatch({ type: "LOAD_START" });

    try {
      const response = await getAuditLogsAction();
      if (response.success && response.data) {
        dispatch({ type: "LOAD_SUCCESS", payload: response.data });
      } else {
        dispatch({ type: "LOAD_END" });
      }
    } catch {
      dispatch({ type: "LOAD_END" });
    }
  }, []);

  useEffect(() => {
    void refreshAuditLogs();
  }, [refreshAuditLogs]);

  const getAuditLogs = useCallback(
    (filters?: AuditFilters) => {
      let filtered = [...state.auditLogs];

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
    [state.auditLogs],
  );

  const addAuditLog = useCallback((log: Omit<AuditLog, "id" | "createdAt">) => {
    dispatch({
      type: "APPEND",
      payload: {
        ...log,
        id: String(Date.now()),
        createdAt: new Date(),
      },
    });
  }, []);

  return (
    <AuditContext.Provider
      value={{
        auditLogs: state.auditLogs,
        isLoading: state.isLoading,
        getAuditLogs,
        addAuditLog,
        refreshAuditLogs,
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
