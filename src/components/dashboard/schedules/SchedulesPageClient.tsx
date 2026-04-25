"use client";

import { useMemo, useState } from "react";
import {
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { formatDateTimeEs, getInitials } from "@/lib/format";
import { SectionHeader } from "@/components/dashboard/common/SectionHeader";
import { ScheduleFormDialog } from "@/components/dashboard/schedules/ScheduleFormDialog";
import { SchedulesFilters } from "@/components/dashboard/schedules/SchedulesFilters";
import { SchedulesTable } from "@/components/dashboard/schedules/SchedulesTable";
import { ScheduleDetailsDialog } from "@/components/dashboard/schedules/ScheduleDetailsDialog";
import { type Schedule, type ScheduleFormData } from "@/types";

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

  const formatDateTime = (date: Date) =>
    formatDateTimeEs(date, {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDateForInput = (date: Date) => {
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
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
        <SectionHeader
          title="Horarios"
          subtitle={canViewAll ? "Gestiona todos los horarios del equipo" : "Visualiza tus horarios asignados"}
          actions={
            canCreate ? (
              <Button className="h-9 px-4" onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Horario
              </Button>
            ) : null
          }
        />

        <SchedulesFilters
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearchChange={setSearchTerm}
          onStatusFilterChange={setStatusFilter}
        />

        <SchedulesTable
          schedules={filteredSchedules}
          usersById={usersById}
          canCreate={canCreate}
          canEdit={canEdit}
          canDelete={canDelete}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onCreate={handleCreate}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          formatDateTime={formatDateTime}
          getInitials={getInitials}
        />
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

      <ScheduleDetailsDialog
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        schedule={selectedSchedule}
        assignedUser={selectedAssignedUser}
        formatDateTime={formatDateTime}
        getInitials={getInitials}
      />

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
