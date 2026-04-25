ALTER TABLE "User" ADD COLUMN "teamId" TEXT;

CREATE INDEX "User_teamId_idx" ON "User"("teamId");
