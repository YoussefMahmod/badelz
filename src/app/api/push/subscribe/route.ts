import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  p256dh: z.string().min(1),
  auth: z.string().min(1),
  phone: z.string().regex(/^01[0125]\d{8}$/).optional(),
  area: z.string().optional(),
  level: z.string().optional(),
  locale: z.enum(["ar", "en"]).default("ar"),
});

// POST — Subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { statusCode: 400, message: "Invalid subscription data", data: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { endpoint, p256dh, auth, phone, area, level, locale } = parsed.data;

    // Check if user is authenticated (venue owner)
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    // Must have either userId or phone
    if (!userId && !phone) {
      return NextResponse.json(
        { statusCode: 400, message: "Phone number required for non-authenticated users", data: null },
        { status: 400 }
      );
    }

    // Upsert by endpoint — update if subscription already exists
    const subscription = await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        p256dh,
        auth,
        userId,
        phone: phone || null,
        area: area || null,
        level: level || null,
        locale,
        isActive: true,
      },
      create: {
        endpoint,
        p256dh,
        auth,
        userId,
        phone: phone || null,
        area: area || null,
        level: level || null,
        locale,
        isActive: true,
      },
    });

    return NextResponse.json(
      { statusCode: 201, message: "Subscribed", data: { id: subscription.id } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Push subscribe error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "Server error", data: null },
      { status: 500 }
    );
  }
}

// DELETE — Unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
  try {
    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { statusCode: 400, message: "Endpoint required", data: null },
        { status: 400 }
      );
    }

    await prisma.pushSubscription.updateMany({
      where: { endpoint },
      data: { isActive: false },
    });

    return NextResponse.json(
      { statusCode: 200, message: "Unsubscribed", data: null }
    );
  } catch (error) {
    console.error("Push unsubscribe error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "Server error", data: null },
      { status: 500 }
    );
  }
}
