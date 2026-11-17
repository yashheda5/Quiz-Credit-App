
import { z } from "zod";

export const purchaseSchema = z.object({
  purchaseId: z.uuid(),
  credits: z.number().int().min(10).max(10000),
});

export type PurchaseInput = z.infer<typeof purchaseSchema>;
