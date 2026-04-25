"use client";

import { Calendar, Edit, LogIn } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type AuditStatsProps = {
  todayLogs: number;
  loginCount: number;
  changeCount: number;
};

export function AuditStats({ todayLogs, loginCount, changeCount }: AuditStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="surface">
        <CardContent className="surface-body">
          <div className="flex items-center gap-4">
            <div className="rounded-lg border border-[rgba(148,163,184,0.4)] bg-[rgba(148,163,184,0.2)] p-2">
              <Calendar className="h-5 w-5 text-slate-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-200">{todayLogs}</p>
              <p className="text-sm text-slate-300">Eventos Hoy</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="surface">
        <CardContent className="surface-body">
          <div className="flex items-center gap-4">
            <div className="rounded-lg border border-[rgba(52,211,153,0.4)] bg-[rgba(52,211,153,0.2)] p-2">
              <LogIn className="h-5 w-5 text-emerald-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-200">{loginCount}</p>
              <p className="text-sm text-emerald-300">Inicios de Sesión</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="surface">
        <CardContent className="surface-body">
          <div className="flex items-center gap-4">
            <div className="rounded-lg border border-[rgba(125,211,252,0.4)] bg-[rgba(125,211,252,0.2)] p-2">
              <Edit className="h-5 w-5 text-sky-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-sky-200">{changeCount}</p>
              <p className="text-sm text-sky-300">Cambios Realizados</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
