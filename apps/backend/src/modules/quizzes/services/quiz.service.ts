
import { quizRepository } from "../repositories/quiz.repository.js";
import type { CreateQuizInput } from "../schemas/quiz.schema.js";
import { AppError } from "../../../common/errors/AppError.js";
import type { UpdateQuizInput } from "../schemas/update-quiz.schema.js";

export const quizService = {
  async createQuiz(input: CreateQuizInput) {
    return quizRepository.create(input);
  },
  async publishQuiz(quizId: string) {
  const quiz = await quizRepository.findById(quizId);

  if (!quiz) {
    throw new AppError(404, "Quiz not found");
  }

  if (quiz.status !== "DRAFT") {
    throw new AppError(409, "Only draft quizzes can be published");
  }

  if (quiz.questions.length === 0) {
    throw new AppError(400, "Add at least one question before publishing");
  }

  for (const question of quiz.questions) {
    if (question.options.length < 2) {
      throw new AppError(400, "Every question needs at least two options");
    }

    const correctCount = question.options.filter(
      (option) => option.isCorrect,
    ).length;

    if (correctCount !== 1) {
      throw new AppError(400, "Each question must have exactly one correct option");
    }
  }

  const result = await quizRepository.publish(quizId);

  if (result.count === 0) {
    throw new AppError(409, "Quiz could not be published");
  }

  return quizRepository.findById(quizId);
},
async getPublishedQuizzes() {
  return quizRepository.findPublished();
},

async getPublishedQuizById(quizId: string) {
  const quiz = await quizRepository.findPublishedById(quizId);

  if (!quiz) {
    throw new AppError(404, "Quiz not found");
  }

  return quiz;
},
async updateQuiz(quizId: string, input: UpdateQuizInput) {
  const quiz = await quizRepository.findById(quizId);

  if (!quiz) {
    throw new AppError(404, "Quiz not found");
  }

  if (quiz.status !== "DRAFT") {
    throw new AppError(409, "Only draft quizzes can be edited");
  }

  const result = await quizRepository.update(quizId, input);

  if (result.count === 0) {
    throw new AppError(409, "Quiz could not be updated");
  }

  return quizRepository.findById(quizId);
},
async getAllQuizzesForAdmin() {
  return quizRepository.findAllForAdmin();
},

async archiveQuiz(quizId: string) {
  const quiz = await quizRepository.findById(quizId);

  if (!quiz) {
    throw new AppError(404, "Quiz not found");
  }

  if (quiz.status === "ARCHIVED") {
    throw new AppError(409, "Quiz is already archived");
  }

  const result = await quizRepository.archive(quizId);

  if (result.count === 0) {
    throw new AppError(409, "Quiz could not be archived");
  }

  return quizRepository.findById(quizId);
},

};
