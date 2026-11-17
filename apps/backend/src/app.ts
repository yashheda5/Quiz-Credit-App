
import express from "express";
import cors from "cors";
import helmet from "helmet";

import { authRouter } from "./modules/auth/routes/auth.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import {
  authenticate,
  requireAdmin,
} from "./middleware/auth.middleware.js";
import { adminQuizRouter } from "./modules/quizzes/routes/admin-quiz.routes.js";
import { quizRouter } from "./modules/quizzes/routes/quiz.routes.js";
import { attemptRouter } from "./modules/attempts/routes/attempt.routes.js";
import { walletRouter } from "./modules/wallet/routes/wallet.routes.js";
import swaggerUi from "swagger-ui-express";
import { swaggerDocument } from "./config/swagger/index.js";
export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Quiz Credit API is running",
  });
});

app.use("/api/v1/auth", authRouter);

app.get("/api/v1/me", authenticate, (_req, res) => {
  res.json({
    success: true,
    data: res.locals.user,
  });
});

app.get(
  "/api/v1/admin/test",
  authenticate,
  requireAdmin,
  (_req, res) => {
    res.json({
      success: true,
      message: "Admin access granted",
    });
  },
);

app.use("/api/v1/admin/quizzes", adminQuizRouter);
app.use("/api/v1/quizzes", quizRouter);
app.use("/api/v1", attemptRouter);
app.use("/api/v1/wallet", walletRouter);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument),
);

app.use(errorMiddleware);
