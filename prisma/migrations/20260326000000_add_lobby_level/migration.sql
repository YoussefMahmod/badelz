-- CreateEnum
CREATE TYPE "LobbyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PRO');

-- AlterTable
ALTER TABLE "Lobby" ADD COLUMN "level" "LobbyLevel";
