"use client";

import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { USER_ROLE_BADGE_CLASS, USER_STATUS_BADGE_CLASS } from "@/lib/semantic-colors";

type UsersFiltersProps = {
  searchTerm: string;
  roleFilter: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
};

export function UsersFilters({
  searchTerm,
  roleFilter,
  statusFilter,
  onSearchChange,
  onRoleFilterChange,
  onStatusFilterChange,
}: UsersFiltersProps) {
  return (
    <Card className="surface">
      <CardContent className="surface-body">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-10 pl-10"
            />
          </div>

          <Select value={roleFilter} onValueChange={onRoleFilterChange}>
            <SelectTrigger className="h-10 w-full md:w-40">
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="ADMIN" className={USER_ROLE_BADGE_CLASS.ADMIN}>Administrador</SelectItem>
              <SelectItem value="MANAGER" className={USER_ROLE_BADGE_CLASS.MANAGER}>Gerente</SelectItem>
              <SelectItem value="EMPLOYEE" className={USER_ROLE_BADGE_CLASS.EMPLOYEE}>Empleado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="h-10 w-full md:w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ACTIVE" className={USER_STATUS_BADGE_CLASS.ACTIVE}>Activo</SelectItem>
              <SelectItem value="INACTIVE" className={USER_STATUS_BADGE_CLASS.INACTIVE}>Inactivo</SelectItem>
              <SelectItem value="SUSPENDED" className={USER_STATUS_BADGE_CLASS.SUSPENDED}>Suspendido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
