
import { prisma } from "../../../infrastructure/database/prisma.js";
import type { CreateQuizInput } from "../schemas/quiz.schema.js";
import type { UpdateQuizInput } from "../schemas/update-quiz.schema.js";

export const quizRepository = {
  async create(data: CreateQuizInput) {
    return prisma.quiz.create({
      data: {
        ...data,
        status: "DRAFT",
      },
    });
  },
  async findById(id: string) {
  return prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: {
        include: { options: true },
      },
    },
  });
},

async publish(id: string) {
  return prisma.quiz.updateMany({
    where: {
      id,
      status: "DRAFT",
      questions: {
        some: {},
        every: {
          options: {
            some: {},
          },
        },
      },
    },
    data: { status: "PUBLISHED" },
  });
},
async findPublished() {
  return prisma.quiz.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      description: true,
      stake: true,
      reward: true,
      passingScore: true,
      createdAt: true,
      _count: {
        select: { questions: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
},

async findPublishedById(id: string) {
  return prisma.quiz.findFirst({
    where: {
      id,
      status: "PUBLISHED",
    },
    select: {
      id: true,
      title: true,
      description: true,
      stake: true,
      reward: true,
      passingScore: true,
      questions: {
        select: {
          id: true,
          text: true,
          points: true,
          options: {
            select: {
              id: true,
              text: true,
            },
          },
        },
      },
    },
  });
},
async update(id: string, data: UpdateQuizInput) {
  return prisma.quiz.updateMany({
    where: {
      id,
      status: "DRAFT",
    },
    data,
  });
},

async findAllForAdmin() {
  return prisma.quiz.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      stake: true,
      reward: true,
      passingScore: true,
      _count: {
        select: {
          questions: true,
          attempts: true,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  });
},

async archive(quizId: string) {
  return prisma.quiz.updateMany({
    where: {
      id: quizId,
      status: {
        in: ["DRAFT", "PUBLISHED"],
      },
    },
    data: {
      status: "ARCHIVED",
    },
  });
},

};
