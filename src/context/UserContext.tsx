"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { User, UserFormData, UserRole, UserStatus } from "@/types";

interface UserContextType {
  users: User[];
  isLoading: boolean;
  getUsers: () => User[];
  getUserById: (id: string) => User | undefined;
  createUser: (data: UserFormData) => Promise<{ success: boolean; message: string }>;
  updateUser: (id: string, data: Partial<UserFormData>) => Promise<{ success: boolean; message: string }>;
  deleteUser: (id: string) => Promise<{ success: boolean; message: string }>;
  changeUserRole: (id: string, role: UserRole) => Promise<{ success: boolean; message: string }>;
  changeUserStatus: (id: string, status: UserStatus) => Promise<{ success: boolean; message: string }>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Datos de demostración
const INITIAL_USERS: User[] = [
  {
    id: "1",
    email: "admin@clockhub.com",
    name: "Carlos Administrador",
    role: "ADMIN",
    status: "ACTIVE",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    email: "gerente@clockhub.com",
    name: "María Gerente",
    role: "MANAGER",
    status: "ACTIVE",
    teamId: "team-1",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
  },
  {
    id: "3",
    email: "empleado@clockhub.com",
    name: "Juan Empleado",
    role: "EMPLOYEE",
    status: "ACTIVE",
    teamId: "team-1",
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-02-15"),
  },
  {
    id: "4",
    email: "ana.lopez@clockhub.com",
    name: "Ana López",
    role: "EMPLOYEE",
    status: "ACTIVE",
    teamId: "team-1",
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-01"),
  },
  {
    id: "5",
    email: "pedro.garcia@clockhub.com",
    name: "Pedro García",
    role: "EMPLOYEE",
    status: "INACTIVE",
    teamId: "team-2",
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-06-01"),
  },
  {
    id: "6",
    email: "laura.martinez@clockhub.com",
    name: "Laura Martínez",
    role: "MANAGER",
    status: "ACTIVE",
    teamId: "team-2",
    createdAt: new Date("2024-04-01"),
    updatedAt: new Date("2024-04-01"),
  },
];

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [isLoading, setIsLoading] = useState(false);

  const getUsers = useCallback(() => {
    return users;
  }, [users]);

  const getUserById = useCallback(
    (id: string) => {
      return users.find((u) => u.id === id);
    },
    [users]
  );

  const createUser = useCallback(
    async (data: UserFormData) => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const exists = users.find((u) => u.email === data.email);
      if (exists) {
        setIsLoading(false);
        return { success: false, message: "El correo ya está registrado" };
      }

      const newUser: User = {
        id: String(Date.now()),
        email: data.email,
        name: data.name,
        role: data.role,
        status: data.status,
        teamId: data.teamId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setUsers((prev) => [...prev, newUser]);
      setIsLoading(false);
      return { success: true, message: "Usuario creado exitosamente" };
    },
    [users]
  );

  const updateUser = useCallback(
    async (id: string, data: Partial<UserFormData>) => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const user = users.find((u) => u.id === id);
      if (!user) {
        setIsLoading(false);
        return { success: false, message: "Usuario no encontrado" };
      }

      if (data.email && data.email !== user.email) {
        const exists = users.find((u) => u.email === data.email);
        if (exists) {
          setIsLoading(false);
          return { success: false, message: "El correo ya está registrado" };
        }
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                ...data,
                updatedAt: new Date(),
              }
            : u
        )
      );

      setIsLoading(false);
      return { success: true, message: "Usuario actualizado exitosamente" };
    },
    [users]
  );

  const deleteUser = useCallback(async (id: string) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    setUsers((prev) => prev.filter((u) => u.id !== id));

    setIsLoading(false);
    return { success: true, message: "Usuario eliminado exitosamente" };
  }, []);

  const changeUserRole = useCallback(
    async (id: string, role: UserRole) => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const user = users.find((u) => u.id === id);
      if (!user) {
        setIsLoading(false);
        return { success: false, message: "Usuario no encontrado" };
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                role,
                updatedAt: new Date(),
              }
            : u
        )
      );

      setIsLoading(false);
      return { success: true, message: "Rol actualizado exitosamente" };
    },
    [users]
  );

  const changeUserStatus = useCallback(
    async (id: string, status: UserStatus) => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const user = users.find((u) => u.id === id);
      if (!user) {
        setIsLoading(false);
        return { success: false, message: "Usuario no encontrado" };
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                status,
                updatedAt: new Date(),
              }
            : u
        )
      );

      setIsLoading(false);
      return { success: true, message: "Estado actualizado exitosamente" };
    },
    [users]
  );

  return (
    <UserContext.Provider
      value={{
        users,
        isLoading,
        getUsers,
        getUserById,
        createUser,
        updateUser,
        deleteUser,
        changeUserRole,
        changeUserStatus,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUsers debe usarse dentro de un UserProvider");
  }
  return context;
}
