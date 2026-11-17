
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Coins, Trophy } from "lucide-react";

import { getPublishedQuizzes } from "../quiz.api";

export default function QuizListPage() {
  const {
    data: quizzes,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["quizzes"],
    queryFn: getPublishedQuizzes,
  });

  if (isLoading) {
    return <p>Loading quizzes...</p>;
  }

  if (isError) {
    return <p className="text-red-600">Failed to load quizzes.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Available Quizzes</h1>
        <p className="mt-2 text-slate-500">
          Test your knowledge and earn credits.
        </p>
      </div>

      {quizzes?.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          <BookOpen className="mx-auto mb-3 text-slate-400" size={36} />
          <p>No published quizzes available yet.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {quizzes?.map((quiz) => (
            <div
              key={quiz.id}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold">{quiz.title}</h2>

              <p className="mt-2 min-h-12 text-sm text-slate-500">
                {quiz.description || "Test your knowledge."}
              </p>

              <div className="mt-5 flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Coins size={16} />
                  Stake: {quiz.stake}
                </span>

                <span className="flex items-center gap-1 text-green-700">
                  <Trophy size={16} />
                  Reward: {quiz.reward}
                </span>
              </div>

              <p className="mt-3 text-sm text-slate-500">
                Passing score: {quiz.passingScore}%
              </p>

              <Link
                to={`/quizzes/${quiz.id}`}
                className="mt-5 block rounded-lg bg-slate-900 px-4 py-3 text-center font-medium text-white"
              >
                View Quiz
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
