-- AlterEnum: Add PLAYER and COACH to UserRole
-- PostgreSQL ADD VALUE cannot run in a transaction, so we recreate the type.
-- Must drop defaults before altering column type.
CREATE TYPE "UserRole_new" AS ENUM ('PLAYER', 'COACH', 'VENUE_OWNER', 'ADMIN');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'VENUE_OWNER'::"UserRole_new";
DROP TYPE "UserRole";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";

-- AlterEnum: Replace PlayerTier (BRONZE,SILVER,GOLD,DIAMOND,ELITE) with (BRONZE,GOLD,EMERALD,DIAMOND,MASTER,GRANDMASTER)
CREATE TYPE "PlayerTier_new" AS ENUM ('BRONZE', 'GOLD', 'EMERALD', 'DIAMOND', 'MASTER', 'GRANDMASTER');
ALTER TABLE "PlayerProfile" ALTER COLUMN "tier" DROP DEFAULT;
ALTER TABLE "PlayerProfile" ALTER COLUMN "tier" TYPE "PlayerTier_new" USING (
  CASE "tier"::text
    WHEN 'SILVER' THEN 'GOLD'::"PlayerTier_new"
    WHEN 'ELITE' THEN 'MASTER'::"PlayerTier_new"
    ELSE "tier"::text::"PlayerTier_new"
  END
);
ALTER TABLE "PlayerProfile" ALTER COLUMN "tier" SET DEFAULT 'BRONZE'::"PlayerTier_new";
DROP TYPE "PlayerTier";
ALTER TYPE "PlayerTier_new" RENAME TO "PlayerTier";

-- AlterTable: Add userId to PlayerProfile
ALTER TABLE "PlayerProfile" ADD COLUMN "userId" TEXT;

-- AlterTable: Add userId to Coach
ALTER TABLE "Coach" ADD COLUMN "userId" TEXT;

-- CreateIndex: Unique constraint on PlayerProfile.userId
CREATE UNIQUE INDEX "PlayerProfile_userId_key" ON "PlayerProfile"("userId");

-- CreateIndex: Unique constraint on Coach.userId
CREATE UNIQUE INDEX "Coach_userId_key" ON "Coach"("userId");

-- AddForeignKey: PlayerProfile -> User
ALTER TABLE "PlayerProfile" ADD CONSTRAINT "PlayerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: Coach -> User
ALTER TABLE "Coach" ADD CONSTRAINT "Coach_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
