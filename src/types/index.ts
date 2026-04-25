// Tipos de Usuario
export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  teamId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de Horario
export type ScheduleStatus = 'SCHEDULED' | 'CANCELLED';

export interface Schedule {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  userId: string;
  user?: User;
  status: ScheduleStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de Auditoría
export type AuditAction = 
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'ROLE_CHANGE'
  | 'STATUS_CHANGE';

export type AuditEntity = 'USER' | 'SCHEDULE' | 'AUTH';

export interface AuditLog {
  id: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  userId: string;
  user?: User;
  changes?: Record<string, { old: unknown; new: unknown }>;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// Tipos de Autenticación
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

// Tipos de API
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
}

// Tipos de Formulario
export interface ScheduleFormData {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  userId: string;
  status: ScheduleStatus;
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  teamId?: string;
}

// Permisos por Rol
export const ROLE_PERMISSIONS = {
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
    canViewAllSchedules: false, // Solo equipo
    canCreateSchedules: true, // Solo equipo
    canEditSchedules: true, // Solo equipo
    canDeleteSchedules: true, // Solo equipo
    canManageUsers: false,
    canViewAudit: true, // Limitado
    canChangeRoles: false,
  },
  EMPLOYEE: {
    canViewAllSchedules: false, // Solo propios
    canCreateSchedules: false,
    canEditSchedules: false,
    canDeleteSchedules: false,
    canManageUsers: false,
    canViewAudit: false,
    canChangeRoles: false,
  },
} as const;

// Traducciones
export const STATUS_LABELS: Record<ScheduleStatus, string> = {
  SCHEDULED: 'Programado',
  CANCELLED: 'Cancelado',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  EMPLOYEE: 'Empleado',
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  SUSPENDED: 'Suspendido',
};

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  CREATE: 'Creación',
  UPDATE: 'Actualización',
  DELETE: 'Eliminación',
  LOGIN: 'Inicio de Sesión',
  LOGOUT: 'Cierre de Sesión',
  ROLE_CHANGE: 'Cambio de Rol',
  STATUS_CHANGE: 'Cambio de Estado',
};

export const AUDIT_ENTITY_LABELS: Record<AuditEntity, string> = {
  USER: 'Usuario',
  SCHEDULE: 'Horario',
  AUTH: 'Autenticación',
};
