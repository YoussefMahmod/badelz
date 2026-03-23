-- CreateEnum
CREATE TYPE "LobbyStatus" AS ENUM ('OPEN', 'FULL', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PlayerTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'DIAMOND', 'ELITE');

-- CreateEnum
CREATE TYPE "ListingCategory" AS ENUM ('RACKETS', 'SHOES', 'BAGS', 'BALLS', 'APPAREL', 'ACCESSORIES', 'OTHER');

-- CreateEnum
CREATE TYPE "ListingCondition" AS ENUM ('NEW', 'LIKE_NEW', 'USED', 'WELL_USED');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'SOLD', 'REMOVED');

-- CreateTable
CREATE TABLE "Lobby" (
    "id" TEXT NOT NULL,
    "lobbyCode" TEXT NOT NULL,
    "hostName" TEXT NOT NULL,
    "hostPhone" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "areaAr" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT,
    "priceRange" TEXT,
    "note" TEXT,
    "status" "LobbyStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lobby_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LobbyPlayer" (
    "id" TEXT NOT NULL,
    "lobbyId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "playerName" TEXT NOT NULL,
    "playerPhone" TEXT NOT NULL,
    "confirmedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LobbyPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerProfile" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "area" TEXT,
    "areaAr" TEXT,
    "avatar" TEXT,
    "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "gamesWon" INTEGER NOT NULL DEFAULT 0,
    "rating" DECIMAL(3,1) NOT NULL DEFAULT 0,
    "tier" "PlayerTier" NOT NULL DEFAULT 'BRONZE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coach" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "bio" TEXT,
    "bioAr" TEXT,
    "photo" TEXT,
    "areas" TEXT[],
    "areasAr" TEXT[],
    "pricePerHour" DECIMAL(10,2),
    "experience" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coach_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "sellerName" TEXT NOT NULL,
    "sellerPhone" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleAr" TEXT,
    "description" TEXT,
    "descriptionAr" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "category" "ListingCategory" NOT NULL,
    "condition" "ListingCondition" NOT NULL DEFAULT 'USED',
    "photos" TEXT[],
    "area" TEXT NOT NULL,
    "areaAr" TEXT,
    "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lobby_lobbyCode_key" ON "Lobby"("lobbyCode");

-- CreateIndex
CREATE INDEX "Lobby_area_idx" ON "Lobby"("area");

-- CreateIndex
CREATE INDEX "Lobby_date_idx" ON "Lobby"("date");

-- CreateIndex
CREATE INDEX "Lobby_status_idx" ON "Lobby"("status");

-- CreateIndex
CREATE INDEX "Lobby_lobbyCode_idx" ON "Lobby"("lobbyCode");

-- CreateIndex
CREATE INDEX "LobbyPlayer_lobbyId_idx" ON "LobbyPlayer"("lobbyId");

-- CreateIndex
CREATE UNIQUE INDEX "LobbyPlayer_lobbyId_playerPhone_key" ON "LobbyPlayer"("lobbyId", "playerPhone");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerProfile_phone_key" ON "PlayerProfile"("phone");

-- CreateIndex
CREATE INDEX "PlayerProfile_phone_idx" ON "PlayerProfile"("phone");

-- CreateIndex
CREATE INDEX "PlayerProfile_tier_idx" ON "PlayerProfile"("tier");

-- CreateIndex
CREATE INDEX "PlayerProfile_area_idx" ON "PlayerProfile"("area");

-- CreateIndex
CREATE UNIQUE INDEX "Coach_phone_key" ON "Coach"("phone");

-- CreateIndex
CREATE INDEX "Coach_isActive_idx" ON "Coach"("isActive");

-- CreateIndex
CREATE INDEX "Listing_category_idx" ON "Listing"("category");

-- CreateIndex
CREATE INDEX "Listing_area_idx" ON "Listing"("area");

-- CreateIndex
CREATE INDEX "Listing_status_idx" ON "Listing"("status");

-- CreateIndex
CREATE INDEX "Listing_createdAt_idx" ON "Listing"("createdAt");

-- AddForeignKey
ALTER TABLE "LobbyPlayer" ADD CONSTRAINT "LobbyPlayer_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "Lobby"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
