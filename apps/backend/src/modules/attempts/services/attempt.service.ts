
import { AppError } from "../../../common/errors/AppError.js";
import { attemptRepository } from "../repositories/attempt.repository.js";
import type { SubmitAttemptInput } from "../schemas/attempt.schema.js";

export const attemptService = {
  async startQuiz(
    userId: string,
    quizId: string,
    idempotencyKey: string,
  ) {
    return attemptRepository.startQuiz(
      userId,
      quizId,
      idempotencyKey,
    );
  },

  async submitQuiz(
    userId: string,
    attemptId: string,
    input: SubmitAttemptInput,
  ) {
    return attemptRepository.submitQuiz(userId, attemptId, input);
  },

  async getUserAttempts(userId: string) {
  await attemptRepository.expireOldAttempts();

  return attemptRepository.getUserAttempts(userId);
  },

  async getAttemptById(userId: string, attemptId: string) {
    const attempt = await attemptRepository.getAttemptById(
      userId,
      attemptId,
    );

    if (!attempt) {
      throw new AppError(404, "Attempt not found");
    }

    return attempt;
  },
  
};
