/*
  Warnings:

  - A unique constraint covering the columns `[idempotencyKey]` on the table `QuizAttempt` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "QuizAttempt" ADD COLUMN     "idempotencyKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "QuizAttempt_idempotencyKey_key" ON "QuizAttempt"("idempotencyKey");
