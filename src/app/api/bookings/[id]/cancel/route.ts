import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { playerPhone } = body;

    if (!playerPhone) {
      return NextResponse.json(
        { statusCode: 400, message: "رقم التليفون مطلوب", data: null },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: {
        id: true,
        playerPhone: true,
        status: true,
        date: true,
        startTime: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { statusCode: 404, message: "الحجز غير موجود", data: null },
        { status: 404 }
      );
    }

    // Verify the caller is the booking owner
    if (booking.playerPhone !== playerPhone) {
      return NextResponse.json(
        { statusCode: 403, message: "رقم التليفون مش مطابق للحجز", data: null },
        { status: 403 }
      );
    }

    // Can only cancel CONFIRMED or PENDING bookings
    if (!["CONFIRMED", "PENDING"].includes(booking.status)) {
      return NextResponse.json(
        { statusCode: 400, message: "الحجز ده مش ممكن يتلغي", data: null },
        { status: 400 }
      );
    }

    // Update booking status
    const updated = await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    // Cascade cancellation to linked game
    await prisma.game.updateMany({
      where: { bookingId: id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({
      statusCode: 200,
      message: "تم إلغاء الحجز بنجاح",
      data: updated,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
