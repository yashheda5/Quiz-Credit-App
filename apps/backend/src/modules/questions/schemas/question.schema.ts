
import { z } from "zod";

export const createQuestionSchema = z.object({
  text: z.string().trim().min(5).max(1000),

  points: z.number().int().positive().default(1),

  options: z.array(
    z.object({
      text: z.string().trim().min(1),
      isCorrect: z.boolean(),
    }),
  )
    .min(2)
    .max(6)
    .refine(
      (options) =>
        options.filter((option) => option.isCorrect).length === 1,
      "Exactly one option must be correct",
    ),
});

export type CreateQuestionInput = z.infer<
  typeof createQuestionSchema
>;
