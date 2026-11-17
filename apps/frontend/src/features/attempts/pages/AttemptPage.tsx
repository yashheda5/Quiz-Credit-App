
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { getQuizById } from "../../quizzes/quiz.api";
import {
  getAttempt,
  submitAttempt,
  type SubmitResult,
} from "../attempt.api";

export default function AttemptPage() {
  const { attemptId } = useParams();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());

  const { data: attempt, isLoading } = useQuery({
    queryKey: ["attempt", attemptId],
    queryFn: () => getAttempt(attemptId!),
    enabled: Boolean(attemptId),
  });

  const { data: quiz } = useQuery({
    queryKey: ["quiz", attempt?.quiz.id],
    queryFn: () => getQuizById(attempt!.quiz.id),
    enabled: Boolean(attempt?.quiz.id) && attempt?.status === "IN_PROGRESS",
  });

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const secondsLeft = attempt?.expiresAt
    ? Math.max(0, Math.ceil((new Date(attempt.expiresAt).getTime() - now) / 1000))
    : null;

  const expired = secondsLeft !== null && secondsLeft <= 0;

  async function handleSubmit() {
    if (!attemptId || !quiz || submitting || expired) return;

    if (Object.keys(answers).length !== quiz.questions.length) {
      setError("Please answer every question before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const submitted = await submitAttempt(
        attemptId,
        quiz.questions.map((question) => ({
          questionId: question.id,
          optionId: answers[question.id],
        })),
      );

      setResult(submitted);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Submission failed");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) return <p>Loading attempt...</p>;

  if (!attempt) return <p>Attempt not found.</p>;

  if (result || attempt.status === "PASSED" || attempt.status === "FAILED") {
    const score = result?.score ?? attempt.score;
    const passed = result?.passed ?? attempt.status === "PASSED";

    return (
      <div className="mx-auto max-w-xl rounded-xl border bg-white p-8 text-center">
        <h1 className="text-3xl font-bold">
          {passed ? "Quiz Passed!" : "Quiz Completed"}
        </h1>

        <p className="mt-5 text-5xl font-bold">{score}%</p>

        <p className="mt-3 text-slate-600">
          {passed
            ? `You earned ${result?.rewardEarned ?? attempt.rewardAmount} credits!`
            : "You did not reach the passing score."}
        </p>

        <Link
          to="/quizzes"
          className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-3 text-white"
        >
          Back to Quizzes
        </Link>
      </div>
    );
  }

  if (attempt.status === "EXPIRED" || expired) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center">
        <h1 className="text-2xl font-bold">Attempt Expired</h1>
        <p className="mt-3 text-slate-500">
          Your time has run out. The entry stake is not refunded.
        </p>
        <Link to="/quizzes" className="mt-5 inline-block text-blue-600">
          Browse quizzes
        </Link>
      </div>
    );
  }

  if (!quiz) return <p>Loading questions...</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-xl border bg-white p-6">
        <div className="flex justify-between gap-4">
          <h1 className="text-2xl font-bold">{quiz.title}</h1>

          <span className="font-semibold text-slate-700">
            {secondsLeft === null
              ? "No deadline"
              : `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`}
          </span>
        </div>

        <p className="mt-2 text-slate-500">
          Answer all {quiz.questions.length} questions.
        </p>
      </div>

      {quiz.questions.map((question, index) => (
        <div key={question.id} className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 font-semibold">
            {index + 1}. {question.text}
          </h2>

          <div className="space-y-3">
            {question.options.map((option) => (
              <label
                key={option.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-3"
              >
                <input
                  type="radio"
                  name={question.id}
                  checked={answers[question.id] === option.id}
                  onChange={() =>
                    setAnswers((previous) => ({
                      ...previous,
                      [question.id]: option.id,
                    }))
                  }
                />
                {option.text}
              </label>
            ))}
          </div>
        </div>
      ))}

      {error && <p className="text-red-600">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full rounded-lg bg-slate-900 p-4 font-medium text-white disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Quiz"}
      </button>
    </div>
  );
}
