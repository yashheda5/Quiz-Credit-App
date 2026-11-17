
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppError } from "../../../common/errors/AppError.js";

import { env } from "../../../config/env.js";
import { authRepository } from "../repositories/auth.repository.js";
import type {
  LoginInput,
  RegisterInput,
} from "../schemas/auth.schema.js";

const SALT_ROUNDS = 12;

function generateToken(user: { id: string; role: string }) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    env.JWT_SECRET,
    { expiresIn: "1h" },
  );
}

function toPublicUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export const authService = {
  async register(input: RegisterInput) {
    const existingUser = await authRepository.findUserByEmail(
      input.email,
    );

    if (existingUser) {
      throw new AppError(409, "Email already registered");
    }

    const passwordHash = await bcrypt.hash(
      input.password,
      SALT_ROUNDS,
    );

    const user = await authRepository.createUserWithWallet({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    return {
      user: toPublicUser(user),
      token: generateToken(user),
    };
  },

  async login(input: LoginInput) {
    const user = await authRepository.findUserByEmail(
      input.email,
    );

    if (!user) {
      throw new AppError(401, "Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new AppError(401, "Invalid email or password");
    }

    return {
      user: toPublicUser(user),
      token: generateToken(user),
    };
  },
};

