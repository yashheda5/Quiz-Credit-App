
import type { OpenAPIV3 } from "openapi-types";

export const authPaths: OpenAPIV3.PathsObject = {
  "/api/v1/auth/register": {
    post: {
      tags: ["Authentication"],
      summary: "Register a new user",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "email", "password"],
              properties: {
                name: { type: "string" },
                email: { type: "string", format: "email" },
                password: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        "201": { description: "User registered" },
        "400": { description: "Invalid input" },
        "409": { description: "Email already exists" },
      },
    },
  },

  "/api/v1/auth/login": {
    post: {
      tags: ["Authentication"],
      summary: "Login and receive JWT",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: { type: "string", format: "email" },
                password: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        "200": { description: "Login successful" },
        "401": { description: "Invalid credentials" },
      },
    },
  },

  "/api/v1/me": {
    get: {
      tags: ["Authentication"],
      summary: "Get authenticated user",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Authenticated user details" },
        "401": { description: "Unauthorized" },
      },
    },
  },
};
