
import type { OpenAPIV3 } from "openapi-types";

export const walletPaths: OpenAPIV3.PathsObject = {
  "/api/v1/wallet": {
    get: {
      tags: ["Wallet"],
      summary: "Get current user's wallet balance",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Wallet balance" },
      },
    },
  },

  "/api/v1/wallet/transactions": {
    get: {
      tags: ["Wallet"],
      summary: "Get wallet transaction history",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Credit transactions" },
      },
    },
  },

  "/api/v1/wallet/purchase": {
    post: {
      tags: ["Wallet"],
      summary: "Purchase credits (mock payment)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["purchaseId", "credits"],
              properties: {
                purchaseId: {
                  type: "string",
                  format: "uuid",
                  description:
                    "Unique purchase ID for idempotency",
                },
                credits: {
                  type: "integer",
                  minimum: 1,
                  example: 200,
                },
              },
            },
          },
        },
      },
      responses: {
        "200": { description: "Credits purchased" },
        "400": { description: "Invalid purchase request" },
        "409": { description: "Purchase ID conflict" },
      },
    },
  },
};
