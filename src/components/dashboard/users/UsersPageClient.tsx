"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { useUsers } from "@/context/UserContext";
import { UserFormDialog } from "@/components/dashboard/users/UserFormDialog";
import { UsersStats } from "@/components/dashboard/users/UsersStats";
import { UsersFilters } from "@/components/dashboard/users/UsersFilters";
import { UsersTable } from "@/components/dashboard/users/UsersTable";
import { UserDetailsDialog } from "@/components/dashboard/users/UserDetailsDialog";
import { 
  type User, 
  type UserStatus,
  type UserFormData,
} from "@/types";

export default function UsersPage() {
  const router = useRouter();
  const { user: currentUser, hasPermission } = useAuth();
  const { users, createUser, updateUser, deleteUser, changeUserStatus, isLoading } = useUsers();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formError, setFormError] = useState("");

  // Form state
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
    status: "ACTIVE",
    teamId: "",
  });

  // Redirect if not admin
  useEffect(() => {
    if (currentUser && !hasPermission("canManageUsers")) {
      router.push("/dashboard");
    }
  }, [currentUser, hasPermission, router]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!u.name.toLowerCase().includes(term) && !u.email.toLowerCase().includes(term)) {
          return false;
        }
      }

      if (roleFilter !== "all" && u.role !== roleFilter) {
        return false;
      }

      if (statusFilter !== "all" && u.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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
      name: "",
      email: "",
      password: "",
      role: "EMPLOYEE",
      status: "ACTIVE",
      teamId: "",
    });
    setFormError("");
  };

  const handleCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      teamId: user.teamId || "",
    });
    setIsEditOpen(true);
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleToggleStatus = async (user: User, newStatus: UserStatus) => {
    await changeUserStatus(user.id, newStatus);
  };

  const validateUserForm = (isEditMode: boolean) => {
    if (!formData.name || !formData.email || (!isEditMode && !formData.password)) {
      return "Por favor completa todos los campos obligatorios";
    }

    if (formData.password && formData.password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres";
    }

    return "";
  };

  const handleSubmitCreate = async () => {
    setFormError("");

    const validationError = validateUserForm(false);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const result = await createUser(formData);
    
    if (result.success) {
      setIsCreateOpen(false);
      resetForm();
    } else {
      setFormError(result.message);
    }
  };

  const handleSubmitEdit = async () => {
    setFormError("");

    const validationError = validateUserForm(true);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const result = await updateUser(selectedUser!.id, formData);
    
    if (result.success) {
      setIsEditOpen(false);
      setSelectedUser(null);
      resetForm();
    } else {
      setFormError(result.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    
    await deleteUser(selectedUser.id);
    setIsDeleteOpen(false);
    setSelectedUser(null);
  };

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === "ACTIVE").length;
  const adminCount = users.filter(u => u.role === "ADMIN").length;
  const managerCount = users.filter(u => u.role === "MANAGER").length;

  if (!hasPermission("canManageUsers")) {
    return null;
  }

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Gestión de Usuarios" />

      <div className="page-shell page-stack">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="page-heading">Usuarios</h2>
            <p className="page-subheading">
              Gestiona los usuarios y sus permisos
            </p>
          </div>
          <Button className="h-9 px-4" onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Crear Usuario
          </Button>
        </div>

        <UsersStats
          totalUsers={totalUsers}
          activeUsers={activeUsers}
          adminCount={adminCount}
          managerCount={managerCount}
        />

        <UsersFilters
          searchTerm={searchTerm}
          roleFilter={roleFilter}
          statusFilter={statusFilter}
          onSearchChange={setSearchTerm}
          onRoleFilterChange={setRoleFilter}
          onStatusFilterChange={setStatusFilter}
        />

        <UsersTable
          users={filteredUsers}
          currentUserId={currentUser?.id}
          badgeClassName={badgeClassName}
          searchTerm={searchTerm}
          roleFilter={roleFilter}
          statusFilter={statusFilter}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onToggleStatus={(targetUser, newStatus) => void handleToggleStatus(targetUser, newStatus)}
          formatDate={formatDate}
          getInitials={getInitials}
        />
      </div>

      <UserFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        formData={formData}
        formError={formError}
        isLoading={isLoading}
        isEditMode={false}
        onChange={setFormData}
        onSubmit={handleSubmitCreate}
      />

      <UserFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        formData={formData}
        formError={formError}
        isLoading={isLoading}
        isEditMode
        onChange={setFormData}
        onSubmit={handleSubmitEdit}
      />

      <UserDetailsDialog
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        user={selectedUser}
        badgeClassName={badgeClassName}
        formatDate={formatDate}
        getInitials={getInitials}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente al usuario{" "}
              <span className="font-semibold">{selectedUser?.name}</span> del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
