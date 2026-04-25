"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/shared/AppHeader";
import { useAuth } from "@/hooks/use-auth";
import { useSchedule } from "@/context/ScheduleContext";
import { useUsers } from "@/context/UserContext";
import { STATUS_LABELS } from "@/types";

export default function DashboardPage() {
  const { user, hasPermission } = useAuth();
  const { schedules, getSchedules } = useSchedule();
  const { users } = useUsers();

  const activeSchedules = schedules.filter((s) => s.status !== "CANCELLED");
  const confirmedSchedules = schedules.filter((s) => s.status === "CONFIRMED");
  const pendingSchedules = schedules.filter((s) => s.status === "SCHEDULED");
  const activeUsers = users.filter((u) => u.status === "ACTIVE");

  const mySchedules = user ? getSchedules(user.id) : [];
  const upcomingSchedules = mySchedules
    .filter((s) => new Date(s.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5);

  const recentActivity = activeSchedules
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const formatDateTime = (date: Date) =>
    new Date(date).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Panel" />

      <div className="flex-1 space-y-6 overflow-auto p-4">
        <section>
          <h2 className="text-xl font-semibold">Resumen</h2>
          <p className="text-sm text-muted-foreground">Hola, {user?.name}</p>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded border p-3">
            <p className="text-sm text-muted-foreground">Horarios activos</p>
            <p className="text-2xl font-semibold">{activeSchedules.length}</p>
          </div>
          <div className="rounded border p-3">
            <p className="text-sm text-muted-foreground">Confirmados</p>
            <p className="text-2xl font-semibold">{confirmedSchedules.length}</p>
          </div>
          <div className="rounded border p-3">
            <p className="text-sm text-muted-foreground">Pendientes</p>
            <p className="text-2xl font-semibold">{pendingSchedules.length}</p>
          </div>
          <div className="rounded border p-3">
            <p className="text-sm text-muted-foreground">Usuarios activos</p>
            <p className="text-2xl font-semibold">{activeUsers.length}</p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded border p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-medium">Mis próximos horarios</h3>
              <Link href="/dashboard/horarios">
                <Button size="sm" variant="outline">Ver todos</Button>
              </Link>
            </div>
            {upcomingSchedules.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tienes horarios próximos.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {upcomingSchedules.map((schedule) => (
                  <li key={schedule.id} className="rounded border p-2">
                    <p className="font-medium">{schedule.title}</p>
                    <p className="text-muted-foreground">{formatDateTime(schedule.startTime)} - {formatDateTime(schedule.endTime)}</p>
                    <p className="text-xs text-muted-foreground">{STATUS_LABELS[schedule.status]}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded border p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-medium">Actividad reciente</h3>
              {hasPermission("canViewAudit") && (
                <Link href="/dashboard/auditoria">
                  <Button size="sm" variant="outline">Auditoría</Button>
                </Link>
              )}
            </div>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay actividad reciente.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {recentActivity.map((schedule) => {
                  const assignedUser = users.find((u) => u.id === schedule.userId);

                  return (
                    <li key={schedule.id} className="rounded border p-2">
                      <p className="font-medium">{schedule.title}</p>
                      <p className="text-muted-foreground">{assignedUser?.name ?? "Usuario desconocido"}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(schedule.updatedAt)}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
