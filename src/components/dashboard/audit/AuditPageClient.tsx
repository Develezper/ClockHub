"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Search,
  Calendar,
  FileText,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Plus,
  Shield,
  Activity,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppHeader } from "@/components/shared/AppHeader";
import { useAuth } from "@/hooks/use-auth";
import { useAudit } from "@/hooks/use-audit";
import { useUsers } from "@/context/UserContext";
import { AuditDetailModal } from "@/components/dashboard/audit/AuditDetailModal";
import {
  AUDIT_ACTION_LABELS,
  AUDIT_ENTITY_LABELS,
  type AuditLog,
  type AuditAction,
} from "@/types";

export default function AuditPage() {
  const router = useRouter();
  const { user: currentUser, hasPermission } = useAuth();
  const { auditLogs, refreshAuditLogs } = useAudit();
  const { users } = useUsers();

  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Redirect if no permission
  useEffect(() => {
    if (currentUser && !hasPermission("canViewAudit")) {
      router.push("/dashboard");
    }
  }, [currentUser, hasPermission, router]);

  const usersById = useMemo(() => {
    return new Map(users.map((u) => [u.id, u]));
  }, [users]);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const logUser = usersById.get(log.userId);
        if (
          !logUser?.name.toLowerCase().includes(term) &&
          !log.entity.toLowerCase().includes(term) &&
          !log.action.toLowerCase().includes(term)
        ) {
          return false;
        }
      }

      if (actionFilter !== "all" && log.action !== actionFilter) {
        return false;
      }

      if (entityFilter !== "all" && log.entity !== entityFilter) {
        return false;
      }

      return true;
    });
  }, [auditLogs, searchTerm, actionFilter, entityFilter, usersById]);

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Ahora mismo";
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? "s" : ""}`;
    if (days < 7) return `Hace ${days} día${days > 1 ? "s" : ""}`;
    return formatDateTime(date);
  };

  const getActionIcon = (action: AuditAction) => {
    switch (action) {
      case "CREATE":
        return Plus;
      case "UPDATE":
        return Edit;
      case "DELETE":
        return Trash2;
      case "LOGIN":
        return LogIn;
      case "LOGOUT":
        return LogOut;
      case "ROLE_CHANGE":
        return Shield;
      case "STATUS_CHANGE":
        return Activity;
      default:
        return FileText;
    }
  };

  const actionBadgeClass = "bg-muted text-foreground";
  const entityBadgeClass = "bg-muted text-foreground border-border";

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleViewDetail = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };
  const selectedLogUser = selectedLog ? users.find((u) => u.id === selectedLog.userId) : undefined;

  const { todayLogs, loginCount, changeCount } = useMemo(() => {
    const today = new Date().toDateString();
    let todayTotal = 0;
    let loginTotal = 0;
    let changeTotal = 0;

    for (const log of auditLogs) {
      if (new Date(log.createdAt).toDateString() === today) {
        todayTotal += 1;
      }
      if (log.action === "LOGIN") {
        loginTotal += 1;
      }
      if (log.action === "CREATE" || log.action === "UPDATE" || log.action === "DELETE") {
        changeTotal += 1;
      }
    }

    return { todayLogs: todayTotal, loginCount: loginTotal, changeCount: changeTotal };
  }, [auditLogs]);

  if (!hasPermission("canViewAudit")) {
    return null;
  }

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Registro de Auditoría" />

      <div className="page-shell page-stack">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="page-heading">Auditoría</h2>
            <p className="page-subheading">
              Registro de todas las acciones del sistema
            </p>
          </div>
          <Button variant="outline" className="h-9 px-4" onClick={() => void refreshAuditLogs()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="surface">
            <CardContent className="surface-body">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-muted">
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
                <div className="p-2 rounded-lg bg-muted">
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
                <div className="p-2 rounded-lg bg-muted">
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

        {/* Filters */}
        <Card className="surface">
          <CardContent className="surface-body">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar en el registro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 pl-10"
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="h-10 w-full md:w-44">
                  <SelectValue placeholder="Acción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las acciones</SelectItem>
                  <SelectItem value="CREATE">Creación</SelectItem>
                  <SelectItem value="UPDATE">Actualización</SelectItem>
                  <SelectItem value="DELETE">Eliminación</SelectItem>
                  <SelectItem value="LOGIN">Inicio Sesión</SelectItem>
                  <SelectItem value="LOGOUT">Cierre Sesión</SelectItem>
                  <SelectItem value="ROLE_CHANGE">Cambio de Rol</SelectItem>
                  <SelectItem value="STATUS_CHANGE">Cambio de Estado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="h-10 w-full md:w-40">
                  <SelectValue placeholder="Entidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="USER">Usuario</SelectItem>
                  <SelectItem value="SCHEDULE">Horario</SelectItem>
                  <SelectItem value="AUTH">Autenticación</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card className="surface">
          <CardHeader>
            <CardTitle>Historial de Eventos</CardTitle>
            <CardDescription>
              {filteredLogs.length} evento{filteredLogs.length !== 1 ? "s" : ""} encontrado{filteredLogs.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredLogs.length > 0 ? (
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
                    {filteredLogs.map((log) => {
                      const logUser = usersById.get(log.userId);
                      const ActionIcon = getActionIcon(log.action);
                      return (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${actionBadgeClass}`}>
                                <ActionIcon className="h-4 w-4" />
                              </div>
                              <span className="font-medium">
                                {AUDIT_ACTION_LABELS[log.action]}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={entityBadgeClass}
                            >
                              {AUDIT_ENTITY_LABELS[log.entity]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {logUser ? getInitials(logUser.name) : "?"}
                                </AvatarFallback>
                              </Avatar>
                              <span>{logUser?.name || "Desconocido"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{formatRelativeTime(log.createdAt)}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDateTime(log.createdAt)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(log)}
                            >
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
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ClipboardList className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">No hay eventos</h3>
                <p className="text-muted-foreground mt-1">
                  {searchTerm || actionFilter !== "all" || entityFilter !== "all"
                    ? "No se encontraron eventos con los filtros aplicados"
                    : "No hay eventos de auditoría registrados"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AuditDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        selectedLog={selectedLog}
        selectedLogUser={selectedLogUser}
        actionBadgeClass={actionBadgeClass}
        entityBadgeClass={entityBadgeClass}
        formatDateTime={formatDateTime}
        getInitials={getInitials}
        getActionIcon={getActionIcon}
      />
    </div>
  );
}
