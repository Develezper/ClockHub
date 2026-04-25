"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Clock,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AppHeader } from "@/components/shared/AppHeader";
import { useAuth } from "@/hooks/use-auth";
import { useSchedule } from "@/context/ScheduleContext";
import { useUsers } from "@/context/UserContext";
import { ScheduleFormDialog } from "@/components/dashboard/schedules/ScheduleFormDialog";
import { STATUS_LABELS, type Schedule, type ScheduleFormData } from "@/types";

export default function SchedulesPage() {
  const { user, hasPermission } = useAuth();
  const { schedules, createSchedule, updateSchedule, deleteSchedule, isLoading } = useSchedule();
  const { users } = useUsers();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [formError, setFormError] = useState("");

  // Form state
  const [formData, setFormData] = useState<ScheduleFormData>({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    userId: "",
    status: "SCHEDULED",
  });

  const canCreate = hasPermission("canCreateSchedules");
  const canEdit = hasPermission("canEditSchedules");
  const canDelete = hasPermission("canDeleteSchedules");
  const canViewAll = hasPermission("canViewAllSchedules");

  const usersById = useMemo(() => {
    return new Map(users.map((u) => [u.id, u]));
  }, [users]);

  const filteredSchedules = useMemo(() => {
    return schedules
      .filter((schedule) => {
        if (!canViewAll && user) {
          if (user.role === "MANAGER") {
            const scheduleUser = usersById.get(schedule.userId);
            if (scheduleUser?.teamId !== user.teamId && schedule.userId !== user.id) {
              return false;
            }
          } else if (user.role === "EMPLOYEE" && schedule.userId !== user.id) {
            return false;
          }
        }

        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const assignedUser = usersById.get(schedule.userId);
          if (!schedule.title.toLowerCase().includes(term) && !assignedUser?.name.toLowerCase().includes(term)) {
            return false;
          }
        }

        if (statusFilter !== "all" && schedule.status !== statusFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [schedules, canViewAll, user, usersById, searchTerm, statusFilter]);

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateForInput = (date: Date) => {
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  };

  const badgeClassName = "bg-muted text-foreground";

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      userId: "",
      status: "SCHEDULED",
    });
    setFormError("");
  };

  const handleCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleEdit = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      title: schedule.title,
      description: schedule.description || "",
      startTime: formatDateForInput(schedule.startTime),
      endTime: formatDateForInput(schedule.endTime),
      userId: schedule.userId,
      status: schedule.status,
    });
    setIsEditOpen(true);
  };

  const handleView = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setIsViewOpen(true);
  };

  const handleDeleteClick = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setIsDeleteOpen(true);
  };

  const validateScheduleForm = () => {
    if (!formData.title || !formData.startTime || !formData.endTime || !formData.userId) {
      return "Por favor completa todos los campos obligatorios";
    }

    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      return "La hora de inicio debe ser anterior a la hora de fin";
    }

    return "";
  };

  const handleSubmitCreate = async () => {
    setFormError("");

    const validationError = validateScheduleForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const result = await createSchedule(formData);
    
    if (result.success) {
      setIsCreateOpen(false);
      resetForm();
    } else {
      setFormError(result.message);
    }
  };

  const handleSubmitEdit = async () => {
    setFormError("");

    const validationError = validateScheduleForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const result = await updateSchedule(selectedSchedule!.id, formData);
    
    if (result.success) {
      setIsEditOpen(false);
      setSelectedSchedule(null);
      resetForm();
    } else {
      setFormError(result.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedSchedule) return;
    
    await deleteSchedule(selectedSchedule.id);
    setIsDeleteOpen(false);
    setSelectedSchedule(null);
  };

  const activeUsers = users.filter(u => u.status === "ACTIVE");
  const selectedAssignedUser = selectedSchedule ? usersById.get(selectedSchedule.userId) : undefined;

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Gestión de Horarios" />

      <div className="page-shell page-stack">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="page-heading">Horarios</h2>
            <p className="page-subheading">
              {canViewAll ? "Gestiona todos los horarios del equipo" : "Visualiza tus horarios asignados"}
            </p>
          </div>
          {canCreate && (
            <Button className="h-9 px-4" onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Horario
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card className="surface">
          <CardContent className="surface-body">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título o usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 w-full md:w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="SCHEDULED">Programado</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                  <SelectItem value="COMPLETED">Completado</SelectItem>
                  <SelectItem value="CANCELLED">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Schedules Table */}
        <Card className="surface">
          <CardHeader>
            <CardTitle>Lista de Horarios</CardTitle>
            <CardDescription>
              {filteredSchedules.length} horario{filteredSchedules.length !== 1 ? "s" : ""} encontrado{filteredSchedules.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredSchedules.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Inicio</TableHead>
                      <TableHead>Fin</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSchedules.map((schedule) => {
                      const assignedUser = usersById.get(schedule.userId);
                      return (
                        <TableRow key={schedule.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Calendar className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{schedule.title}</p>
                                {schedule.description && (
                                  <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                    {schedule.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {assignedUser ? getInitials(assignedUser.name) : "?"}
                                </AvatarFallback>
                              </Avatar>
                              <span>{assignedUser?.name || "Desconocido"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {formatDateTime(schedule.startTime)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {formatDateTime(schedule.endTime)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={badgeClassName}>
                              {STATUS_LABELS[schedule.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleView(schedule)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver Detalles
                                </DropdownMenuItem>
                                {canEdit && schedule.status !== "CANCELLED" && (
                                  <DropdownMenuItem onClick={() => handleEdit(schedule)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                )}
                                {canDelete && schedule.status !== "CANCELLED" && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteClick(schedule)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Cancelar
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">No hay horarios</h3>
                <p className="text-muted-foreground mt-1">
                  {searchTerm || statusFilter !== "all"
                    ? "No se encontraron horarios con los filtros aplicados"
                    : "Aún no se han creado horarios"}
                </p>
                {canCreate && !searchTerm && statusFilter === "all" && (
                  <Button className="mt-4" onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Primer Horario
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ScheduleFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        formData={formData}
        formError={formError}
        isLoading={isLoading}
        isEditMode={false}
        activeUsers={activeUsers}
        onChange={setFormData}
        onSubmit={handleSubmitCreate}
      />

      <ScheduleFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        formData={formData}
        formError={formError}
        isLoading={isLoading}
        isEditMode
        activeUsers={activeUsers}
        onChange={setFormData}
        onSubmit={handleSubmitEdit}
      />

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalles del Horario</DialogTitle>
          </DialogHeader>
          {selectedSchedule && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Calendar className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedSchedule.title}</h3>
                  <Badge className={badgeClassName}>
                    {STATUS_LABELS[selectedSchedule.status]}
                  </Badge>
                </div>
              </div>
              
              {selectedSchedule.description && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{selectedSchedule.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Inicio</p>
                  <p className="font-medium">{formatDateTime(selectedSchedule.startTime)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Fin</p>
                  <p className="font-medium">{formatDateTime(selectedSchedule.endTime)}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Asignado a</p>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {selectedAssignedUser ? getInitials(selectedAssignedUser.name) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {selectedAssignedUser?.name || "Desconocido"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Creado</p>
                  <p>{formatDateTime(selectedSchedule.createdAt)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Actualizado</p>
                  <p>{formatDateTime(selectedSchedule.updatedAt)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar este horario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará el horario como cancelado. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, mantener</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
