"use client";

import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from "react";
import {
  changeUserRoleAction,
  changeUserStatusAction,
  createUserAction,
  deleteUserAction,
  getUsersAction,
  updateUserAction,
} from "@/actions/users";
import type { User, UserFormData, UserRole, UserStatus } from "@/types";

type MutationResult = { success: boolean; message: string };

interface UserContextType {
  users: User[];
  isLoading: boolean;
  getUsers: () => User[];
  getUserById: (id: string) => User | undefined;
  createUser: (data: UserFormData) => Promise<MutationResult>;
  updateUser: (id: string, data: Partial<UserFormData>) => Promise<MutationResult>;
  deleteUser: (id: string) => Promise<MutationResult>;
  changeUserRole: (id: string, role: UserRole) => Promise<MutationResult>;
  changeUserStatus: (id: string, status: UserStatus) => Promise<MutationResult>;
  refreshUsers: () => Promise<void>;
}

type UserState = {
  users: User[];
  isLoading: boolean;
};

type UserAction =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; payload: User[] }
  | { type: "LOAD_END" };

const initialState: UserState = {
  users: [],
  isLoading: false,
};

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, isLoading: true };
    case "LOAD_SUCCESS":
      return { users: action.payload, isLoading: false };
    case "LOAD_END":
      return { ...state, isLoading: false };
    default:
      return state;
  }
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  const refreshUsers = useCallback(async () => {
    dispatch({ type: "LOAD_START" });

    try {
      const response = await getUsersAction();
      if (response.success && response.data) {
        dispatch({ type: "LOAD_SUCCESS", payload: response.data });
      } else {
        dispatch({ type: "LOAD_END" });
      }
    } catch {
      dispatch({ type: "LOAD_END" });
    }
  }, []);

  useEffect(() => {
    void refreshUsers();
  }, [refreshUsers]);

  const getUsers = useCallback(() => state.users, [state.users]);

  const getUserById = useCallback(
    (id: string) => {
      return state.users.find((user) => user.id === id);
    },
    [state.users],
  );

  const createUser = useCallback(async (data: UserFormData): Promise<MutationResult> => {
    dispatch({ type: "LOAD_START" });

    const response = await createUserAction(data);
    if (response.success) {
      await refreshUsers();
      return { success: true, message: response.message };
    }

    dispatch({ type: "LOAD_END" });
    return { success: false, message: response.message };
  }, [refreshUsers]);

  const updateUser = useCallback(async (id: string, data: Partial<UserFormData>): Promise<MutationResult> => {
    const existing = state.users.find((user) => user.id === id);
    if (!existing) {
      return { success: false, message: "Usuario no encontrado" };
    }

    dispatch({ type: "LOAD_START" });

    const response = await updateUserAction({
      id,
      name: data.name ?? existing.name,
      email: data.email ?? existing.email,
      role: data.role ?? existing.role,
      status: data.status ?? existing.status,
      teamId: data.teamId ?? existing.teamId ?? null,
      password: data.password,
    });

    if (response.success) {
      await refreshUsers();
      return { success: true, message: response.message };
    }

    dispatch({ type: "LOAD_END" });
    return { success: false, message: response.message };
  }, [refreshUsers, state.users]);

  const deleteUser = useCallback(async (id: string): Promise<MutationResult> => {
    dispatch({ type: "LOAD_START" });

    const response = await deleteUserAction(id);
    if (response.success) {
      await refreshUsers();
      return { success: true, message: response.message };
    }

    dispatch({ type: "LOAD_END" });
    return { success: false, message: response.message };
  }, [refreshUsers]);

  const changeUserRole = useCallback(async (id: string, role: UserRole): Promise<MutationResult> => {
    dispatch({ type: "LOAD_START" });

    const response = await changeUserRoleAction({ id, role });
    if (response.success) {
      await refreshUsers();
      return { success: true, message: response.message };
    }

    dispatch({ type: "LOAD_END" });
    return { success: false, message: response.message };
  }, [refreshUsers]);

  const changeUserStatus = useCallback(async (id: string, status: UserStatus): Promise<MutationResult> => {
    dispatch({ type: "LOAD_START" });

    const response = await changeUserStatusAction({ id, status });
    if (response.success) {
      await refreshUsers();
      return { success: true, message: response.message };
    }

    dispatch({ type: "LOAD_END" });
    return { success: false, message: response.message };
  }, [refreshUsers]);

  return (
    <UserContext.Provider
      value={{
        users: state.users,
        isLoading: state.isLoading,
        getUsers,
        getUserById,
        createUser,
        updateUser,
        deleteUser,
        changeUserRole,
        changeUserStatus,
        refreshUsers,
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
