"use client";

import { CalendarDays } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { SCHEDULE_STATUS_BADGE_CLASS } from "@/lib/semantic-colors";
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

type DateTimeFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function DateTimeField({ id, label, value, onChange }: DateTimeFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    const input = inputRef.current;
    if (!input) return;

    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.focus();
    input.click();
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          type="datetime-local"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:invert"
        />
        <button
          type="button"
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          onClick={openPicker}
          aria-label={`Seleccionar fecha para ${label.toLowerCase()}`}
        >
          <CalendarDays className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

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
            <DateTimeField
              id={isEditMode ? "edit-startTime" : "startTime"}
              label="Inicio *"
              value={formData.startTime}
              onChange={(value) => onChange({ ...formData, startTime: value })}
            />
            <DateTimeField
              id={isEditMode ? "edit-endTime" : "endTime"}
              label="Fin *"
              value={formData.endTime}
              onChange={(value) => onChange({ ...formData, endTime: value })}
            />
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
                <SelectItem value="SCHEDULED" className={SCHEDULE_STATUS_BADGE_CLASS.SCHEDULED}>Programado</SelectItem>
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
