import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { venueSchema } from "@/lib/validators";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const venue = await prisma.venue.findUnique({
      where: { id },
      include: {
        courts: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            name: true,
            nameAr: true,
            sportType: true,
            pricePerHour: true,
            isActive: true,
            sortOrder: true,
            _count: { select: { slots: { where: { isActive: true } } } },
          },
        },
      },
    });

    if (!venue) {
      return NextResponse.json(
        { statusCode: 404, message: "الملعب غير موجود", data: null },
        { status: 404 }
      );
    }

    const courts = venue.courts.map(({ _count, ...court }) => ({
      ...court,
      slotCount: _count.slots,
    }));

    return NextResponse.json({
      statusCode: 200,
      message: "تم جلب بيانات الملعب",
      data: { ...venue, courts },
    });
  } catch (error) {
    console.error("Get venue error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { statusCode: 401, message: "يجب تسجيل الدخول", data: null },
        { status: 401 }
      );
    }

    const venue = await prisma.venue.findUnique({
      where: { id },
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
        { statusCode: 403, message: "غير مصرح لك بتعديل هذا الملعب", data: null },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = venueSchema.partial().safeParse(body);

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

    const updated = await prisma.venue.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({
      statusCode: 200,
      message: "تم تحديث الملعب بنجاح",
      data: updated,
    });
  } catch (error) {
    console.error("Update venue error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
