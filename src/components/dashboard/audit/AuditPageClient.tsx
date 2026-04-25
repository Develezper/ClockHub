"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
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
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/shared/AppHeader";
import { useAuth } from "@/hooks/use-auth";
import { useAudit } from "@/hooks/use-audit";
import { useUsers } from "@/context/UserContext";
import { formatDateTimeEs, getInitials } from "@/lib/format";
import { SectionHeader } from "@/components/dashboard/common/SectionHeader";
import { AuditDetailModal } from "@/components/dashboard/audit/AuditDetailModal";
import { AuditStats } from "@/components/dashboard/audit/AuditStats";
import { AuditFilters } from "@/components/dashboard/audit/AuditFilters";
import { AuditTable } from "@/components/dashboard/audit/AuditTable";
import {
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

  const formatDateTime = (date: Date) => formatDateTimeEs(date);

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
        <SectionHeader
          title="Auditoría"
          subtitle="Registro de todas las acciones del sistema"
          actions={
            <Button variant="outline" className="h-9 px-4" onClick={() => void refreshAuditLogs()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
          }
        />

        <AuditStats todayLogs={todayLogs} loginCount={loginCount} changeCount={changeCount} />

        <AuditFilters
          searchTerm={searchTerm}
          actionFilter={actionFilter}
          entityFilter={entityFilter}
          onSearchChange={setSearchTerm}
          onActionFilterChange={setActionFilter}
          onEntityFilterChange={setEntityFilter}
        />

        <AuditTable
          logs={filteredLogs}
          usersById={usersById}
          actionBadgeClass={actionBadgeClass}
          entityBadgeClass={entityBadgeClass}
          searchTerm={searchTerm}
          actionFilter={actionFilter}
          entityFilter={entityFilter}
          getInitials={getInitials}
          formatDateTime={formatDateTime}
          formatRelativeTime={formatRelativeTime}
          getActionIcon={getActionIcon}
          onViewDetail={handleViewDetail}
        />
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
