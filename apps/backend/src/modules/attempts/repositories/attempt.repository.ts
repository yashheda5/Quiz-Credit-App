
import { prisma } from "../../../infrastructure/database/prisma.js";
import { AppError } from "../../../common/errors/AppError.js";
import type { SubmitAttemptInput } from "../schemas/attempt.schema.js";
import { Prisma } from "../../../generated/prisma/client.js";
import { withTransactionRetry } from "../../../common/utils/transaction-retry.js";
export const attemptRepository = {

async startQuiz(
  userId: string,
  quizId: string,
  idempotencyKey: string,
) {
  const findExistingAttempt = async () => {
    const existing = await prisma.quizAttempt.findUnique({
      where: { idempotencyKey },
    });

    if (!existing) return null;

    if (existing.userId !== userId || existing.quizId !== quizId) {
      throw new AppError(
        409,
        "Idempotency key already used for another request",
      );
    }

    const wallet = await prisma.wallet.findUniqueOrThrow({
      where: { userId },
    });

    return {
      attempt: existing,
      remainingCredits: wallet.balance,
    };
  };

  const existing = await findExistingAttempt();

  if (existing) return existing;

  try {
    return await prisma.$transaction(async (tx) => {
      const quiz = await tx.quiz.findFirst({
        where: {
          id: quizId,
          status: "PUBLISHED",
        },
      });

      if (!quiz) {
        throw new AppError(404, "Published quiz not found");
      }

      const walletUpdate = await tx.wallet.updateMany({
        where: {
          userId,
          balance: {
            gte: quiz.stake,
          },
        },
        data: {
          balance: {
            decrement: quiz.stake,
          },
        },
      });

      if (walletUpdate.count === 0) {
        throw new AppError(400, "Insufficient credits");
      }

      const wallet = await tx.wallet.findUniqueOrThrow({
        where: { userId },
      });

      const attempt = await tx.quizAttempt.create({
        data: {
          userId,
          quizId,
          idempotencyKey,
          status: "IN_PROGRESS",
          stakeAmount: quiz.stake,
          rewardAmount: quiz.reward,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });

      await tx.creditTransaction.create({
        data: {
          walletId: wallet.id,
          type: "QUIZ_STAKE",
          amount: -quiz.stake,
          balanceAfter: wallet.balance,
          referenceId: attempt.id,
        },
      });

      return {
        attempt,
        remainingCredits: wallet.balance,
      };
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const existing = await findExistingAttempt();

      if (existing) return existing;
    }

    throw error;
  }
},


async submitQuiz(
  userId: string,
  attemptId: string,
  input: SubmitAttemptInput,
) {
  return withTransactionRetry(() =>
    prisma.$transaction(async (tx) => {
    // Claim the attempt so it cannot be submitted twice
    const claimed = await tx.quizAttempt.updateMany({
      where: {
        id: attemptId,
        userId,
        status: "IN_PROGRESS",
        OR: [
      { expiresAt: null },
      { expiresAt: { gt: new Date() } },
    ],
  },data: {
    status: "EXPIRED",
  },
});

    if (claimed.count === 0) {
      throw new AppError(409, "Attempt not found or already submitted");
    }

    const attempt = await tx.quizAttempt.findUniqueOrThrow({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: {
              include: { options: true },
            },
          },
        },
      },
    });

    const questions = attempt.quiz.questions;

    // Require one answer for every question
    if (input.answers.length !== questions.length) {
      throw new AppError(400, "Answer every question exactly once");
    }

    const answerMap = new Map(
      input.answers.map((answer) => [
        answer.questionId,
        answer.optionId,
      ]),
    );

    if (answerMap.size !== questions.length) {
      throw new AppError(400, "Duplicate question answers are not allowed");
    }

    let earnedPoints = 0;
    let totalPoints = 0;

    for (const question of questions) {
      const optionId = answerMap.get(question.id);

      const selectedOption = question.options.find(
        (option) => option.id === optionId,
      );

      if (!selectedOption) {
        throw new AppError(400, "Invalid question or answer option");
      }

      totalPoints += question.points;

      if (selectedOption.isCorrect) {
        earnedPoints += question.points;
      }
    }

    const score = Math.round(
      (earnedPoints / totalPoints) * 100,
    );

    const passed = score >= attempt.quiz.passingScore;

    await tx.attemptAnswer.createMany({
      data: input.answers.map((answer) => ({
        attemptId,
        questionId: answer.questionId,
        optionId: answer.optionId,
      })),
    });

    let remainingCredits: number | null = null;

    if (passed) {
      const wallet = await tx.wallet.update({
        where: { userId },
        data: {
          balance: { increment: attempt.rewardAmount },
        },
      });

      await tx.creditTransaction.create({
        data: {
          walletId: wallet.id,
          type: "QUIZ_REWARD",
          amount: attempt.rewardAmount,
          balanceAfter: wallet.balance,
          referenceId: attempt.id,
        },
      });

      remainingCredits = wallet.balance;
    } else {
      const wallet = await tx.wallet.findUniqueOrThrow({
        where: { userId },
      });

      remainingCredits = wallet.balance;
    }

    await tx.quizAttempt.update({
      where: { id: attemptId },
      data: {
        status: passed ? "PASSED" : "FAILED",
        score,
        submittedAt: new Date(),
      },
    });

    return {
      attemptId,
      score,
      passed,
      earnedPoints,
      totalPoints,
      rewardEarned: passed ? attempt.rewardAmount : 0,
      remainingCredits,
    };
    }),
  );
},

async getUserAttempts(userId: string) {
  return prisma.quizAttempt.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      status: true,
      score: true,
      stakeAmount: true,
      rewardAmount: true,
      startedAt: true,
      submittedAt: true,
      quiz: {
        select: {
          id: true,
          title: true,
          passingScore: true,
        },
      },
    },
    orderBy: {
      startedAt: "desc",
    },
  });
},

async getAttemptById(userId: string, attemptId: string) {
  return prisma.quizAttempt.findFirst({
    where: {
      id: attemptId,
      userId,
    },
    select: {
      id: true,
      status: true,
      score: true,
      stakeAmount: true,
      rewardAmount: true,
      startedAt: true,
      submittedAt: true,
      expiresAt: true,
      quiz: {
        select: {
          id: true,
          title: true,
          passingScore: true,
        },
      },
      answers: {
        select: {
          questionId: true,
          optionId: true,
          question: {
            select: {
              text: true,
              points: true,
            },
          },
          option: {
            select: {
              text: true,
            },
          },
        },
      },
    },
  });
},

async expireOldAttempts() {
  return prisma.quizAttempt.updateMany({
    where: {
      status: "IN_PROGRESS",
      expiresAt: {
        lte: new Date(),
      },
    },
    data: {
      status: "EXPIRED",
    },
  });
},

};
