
import type { Request, Response } from "express";

import { authService } from "../services/auth.service.js";
import {
  loginSchema,
  registerSchema,
} from "../schemas/auth.schema.js";

export const authController = {
  async register(req: Request, res: Response) {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  },

  async login(req: Request, res: Response) {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  },
};
