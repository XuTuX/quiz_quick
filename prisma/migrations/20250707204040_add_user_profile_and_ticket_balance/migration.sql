-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "ticketBalance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_clerkUserId_key" ON "UserProfile"("clerkUserId");
