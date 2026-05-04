import { z } from "zod";

export const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid identifier.");

export const nullableDateSchema = z
  .union([z.string().trim(), z.null()])
  .optional()
  .transform((value, ctx) => {
    if (value === undefined) {
      return undefined;
    }

    if (value === null || value === "") {
      return null;
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid date value."
      });
      return z.NEVER;
    }

    return parsedDate;
  });
