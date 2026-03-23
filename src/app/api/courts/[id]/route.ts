import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const court = await prisma.court.findUnique({
      where: { id, isActive: true },
      select: {
        id: true,
        name: true,
        nameAr: true,
        pricePerHour: true,
        venue: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            isActive: true,
          },
        },
      },
    });

    if (!court || !court.venue.isActive) {
      return NextResponse.json(
        { statusCode: 404, message: "الكورت غير موجود", data: null },
        { status: 404 }
      );
    }

    return NextResponse.json({
      statusCode: 200,
      message: "تم جلب بيانات الكورت",
      data: court,
    });
  } catch (error) {
    console.error("Get court error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
