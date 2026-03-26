import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ code: string }> };

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { code } = await params;

    const game = await prisma.game.findUnique({
      where: { gameCode: code.toUpperCase() },
      include: {
        booking: {
          select: {
            date: true,
            startTime: true,
            endTime: true,
            totalPrice: true,
          },
        },
        players: {
          orderBy: { position: "asc" },
          select: {
            position: true,
            playerName: true,
            confirmedAt: true,
            // NO playerPhone — privacy
          },
        },
      },
    });

    if (!game) {
      return NextResponse.json(
        { statusCode: 404, message: "اللعبة غير موجودة", data: null },
        { status: 404 }
      );
    }

    // Fetch venue + court through the booking relation
    const booking = await prisma.booking.findUnique({
      where: { id: game.bookingId },
      select: {
        venue: {
          select: {
            name: true,
            nameAr: true,
            coverPhoto: true,
            phone: true,
            address: true,
            addressAr: true,
          },
        },
        court: {
          select: {
            name: true,
            nameAr: true,
            pricePerHour: true,
          },
        },
      },
    });

    const totalPrice = Number(game.booking.totalPrice);
    const pricePerPlayer = Math.ceil(totalPrice / 4);
    const spotsLeft = 4 - game.players.length;

    return NextResponse.json({
      statusCode: 200,
      message: "تم جلب بيانات اللعبة",
      data: {
        gameCode: game.gameCode,
        status: game.status,
        level: game.level,
        date: game.booking.date,
        startTime: game.booking.startTime,
        endTime: game.booking.endTime,
        totalPrice,
        pricePerPlayer,
        spotsLeft,
        venue: booking?.venue ?? null,
        court: booking?.court ?? null,
        players: game.players,
      },
    });
  } catch (error) {
    console.error("Get game error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
