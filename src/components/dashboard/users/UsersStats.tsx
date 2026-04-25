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
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-muted p-2">
              <Users className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalUsers}</p>
              <p className="text-sm text-muted-foreground">Total Usuarios</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="surface">
        <CardContent className="surface-body">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-muted p-2">
              <UserCheck className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeUsers}</p>
              <p className="text-sm text-muted-foreground">Activos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="surface">
        <CardContent className="surface-body">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-muted p-2">
              <Shield className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{adminCount}</p>
              <p className="text-sm text-muted-foreground">Administradores</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="surface">
        <CardContent className="surface-body">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-muted p-2">
              <Users className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{managerCount}</p>
              <p className="text-sm text-muted-foreground">Gerentes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
