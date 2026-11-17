
import { prisma } from "../../../infrastructure/database/prisma.js";
import { AppError } from "../../../common/errors/AppError.js";
import { questionRepository } from "../repositories/question.repository.js";
import type { CreateQuestionInput } from "../schemas/question.schema.js";

import type { UpdateQuestionInput } from "../schemas/update-question.schema.js";
export const questionService = {
  async createQuestion(quizId: string, input: CreateQuestionInput) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new AppError(404, "Quiz not found");
    }

    if (quiz.status !== "DRAFT") {
      throw new AppError(409, "Questions can only be added to draft quizzes");
    }

    return questionRepository.create(quizId, input);
  },

async updateQuestion(
  quizId: string,
  questionId: string,
  input: UpdateQuestionInput,
) {
  return questionRepository.updateQuestion(
    quizId,
    questionId,
    input,
  );
},

async deleteQuestion(quizId: string, questionId: string) {
  return questionRepository.deleteQuestion(quizId, questionId);
},
async  getQuizQuestions(quizId: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
  });

  if (!quiz) {
    throw new AppError(404,"Quiz not found");
  }

return questionRepository.findQuestionsByQuizId(quizId);
}
};
