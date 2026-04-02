import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { statusCode: 401, message: "يجب تسجيل الدخول", data: null },
        { status: 401 }
      );
    }

    const venue = await prisma.venue.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true },
    });

    if (!venue) {
      return NextResponse.json(
        { statusCode: 404, message: "لم يتم العثور على ملعب", data: null },
        { status: 404 }
      );
    }

    const { searchParams } = request.nextUrl;
    const dateParam = searchParams.get("date");

    if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return NextResponse.json(
        { statusCode: 400, message: "التاريخ مطلوب", data: null },
        { status: 400 }
      );
    }

    const [courts, bookings] = await Promise.all([
      prisma.court.findMany({
        where: { venueId: venue.id, isActive: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          nameAr: true,
          pricePerHour: true,
          priceRules: {
            select: {
              dayGroup: true,
              startTime: true,
              endTime: true,
              pricePerHour: true,
            },
          },
        },
      }),
      prisma.booking.findMany({
        where: {
          venueId: venue.id,
          date: new Date(dateParam),
          status: { not: "CANCELLED" },
        },
        orderBy: { startTime: "asc" },
        select: {
          id: true,
          courtId: true,
          playerName: true,
          playerPhone: true,
          startTime: true,
          endTime: true,
          status: true,
          confirmationCode: true,
          notes: true,
        },
      }),
    ]);

    return NextResponse.json({
      statusCode: 200,
      message: "تم جلب الجدول",
      data: {
        courts,
        bookings,
        date: dateParam,
      },
    });
  } catch (error) {
    console.error("Owner schedule error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
