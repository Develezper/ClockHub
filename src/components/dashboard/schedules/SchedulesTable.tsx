"use client";

import { Calendar, Clock, Edit, Eye, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/dashboard/common/EmptyState";
import { STATUS_LABELS, type Schedule, type User } from "@/types";

type SchedulesTableProps = {
  schedules: Schedule[];
  usersById: Map<string, User>;
  badgeClassName: string;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  searchTerm: string;
  statusFilter: string;
  onCreate: () => void;
  onView: (schedule: Schedule) => void;
  onEdit: (schedule: Schedule) => void;
  onDelete: (schedule: Schedule) => void;
  formatDateTime: (date: Date) => string;
  getInitials: (name: string) => string;
};

export function SchedulesTable({
  schedules,
  usersById,
  badgeClassName,
  canCreate,
  canEdit,
  canDelete,
  searchTerm,
  statusFilter,
  onCreate,
  onView,
  onEdit,
  onDelete,
  formatDateTime,
  getInitials,
}: SchedulesTableProps) {
  return (
    <Card className="surface">
      <CardHeader>
        <CardTitle>Lista de Horarios</CardTitle>
        <CardDescription>
          {schedules.length} horario{schedules.length !== 1 ? "s" : ""} encontrado
          {schedules.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {schedules.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Inicio</TableHead>
                  <TableHead>Fin</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => {
                  const assignedUser = usersById.get(schedule.userId);
                  return (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{schedule.title}</p>
                            {schedule.description && (
                              <p className="max-w-[200px] truncate text-sm text-muted-foreground">{schedule.description}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">{assignedUser ? getInitials(assignedUser.name) : "?"}</AvatarFallback>
                          </Avatar>
                          <span>{assignedUser?.name || "Desconocido"}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {formatDateTime(schedule.startTime)}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {formatDateTime(schedule.endTime)}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge className={badgeClassName}>{STATUS_LABELS[schedule.status]}</Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onView(schedule)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Detalles
                            </DropdownMenuItem>
                            {canEdit && schedule.status !== "CANCELLED" && (
                              <DropdownMenuItem onClick={() => onEdit(schedule)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                            )}
                            {canDelete && schedule.status !== "CANCELLED" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => onDelete(schedule)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Cancelar
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No hay horarios"
            description={
              searchTerm || statusFilter !== "all"
                ? "No se encontraron horarios con los filtros aplicados"
                : "Aún no se han creado horarios"
            }
            action={
              canCreate && !searchTerm && statusFilter === "all" ? (
                <Button onClick={onCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Primer Horario
                </Button>
              ) : null
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
