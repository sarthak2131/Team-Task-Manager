import { z } from "zod";

export const signupBodySchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72)
});

export const loginBodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72)
});
