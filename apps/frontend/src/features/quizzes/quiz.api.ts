
import { api } from "../../lib/api";

export type Quiz = {
  id: string;
  title: string;
  description: string | null;
  stake: number;
  reward: number;
  passingScore: number;
  status?: string;
};

export type QuizOption = {
  id: string;
  text: string;
};

export type QuizQuestion = {
  id: string;
  text: string;
  points: number;
  options: QuizOption[];
};

export type QuizDetails = Quiz & {
  questions: QuizQuestion[];
};

export type QuizAttempt = {
  id: string;
  quizId: string;
  status: string;
  expiresAt: string | null;
};

export async function getPublishedQuizzes(): Promise<Quiz[]> {
  const response = await api.get("/quizzes");
  return response.data.data;
}

export async function getQuizById(
  quizId: string,
): Promise<QuizDetails> {
  const response = await api.get(`/quizzes/${quizId}`);
  return response.data.data;
}

export async function startQuiz(quizId: string) {
  const response = await api.post(
    `/quizzes/${quizId}/start`,
    {
      idempotencyKey: crypto.randomUUID(),
    },
  );

  return response.data.data as {
    attempt: QuizAttempt;
    remainingCredits: number;
  };
}
