
import { z } from "zod";

export const createQuizSchema = z.object({
  title: z.string().trim().min(3).max(150),

  description: z.string().trim().max(1000).optional(),

  stake: z.number().int().positive(),

  reward: z.number().int().positive(),

  passingScore: z.number().int().min(0).max(100),
});

export type CreateQuizInput = z.infer<
  typeof createQuizSchema
>;
