import webpush from "web-push";
import { prisma } from "@/lib/prisma";

// Configure VAPID (same as push.ts — shared env vars)
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:admin@badelz.app",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  lang?: "ar" | "en";
}

/**
 * Send push notification to all active subscribers in a given area.
 * Excludes specified phone numbers (e.g., the lobby host or existing players).
 * Fire-and-forget — call without await.
 */
export async function notifyAreaPlayers(
  area: string,
  excludePhones: string[],
  payload: NotificationPayload
) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: {
      area,
      isActive: true,
      ...(excludePhones.length > 0 && {
        phone: { notIn: excludePhones },
      }),
    },
  });

  if (subscriptions.length === 0) return [];

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload)
        );
      } catch (error: unknown) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 410 || statusCode === 404) {
          await prisma.pushSubscription.update({
            where: { id: sub.id },
            data: { isActive: false },
          });
        }
        throw error;
      }
    })
  );

  return results;
}
