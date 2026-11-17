import { prisma } from "../../../infrastructure/database/prisma.js";
import type { CreateQuestionInput } from "../schemas/question.schema.js";
import type { UpdateQuestionInput } from "../schemas/update-question.schema.js";
import { AppError } from "../../../common/errors/AppError.js";

export const questionRepository = {
  async create(quizId: string, data: CreateQuestionInput) {
    return prisma.question.create({
      data: {
        quizId,
        text: data.text,
        points: data.points,
        options: {
          create: data.options,
        },
      },
      include: {
        options: true,
      },
    });
  },

  async updateQuestion(
    quizId: string,
    questionId: string,
    input: UpdateQuestionInput,
  ) {
    return prisma.$transaction(async (tx) => {
      const question = await tx.question.findFirst({
        where: {
          id: questionId,
          quizId,
          quiz: { status: "DRAFT" },
        },
      });

      if (!question) {
        throw new AppError(404, "Question not found or quiz is not editable");
      }

      const { options, ...questionData } = input;

      // Update question fields
      await tx.question.update({
        where: { id: questionId },
        data: questionData,
      });

      // Replace options only when new options are supplied
      if (options !== undefined) {
        await tx.questionOption.deleteMany({
          where: { questionId },
        });

        await tx.questionOption.createMany({
          data: options.map((option) => ({
            questionId,
            text: option.text,
            isCorrect: option.isCorrect,
          })),
        });
      }

      return tx.question.findUnique({
        where: { id: questionId },
        include: { options: true },
      });
    });
  },

  async deleteQuestion(quizId: string, questionId: string) {
    return prisma.$transaction(async (tx) => {
      const question = await tx.question.findFirst({
        where: {
          id: questionId,
          quizId,
          quiz: { status: "DRAFT" },
        },
      });

      if (!question) {
        throw new AppError(404, "Question not found or quiz is not editable");
      }

      await tx.questionOption.deleteMany({
        where: { questionId },
      });

      await tx.question.delete({
        where: { id: questionId },
      });

      return { id: questionId };
    });
  },
  async findQuestionsByQuizId(quizId: string) {
    return prisma.question.findMany({
      where: { quizId },
      include: {
        options: {
          orderBy: { id: "asc" },
        },
      },
      orderBy: { id: "asc" },
    });
  },
};
