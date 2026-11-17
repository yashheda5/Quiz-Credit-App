import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import {
  addQuestion,
  type CreateQuestionInput,
} from "../admin.api";

type Props = {
  quizId: string;
  onClose: () => void;
};

const initialForm: CreateQuestionInput = {
  text: "",
  points: 1,
  options: [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
  ],
};

export default function AddQuestionForm({ quizId, onClose }: Props) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<CreateQuestionInput>(initialForm);
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: (input: CreateQuestionInput) =>
      addQuestion(quizId, input),

   onSuccess: () => {
  queryClient.invalidateQueries({
    queryKey: ["admin", "quizzes"],
  });

  queryClient.invalidateQueries({
    queryKey: ["admin", "questions", quizId],
  });

  onClose();
},

    onError: (err) => {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || "Failed to add question"
          : "Something went wrong",
      );
    },
  });

  function updateOption(index: number, text: string) {
    setForm((previous) => ({
      ...previous,
      options: previous.options.map((option, i) =>
        i === index ? { ...option, text } : option,
      ),
    }));
  }

  function setCorrectOption(index: number) {
    setForm((previous) => ({
      ...previous,
      options: previous.options.map((option, i) => ({
        ...option,
        isCorrect: i === index,
      })),
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (form.options.some((option) => !option.text.trim())) {
      setError("All options must have text.");
      return;
    }

    mutation.mutate(form);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 space-y-4 rounded-lg border bg-slate-50 p-5"
    >
      <h3 className="font-semibold">Add Question</h3>

      <textarea
        required
        placeholder="Question text"
        value={form.text}
        onChange={(e) =>
          setForm({ ...form, text: e.target.value })
        }
        className="w-full rounded-lg border p-3"
      />

      <label className="block text-sm">
        Points
        <input
          type="number"
          min={1}
          required
          value={form.points}
          onChange={(e) =>
            setForm({ ...form, points: Number(e.target.value) })
          }
          className="mt-2 w-full rounded-lg border p-3"
        />
      </label>

      <div className="space-y-3">
        <p className="text-sm font-medium">
          Answer Options (select the correct answer)
        </p>

        {form.options.map((option, index) => (
          <div key={index} className="flex items-center gap-3">
            <input
              type="radio"
              name={`correct-${quizId}`}
              checked={option.isCorrect}
              onChange={() => setCorrectOption(index)}
            />

            <input
              required
              placeholder={`Option ${index + 1}`}
              value={option.text}
              onChange={(e) => updateOption(index, e.target.value)}
              className="w-full rounded-lg border p-3"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            setForm((previous) => ({
              ...previous,
              options: [
                ...previous.options,
                { text: "", isCorrect: false },
              ],
            }))
          }
          className="text-sm font-medium text-blue-600"
        >
          + Add Option
        </button>

        {form.options.length > 2 && (
          <button
            type="button"
            onClick={() =>
              setForm((previous) => ({
                ...previous,
                options: previous.options.slice(0, -1),
              }))
            }
            className="ml-4 text-sm font-medium text-red-600"
          >
            Remove Last Option
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-lg bg-slate-900 px-5 py-2 text-white disabled:opacity-50"
        >
          {mutation.isPending ? "Saving..." : "Save Question"}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border px-5 py-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}