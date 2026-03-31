-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "blockCount" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Coach" ADD COLUMN     "isPioneerCoach" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PlayerProfile" ADD COLUMN     "isEarlyAdopter" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PushSubscription" ADD COLUMN     "area" TEXT,
ADD COLUMN     "level" TEXT;

-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "isFoundingVenue" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ScheduleTemplate" (
    "id" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,
    "dayGroup" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "slotDuration" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourtPriceRule" (
    "id" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,
    "dayGroup" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "pricePerHour" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourtPriceRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScheduleTemplate_courtId_idx" ON "ScheduleTemplate"("courtId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleTemplate_courtId_dayGroup_key" ON "ScheduleTemplate"("courtId", "dayGroup");

-- CreateIndex
CREATE INDEX "CourtPriceRule_courtId_idx" ON "CourtPriceRule"("courtId");

-- CreateIndex
CREATE INDEX "PushSubscription_area_isActive_idx" ON "PushSubscription"("area", "isActive");

-- AddForeignKey
ALTER TABLE "ScheduleTemplate" ADD CONSTRAINT "ScheduleTemplate_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourtPriceRule" ADD CONSTRAINT "CourtPriceRule_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE CASCADE ON UPDATE CASCADE;

