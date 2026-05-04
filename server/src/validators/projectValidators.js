import { z } from "zod";

import { nullableDateSchema, objectIdSchema } from "./common.js";

const memberEmailSchema = z.string().trim().toLowerCase().email();

export const projectIdParamsSchema = z.object({
  projectId: objectIdSchema
});

export const createProjectBodySchema = z.object({
  name: z.string().trim().min(3).max(80),
  description: z.string().trim().max(500).optional().default(""),
  dueDate: nullableDateSchema,
  memberIds: z.array(objectIdSchema).max(50).optional().default([]),
  memberEmails: z.array(memberEmailSchema).max(50).optional().default([])
});

export const updateProjectBodySchema = z
  .object({
    name: z.string().trim().min(3).max(80).optional(),
    description: z.string().trim().max(500).optional(),
    dueDate: nullableDateSchema,
    memberIds: z.array(objectIdSchema).max(50).optional(),
    memberEmails: z.array(memberEmailSchema).max(50).optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided."
  });
