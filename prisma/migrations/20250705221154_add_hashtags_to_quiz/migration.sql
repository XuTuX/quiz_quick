-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "hashtags" TEXT[] DEFAULT ARRAY[]::TEXT[];
