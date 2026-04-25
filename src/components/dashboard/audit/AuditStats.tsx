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
            <div className="rounded-lg bg-muted p-2">
              <Calendar className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{todayLogs}</p>
              <p className="text-sm text-muted-foreground">Eventos Hoy</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="surface">
        <CardContent className="surface-body">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-muted p-2">
              <LogIn className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{loginCount}</p>
              <p className="text-sm text-muted-foreground">Inicios de Sesión</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="surface">
        <CardContent className="surface-body">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-muted p-2">
              <Edit className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{changeCount}</p>
              <p className="text-sm text-muted-foreground">Cambios Realizados</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
