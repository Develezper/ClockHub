"use client";

import { createContext, useContext, useReducer, useCallback, useEffect, useRef, type ReactNode } from "react";
import { getAuditLogsAction } from "@/actions/audit";
import type { AuditLog } from "@/types";

interface AuditContextType {
  auditLogs: AuditLog[];
  isLoading: boolean;
  refreshAuditLogs: () => Promise<void>;
}

type AuditState = {
  auditLogs: AuditLog[];
  isLoading: boolean;
};

type AuditActionType =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; payload: AuditLog[] }
  | { type: "LOAD_END" };

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
    default:
      return state;
  }
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export function AuditProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(auditReducer, initialState);
  const hasInitialized = useRef(false);

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
    if (hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;
    void refreshAuditLogs();
  }, [refreshAuditLogs]);

  return (
    <AuditContext.Provider
      value={{
        auditLogs: state.auditLogs,
        isLoading: state.isLoading,
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
