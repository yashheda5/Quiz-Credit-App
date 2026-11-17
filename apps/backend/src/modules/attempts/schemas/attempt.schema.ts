
import { z } from "zod";

export const submitAttemptSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.uuid(),
      optionId: z.uuid(),
    }),
  ).min(1),
});

export type SubmitAttemptInput = z.infer<
  typeof submitAttemptSchema
>;
