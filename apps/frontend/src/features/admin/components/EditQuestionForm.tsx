
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import {
  updateQuestion,
  type AdminQuestion,
  type QuestionOptionInput,
} from "../admin.api";

type Props = {
  quizId: string;
  question: AdminQuestion;
  onClose: () => void;
};

export default function EditQuestionForm({
  quizId,
  question,
  onClose,
}: Props) {
  const queryClient = useQueryClient();

  const [text, setText] = useState(question.text);
  const [points, setPoints] = useState(question.points);

  const [options, setOptions] = useState<QuestionOptionInput[]>(
    question.options.map((option) => ({
      text: option.text,
      isCorrect: option.isCorrect,
    })),
  );

  const mutation = useMutation({
    mutationFn: () =>
      updateQuestion(quizId, question.id, {
        text,
        points,
        options,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "questions", quizId],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin", "quizzes"],
      });

      onClose();
    },
  });

  function updateOptionText(index: number, value: string) {
    setOptions((previous) =>
      previous.map((option, i) =>
        i === index ? { ...option, text: value } : option,
      ),
    );
  }

  function setCorrectOption(index: number) {
    setOptions((previous) =>
      previous.map((option, i) => ({
        ...option,
        isCorrect: i === index,
      })),
    );
  }

  function addOption() {
    setOptions((previous) => [
      ...previous,
      { text: "", isCorrect: false },
    ]);
  }

  function removeOption(index: number) {
    setOptions((previous) => previous.filter((_, i) => i !== index));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!text.trim()) return;
    if (points < 1) return;
    if (options.length < 2) return;
    if (options.some((option) => !option.text.trim())) return;
    if (options.filter((option) => option.isCorrect).length !== 1) return;

    mutation.mutate();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 space-y-4 rounded-lg border bg-blue-50 p-4"
    >
      <h4 className="font-semibold">Edit Question</h4>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Question
        </label>

        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="w-full rounded-lg border p-2"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Points
        </label>

        <input
          type="number"
          min={1}
          value={points}
          onChange={(event) => setPoints(Number(event.target.value))}
          className="w-full rounded-lg border p-2"
          required
        />
      </div>

      <div className="space-y-3">
        <p className="font-medium">Answer Options</p>

        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="radio"
              name={`correct-option-${question.id}`}
              checked={option.isCorrect}
              onChange={() => setCorrectOption(index)}
              aria-label={`Mark option ${index + 1} as correct`}
            />

            <input
              value={option.text}
              onChange={(event) =>
                updateOptionText(index, event.target.value)
              }
              placeholder={`Option ${index + 1}`}
              className="flex-1 rounded-lg border p-2"
              required
            />

            <button
              type="button"
              onClick={() => removeOption(index)}
              disabled={options.length <= 2}
              className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addOption}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          + Add Option
        </button>
      </div>

      {mutation.isError && (
        <p className="text-sm text-red-600">
          {axios.isAxiosError(mutation.error)
            ? mutation.error.response?.data?.message ||
              "Failed to update question"
            : "Failed to update question"}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {mutation.isPending ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border px-4 py-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
