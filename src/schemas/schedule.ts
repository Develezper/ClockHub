import { z } from "zod";

export const scheduleStatusSchema = z.enum(["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED"]);

const scheduleBaseSchema = z.object({
  title: z.string().trim().min(2).max(140),
  description: z.string().trim().max(400).optional().nullable(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  userId: z.string().trim().min(1),
  status: scheduleStatusSchema,
});

export const createScheduleSchema = scheduleBaseSchema
  .refine((value) => new Date(value.startTime) < new Date(value.endTime), {
    message: "La hora de inicio debe ser anterior a la hora de fin",
    path: ["endTime"],
  });

export const updateScheduleSchema = scheduleBaseSchema
  .extend({
    id: z.string().trim().min(1),
  })
  .refine((value) => new Date(value.startTime) < new Date(value.endTime), {
    message: "La hora de inicio debe ser anterior a la hora de fin",
    path: ["endTime"],
  });

export const cancelScheduleSchema = z.object({
  id: z.string().trim().min(1),
});
