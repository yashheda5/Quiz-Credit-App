
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Clock3, Trophy, Coins } from "lucide-react";

import { getAttemptHistory } from "../attempt.api";

const statusStyles: Record<string, string> = {
  PASSED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  EXPIRED: "bg-slate-100 text-slate-600",
};

export default function AttemptHistoryPage() {
  const { data: attempts, isLoading, isError } = useQuery({
    queryKey: ["attempts"],
    queryFn: getAttemptHistory,
  });

  if (isLoading) return <p>Loading attempt history...</p>;

  if (isError) {
    return <p className="text-red-600">Failed to load attempts.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quiz History</h1>
        <p className="mt-2 text-slate-500">
          Review your previous quiz attempts and results.
        </p>
      </div>

      {attempts?.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          <Clock3 className="mx-auto mb-3 text-slate-400" size={36} />
          <p>You haven't attempted any quizzes yet.</p>
          <Link to="/quizzes" className="mt-3 inline-block text-blue-600">
            Explore quizzes
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {attempts?.map((attempt) => (
            <div
              key={attempt.id}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    {attempt.quiz.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {new Date(attempt.startedAt).toLocaleString()}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    statusStyles[attempt.status]
                  }`}
                >
                  {attempt.status.replace("_", " ")}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <p className="flex items-center gap-1 text-sm text-slate-500">
                    <Trophy size={15} /> Score
                  </p>
                  <p className="mt-1 font-semibold">
                    {attempt.score === null ? "—" : `${attempt.score}%`}
                  </p>
                </div>

                <div>
                  <p className="flex items-center gap-1 text-sm text-slate-500">
                    <Coins size={15} /> Stake
                  </p>
                  <p className="mt-1 font-semibold">
                    {attempt.stakeAmount} credits
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Reward Earned</p>
                  <p className="mt-1 font-semibold text-green-700">
                    {attempt.status === "PASSED"
                      ? attempt.rewardAmount
                      : 0}{" "}
                    credits
                  </p>
                </div>
              </div>

              <Link
                to={`/attempts/${attempt.id}`}
                className="mt-5 inline-block text-sm font-medium text-blue-600 hover:underline"
              >
                {attempt.status === "IN_PROGRESS"
                  ? "Continue Quiz"
                  : "View Result"}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
