"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { ScheduleFormData, ScheduleStatus, User } from "@/types";

type ScheduleFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ScheduleFormData;
  formError: string;
  isLoading: boolean;
  isEditMode: boolean;
  activeUsers: User[];
  onChange: (data: ScheduleFormData) => void;
  onSubmit: () => Promise<void>;
};

export function ScheduleFormDialog({
  open,
  onOpenChange,
  formData,
  formError,
  isLoading,
  isEditMode,
  activeUsers,
  onChange,
  onSubmit,
}: ScheduleFormDialogProps) {
  const title = isEditMode ? "Editar Horario" : "Crear Nuevo Horario";
  const description = isEditMode
    ? "Modifica los campos del horario"
    : "Completa los campos para crear un nuevo horario";

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
            <Label htmlFor={isEditMode ? "edit-title" : "title"}>Título *</Label>
            <Input
              id={isEditMode ? "edit-title" : "title"}
              value={formData.title}
              onChange={(e) => onChange({ ...formData, title: e.target.value })}
              placeholder={isEditMode ? undefined : "Ej: Turno Mañana"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={isEditMode ? "edit-description" : "description"}>Descripción</Label>
            <Textarea
              id={isEditMode ? "edit-description" : "description"}
              value={formData.description}
              onChange={(e) => onChange({ ...formData, description: e.target.value })}
              placeholder={isEditMode ? undefined : "Descripción del horario..."}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={isEditMode ? "edit-startTime" : "startTime"}>Inicio *</Label>
              <Input
                id={isEditMode ? "edit-startTime" : "startTime"}
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => onChange({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={isEditMode ? "edit-endTime" : "endTime"}>Fin *</Label>
              <Input
                id={isEditMode ? "edit-endTime" : "endTime"}
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => onChange({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={isEditMode ? "edit-userId" : "userId"}>Asignar a *</Label>
            <Select value={formData.userId} onValueChange={(value) => onChange({ ...formData, userId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un usuario" />
              </SelectTrigger>
              <SelectContent>
                {activeUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={isEditMode ? "edit-status" : "status"}>Estado</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => onChange({ ...formData, status: value as ScheduleStatus })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SCHEDULED">Programado</SelectItem>
              </SelectContent>
            </Select>
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
              "Crear Horario"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
