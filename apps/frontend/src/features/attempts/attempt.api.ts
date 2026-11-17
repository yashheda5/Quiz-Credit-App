
import { api } from "../../lib/api";

export type Attempt = {
  id: string;
  status: "IN_PROGRESS" | "PASSED" | "FAILED" | "EXPIRED";
  score: number | null;
  stakeAmount: number;
  rewardAmount: number;
  startedAt: string;
  expiresAt: string | null;
  quiz: {
    id: string;
    title: string;
    passingScore: number;
  };
};

export type SubmitResult = {
  attemptId: string;
  score: number;
  passed: boolean;
  earnedPoints: number;
  totalPoints: number;
  rewardEarned: number;
  remainingCredits: number;
};

export async function getAttempt(attemptId: string): Promise<Attempt> {
  const response = await api.get(`/attempts/${attemptId}`);
  return response.data.data;
}

export async function submitAttempt(
  attemptId: string,
  answers: { questionId: string; optionId: string }[],
): Promise<SubmitResult> {
  const response = await api.post(`/attempts/${attemptId}/submit`, {
    answers,
  });

  return response.data.data;
}

export type AttemptHistoryItem = {
  id: string;
  status: "IN_PROGRESS" | "PASSED" | "FAILED" | "EXPIRED";
  score: number | null;
  stakeAmount: number;
  rewardAmount: number;
  startedAt: string;
  submittedAt: string | null;
  quiz: {
    id: string;
    title: string;
    passingScore: number;
  };
};

export async function getAttemptHistory(): Promise<AttemptHistoryItem[]> {
  const response = await api.get("/attempts");
  return response.data.data;
}
