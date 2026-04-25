import type { AuditAction, AuditEntity, ScheduleStatus, UserRole, UserStatus } from "@/types";

export const SOFT_NEUTRAL_BADGE_CLASS = "border-[rgba(161,161,170,0.4)] bg-[rgba(161,161,170,0.2)] text-zinc-300";

export const SCHEDULE_STATUS_BADGE_CLASS: Record<ScheduleStatus, string> = {
  SCHEDULED: "border-[rgba(52,211,153,0.4)] bg-[rgba(52,211,153,0.2)] text-emerald-300",
  CANCELLED: "border-[rgba(251,113,133,0.4)] bg-[rgba(251,113,133,0.2)] text-rose-300",
};

export const USER_ROLE_BADGE_CLASS: Record<UserRole, string> = {
  ADMIN: "border-[rgba(251,113,133,0.4)] bg-[rgba(251,113,133,0.2)] text-rose-300",
  MANAGER: "border-[rgba(251,191,36,0.4)] bg-[rgba(251,191,36,0.2)] text-amber-300",
  EMPLOYEE: "border-[rgba(125,211,252,0.4)] bg-[rgba(125,211,252,0.2)] text-sky-300",
};

export const USER_ROLE_TEXT_CLASS: Record<UserRole, string> = {
  ADMIN: "text-rose-300",
  MANAGER: "text-amber-300",
  EMPLOYEE: "text-sky-300",
};

export const USER_STATUS_BADGE_CLASS: Record<UserStatus, string> = {
  ACTIVE: "border-[rgba(52,211,153,0.4)] bg-[rgba(52,211,153,0.2)] text-emerald-300",
  INACTIVE: "border-[rgba(161,161,170,0.4)] bg-[rgba(161,161,170,0.2)] text-zinc-300",
  SUSPENDED: "border-[rgba(251,191,36,0.4)] bg-[rgba(251,191,36,0.2)] text-amber-300",
};

export const AUDIT_ENTITY_BADGE_CLASS: Record<AuditEntity, string> = {
  USER: "border-[rgba(253,186,116,0.4)] bg-[rgba(253,186,116,0.2)] text-orange-300",
  SCHEDULE: "border-[rgba(196,181,253,0.4)] bg-[rgba(196,181,253,0.2)] text-violet-300",
  AUTH: "border-[rgba(103,232,249,0.4)] bg-[rgba(103,232,249,0.2)] text-cyan-300",
};

type AuditActionStyle = {
  iconBadgeClass: string;
  textClass: string;
};

export const AUDIT_ACTION_STYLE: Record<AuditAction, AuditActionStyle> = {
  CREATE: {
    iconBadgeClass: "border-[rgba(125,211,252,0.4)] bg-[rgba(125,211,252,0.2)] text-sky-300",
    textClass: "text-sky-300",
  },
  UPDATE: {
    iconBadgeClass: "border-[rgba(103,232,249,0.4)] bg-[rgba(103,232,249,0.2)] text-cyan-300",
    textClass: "text-cyan-300",
  },
  DELETE: {
    iconBadgeClass: "border-[rgba(251,113,133,0.4)] bg-[rgba(251,113,133,0.2)] text-rose-300",
    textClass: "text-rose-300",
  },
  LOGIN: {
    iconBadgeClass: "border-[rgba(52,211,153,0.4)] bg-[rgba(52,211,153,0.2)] text-emerald-300",
    textClass: "text-emerald-300",
  },
  LOGOUT: {
    iconBadgeClass: "border-[rgba(251,191,36,0.4)] bg-[rgba(251,191,36,0.2)] text-amber-300",
    textClass: "text-amber-300",
  },
  ROLE_CHANGE: {
    iconBadgeClass: "border-[rgba(196,181,253,0.4)] bg-[rgba(196,181,253,0.2)] text-violet-300",
    textClass: "text-violet-300",
  },
  STATUS_CHANGE: {
    iconBadgeClass: "border-[rgba(147,197,253,0.4)] bg-[rgba(147,197,253,0.2)] text-blue-300",
    textClass: "text-blue-300",
  },
};
