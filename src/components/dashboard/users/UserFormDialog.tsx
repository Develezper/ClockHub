"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import type { UserFormData, UserRole, UserStatus } from "@/types";

type UserFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: UserFormData;
  formError: string;
  isLoading: boolean;
  isEditMode: boolean;
  onChange: (data: UserFormData) => void;
  onSubmit: () => Promise<void>;
};

export function UserFormDialog({
  open,
  onOpenChange,
  formData,
  formError,
  isLoading,
  isEditMode,
  onChange,
  onSubmit,
}: UserFormDialogProps) {
  const title = isEditMode ? "Editar Usuario" : "Crear Nuevo Usuario";
  const description = isEditMode
    ? "Modifica los datos del usuario"
    : "Completa los campos para crear un nuevo usuario";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {formError && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{formError}</div>}

          <div className="space-y-2">
            <Label htmlFor={isEditMode ? "edit-name" : "name"}>Nombre Completo *</Label>
            <Input
              id={isEditMode ? "edit-name" : "name"}
              value={formData.name}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
              placeholder={isEditMode ? undefined : "Juan Pérez"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={isEditMode ? "edit-email" : "email"}>Correo Electrónico *</Label>
            <Input
              id={isEditMode ? "edit-email" : "email"}
              type="email"
              value={formData.email}
              onChange={(e) => onChange({ ...formData, email: e.target.value })}
              placeholder={isEditMode ? undefined : "juan@clockhub.com"}
            />
          </div>

          {!isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => onChange({ ...formData, password: e.target.value })}
                placeholder="Mínimo 8 caracteres"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={isEditMode ? "edit-role" : "role"}>Rol</Label>
              <Select value={formData.role} onValueChange={(value) => onChange({ ...formData, role: value as UserRole })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLOYEE">Empleado</SelectItem>
                  <SelectItem value="MANAGER">Gerente</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor={isEditMode ? "edit-status" : "status"}>Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => onChange({ ...formData, status: value as UserStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Activo</SelectItem>
                  <SelectItem value="INACTIVE">Inactivo</SelectItem>
                  <SelectItem value="SUSPENDED">Suspendido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={isEditMode ? "edit-teamId" : "teamId"}>Equipo {isEditMode ? "" : "(Opcional)"}</Label>
            <Input
              id={isEditMode ? "edit-teamId" : "teamId"}
              value={formData.teamId}
              onChange={(e) => onChange({ ...formData, teamId: e.target.value })}
              placeholder={isEditMode ? undefined : "team-1"}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => void onSubmit()} disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                {isEditMode ? "Guardando..." : "Creando..."}
              </>
            ) : isEditMode ? (
              "Guardar Cambios"
            ) : (
              "Crear Usuario"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
