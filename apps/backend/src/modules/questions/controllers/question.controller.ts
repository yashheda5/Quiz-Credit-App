
import type { NextFunction,Request, Response } from "express";

import { createQuestionSchema } from "../schemas/question.schema.js";
import { questionService } from "../services/question.service.js";
import { updateQuestionSchema } from "../schemas/update-question.schema.js";
import { AppError } from "../../../common/errors/AppError.js";

export const questionController = {
  async create(req: Request, res: Response) {
    const quizId = req.params.quizId;

    if (typeof quizId !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid quiz ID",
      });
      return;
    }

    const input = createQuestionSchema.parse(req.body);
    const question = await questionService.createQuestion(quizId, input);

    res.status(201).json({
      success: true,
      message: "Question added successfully",
      data: question,
    });
  },

async update(req: Request, res: Response) {
  const { quizId, questionId } = req.params;

  if (typeof quizId !== "string" || typeof questionId !== "string") {
    throw new AppError(400, "Invalid quiz or question ID");
  }

  const input = updateQuestionSchema.parse(req.body);

  const question = await questionService.updateQuestion(
    quizId,
    questionId,
    input,
  );

  res.status(200).json({
    success: true,
    message: "Question updated successfully",
    data: question,
  });
},

async delete(req: Request, res: Response) {
  const { quizId, questionId } = req.params;

  if (typeof quizId !== "string" || typeof questionId !== "string") {
    throw new AppError(400, "Invalid quiz or question ID");
  }

  await questionService.deleteQuestion(quizId, questionId);

  res.status(200).json({
    success: true,
    message: "Question deleted successfully",
  });
},
async  getQuizQuestionsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const quizId = req.params.quizId as string;

const questions = await questionService.getQuizQuestions(quizId);
    res.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    next(error);
  }
}
};
