
import { prisma } from "../../../infrastructure/database/prisma.js";
import { Prisma } from "../../../generated/prisma/client.js";
import { AppError } from "../../../common/errors/AppError.js";
import type { PurchaseInput } from "../schemas/purchase.schema.js";


export const walletRepository = {
  async getWallet(userId: string) {
    return prisma.wallet.findUnique({
      where: { userId },
      select: {
        id: true,
        balance: true,
      },
    });
  },

  async getTransactions(userId: string) {
  return prisma.creditTransaction.findMany({
    where: {
      wallet: { userId },
    },
    select: {
      id: true,
      type: true,
      amount: true,
      balanceAfter: true,
      referenceId: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    
  });
},

async purchaseCredits(userId: string, input: PurchaseInput) {
  const { purchaseId, credits } = input;

  const existing = await prisma.payment.findUnique({
    where: { id: purchaseId },
  });

  if (existing) {
    if (existing.userId !== userId || existing.credits !== credits) {
      throw new AppError(409, "Purchase ID already used");
    }

    return existing;
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          id: purchaseId,
          userId,
          credits,
          amount: credits,
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      const wallet = await tx.wallet.update({
        where: { userId },
        data: {
          balance: { increment: credits },
        },
      });

      await tx.creditTransaction.create({
        data: {
          walletId: wallet.id,
          type: "CREDIT_PURCHASE",
          amount: credits,
          balanceAfter: wallet.balance,
          referenceId: payment.id,
        },
      });

      return payment;
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const payment = await prisma.payment.findUnique({
        where: { id: purchaseId },
      });

      if (
        payment &&
        payment.userId === userId &&
        payment.credits === credits
      ) {
        return payment;
      }

      throw new AppError(409, "Purchase ID already used");
    }

    throw error;
  }
},

};
