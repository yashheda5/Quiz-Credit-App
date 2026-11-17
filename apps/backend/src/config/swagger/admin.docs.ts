
import type { OpenAPIV3 } from "openapi-types";

const quizId = {
  name: "quizId",
  in: "path" as const,
  required: true,
  schema: { type: "string" as const, format: "uuid" },
};

const questionId = {
  name: "questionId",
  in: "path" as const,
  required: true,
  schema: { type: "string" as const, format: "uuid" },
};

const quizProperties = {
  title: { type: "string" as const },
  description: { type: "string" as const },
  stake: { type: "integer" as const, minimum: 0 },
  reward: { type: "integer" as const, minimum: 0 },
  passingScore: {
    type: "integer" as const,
    minimum: 0,
    maximum: 100,
  },
};

const questionProperties = {
  text: { type: "string" as const },
  points: { type: "integer" as const, minimum: 1 },
  options: {
    type: "array" as const,
    items: {
      type: "object" as const,
      properties: {
        text: { type: "string" as const },
        isCorrect: { type: "boolean" as const },
      },
    },
  },
};

export const adminPaths: OpenAPIV3.PathsObject = {
  "/api/v1/admin/quizzes": {
    get: {
      tags: ["Admin"],
      summary: "List all quizzes including drafts",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "All quizzes" },
        "403": { description: "Admin access required" },
      },
    },
    post: {
      tags: ["Admin"],
      summary: "Create a draft quiz",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: [
                "title",
                "stake",
                "reward",
                "passingScore",
              ],
              properties: quizProperties,
            },
          },
        },
      },
      responses: {
        "201": { description: "Draft quiz created" },
        "403": { description: "Admin access required" },
      },
    },
  },

  "/api/v1/admin/quizzes/{quizId}": {
    patch: {
      tags: ["Admin"],
      summary: "Update a draft quiz",
      security: [{ bearerAuth: [] }],
      parameters: [quizId],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: quizProperties,
            },
          },
        },
      },
      responses: {
        "200": { description: "Quiz updated" },
        "409": { description: "Quiz cannot be edited" },
      },
    },
  },

  "/api/v1/admin/quizzes/{quizId}/publish": {
    patch: {
      tags: ["Admin"],
      summary: "Publish a draft quiz",
      security: [{ bearerAuth: [] }],
      parameters: [quizId],
      responses: {
        "200": { description: "Quiz published" },
        "400": { description: "Quiz validation failed" },
      },
    },
  },

  "/api/v1/admin/quizzes/{quizId}/archive": {
    patch: {
      tags: ["Admin"],
      summary: "Archive a quiz",
      security: [{ bearerAuth: [] }],
      parameters: [quizId],
      responses: {
        "200": { description: "Quiz archived" },
        "409": { description: "Quiz already archived" },
      },
    },
  },

  "/api/v1/admin/quizzes/{quizId}/questions": {
    post: {
      tags: ["Admin"],
      summary: "Add a question to a draft quiz",
      security: [{ bearerAuth: [] }],
      parameters: [quizId],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["text", "options"],
              properties: questionProperties,
            },
          },
        },
      },
      responses: {
        "201": { description: "Question created" },
        "409": { description: "Quiz cannot be edited" },
      },
    },
  },

  "/api/v1/admin/quizzes/{quizId}/questions/{questionId}": {
    patch: {
      tags: ["Admin"],
      summary: "Update a question",
      security: [{ bearerAuth: [] }],
      parameters: [quizId, questionId],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: questionProperties,
            },
          },
        },
      },
      responses: {
        "200": { description: "Question updated" },
        "409": { description: "Question cannot be edited" },
      },
    },
    delete: {
      tags: ["Admin"],
      summary: "Delete a question",
      security: [{ bearerAuth: [] }],
      parameters: [quizId, questionId],
      responses: {
        "200": { description: "Question deleted" },
        "409": { description: "Question cannot be deleted" },
      },
    },
  },
};
