import type { OpenAPIV3 } from "openapi-types";

import { authPaths } from "./auth.docs.js";
import { quizPaths } from "./quiz.docs.js";
import { walletPaths } from "./wallet.docs.js";
import { adminPaths } from "./admin.docs.js";

export const swaggerDocument: OpenAPIV3.Document = {
  openapi: "3.0.3",

  info: {
    title: "Quiz Credit Platform API",
    version: "1.0.0",
    description:
      "API documentation for authentication, quiz management, quiz attempts, wallets, and credit purchases.",
  },

  servers: [
    {
      url: "/",
      description: "Current server",
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },

  paths: {
    "/api/v1/health": {
      get: {
        tags: ["Health"],
        summary: "Check API health",
        responses: {
          "200": { description: "API is running" },
        },
      },
    },

    "/api/v1/admin/test": {
      get: {
        tags: ["Admin"],
        summary: "Verify admin access",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Admin access granted" },
          "403": { description: "Admin access required" },
        },
      },
    },

    ...authPaths,
    ...quizPaths,
    ...walletPaths,
    ...adminPaths,
  },
};
