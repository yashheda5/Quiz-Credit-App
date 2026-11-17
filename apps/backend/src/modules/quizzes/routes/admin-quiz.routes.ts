
import { Router } from "express";

import {
  authenticate,
  requireAdmin,
} from "../../../middleware/auth.middleware.js";

import { quizController } from "../controllers/quiz.controller.js";

import { questionController } from "../../../modules/questions/controllers/question.controller.js";

export const adminQuizRouter = Router();

adminQuizRouter.use(authenticate, requireAdmin);

adminQuizRouter.post("/", quizController.create);

adminQuizRouter.post("/:quizId/questions", questionController.create);

adminQuizRouter.patch("/:quizId/publish", quizController.publish);

adminQuizRouter.patch("/:quizId", quizController.update);

adminQuizRouter.patch(
  "/:quizId/questions/:questionId",
  questionController.update,
);

adminQuizRouter.delete(
  "/:quizId/questions/:questionId",
  questionController.delete,
);
adminQuizRouter.get("/", quizController.listForAdmin);
adminQuizRouter.patch("/:quizId/archive", quizController.archive);
adminQuizRouter.get("/:quizId/questions", questionController.getQuizQuestionsController);