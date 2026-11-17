
import { z } from "zod";
import { createQuizSchema } from "./quiz.schema.js";

export const updateQuizSchema = createQuizSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required",
  );

export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
