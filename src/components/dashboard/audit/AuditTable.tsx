"use client";

import { ClipboardList } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/dashboard/common/EmptyState";
import { AUDIT_ACTION_LABELS, AUDIT_ENTITY_LABELS, type AuditAction, type AuditLog, type User } from "@/types";
import { AUDIT_ACTION_STYLE, AUDIT_ENTITY_BADGE_CLASS } from "@/lib/semantic-colors";
import type { LucideIcon } from "lucide-react";

type AuditTableProps = {
  logs: AuditLog[];
  usersById: Map<string, User>;
  searchTerm: string;
  actionFilter: string;
  entityFilter: string;
  getInitials: (name: string) => string;
  formatDateTime: (date: Date) => string;
  formatRelativeTime: (date: Date) => string;
  getActionIcon: (action: AuditAction) => LucideIcon;
  onViewDetail: (log: AuditLog) => void;
};

export function AuditTable({
  logs,
  usersById,
  searchTerm,
  actionFilter,
  entityFilter,
  getInitials,
  formatDateTime,
  formatRelativeTime,
  getActionIcon,
  onViewDetail,
}: AuditTableProps) {
  return (
    <Card className="surface">
      <CardHeader>
        <CardTitle>Historial de Eventos</CardTitle>
        <CardDescription>
          {logs.length} evento{logs.length !== 1 ? "s" : ""} encontrado{logs.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Acción</TableHead>
                  <TableHead>Entidad</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Detalles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  const logUser = usersById.get(log.userId);
                  const ActionIcon = getActionIcon(log.action);
                  const actionStyle = AUDIT_ACTION_STYLE[log.action];

                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`rounded-lg border p-2 ${actionStyle.iconBadgeClass}`}>
                            <ActionIcon className="h-4 w-4" />
                          </div>
                          <span className="font-medium">{AUDIT_ACTION_LABELS[log.action]}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge className={AUDIT_ENTITY_BADGE_CLASS[log.entity]}>
                          {AUDIT_ENTITY_LABELS[log.entity]}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">{logUser ? getInitials(logUser.name) : "?"}</AvatarFallback>
                          </Avatar>
                          <span>{logUser?.name || "Desconocido"}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{formatRelativeTime(log.createdAt)}</span>
                          <span className="text-xs text-muted-foreground">{formatDateTime(log.createdAt)}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => onViewDetail(log)}>
                          Ver más
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState
            icon={ClipboardList}
            title="No hay eventos"
            description={
              searchTerm || actionFilter !== "all" || entityFilter !== "all"
                ? "No se encontraron eventos con los filtros aplicados"
                : "No hay eventos de auditoría registrados"
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
