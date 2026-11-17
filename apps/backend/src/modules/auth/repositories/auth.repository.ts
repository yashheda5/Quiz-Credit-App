
import { prisma } from "../../../infrastructure/database/prisma.js";

export const authRepository = {
  // Find an existing user by email
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  // Find an existing user by ID
  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  // Create a user, wallet, and signup transaction atomically
  async createUserWithWallet(data: {
    name: string;
    email: string;
    passwordHash: string;
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Create the user
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash: data.passwordHash,
          role: "USER",
        },
      });

      // 2. Create a wallet with 500 credits
      const wallet = await tx.wallet.create({
        data: {
          userId: user.id,
          balance: 500,
        },
      });

      // 3. Record the signup bonus
      await tx.creditTransaction.create({
        data: {
          walletId: wallet.id,
          type: "SIGNUP_BONUS",
          amount: 500,
          balanceAfter: 500,
          referenceId: user.id,
        },
      });

      return user;
    });
  },
};
