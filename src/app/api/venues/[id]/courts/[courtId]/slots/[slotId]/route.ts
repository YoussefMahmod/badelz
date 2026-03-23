import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = {
  params: Promise<{ id: string; courtId: string; slotId: string }>;
};

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id: venueId, courtId, slotId } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { statusCode: 401, message: "يجب تسجيل الدخول", data: null },
        { status: 401 }
      );
    }

    // Verify ownership
    const court = await prisma.court.findUnique({
      where: { id: courtId },
      include: { venue: { select: { ownerId: true } } },
    });

    if (!court || court.venueId !== venueId) {
      return NextResponse.json(
        { statusCode: 404, message: "الكورت غير موجود", data: null },
        { status: 404 }
      );
    }

    if (court.venue.ownerId !== session.user.id) {
      return NextResponse.json(
        { statusCode: 403, message: "غير مصرح لك", data: null },
        { status: 403 }
      );
    }

    // Verify slot belongs to this court
    const slot = await prisma.timeSlot.findUnique({
      where: { id: slotId },
    });

    if (!slot || slot.courtId !== courtId) {
      return NextResponse.json(
        { statusCode: 404, message: "الميعاد غير موجود", data: null },
        { status: 404 }
      );
    }

    await prisma.timeSlot.update({
      where: { id: slotId },
      data: { isActive: false },
    });

    return NextResponse.json({
      statusCode: 200,
      message: "تم حذف الميعاد",
      data: null,
    });
  } catch (error) {
    console.error("Delete slot error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
