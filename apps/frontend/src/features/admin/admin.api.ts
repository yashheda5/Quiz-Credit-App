
import { api } from "../../lib/api";

export type AdminQuiz = {
  id: string;
  title: string;
  description: string | null;
  stake: number;
  reward: number;
  passingScore: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

export type CreateQuizInput = {
  title: string;
  description?: string;
  stake: number;
  reward: number;
  passingScore: number;
};

export async function getAdminQuizzes(): Promise<AdminQuiz[]> {
  const response = await api.get("/admin/quizzes");
  return response.data.data;
}

export async function createQuiz(input: CreateQuizInput): Promise<AdminQuiz> {
  const response = await api.post("/admin/quizzes", input);
  return response.data.data;
}

export async function updateQuiz(
  quizId: string,
  input: Partial<CreateQuizInput>,
): Promise<AdminQuiz> {
  const response = await api.patch(`/admin/quizzes/${quizId}`, input);
  return response.data.data;
}

export async function publishQuiz(quizId: string) {
  const response = await api.patch(`/admin/quizzes/${quizId}/publish`);
  return response.data.data;
}

export async function archiveQuiz(quizId: string) {
  const response = await api.patch(`/admin/quizzes/${quizId}/archive`);
  return response.data.data;
}
export type QuestionOptionInput = {
  text: string;
  isCorrect: boolean;
};

export type CreateQuestionInput = {
  text: string;
  points: number;
  options: QuestionOptionInput[];
};

export async function addQuestion(
  quizId: string,
  input: CreateQuestionInput,
) {
  const response = await api.post(
    `/admin/quizzes/${quizId}/questions`,
    input,
  );

  return response.data.data;
}

export type AdminQuestionOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type AdminQuestion = {
  id: string;
  quizId: string;
  text: string;
  points: number;
  options: AdminQuestionOption[];
};

export async function getAdminQuizQuestions(
  quizId: string,
): Promise<AdminQuestion[]> {
  const response = await api.get(`/admin/quizzes/${quizId}/questions`);
  return response.data.data;
}

export async function updateQuestion(
  quizId: string,
  questionId: string,
  input: CreateQuestionInput,
) {
  const response = await api.patch(
    `/admin/quizzes/${quizId}/questions/${questionId}`,
    input,
  );

  return response.data.data;
}

export async function deleteQuestion(
  quizId: string,
  questionId: string,
) {
  const response = await api.delete(
    `/admin/quizzes/${quizId}/questions/${questionId}`,
  );

  return response.data.data;
}
