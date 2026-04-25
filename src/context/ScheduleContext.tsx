"use client";

import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from "react";
import {
  cancelScheduleAction,
  createScheduleAction,
  getSchedulesAction,
  updateScheduleAction,
} from "@/actions/schedules";
import type { Schedule, ScheduleFormData } from "@/types";

type MutationResult = { success: boolean; message: string };

interface ScheduleContextType {
  schedules: Schedule[];
  isLoading: boolean;
  getSchedules: (userId?: string) => Schedule[];
  getScheduleById: (id: string) => Schedule | undefined;
  createSchedule: (data: ScheduleFormData, createdBy: string) => Promise<MutationResult>;
  updateSchedule: (id: string, data: Partial<ScheduleFormData>) => Promise<MutationResult>;
  deleteSchedule: (id: string) => Promise<MutationResult>;
  checkConflicts: (userId: string, startTime: Date, endTime: Date, excludeId?: string) => boolean;
  refreshSchedules: () => Promise<void>;
}

type ScheduleState = {
  schedules: Schedule[];
  isLoading: boolean;
};

type ScheduleAction =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; payload: Schedule[] }
  | { type: "LOAD_END" };

const initialState: ScheduleState = {
  schedules: [],
  isLoading: false,
};

function scheduleReducer(state: ScheduleState, action: ScheduleAction): ScheduleState {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, isLoading: true };
    case "LOAD_SUCCESS":
      return { schedules: action.payload, isLoading: false };
    case "LOAD_END":
      return { ...state, isLoading: false };
    default:
      return state;
  }
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(scheduleReducer, initialState);

  const refreshSchedules = useCallback(async () => {
    dispatch({ type: "LOAD_START" });

    try {
      const response = await getSchedulesAction();
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
    void refreshSchedules();
  }, [refreshSchedules]);

  const getSchedules = useCallback(
    (userId?: string) => {
      if (userId) {
        return state.schedules.filter((schedule) => schedule.userId === userId && schedule.status !== "CANCELLED");
      }
      return state.schedules.filter((schedule) => schedule.status !== "CANCELLED");
    },
    [state.schedules],
  );

  const getScheduleById = useCallback(
    (id: string) => {
      return state.schedules.find((schedule) => schedule.id === id);
    },
    [state.schedules],
  );

  const checkConflicts = useCallback(
    (userId: string, startTime: Date, endTime: Date, excludeId?: string) => {
      return state.schedules.some((schedule) => {
        if (schedule.userId !== userId) return false;
        if (schedule.status === "CANCELLED") return false;
        if (excludeId && schedule.id === excludeId) return false;

        const scheduleStart = new Date(schedule.startTime);
        const scheduleEnd = new Date(schedule.endTime);

        return (
          (startTime >= scheduleStart && startTime < scheduleEnd) ||
          (endTime > scheduleStart && endTime <= scheduleEnd) ||
          (startTime <= scheduleStart && endTime >= scheduleEnd)
        );
      });
    },
    [state.schedules],
  );

  const createSchedule = useCallback(async (data: ScheduleFormData): Promise<MutationResult> => {
    dispatch({ type: "LOAD_START" });

    const response = await createScheduleAction(data);
    if (response.success) {
      await refreshSchedules();
      return { success: true, message: response.message };
    }

    dispatch({ type: "LOAD_END" });
    return { success: false, message: response.message };
  }, [refreshSchedules]);

  const updateSchedule = useCallback(async (id: string, data: Partial<ScheduleFormData>): Promise<MutationResult> => {
    const existing = state.schedules.find((schedule) => schedule.id === id);
    if (!existing) {
      return { success: false, message: "Horario no encontrado" };
    }

    dispatch({ type: "LOAD_START" });

    const response = await updateScheduleAction({
      id,
      title: data.title ?? existing.title,
      description: data.description ?? existing.description ?? null,
      startTime: data.startTime ?? new Date(existing.startTime).toISOString(),
      endTime: data.endTime ?? new Date(existing.endTime).toISOString(),
      userId: data.userId ?? existing.userId,
      status: data.status ?? existing.status,
    });

    if (response.success) {
      await refreshSchedules();
      return { success: true, message: response.message };
    }

    dispatch({ type: "LOAD_END" });
    return { success: false, message: response.message };
  }, [refreshSchedules, state.schedules]);

  const deleteSchedule = useCallback(async (id: string): Promise<MutationResult> => {
    dispatch({ type: "LOAD_START" });

    const response = await cancelScheduleAction({ id });
    if (response.success) {
      await refreshSchedules();
      return { success: true, message: response.message };
    }

    dispatch({ type: "LOAD_END" });
    return { success: false, message: response.message };
  }, [refreshSchedules]);

  return (
    <ScheduleContext.Provider
      value={{
        schedules: state.schedules,
        isLoading: state.isLoading,
        getSchedules,
        getScheduleById,
        createSchedule,
        updateSchedule,
        deleteSchedule,
        checkConflicts,
        refreshSchedules,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error("useSchedule debe usarse dentro de un ScheduleProvider");
  }
  return context;
}
