import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateTier } from "@/lib/constants";
import { z } from "zod";

type RouteParams = { params: Promise<{ id: string }> };

const updateStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"]),
});

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        court: { select: { name: true, nameAr: true, pricePerHour: true } },
        venue: {
          select: {
            name: true,
            nameAr: true,
            phone: true,
            whatsapp: true,
            address: true,
            addressAr: true,
          },
        },
        game: {
          include: {
            players: {
              orderBy: { position: "asc" },
              select: { position: true, playerName: true, confirmedAt: true },
            },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { statusCode: 404, message: "الحجز غير موجود", data: null },
        { status: 404 }
      );
    }

    return NextResponse.json({
      statusCode: 200,
      message: "تم جلب بيانات الحجز",
      data: booking,
    });
  } catch (error) {
    console.error("Get booking error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { statusCode: 401, message: "يجب تسجيل الدخول", data: null },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = updateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: "بيانات غير صحيحة. الحالات المتاحة: CONFIRMED, CANCELLED, COMPLETED, NO_SHOW",
          data: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Fetch the booking and verify the caller is the venue owner
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { venue: { select: { ownerId: true } } },
    });

    if (!booking) {
      return NextResponse.json(
        { statusCode: 404, message: "الحجز غير موجود", data: null },
        { status: 404 }
      );
    }

    if (booking.venue.ownerId !== session.user.id) {
      return NextResponse.json(
        { statusCode: 403, message: "غير مصرح لك بتعديل هذا الحجز", data: null },
        { status: 403 }
      );
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    // Cascade cancellation to the linked game
    if (parsed.data.status === "CANCELLED") {
      await prisma.game.updateMany({
        where: { bookingId: id },
        data: { status: "CANCELLED" },
      });
    }

    // On completion: increment gamesPlayed for ALL players in the game
    if (parsed.data.status === "COMPLETED") {
      const game = await prisma.game.findUnique({
        where: { bookingId: id },
        include: { players: { select: { playerName: true, playerPhone: true } } },
      });

      // Collect all unique player phones
      const playerMap = new Map<string, string>();
      if (booking.playerPhone) {
        playerMap.set(booking.playerPhone, booking.playerName);
      }
      game?.players.forEach((p) => {
        playerMap.set(p.playerPhone, p.playerName);
      });

      // Upsert each player's profile
      for (const [phone, name] of playerMap) {
        const existing = await prisma.playerProfile.findUnique({
          where: { phone },
          select: { gamesPlayed: true },
        });
        const newCount = (existing?.gamesPlayed ?? 0) + 1;

        await prisma.playerProfile.upsert({
          where: { phone },
          create: {
            phone,
            name,
            gamesPlayed: 1,
            tier: calculateTier(1),
            isEarlyAdopter: true,
          },
          update: {
            gamesPlayed: { increment: 1 },
            tier: calculateTier(newCount),
          },
        });
      }
    }

    return NextResponse.json({
      statusCode: 200,
      message: "تم تحديث حالة الحجز",
      data: updated,
    });
  } catch (error) {
    console.error("Update booking error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
