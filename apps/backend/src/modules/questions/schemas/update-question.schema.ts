
import { z } from "zod";
import { createQuestionSchema } from "./question.schema.js";

export const updateQuestionSchema = createQuestionSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required",
  );

export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
