import webpush from "web-push";
import { prisma } from "@/lib/prisma";

// Configure VAPID
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

/** Send push notification to all subscriptions for a phone number (players) */
export async function sendPushToPhone(phone: string, payload: NotificationPayload) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { phone, isActive: true },
  });
  return sendToSubscriptions(subscriptions, payload);
}

/** Send push notification to all subscriptions for a user ID (venue owners) */
export async function sendPushToUser(userId: string, payload: NotificationPayload) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId, isActive: true },
  });
  return sendToSubscriptions(subscriptions, payload);
}

async function sendToSubscriptions(
  subscriptions: Array<{ id: string; endpoint: string; p256dh: string; auth: string }>,
  payload: NotificationPayload
) {
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
        // 410 Gone or 404 = subscription expired, deactivate
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
