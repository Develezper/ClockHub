"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { AUDIT_ACTION_LABELS, AUDIT_ENTITY_LABELS, type AuditLog } from "@/types";
import { AUDIT_ACTION_STYLE, AUDIT_ENTITY_BADGE_CLASS } from "@/lib/semantic-colors";
import type { LucideIcon } from "lucide-react";
import type { User } from "@/types";

type AuditDetailModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLog: AuditLog | null;
  selectedLogUser?: User;
  formatDateTime: (date: Date) => string;
  getInitials: (name: string) => string;
  getActionIcon: (action: AuditLog["action"]) => LucideIcon;
};

export function AuditDetailModal({
  open,
  onOpenChange,
  selectedLog,
  selectedLogUser,
  formatDateTime,
  getInitials,
  getActionIcon,
}: AuditDetailModalProps) {
  const actionStyle = selectedLog ? AUDIT_ACTION_STYLE[selectedLog.action] : null;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Detalles del Evento"
      description="Información completa del registro de auditoría"
      contentClassName="sm:max-w-[600px]"
      footer={
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cerrar
        </Button>
      }
    >
      {selectedLog && (
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4">
            <div className={`rounded-xl border p-3 ${actionStyle?.iconBadgeClass ?? ""}`}>
              {(() => {
                const ActionIcon = getActionIcon(selectedLog.action);
                return <ActionIcon className="h-6 w-6" />;
              })()}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{AUDIT_ACTION_LABELS[selectedLog.action]}</h3>
              <Badge className={AUDIT_ENTITY_BADGE_CLASS[selectedLog.entity]}>
                {AUDIT_ENTITY_LABELS[selectedLog.entity]}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Realizado por</p>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{selectedLogUser ? getInitials(selectedLogUser.name) : "?"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedLogUser?.name || "Desconocido"}</p>
                <p className="text-sm text-muted-foreground">{selectedLogUser?.email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Fecha y Hora</p>
            <p className="font-medium">{formatDateTime(selectedLog.createdAt)}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">ID de Entidad</p>
            <code className="rounded bg-muted px-2 py-1 text-sm">{selectedLog.entityId}</code>
          </div>

          {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Cambios Realizados</p>
              <ScrollArea className="h-40 rounded-lg border p-4">
                <div className="space-y-3">
                  {Object.entries(selectedLog.changes).map(([field, change]) => (
                    <div key={field} className="space-y-1">
                      <p className="text-sm font-medium capitalize">{field}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="rounded bg-muted px-2 py-0.5 text-foreground line-through">
                          {String(change.old) || "null"}
                        </span>
                        <span>→</span>
                        <span className="rounded bg-muted px-2 py-0.5 text-foreground">{String(change.new) || "null"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Información Adicional</p>
              <ScrollArea className="h-24 rounded-lg border p-4">
                <pre className="text-xs">{JSON.stringify(selectedLog.metadata, null, 2)}</pre>
              </ScrollArea>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
