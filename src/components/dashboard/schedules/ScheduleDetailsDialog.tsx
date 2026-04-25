"use client";

import { Calendar } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { STATUS_LABELS, type Schedule, type User } from "@/types";
import { SCHEDULE_STATUS_BADGE_CLASS } from "@/lib/semantic-colors";

type ScheduleDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: Schedule | null;
  assignedUser?: User;
  formatDateTime: (date: Date) => string;
  getInitials: (name: string) => string;
};

export function ScheduleDetailsDialog({
  open,
  onOpenChange,
  schedule,
  assignedUser,
  formatDateTime,
  getInitials,
}: ScheduleDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalles del Horario</DialogTitle>
        </DialogHeader>

        {schedule && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <Calendar className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{schedule.title}</h3>
                <Badge className={SCHEDULE_STATUS_BADGE_CLASS[schedule.status]}>
                  {STATUS_LABELS[schedule.status]}
                </Badge>
              </div>
            </div>

            {schedule.description && (
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">{schedule.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Inicio</p>
                <p className="font-medium">{formatDateTime(schedule.startTime)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Fin</p>
                <p className="font-medium">{formatDateTime(schedule.endTime)}</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Asignado a</p>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{assignedUser ? getInitials(assignedUser.name) : "?"}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{assignedUser?.name || "Desconocido"}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Creado</p>
                <p>{formatDateTime(schedule.createdAt)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Actualizado</p>
                <p>{formatDateTime(schedule.updatedAt)}</p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
