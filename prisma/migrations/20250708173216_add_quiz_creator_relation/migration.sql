-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("clerkUserId") ON DELETE RESTRICT ON UPDATE CASCADE;
