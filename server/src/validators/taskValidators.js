import { z } from "zod";

import { nullableDateSchema, objectIdSchema } from "./common.js";

export const taskStatusSchema = z.enum(["todo", "in_progress", "review", "completed"]);
export const taskPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);

export const taskIdParamsSchema = z.object({
  taskId: objectIdSchema
});

export const createTaskBodySchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(1000).optional().default(""),
  projectId: objectIdSchema,
  assigneeId: objectIdSchema,
  status: taskStatusSchema.optional().default("todo"),
  priority: taskPrioritySchema.optional().default("medium"),
  dueDate: nullableDateSchema
});

export const updateTaskBodySchema = z
  .object({
    title: z.string().trim().min(3).max(120).optional(),
    description: z.string().trim().max(1000).optional(),
    assigneeId: objectIdSchema.optional(),
    status: taskStatusSchema.optional(),
    priority: taskPrioritySchema.optional(),
    dueDate: nullableDateSchema
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided."
  });

export const taskQuerySchema = z.object({
  projectId: objectIdSchema.optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  assignee: z.union([objectIdSchema, z.literal("me")]).optional(),
  overdue: z.enum(["true", "false"]).optional()
});
