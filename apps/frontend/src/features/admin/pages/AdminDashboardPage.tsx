import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Plus, BookOpen } from "lucide-react";
import AddQuestionForm from "../components/AddQuestionForm";
import QuizQuestions from "../components/QuizQuestions";
import {
  createQuiz,
  getAdminQuizzes,
  updateQuiz,
  publishQuiz,
  archiveQuiz,
  type CreateQuizInput,
  type AdminQuiz,
} from "../admin.api";

const initialForm: CreateQuizInput = {
  title: "",
  description: "",
  stake: 50,
  reward: 100,
  passingScore: 70,
};

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<CreateQuizInput>(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [editingQuiz, setEditingQuiz] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [addingQuestionTo, setAddingQuestionTo] = useState<string | null>(null);
  const [viewingQuestionsFor, setViewingQuestionsFor] = useState<string | null>(
    null,
  );

  function handleEdit(quiz: AdminQuiz) {
    setEditingQuiz(quiz.id);
    setShowForm(true);
    setError("");

    setForm({
      title: quiz.title,
      description: quiz.description ?? "",
      stake: quiz.stake,
      reward: quiz.reward,
      passingScore: quiz.passingScore,
    });
  }

  function handleCancel() {
    setEditingQuiz(null);
    setShowForm(false);
    setForm(initialForm);
    setError("");
  }

  const {
    data: quizzes,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin", "quizzes"],
    queryFn: getAdminQuizzes,
  });

  const createMutation = useMutation({
    mutationFn: createQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "quizzes"] });
      setForm(initialForm);
      setShowForm(false);
      setError("");
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to create quiz");
      } else {
        setError("Something went wrong");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      quizId,
      input,
    }: {
      quizId: string;
      input: Partial<CreateQuizInput>;
    }) => updateQuiz(quizId, input),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "quizzes"] });
      setEditingQuiz(null);
      setForm(initialForm);
      setShowForm(false);
      setError("");
    },

    onError: (err) => {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || "Failed to update quiz"
          : "Something went wrong",
      );
    },
  });

  const publishMutation = useMutation({
    mutationFn: publishQuiz,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      setActionError("");
    },

    onError: (err) => {
      setActionError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || "Failed to publish quiz"
          : "Something went wrong",
      );
    },
  });

  const archiveMutation = useMutation({
    mutationFn: archiveQuiz,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      setActionError("");
    },

    onError: (err) => {
      setActionError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || "Failed to archive quiz"
          : "Something went wrong",
      );
    },
  });

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (editingQuiz) {
      updateMutation.mutate({
        quizId: editingQuiz,
        input: form,
      });
    } else {
      createMutation.mutate(form);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-slate-500">Manage quizzes and questions.</p>
        </div>

        <button
          onClick={() => {
            if (showForm) {
              handleCancel();
            } else {
              setEditingQuiz(null);
              setForm(initialForm);
              setShowForm(true);
            }
          }}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-white"
        >
          <Plus size={18} />
          Create Quiz
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="space-y-4 rounded-xl border bg-white p-6"
        >
          <h2 className="text-xl font-semibold">
            {editingQuiz ? "Edit Quiz" : "Create New Quiz"}
          </h2>

          <input
            required
            placeholder="Quiz title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border p-3"
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border p-3"
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-sm">
              Stake
              <input
                type="number"
                min={0}
                required
                value={form.stake}
                onChange={(e) =>
                  setForm({ ...form, stake: Number(e.target.value) })
                }
                className="mt-2 w-full rounded-lg border p-3"
              />
            </label>

            <label className="text-sm">
              Reward
              <input
                type="number"
                min={0}
                required
                value={form.reward}
                onChange={(e) =>
                  setForm({ ...form, reward: Number(e.target.value) })
                }
                className="mt-2 w-full rounded-lg border p-3"
              />
            </label>

            <label className="text-sm">
              Passing Score (%)
              <input
                type="number"
                min={0}
                max={100}
                required
                value={form.passingScore}
                onChange={(e) =>
                  setForm({
                    ...form,
                    passingScore: Number(e.target.value),
                  })
                }
                className="mt-2 w-full rounded-lg border p-3"
              />
            </label>
          </div>

          {error && <p className="text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="rounded-lg bg-slate-900 px-5 py-3 text-white disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : editingQuiz
                  ? "Update Quiz"
                  : "Create Quiz"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border px-5 py-3"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {actionError && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">
          {actionError}
        </p>
      )}

      <div className="rounded-xl border bg-white">
        <div className="flex items-center gap-2 border-b p-5">
          <BookOpen size={20} />
          <h2 className="text-xl font-semibold">All Quizzes</h2>
        </div>

        {isLoading ? (
          <p className="p-6">Loading quizzes...</p>
        ) : isError ? (
          <p className="p-6 text-red-600">Failed to load quizzes.</p>
        ) : quizzes?.length === 0 ? (
          <p className="p-6 text-slate-500">No quizzes created yet.</p>
        ) : (
          <div className="divide-y">
            {quizzes?.map((quiz) => (
              <div
                key={quiz.id}
                className="flex flex-wrap items-center justify-between gap-4 p-5"
              >
                <div>
                  <h3 className="font-semibold">{quiz.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Stake: {quiz.stake} | Reward: {quiz.reward} | Pass:{" "}
                    {quiz.passingScore}%
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                  {quiz.status}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                  {quiz.status}
                </span>

                <div className="flex flex-wrap gap-2">
                  {quiz.status === "DRAFT" && (
                    <>
                      <button
                        onClick={() =>
                          setAddingQuestionTo(
                            addingQuestionTo === quiz.id ? null : quiz.id,
                          )
                        }
                        className="rounded-lg border px-4 py-2 text-sm"
                      >
                        Add Question
                      </button>
                      <button
                        onClick={() => handleEdit(quiz)}
                        className="rounded-lg border px-4 py-2 text-sm"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => publishMutation.mutate(quiz.id)}
                        disabled={publishMutation.isPending}
                        className="rounded-lg bg-green-700 px-4 py-2 text-sm text-white"
                      >
                        Publish
                      </button>
                    </>
                  )}
                  {addingQuestionTo === quiz.id && (
                    <AddQuestionForm
                      quizId={quiz.id}
                      onClose={() => setAddingQuestionTo(null)}
                    />
                  )}
                  {viewingQuestionsFor === quiz.id && (
                    <QuizQuestions
                      quizId={quiz.id}
                      isDraft={quiz.status === "DRAFT"}
                    />
                  )}

                  {quiz.status !== "ARCHIVED" && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Archive "${quiz.title}"?`)) {
                          archiveMutation.mutate(quiz.id);
                        }
                      }}
                      disabled={archiveMutation.isPending}
                      className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700"
                    >
                      Archive
                    </button>
                  )}
                  <button
                    onClick={() =>
                      setViewingQuestionsFor(
                        viewingQuestionsFor === quiz.id ? null : quiz.id,
                      )
                    }
                    className="rounded-lg border px-4 py-2 text-sm"
                  >
                    {viewingQuestionsFor === quiz.id
                      ? "Hide Questions"
                      : "View Questions"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
