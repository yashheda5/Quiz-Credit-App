
import type { Request, Response } from "express";

import { AppError } from "../../../common/errors/AppError.js";
import { attemptService } from "../services/attempt.service.js";
import { submitAttemptSchema } from "../schemas/attempt.schema.js";
import { startAttemptSchema } from "../schemas/start-attempt.schema.js";

export const attemptController = {
  async start(req: Request, res: Response) {
    const userId = res.locals.user.id;
    const quizId = req.params.quizId;
const { idempotencyKey } = startAttemptSchema.parse(req.body);

    if (typeof quizId !== "string") {
      throw new AppError(400, "Invalid quiz ID");
    }

    const result = await attemptService.startQuiz(userId, quizId,idempotencyKey);

    res.status(201).json({
      success: true,
      message: "Quiz started successfully",
      data: result,
    });
  },
  async submit(req: Request, res: Response) {
  const userId = res.locals.user.id;
  const attemptId = req.params.attemptId;

  if (typeof attemptId !== "string") {
    throw new AppError(400, "Invalid attempt ID");
  }

  const input = submitAttemptSchema.parse(req.body);

  const result = await attemptService.submitQuiz(
    userId,
    attemptId,
    input,
  );

  res.status(200).json({
    success: true,
    message: "Quiz submitted successfully",
    data: result,
  });
},

async listAttempts(_req: Request, res: Response) {
  const userId = res.locals.user.id;

  const attempts = await attemptService.getUserAttempts(userId);

  res.status(200).json({
    success: true,
    data: attempts,
  });
},

async getAttempt(req: Request, res: Response) {
  const userId = res.locals.user.id;
  const attemptId = req.params.attemptId;

  if (typeof attemptId !== "string") {
    throw new AppError(400, "Invalid attempt ID");
  }

  const attempt = await attemptService.getAttemptById(
    userId,
    attemptId,
  );

  res.status(200).json({
    success: true,
    data: attempt,
  });
},

};
