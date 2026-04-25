"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Shield,
  UserCheck,
  UserX,
  Mail,
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
  DialogDescription,
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
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { AppHeader } from "@/components/shared/AppHeader";
import { useAuth } from "@/hooks/use-auth";
import { useUsers } from "@/context/UserContext";
import { 
  ROLE_LABELS, 
  USER_STATUS_LABELS, 
  type User, 
  type UserRole, 
  type UserStatus,
  type UserFormData,
} from "@/types";

export default function UsersPage() {
  const router = useRouter();
  const { user: currentUser, hasPermission } = useAuth();
  const { users, createUser, updateUser, deleteUser, changeUserRole, changeUserStatus, isLoading } = useUsers();

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

  // Filter users
  const filteredUsers = users.filter((u) => {
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (
        !u.name.toLowerCase().includes(term) &&
        !u.email.toLowerCase().includes(term)
      ) {
        return false;
      }
    }

    // Role filter
    if (roleFilter !== "all" && u.role !== roleFilter) {
      return false;
    }

    // Status filter
    if (statusFilter !== "all" && u.status !== statusFilter) {
      return false;
    }

    return true;
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "bg-muted text-foreground";
      case "MANAGER":
        return "bg-muted text-foreground";
      case "EMPLOYEE":
        return "bg-muted text-foreground";
      default:
        return "bg-muted text-foreground";
    }
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-muted text-foreground";
      case "INACTIVE":
        return "bg-muted text-foreground";
      case "SUSPENDED":
        return "bg-muted text-foreground";
      default:
        return "bg-muted text-foreground";
    }
  };

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

  const handleToggleStatus = async (user: User) => {
    const newStatus: UserStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await changeUserStatus(user.id, newStatus);
  };

  const handleSubmitCreate = async () => {
    setFormError("");

    if (!formData.name || !formData.email || !formData.password) {
      setFormError("Por favor completa todos los campos obligatorios");
      return;
    }

    if (formData.password && formData.password.length < 8) {
      setFormError("La contraseña debe tener al menos 8 caracteres");
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

    if (!formData.name || !formData.email) {
      setFormError("Por favor completa todos los campos obligatorios");
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

      <div className="mx-auto w-full max-w-6xl flex-1 overflow-auto space-y-6 p-5 md:p-6">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Usuarios</h2>
            <p className="text-muted-foreground">
              Gestiona los usuarios y sus permisos
            </p>
          </div>
          <Button className="h-9 px-4" onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Crear Usuario
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-border bg-card/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  <Users className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                  <p className="text-sm text-muted-foreground">Total Usuarios</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  <UserCheck className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeUsers}</p>
                  <p className="text-sm text-muted-foreground">Activos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  <Shield className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{adminCount}</p>
                  <p className="text-sm text-muted-foreground">Administradores</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  <Users className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{managerCount}</p>
                  <p className="text-sm text-muted-foreground">Gerentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-border bg-card/50">
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o correo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-10 w-full md:w-40">
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="MANAGER">Gerente</SelectItem>
                  <SelectItem value="EMPLOYEE">Empleado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 w-full md:w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ACTIVE">Activo</SelectItem>
                  <SelectItem value="INACTIVE">Inactivo</SelectItem>
                  <SelectItem value="SUSPENDED">Suspendido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle>Lista de Usuarios</CardTitle>
            <CardDescription>
              {filteredUsers.length} usuario{filteredUsers.length !== 1 ? "s" : ""} encontrado{filteredUsers.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Correo</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Creado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {getInitials(u.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{u.name}</p>
                              {u.teamId && (
                                <p className="text-xs text-muted-foreground">
                                  Equipo: {u.teamId}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {u.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(u.role)}>
                            {ROLE_LABELS[u.role]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(u.status)}>
                            {USER_STATUS_LABELS[u.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(u.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(u)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(u)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(u)}>
                                {u.status === "ACTIVE" ? (
                                  <>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Desactivar
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Activar
                                  </>
                                )}
                              </DropdownMenuItem>
                              {u.id !== currentUser?.id && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteClick(u)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">No hay usuarios</h3>
                <p className="text-muted-foreground mt-1">
                  {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                    ? "No se encontraron usuarios con los filtros aplicados"
                    : "Aún no se han creado usuarios"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Completa los campos para crear un nuevo usuario
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {formError && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                {formError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Juan Pérez"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="juan@clockhub.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Rol *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                >
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
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as UserStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Activo</SelectItem>
                    <SelectItem value="INACTIVE">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="teamId">Equipo (Opcional)</Label>
              <Input
                id="teamId"
                value={formData.teamId}
                onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                placeholder="team-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitCreate} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Creando...
                </>
              ) : (
                "Crear Usuario"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica los datos del usuario
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {formError && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                {formError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre Completo *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Correo Electrónico *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-role">Rol</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                >
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
                <Label htmlFor="edit-status">Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as UserStatus })}
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
              <Label htmlFor="edit-teamId">Equipo</Label>
              <Input
                id="edit-teamId"
                value={formData.teamId}
                onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitEdit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalles del Usuario</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {getInitials(selectedUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Rol</p>
                  <Badge className={getRoleColor(selectedUser.role)}>
                    {ROLE_LABELS[selectedUser.role]}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge className={getStatusColor(selectedUser.status)}>
                    {USER_STATUS_LABELS[selectedUser.status]}
                  </Badge>
                </div>
              </div>

              {selectedUser.teamId && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Equipo</p>
                  <p className="font-medium">{selectedUser.teamId}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Creado</p>
                  <p>{formatDate(selectedUser.createdAt)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Actualizado</p>
                  <p>{formatDate(selectedUser.updatedAt)}</p>
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
