import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { statusCode: 403, message: "Admin access required", data: null },
        { status: 403 }
      );
    }

    const now = new Date();
    const cairoOffset = 2 * 60;
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    const cairoNow = new Date(utcMs + cairoOffset * 60000);

    const todayStart = new Date(
      cairoNow.getFullYear(),
      cairoNow.getMonth(),
      cairoNow.getDate()
    );

    const daysSinceSaturday = (cairoNow.getDay() + 1) % 7;
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - daysSinceSaturday);

    const monthStart = new Date(
      cairoNow.getFullYear(),
      cairoNow.getMonth(),
      1
    );

    const [
      totalVenues,
      totalCourts,
      totalBookings,
      revenueResult,
      todayBookings,
      weekBookings,
      monthBookings,
      recentBookings,
    ] = await Promise.all([
      prisma.venue.count(),
      prisma.court.count(),
      prisma.booking.count({ where: { status: { not: "CANCELLED" } } }),
      prisma.booking.aggregate({
        where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
        _sum: { totalPrice: true },
      }),
      prisma.booking.count({
        where: { date: todayStart, status: { not: "CANCELLED" } },
      }),
      prisma.booking.count({
        where: { date: { gte: weekStart }, status: { not: "CANCELLED" } },
      }),
      prisma.booking.count({
        where: { date: { gte: monthStart }, status: { not: "CANCELLED" } },
      }),
      prisma.booking.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          venue: { select: { name: true, nameAr: true } },
          court: { select: { name: true, nameAr: true } },
        },
      }),
    ]);

    return NextResponse.json({
      statusCode: 200,
      message: "Admin stats fetched",
      data: {
        totalVenues,
        totalCourts,
        totalBookings,
        totalRevenue: revenueResult._sum.totalPrice?.toNumber() ?? 0,
        todayBookings,
        weekBookings,
        monthBookings,
        recentBookings,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "Server error", data: null },
      { status: 500 }
    );
  }
}
