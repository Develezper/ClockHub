import { z } from "zod";

export const userRoleSchema = z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]);
export const userStatusSchema = z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]);

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().min(8),
  role: userRoleSchema,
  status: userStatusSchema,
  teamId: z.string().trim().max(80).optional().nullable(),
});

export const updateUserSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  role: userRoleSchema,
  status: userStatusSchema,
  teamId: z.string().trim().max(80).optional().nullable(),
  password: z.string().min(8).optional(),
});

export const updateUserStatusSchema = z.object({
  id: z.string().trim().min(1),
  status: userStatusSchema,
});

export const updateUserRoleSchema = z.object({
  id: z.string().trim().min(1),
  role: userRoleSchema,
});
