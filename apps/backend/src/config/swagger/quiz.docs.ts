
import type { OpenAPIV3 } from "openapi-types";

const quizId = {
  name: "quizId",
  in: "path" as const,
  required: true,
  schema: { type: "string" as const, format: "uuid" },
};

const attemptId = {
  name: "attemptId",
  in: "path" as const,
  required: true,
  schema: { type: "string" as const, format: "uuid" },
};

export const quizPaths: OpenAPIV3.PathsObject = {
  "/api/v1/quizzes": {
    get: {
      tags: ["Quizzes"],
      summary: "List published quizzes",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Published quizzes" },
      },
    },
  },

  "/api/v1/quizzes/{quizId}": {
    get: {
      tags: ["Quizzes"],
      summary: "Get published quiz details",
      security: [{ bearerAuth: [] }],
      parameters: [quizId],
      responses: {
        "200": { description: "Quiz questions and options" },
        "404": { description: "Quiz not found" },
      },
    },
  },

  "/api/v1/quizzes/{quizId}/start": {
    post: {
      tags: ["Attempts"],
      summary: "Start a quiz and deduct stake",
      security: [{ bearerAuth: [] }],
      parameters: [quizId],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["idempotencyKey"],
              properties: {
                idempotencyKey: {
                  type: "string",
                  format: "uuid",
                  description:
                    "Reuse the same UUID when retrying the same start request",
                },
              },
            },
          },
        },
      },
      responses: {
        "201": { description: "Quiz attempt started" },
        "400": { description: "Insufficient credits or invalid input" },
        "409": { description: "Idempotency key conflict" },
      },
    },
  },

  "/api/v1/attempts/{attemptId}/submit": {
    post: {
      tags: ["Attempts"],
      summary: "Submit quiz answers and calculate score",
      security: [{ bearerAuth: [] }],
      parameters: [attemptId],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["answers"],
              properties: {
                answers: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["questionId", "optionId"],
                    properties: {
                      questionId: {
                        type: "string",
                        format: "uuid",
                      },
                      optionId: {
                        type: "string",
                        format: "uuid",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        "200": { description: "Quiz submitted and scored" },
        "400": { description: "Invalid answers" },
        "409": { description: "Attempt expired or already submitted" },
      },
    },
  },

  "/api/v1/attempts": {
    get: {
      tags: ["Attempts"],
      summary: "List current user's quiz attempts",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Attempt history" },
      },
    },
  },

  "/api/v1/attempts/{attemptId}": {
    get: {
      tags: ["Attempts"],
      summary: "Get attempt details",
      security: [{ bearerAuth: [] }],
      parameters: [attemptId],
      responses: {
        "200": { description: "Attempt details and answers" },
        "404": { description: "Attempt not found" },
      },
    },
  },
};
