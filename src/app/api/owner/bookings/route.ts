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

    // Get the owner's first venue (MVP)
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
    const statusParam = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { venueId: venue.id };

    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      where.date = new Date(dateParam);
    }

    if (statusParam) {
      const validStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"];
      if (validStatuses.includes(statusParam.toUpperCase())) {
        where.status = statusParam.toUpperCase();
      }
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ date: "desc" }, { startTime: "desc" }],
        include: {
          court: { select: { name: true, nameAr: true } },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      statusCode: 200,
      message: "تم جلب الحجوزات بنجاح",
      data: bookings,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Owner bookings error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
