"use client";

import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AUDIT_ACTION_STYLE, AUDIT_ENTITY_BADGE_CLASS } from "@/lib/semantic-colors";

type AuditFiltersProps = {
  searchTerm: string;
  actionFilter: string;
  entityFilter: string;
  onSearchChange: (value: string) => void;
  onActionFilterChange: (value: string) => void;
  onEntityFilterChange: (value: string) => void;
};

export function AuditFilters({
  searchTerm,
  actionFilter,
  entityFilter,
  onSearchChange,
  onActionFilterChange,
  onEntityFilterChange,
}: AuditFiltersProps) {
  return (
    <Card className="surface">
      <CardContent className="surface-body">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar en el registro..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-10 pl-10 rounded-lg border-white/10 bg-transparent"
            />
          </div>

          <Select value={actionFilter} onValueChange={onActionFilterChange}>
            <SelectTrigger className="h-10 w-full md:w-44 rounded-lg border-white/10 bg-transparent">
              <SelectValue placeholder="Acción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las acciones</SelectItem>
              <SelectItem value="CREATE" className={AUDIT_ACTION_STYLE.CREATE.textClass}>Creación</SelectItem>
              <SelectItem value="UPDATE" className={AUDIT_ACTION_STYLE.UPDATE.textClass}>Actualización</SelectItem>
              <SelectItem value="DELETE" className={AUDIT_ACTION_STYLE.DELETE.textClass}>Eliminación</SelectItem>
              <SelectItem value="LOGIN" className={AUDIT_ACTION_STYLE.LOGIN.textClass}>Inicio Sesión</SelectItem>
              <SelectItem value="LOGOUT" className={AUDIT_ACTION_STYLE.LOGOUT.textClass}>Cierre Sesión</SelectItem>
              <SelectItem value="ROLE_CHANGE" className={AUDIT_ACTION_STYLE.ROLE_CHANGE.textClass}>Cambio de Rol</SelectItem>
              <SelectItem value="STATUS_CHANGE" className={AUDIT_ACTION_STYLE.STATUS_CHANGE.textClass}>Cambio de Estado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={entityFilter} onValueChange={onEntityFilterChange}>
            <SelectTrigger className="h-10 w-full md:w-40 rounded-lg border-white/10 bg-transparent">
              <SelectValue placeholder="Entidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="USER" className={AUDIT_ENTITY_BADGE_CLASS.USER}>Usuario</SelectItem>
              <SelectItem value="SCHEDULE" className={AUDIT_ENTITY_BADGE_CLASS.SCHEDULE}>Horario</SelectItem>
              <SelectItem value="AUTH" className={AUDIT_ENTITY_BADGE_CLASS.AUTH}>Autenticación</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
