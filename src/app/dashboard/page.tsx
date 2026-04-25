"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/shared/AppHeader";
import { useAuth } from "@/hooks/use-auth";
import { useSchedule } from "@/context/ScheduleContext";
import { useUsers } from "@/context/UserContext";
import { formatDateTimeEs } from "@/lib/format";
import { STATUS_LABELS } from "@/types";
import { SCHEDULE_STATUS_BADGE_CLASS } from "@/lib/semantic-colors";

export default function DashboardPage() {
  const { user, hasPermission } = useAuth();
  const { schedules, getSchedules } = useSchedule();
  const { users } = useUsers();

  const activeSchedules = schedules.filter((s) => s.status !== "CANCELLED");
  const cancelledSchedules = schedules.filter((s) => s.status === "CANCELLED");
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
    formatDateTimeEs(date, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Panel" />

      <div className="flex-1 overflow-auto p-5 md:p-6">
        <div className="mx-auto w-full max-w-6xl space-y-6">
        <section className="rounded-md border border-border bg-card/50 p-5">
          <h2 className="text-2xl font-semibold tracking-tight">Resumen</h2>
          <p className="mt-1 text-sm text-muted-foreground">Hola, {user?.name}</p>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-md border border-border bg-card/40 p-4">
            <p className="text-sm text-emerald-300">Horarios activos</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-200">{activeSchedules.length}</p>
          </div>
          <div className="rounded-md border border-border bg-card/40 p-4">
            <p className="text-sm text-rose-300">Cancelados</p>
            <p className="mt-1 text-2xl font-semibold text-rose-200">{cancelledSchedules.length}</p>
          </div>
          <div className="rounded-md border border-border bg-card/40 p-4">
            <p className="text-sm text-emerald-300">Pendientes</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-200">{pendingSchedules.length}</p>
          </div>
          <div className="rounded-md border border-border bg-card/40 p-4">
            <p className="text-sm text-emerald-300">Usuarios activos</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-200">{activeUsers.length}</p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-md border border-border bg-card/40 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-medium tracking-tight">Mis próximos horarios</h3>
              <Link href="/dashboard/horarios">
                <Button size="sm" variant="outline" className="h-8 px-3">Ver todos</Button>
              </Link>
            </div>
            {upcomingSchedules.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tienes horarios próximos.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {upcomingSchedules.map((schedule) => (
                  <li key={schedule.id} className="rounded-md border border-border/80 bg-background/40 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{schedule.title}</p>
                      <Badge className={SCHEDULE_STATUS_BADGE_CLASS[schedule.status]}>
                        {STATUS_LABELS[schedule.status]}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{formatDateTime(schedule.startTime)} - {formatDateTime(schedule.endTime)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-md border border-border bg-card/40 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-medium tracking-tight">Actividad reciente</h3>
              {hasPermission("canViewAudit") && (
                <Link href="/dashboard/auditoria">
                  <Button size="sm" variant="outline" className="h-8 px-3">Auditoría</Button>
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
                    <li key={schedule.id} className="rounded-md border border-border/80 bg-background/40 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{schedule.title}</p>
                        <Badge className={SCHEDULE_STATUS_BADGE_CLASS[schedule.status]}>
                          {STATUS_LABELS[schedule.status]}
                        </Badge>
                      </div>
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
    </div>
  );
}
