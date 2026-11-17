
import { Router } from "express";

import { authenticate } from "../../../middleware/auth.middleware.js";
import { attemptController } from "../controllers/attempt.controller.js";

export const attemptRouter = Router();

attemptRouter.use(authenticate);

attemptRouter.post(
  "/quizzes/:quizId/start",
  attemptController.start,
);
attemptRouter.post(
  "/attempts/:attemptId/submit",
  attemptController.submit,
);
attemptRouter.get("/attempts", attemptController.listAttempts);

attemptRouter.get(
  "/attempts/:attemptId",
  attemptController.getAttempt,
);
