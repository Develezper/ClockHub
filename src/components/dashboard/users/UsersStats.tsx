"use client";

import { Shield, UserCheck, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type UsersStatsProps = {
  totalUsers: number;
  activeUsers: number;
  adminCount: number;
  managerCount: number;
};

export function UsersStats({ totalUsers, activeUsers, adminCount, managerCount }: UsersStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="surface">
        <CardContent className="surface-body">
          <div className="flex flex-col items-center justify-center text-center gap-3">
            <div className="rounded-lg border border-white/10 bg-transparent p-2">
              <Users className="h-5 w-5 text-slate-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-200">{totalUsers}</p>
              <p className="text-sm text-slate-300">Total Usuarios</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="surface">
        <CardContent className="surface-body">
          <div className="flex flex-col items-center justify-center text-center gap-3">
            <div className="rounded-lg border border-white/10 bg-transparent p-2">
              <UserCheck className="h-5 w-5 text-emerald-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-200">{activeUsers}</p>
              <p className="text-sm text-emerald-300">Activos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="surface">
        <CardContent className="surface-body">
          <div className="flex flex-col items-center justify-center text-center gap-3">
            <div className="rounded-lg border border-white/10 bg-transparent p-2">
              <Shield className="h-5 w-5 text-rose-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-rose-200">{adminCount}</p>
              <p className="text-sm text-rose-300">Administradores</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="surface">
        <CardContent className="surface-body">
          <div className="flex flex-col items-center justify-center text-center gap-3">
            <div className="rounded-lg border border-white/10 bg-transparent p-2">
              <Users className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-200">{managerCount}</p>
              <p className="text-sm text-amber-300">Gerentes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
