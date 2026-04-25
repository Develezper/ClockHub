"use client";

import { Edit, Eye, Mail, MoreHorizontal, Trash2, UserCheck, UserX, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/dashboard/common/EmptyState";
import { ROLE_LABELS, USER_STATUS_LABELS, type User, type UserStatus } from "@/types";
import { USER_ROLE_BADGE_CLASS, USER_STATUS_BADGE_CLASS } from "@/lib/semantic-colors";

type UsersTableProps = {
  users: User[];
  currentUserId?: string;
  searchTerm: string;
  roleFilter: string;
  statusFilter: string;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleStatus: (user: User, newStatus: UserStatus) => void;
  formatDate: (date: Date) => string;
  getInitials: (name: string) => string;
};

export function UsersTable({
  users,
  currentUserId,
  searchTerm,
  roleFilter,
  statusFilter,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  formatDate,
  getInitials,
}: UsersTableProps) {
  return (
    <Card className="surface">
      <CardHeader>
        <CardTitle>Lista de Usuarios</CardTitle>
        <CardDescription>
          {users.length} usuario{users.length !== 1 ? "s" : ""} encontrado{users.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-white/10 text-muted-foreground">{getInitials(u.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          {u.teamId && <p className="text-xs text-muted-foreground">Equipo: {u.teamId}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {u.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-2.5 w-2.5 rounded-full",
                          u.role === 'ADMIN' && "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]",
                          u.role === 'MANAGER' && "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]",
                          u.role === 'EMPLOYEE' && "bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.6)]"
                        )} />
                        <span className="text-sm font-medium">{ROLE_LABELS[u.role]}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-2.5 w-2.5 rounded-full",
                          u.status === 'ACTIVE' && "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]",
                          u.status === 'INACTIVE' && "bg-zinc-500 shadow-[0_0_12px_rgba(113,113,122,0.6)]",
                          u.status === 'SUSPENDED' && "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                        )} />
                        <span className="text-sm font-medium">{USER_STATUS_LABELS[u.status]}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(u.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(u)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(u)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onToggleStatus(u, u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
                          >
                            {u.status === "ACTIVE" ? (
                              <>
                                <UserX className="mr-2 h-4 w-4" />
                                Desactivar
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Activar
                              </>
                            )}
                          </DropdownMenuItem>
                          {u.id !== currentUserId && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onDelete(u)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="No hay usuarios"
            description={
              searchTerm || roleFilter !== "all" || statusFilter !== "all"
                ? "No se encontraron usuarios con los filtros aplicados"
                : "Aún no se han creado usuarios"
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
