import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import EditQuestionForm from "./EditQuestionForm";
import axios from "axios";

import { deleteQuestion, getAdminQuizQuestions } from "../admin.api";

type Props = {
  quizId: string;
  isDraft: boolean;
};

export default function QuizQuestions({ quizId, isDraft }: Props) {
  const queryClient = useQueryClient();
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null,
  );

  const {
    data: questions,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin", "questions", quizId],
    queryFn: () => getAdminQuizQuestions(quizId),
  });

  const deleteMutation = useMutation({
    mutationFn: (questionId: string) => deleteQuestion(quizId, questionId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "questions", quizId],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin", "quizzes"],
      });
    },
  });

  if (isLoading) return <p className="mt-4">Loading questions...</p>;

  if (isError) {
    return <p className="mt-4 text-red-600">Failed to load questions.</p>;
  }

  return (
    <div className="mt-4 space-y-4 rounded-lg bg-slate-50 p-4">
      <h3 className="font-semibold">Questions ({questions?.length ?? 0})</h3>

      {questions?.length === 0 && (
        <p className="text-sm text-slate-500">No questions added yet.</p>
      )}

      {questions?.map((question, index) => (
        <div key={question.id} className="rounded-lg border bg-white p-4">
          <p className="font-medium">
            {index + 1}. {question.text}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {question.points} points
          </p>

          <div className="mt-3 space-y-2">
            {question.options.map((option) => (
              <div
                key={option.id}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  option.isCorrect
                    ? "border-green-300 bg-green-50 text-green-800"
                    : "bg-white"
                }`}
              >
                {option.text}
                {option.isCorrect && (
                  <span className="ml-2 font-semibold">✓ Correct</span>
                )}
              </div>
            ))}
          </div>

          {isDraft && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={() =>
                  setEditingQuestionId(
                    editingQuestionId === question.id ? null : question.id,
                  )
                }
                className="rounded-lg border border-blue-300 px-4 py-2 text-sm text-blue-700"
              >
                {editingQuestionId === question.id
                  ? "Cancel Edit"
                  : "Edit Question"}
              </button>

              <button
                onClick={() => {
                  if (window.confirm("Delete this question?")) {
                    deleteMutation.mutate(question.id);
                  }
                }}
                disabled={deleteMutation.isPending}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700 disabled:opacity-50"
              >
                Delete Question
              </button>
            </div>
          )}

          {isDraft && editingQuestionId === question.id && (
            <EditQuestionForm
              key={question.id}
              quizId={quizId}
              question={question}
              onClose={() => setEditingQuestionId(null)}
            />
          )}
        </div>
      ))}

      {deleteMutation.isError && (
        <p className="text-sm text-red-600">
          {axios.isAxiosError(deleteMutation.error)
            ? deleteMutation.error.response?.data?.message ||
              "Failed to delete question"
            : "Failed to delete question"}
        </p>
      )}
    </div>
  );
}
