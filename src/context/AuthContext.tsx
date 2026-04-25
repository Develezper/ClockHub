"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { User, UserRole } from "@/types";
import { ROLE_PERMISSIONS } from "@/types";

type AuthApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
};

type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  hasPermission: (permission: keyof typeof ROLE_PERMISSIONS.ADMIN) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PERMISSIONS_BY_ROLE: Record<UserRole, typeof ROLE_PERMISSIONS.ADMIN> = {
  ADMIN: {
    canViewAllSchedules: true,
    canCreateSchedules: true,
    canEditSchedules: true,
    canDeleteSchedules: true,
    canManageUsers: true,
    canViewAudit: true,
    canChangeRoles: true,
  },
  MANAGER: {
    canViewAllSchedules: false,
    canCreateSchedules: true,
    canEditSchedules: true,
    canDeleteSchedules: true,
    canManageUsers: false,
    canViewAudit: true,
    canChangeRoles: false,
  },
  EMPLOYEE: {
    canViewAllSchedules: false,
    canCreateSchedules: false,
    canEditSchedules: false,
    canDeleteSchedules: false,
    canManageUsers: false,
    canViewAudit: false,
    canChangeRoles: false,
  },
};

function toContextUser(user: SessionUser): User {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
  };
}

async function parseAuthResponse<T>(response: Response): Promise<AuthApiResponse<T>> {
  try {
    return (await response.json()) as AuthApiResponse<T>;
  } catch {
    return {
      success: false,
      message: "Respuesta inválida del servidor",
      code: "INVALID_SERVER_RESPONSE",
    };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authOperationId = useRef(0);

  const beginAuthOperation = useCallback(() => {
    authOperationId.current += 1;
    return authOperationId.current;
  }, []);

  const isLatestAuthOperation = useCallback((operationId: number) => {
    return authOperationId.current === operationId;
  }, []);

  const readSession = useCallback(async () => {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    const body = await parseAuthResponse<{ user: SessionUser }>(response);
    return { response, body };
  }, []);

  const hydrateSession = useCallback(async () => {
    const operationId = beginAuthOperation();

    try {
      let { response, body } = await readSession();

      if (response.status === 401) {
        await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
        ({ response, body } = await readSession());
      }

      if (!isLatestAuthOperation(operationId)) {
        return;
      }

      if (response.ok && body.success && body.data?.user) {
        setUser(toContextUser(body.data.user));
      } else {
        setUser(null);
      }
    } catch {
      if (isLatestAuthOperation(operationId)) {
        setUser(null);
      }
    } finally {
      if (isLatestAuthOperation(operationId)) {
        setIsLoading(false);
      }
    }
  }, [beginAuthOperation, isLatestAuthOperation, readSession]);

  useEffect(() => {
    void hydrateSession();
  }, [hydrateSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const operationId = beginAuthOperation();
      setIsLoading(true);

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });

        const body = await parseAuthResponse<{ user: SessionUser }>(response);
        if (!response.ok || !body.success || !body.data?.user) {
          return { success: false, message: body.message || "Credenciales inválidas" };
        }

        if (isLatestAuthOperation(operationId)) {
          setUser(toContextUser(body.data.user));
        }

        return { success: true, message: body.message };
      } catch {
        return { success: false, message: "No fue posible iniciar sesión" };
      } finally {
        if (isLatestAuthOperation(operationId)) {
          setIsLoading(false);
        }
      }
    },
    [beginAuthOperation, isLatestAuthOperation],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const operationId = beginAuthOperation();
      setIsLoading(true);

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name, email, password }),
        });

        const body = await parseAuthResponse<{ user: SessionUser }>(response);
        if (!response.ok || !body.success || !body.data?.user) {
          return { success: false, message: body.message || "No fue posible registrarse" };
        }

        if (isLatestAuthOperation(operationId)) {
          setUser(toContextUser(body.data.user));
        }

        return { success: true, message: body.message };
      } catch {
        return { success: false, message: "No fue posible registrarse" };
      } finally {
        if (isLatestAuthOperation(operationId)) {
          setIsLoading(false);
        }
      }
    },
    [beginAuthOperation, isLatestAuthOperation],
  );

  const logout = useCallback(async () => {
    const operationId = beginAuthOperation();
    setIsLoading(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      if (isLatestAuthOperation(operationId)) {
        setUser(null);
        setIsLoading(false);
      }
    }
  }, [beginAuthOperation, isLatestAuthOperation]);

  const hasPermission = useCallback(
    (permission: keyof typeof ROLE_PERMISSIONS.ADMIN) => {
      if (!user) return false;
      return PERMISSIONS_BY_ROLE[user.role][permission];
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
