
import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { AppError } from "../common/errors/AppError.js";
import { authRepository } from "../modules/auth/repositories/auth.repository.js";

export const authenticate: RequestHandler = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    throw new AppError(401, "Authentication required");
  }

  const token = authorization.slice(7);

  let userId: string;

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string"
    ) {
      throw new Error("Invalid token payload");
    }

    userId = payload.sub;
  } catch {
    throw new AppError(401, "Invalid or expired token");
  }

  const user = await authRepository.findUserById(userId);

  if (!user) {
    throw new AppError(401, "User no longer exists");
  }

  // Store verified user information for subsequent middleware
  res.locals.user = {
    id: user.id,
    role: user.role,
  };

  next();
};

export const requireAdmin: RequestHandler = (_req, res, next) => {
  if (res.locals.user?.role !== "ADMIN") {
    throw new AppError(403, "Admin access required");
  }

  next();
};
