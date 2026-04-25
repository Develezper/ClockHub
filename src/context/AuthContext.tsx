"use client";

import { createContext, useCallback, useContext, useEffect, useReducer, useRef, type ReactNode } from "react";
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
  teamId: string | null;
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

type AuthState = {
  user: User | null;
  isLoading: boolean;
};

type AuthAction =
  | { type: "AUTH_START" }
  | { type: "SET_USER"; payload: User | null }
  | { type: "AUTH_END" };

const initialState: AuthState = {
  user: null,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, isLoading: true };
    case "SET_USER":
      return { user: action.payload, isLoading: false };
    case "AUTH_END":
      return { ...state, isLoading: false };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



function toContextUser(user: SessionUser): User {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    teamId: user.teamId ?? undefined,
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
  const [state, dispatch] = useReducer(authReducer, initialState);
  const authOperationId = useRef(0);
  const hasHydratedSession = useRef(false);

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
    dispatch({ type: "AUTH_START" });

    try {
      let { response, body } = await readSession();

      if (response.status === 401) {
        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (refreshResponse.ok) {
          ({ response, body } = await readSession());
        }
      }

      if (!isLatestAuthOperation(operationId)) {
        return;
      }

      if (response.ok && body.success && body.data?.user) {
        dispatch({ type: "SET_USER", payload: toContextUser(body.data.user) });
      } else {
        dispatch({ type: "SET_USER", payload: null });
      }
    } catch {
      if (isLatestAuthOperation(operationId)) {
        dispatch({ type: "SET_USER", payload: null });
      }
    }
  }, [beginAuthOperation, isLatestAuthOperation, readSession]);

  useEffect(() => {
    if (hasHydratedSession.current) {
      return;
    }

    hasHydratedSession.current = true;
    void hydrateSession();
  }, [hydrateSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const operationId = beginAuthOperation();
      dispatch({ type: "AUTH_START" });

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });

        const body = await parseAuthResponse<{ user: SessionUser }>(response);
        if (!response.ok || !body.success || !body.data?.user) {
          dispatch({ type: "AUTH_END" });
          return { success: false, message: body.message || "Credenciales inválidas" };
        }

        if (isLatestAuthOperation(operationId)) {
          dispatch({ type: "SET_USER", payload: toContextUser(body.data.user) });
        }

        return { success: true, message: body.message };
      } catch {
        dispatch({ type: "AUTH_END" });
        return { success: false, message: "No fue posible iniciar sesión" };
      }
    },
    [beginAuthOperation, isLatestAuthOperation],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const operationId = beginAuthOperation();
      dispatch({ type: "AUTH_START" });

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name, email, password }),
        });

        const body = await parseAuthResponse<{ user: SessionUser }>(response);
        if (!response.ok || !body.success || !body.data?.user) {
          dispatch({ type: "AUTH_END" });
          return { success: false, message: body.message || "No fue posible registrarse" };
        }

        if (isLatestAuthOperation(operationId)) {
          dispatch({ type: "SET_USER", payload: toContextUser(body.data.user) });
        }

        return { success: true, message: body.message };
      } catch {
        dispatch({ type: "AUTH_END" });
        return { success: false, message: "No fue posible registrarse" };
      }
    },
    [beginAuthOperation, isLatestAuthOperation],
  );

  const logout = useCallback(async () => {
    dispatch({ type: "AUTH_START" });

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      dispatch({ type: "SET_USER", payload: null });
    }
  }, []);

  const hasPermission = useCallback(
    (permission: keyof typeof ROLE_PERMISSIONS.ADMIN) => {
      if (!state.user) return false;
      return ROLE_PERMISSIONS[state.user.role][permission];
    },
    [state.user],
  );

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isLoading: state.isLoading,
        isAuthenticated: !!state.user,
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
