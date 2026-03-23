import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { statusCode: 401, message: "يجب تسجيل الدخول", data: null },
        { status: 401 }
      );
    }

    // Get the owner's first venue (MVP: one venue per owner)
    const venue = await prisma.venue.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true, name: true, nameAr: true },
    });

    if (!venue) {
      return NextResponse.json(
        { statusCode: 404, message: "لم يتم العثور على ملعب", data: null },
        { status: 404 }
      );
    }

    // Calculate date boundaries in Egypt timezone (Africa/Cairo = UTC+2)
    const now = new Date();
    const cairoOffset = 2 * 60; // minutes
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    const cairoNow = new Date(utcMs + cairoOffset * 60000);

    const todayStart = new Date(
      cairoNow.getFullYear(),
      cairoNow.getMonth(),
      cairoNow.getDate()
    );

    // Week start = most recent Saturday (Egyptian week starts Saturday)
    const daysSinceSaturday = (cairoNow.getDay() + 1) % 7; // Sat=0, Sun=1, ...
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - daysSinceSaturday);

    const [todayBookings, weekBookings, totalBookings, revenueResult, upcomingBookings] =
      await Promise.all([
        // Today's bookings count
        prisma.booking.count({
          where: {
            venueId: venue.id,
            date: todayStart,
            status: { not: "CANCELLED" },
          },
        }),

        // This week's bookings count
        prisma.booking.count({
          where: {
            venueId: venue.id,
            date: { gte: weekStart },
            status: { not: "CANCELLED" },
          },
        }),

        // Total bookings (all time)
        prisma.booking.count({
          where: { venueId: venue.id },
        }),

        // Total revenue (CONFIRMED + COMPLETED only)
        prisma.booking.aggregate({
          where: {
            venueId: venue.id,
            status: { in: ["CONFIRMED", "COMPLETED"] },
          },
          _sum: { totalPrice: true },
        }),

        // Next 5 upcoming bookings
        prisma.booking.findMany({
          where: {
            venueId: venue.id,
            date: { gte: todayStart },
            status: { not: "CANCELLED" },
          },
          orderBy: [{ date: "asc" }, { startTime: "asc" }],
          take: 5,
          include: {
            court: { select: { name: true, nameAr: true } },
          },
        }),
      ]);

    return NextResponse.json({
      statusCode: 200,
      message: "تم جلب بيانات لوحة التحكم",
      data: {
        venue: {
          id: venue.id,
          name: venue.name,
          nameAr: venue.nameAr,
        },
        stats: {
          todayBookings,
          weekBookings,
          totalBookings,
          totalRevenue: revenueResult._sum.totalPrice?.toNumber() ?? 0,
          currency: "EGP",
        },
        upcomingBookings,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
