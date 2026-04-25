"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Schedule, ScheduleFormData, ScheduleStatus } from "@/types";

interface ScheduleContextType {
  schedules: Schedule[];
  isLoading: boolean;
  getSchedules: (userId?: string) => Schedule[];
  getScheduleById: (id: string) => Schedule | undefined;
  createSchedule: (data: ScheduleFormData, createdBy: string) => Promise<{ success: boolean; message: string }>;
  updateSchedule: (id: string, data: Partial<ScheduleFormData>) => Promise<{ success: boolean; message: string }>;
  deleteSchedule: (id: string) => Promise<{ success: boolean; message: string }>;
  checkConflicts: (userId: string, startTime: Date, endTime: Date, excludeId?: string) => boolean;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

// Datos de demostración
const INITIAL_SCHEDULES: Schedule[] = [
  {
    id: "1",
    title: "Turno Mañana",
    description: "Atención al cliente en recepción",
    startTime: new Date(new Date().setHours(8, 0, 0, 0)),
    endTime: new Date(new Date().setHours(14, 0, 0, 0)),
    userId: "3",
    status: "CONFIRMED",
    createdBy: "2",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    title: "Turno Tarde",
    description: "Supervisión de operaciones",
    startTime: new Date(new Date().setHours(14, 0, 0, 0)),
    endTime: new Date(new Date().setHours(20, 0, 0, 0)),
    userId: "2",
    status: "SCHEDULED",
    createdBy: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    title: "Reunión de Equipo",
    description: "Revisión semanal de objetivos",
    startTime: new Date(new Date().setDate(new Date().getDate() + 1)),
    endTime: new Date(new Date().setDate(new Date().getDate() + 1)),
    userId: "1",
    status: "SCHEDULED",
    createdBy: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    title: "Capacitación",
    description: "Formación en nuevos procedimientos",
    startTime: new Date(new Date().setDate(new Date().getDate() + 2)),
    endTime: new Date(new Date().setDate(new Date().getDate() + 2)),
    userId: "3",
    status: "SCHEDULED",
    createdBy: "2",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [schedules, setSchedules] = useState<Schedule[]>(INITIAL_SCHEDULES);
  const [isLoading, setIsLoading] = useState(false);

  const getSchedules = useCallback(
    (userId?: string) => {
      if (userId) {
        return schedules.filter((s) => s.userId === userId && s.status !== "CANCELLED");
      }
      return schedules.filter((s) => s.status !== "CANCELLED");
    },
    [schedules]
  );

  const getScheduleById = useCallback(
    (id: string) => {
      return schedules.find((s) => s.id === id);
    },
    [schedules]
  );

  const checkConflicts = useCallback(
    (userId: string, startTime: Date, endTime: Date, excludeId?: string) => {
      return schedules.some((schedule) => {
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
    [schedules]
  );

  const createSchedule = useCallback(
    async (data: ScheduleFormData, createdBy: string) => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const startTime = new Date(data.startTime);
      const endTime = new Date(data.endTime);

      if (checkConflicts(data.userId, startTime, endTime)) {
        setIsLoading(false);
        return { success: false, message: "Existe un conflicto de horario" };
      }

      const newSchedule: Schedule = {
        id: String(Date.now()),
        title: data.title,
        description: data.description,
        startTime,
        endTime,
        userId: data.userId,
        status: data.status,
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setSchedules((prev) => [...prev, newSchedule]);
      setIsLoading(false);
      return { success: true, message: "Horario creado exitosamente" };
    },
    [checkConflicts]
  );

  const updateSchedule = useCallback(
    async (id: string, data: Partial<ScheduleFormData>) => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const schedule = schedules.find((s) => s.id === id);
      if (!schedule) {
        setIsLoading(false);
        return { success: false, message: "Horario no encontrado" };
      }

      if (data.startTime && data.endTime && data.userId) {
        const startTime = new Date(data.startTime);
        const endTime = new Date(data.endTime);
        if (checkConflicts(data.userId, startTime, endTime, id)) {
          setIsLoading(false);
          return { success: false, message: "Existe un conflicto de horario" };
        }
      }

      setSchedules((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                ...data,
                startTime: data.startTime ? new Date(data.startTime) : s.startTime,
                endTime: data.endTime ? new Date(data.endTime) : s.endTime,
                updatedAt: new Date(),
              }
            : s
        )
      );

      setIsLoading(false);
      return { success: true, message: "Horario actualizado exitosamente" };
    },
    [schedules, checkConflicts]
  );

  const deleteSchedule = useCallback(async (id: string) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    setSchedules((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: "CANCELLED" as ScheduleStatus, updatedAt: new Date() }
          : s
      )
    );

    setIsLoading(false);
    return { success: true, message: "Horario cancelado exitosamente" };
  }, []);

  return (
    <ScheduleContext.Provider
      value={{
        schedules,
        isLoading,
        getSchedules,
        getScheduleById,
        createSchedule,
        updateSchedule,
        deleteSchedule,
        checkConflicts,
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
