
import type { Request, Response } from "express";
import {AppError} from "../../../common/errors/AppError.js"
import { createQuizSchema } from "../schemas/quiz.schema.js";
import { quizService } from "../services/quiz.service.js";
import { updateQuizSchema } from "../schemas/update-quiz.schema.js";
export const quizController = {
  async create(req: Request, res: Response) {
    const input = createQuizSchema.parse(req.body);

    const quiz = await quizService.createQuiz(input);

    res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      data: quiz,
    });
  },
  async publish(req: Request, res: Response) {
  const quizId = req.params.quizId;

  if (typeof quizId !== "string") {
    res.status(400).json({
      success: false,
      message: "Invalid quiz ID",
    });
    return;
  }

  const quiz = await quizService.publishQuiz(quizId);

  res.status(200).json({
    success: true,
    message: "Quiz published successfully",
    data: quiz,
  });
},
async listPublished(_req: Request, res: Response) {
  const quizzes = await quizService.getPublishedQuizzes();

  res.status(200).json({
    success: true,
    data: quizzes,
  });
},

async getPublishedById(req: Request, res: Response) {
  const quizId = req.params.quizId;

  if (typeof quizId !== "string") {
    res.status(400).json({
      success: false,
      message: "Invalid quiz ID",
    });
    return;
  }

  const quiz = await quizService.getPublishedQuizById(quizId);

  res.status(200).json({
    success: true,
    data: quiz,
  });
},
async update(req: Request, res: Response) {
  const quizId = req.params.quizId;

  if (typeof quizId !== "string") {
    throw new AppError(400, "Invalid quiz ID");
  }

  const input = updateQuizSchema.parse(req.body);
  const quiz = await quizService.updateQuiz(quizId, input);

  res.status(200).json({
    success: true,
    message: "Quiz updated successfully",
    data: quiz,
  });
},
async listForAdmin(_req: Request, res: Response) {
  const quizzes = await quizService.getAllQuizzesForAdmin();

  res.status(200).json({
    success: true,
    data: quizzes,
  });
},

async archive(req: Request, res: Response) {
  const quizId = req.params.quizId;

  if (typeof quizId !== "string") {
    throw new AppError(400, "Invalid quiz ID");
  }

  const quiz = await quizService.archiveQuiz(quizId);

  res.status(200).json({
    success: true,
    message: "Quiz archived successfully",
    data: quiz,
  });
},

};
