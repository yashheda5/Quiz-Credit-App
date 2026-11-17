
import { Prisma } from "../../generated/prisma/client.js";

export async function withTransactionRetry<T>(
  operation: () => Promise<T>,
  maxAttempts = 3,
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const isConflict =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034";

      if (!isConflict || attempt === maxAttempts) {
        throw error;
      }

      // Small delay before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, attempt * 100),
      );
    }
  }

  throw new Error("Transaction retry limit exceeded");
}
