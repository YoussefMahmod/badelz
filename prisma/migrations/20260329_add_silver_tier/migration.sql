-- AddSilverTier: Safe additive migration. No data loss.
-- Only adds a new enum value to PlayerTier.
ALTER TYPE "PlayerTier" ADD VALUE 'SILVER';
