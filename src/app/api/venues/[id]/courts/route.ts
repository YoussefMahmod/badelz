import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { courtSchema } from "@/lib/validators";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: venueId } = await params;

    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      select: { id: true },
    });

    if (!venue) {
      return NextResponse.json(
        { statusCode: 404, message: "الملعب غير موجود", data: null },
        { status: 404 }
      );
    }

    const courts = await prisma.court.findMany({
      where: { venueId },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        nameAr: true,
        sportType: true,
        pricePerHour: true,
        isActive: true,
        sortOrder: true,
        createdAt: true,
        priceRules: {
          orderBy: [{ dayGroup: "asc" as const }, { startTime: "asc" as const }],
        },
        _count: { select: { priceRules: true } },
      },
    });

    return NextResponse.json({
      statusCode: 200,
      message: "تم جلب الكورتات بنجاح",
      data: courts,
    });
  } catch (error) {
    console.error("List courts error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: venueId } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { statusCode: 401, message: "يجب تسجيل الدخول", data: null },
        { status: 401 }
      );
    }

    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      select: { ownerId: true },
    });

    if (!venue) {
      return NextResponse.json(
        { statusCode: 404, message: "الملعب غير موجود", data: null },
        { status: 404 }
      );
    }

    if (venue.ownerId !== session.user.id) {
      return NextResponse.json(
        { statusCode: 403, message: "غير مصرح لك بإضافة كورت", data: null },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = courtSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: "بيانات غير صحيحة",
          data: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const court = await prisma.court.create({
      data: {
        venueId,
        name: parsed.data.name,
        nameAr: parsed.data.nameAr,
        pricePerHour: parsed.data.pricePerHour,
        sportType: "PADEL",
      },
    });

    return NextResponse.json(
      {
        statusCode: 201,
        message: "تم إضافة الكورت بنجاح",
        data: court,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create court error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
