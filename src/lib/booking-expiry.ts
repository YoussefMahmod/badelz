import { prisma } from "@/lib/prisma";

const PENDING_EXPIRY_MINUTES = 30;

/**
 * Cancel PENDING bookings older than the expiry threshold.
 * Called before slot availability queries to free stale blocks.
 */
export async function expireStalePendingBookings(
  maxAgeMinutes: number = PENDING_EXPIRY_MINUTES
): Promise<number> {
  const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000);
  const result = await prisma.booking.updateMany({
    where: {
      status: "PENDING",
      createdAt: { lt: cutoff },
    },
    data: { status: "CANCELLED" },
  });
  return result.count;
}
