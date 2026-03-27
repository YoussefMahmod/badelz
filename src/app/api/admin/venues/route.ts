import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { statusCode: 403, message: "Admin access required", data: null },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const city = searchParams.get("city") || "";
    const status = searchParams.get("status") || "all";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { nameAr: { contains: search, mode: "insensitive" } },
        { owner: { name: { contains: search, mode: "insensitive" } } },
        { owner: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (city) {
      where.city = { equals: city, mode: "insensitive" };
    }

    if (status === "active") where.isActive = true;
    if (status === "inactive") where.isActive = false;

    const [venues, total] = await Promise.all([
      prisma.venue.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true, email: true, phone: true } },
          _count: { select: { courts: true, bookings: true } },
          courts: {
            select: {
              id: true,
              _count: { select: { slots: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.venue.count({ where }),
    ]);

    const venuesWithCompleteness = venues.map((venue) => {
      const hasSlots = venue.courts.some((c) => c._count.slots > 0);
      const hasCoverPhoto = !!venue.coverPhoto;
      const hasWhatsApp = !!venue.whatsapp;
      const hasArabicName = !!venue.nameAr;
      const hasLocation = !!venue.latitude && !!venue.longitude;
      const score = [hasSlots, hasCoverPhoto, hasWhatsApp, hasArabicName, hasLocation].filter(Boolean).length;

      return {
        id: venue.id,
        name: venue.name,
        nameAr: venue.nameAr,
        owner: venue.owner,
        city: venue.city,
        cityAr: venue.cityAr,
        phone: venue.phone,
        whatsapp: venue.whatsapp,
        isActive: venue.isActive,
        isFoundingVenue: venue.isFoundingVenue,
        createdAt: venue.createdAt,
        courtsCount: venue._count.courts,
        bookingsCount: venue._count.bookings,
        completeness: { hasSlots, hasCoverPhoto, hasWhatsApp, hasArabicName, hasLocation, score },
      };
    });

    return NextResponse.json({
      statusCode: 200,
      message: "Venues fetched",
      data: {
        venues: venuesWithCompleteness,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin venues error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "Server error", data: null },
      { status: 500 }
    );
  }
}
