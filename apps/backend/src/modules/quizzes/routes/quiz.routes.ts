
import { Router } from "express";

import { quizController } from "../controllers/quiz.controller.js";
import { authenticate } from "../../../middleware/auth.middleware.js";

export const quizRouter = Router();

quizRouter.use(authenticate);

quizRouter.get("/", quizController.listPublished);
quizRouter.get("/:quizId", quizController.getPublishedById);
