"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ROLE_LABELS, USER_STATUS_LABELS, type User } from "@/types";

type UserDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  badgeClassName: string;
  formatDate: (date: Date) => string;
  getInitials: (name: string) => string;
};

export function UserDetailsDialog({
  open,
  onOpenChange,
  user,
  badgeClassName,
  formatDate,
  getInitials,
}: UserDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalles del Usuario</DialogTitle>
        </DialogHeader>

        {user && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary text-xl">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Rol</p>
                <Badge className={badgeClassName}>{ROLE_LABELS[user.role]}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Estado</p>
                <Badge className={badgeClassName}>{USER_STATUS_LABELS[user.status]}</Badge>
              </div>
            </div>

            {user.teamId && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Equipo</p>
                <p className="font-medium">{user.teamId}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Creado</p>
                <p>{formatDate(user.createdAt)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Actualizado</p>
                <p>{formatDate(user.updatedAt)}</p>
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
