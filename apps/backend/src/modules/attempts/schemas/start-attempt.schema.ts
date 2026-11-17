
import { z } from "zod";

export const startAttemptSchema = z.object({
  idempotencyKey: z.uuid(),
});

export type StartAttemptInput = z.infer<
  typeof startAttemptSchema
>;
