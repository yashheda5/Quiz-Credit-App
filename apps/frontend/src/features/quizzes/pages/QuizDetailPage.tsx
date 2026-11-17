
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { getQuizById, startQuiz } from "../quiz.api";

export default function QuizDetailPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  const { data: quiz, isLoading, isError } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => getQuizById(quizId!),
    enabled: Boolean(quizId),
  });

  async function handleStart() {
    if (!quizId || starting) return;

    setStarting(true);
    setError("");

    try {
      const result = await startQuiz(quizId);
      navigate(`/attempts/${result.attempt.id}`);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to start quiz");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setStarting(false);
    }
  }

  if (isLoading) return <p>Loading quiz...</p>;

  if (isError || !quiz) {
    return <p className="text-red-600">Quiz not found.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl rounded-xl border bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold">{quiz.title}</h1>

      <p className="mt-3 text-slate-600">
        {quiz.description || "Test your knowledge."}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-5">
        <div>
          <p className="text-sm text-slate-500">Entry Stake</p>
          <p className="text-2xl font-bold">{quiz.stake} credits</p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Pass Reward</p>
          <p className="text-2xl font-bold text-green-700">
            {quiz.reward} credits
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Passing Score</p>
          <p className="font-semibold">{quiz.passingScore}%</p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Questions</p>
          <p className="font-semibold">{quiz.questions.length}</p>
        </div>
      </div>

      <p className="mt-6 text-sm text-slate-500">
        Your stake will be deducted when you start. Pass the quiz to earn
        the displayed reward.
      </p>

      {error && (
        <p className="mt-4 rounded bg-red-50 p-3 text-red-600">
          {error}
        </p>
      )}

      <button
        onClick={handleStart}
        disabled={starting}
        className="mt-6 w-full rounded-lg bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-50"
      >
        {starting ? "Starting..." : "Start Quiz"}
      </button>
    </div>
  );
}
