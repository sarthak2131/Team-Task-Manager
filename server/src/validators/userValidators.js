import { z } from "zod";

import { objectIdSchema } from "./common.js";

export const userIdParamsSchema = z.object({
  userId: objectIdSchema
});

export const updateRoleBodySchema = z.object({
  role: z.enum(["admin", "member"])
});
