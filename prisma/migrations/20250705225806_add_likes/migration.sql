-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "totalLikes" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Like" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Like_userId_idx" ON "Like"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_quizId_userId_key" ON "Like"("quizId", "userId");

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
