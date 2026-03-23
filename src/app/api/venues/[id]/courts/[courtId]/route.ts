import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { courtSchema } from "@/lib/validators";

type RouteParams = { params: Promise<{ id: string; courtId: string }> };

async function verifyOwnership(venueId: string, courtId: string, userId: string) {
  const court = await prisma.court.findUnique({
    where: { id: courtId },
    include: { venue: { select: { id: true, ownerId: true } } },
  });

  if (!court || court.venueId !== venueId) {
    return { error: "الكورت غير موجود", status: 404 as const };
  }

  if (court.venue.ownerId !== userId) {
    return { error: "غير مصرح لك بتعديل هذا الكورت", status: 403 as const };
  }

  return { court };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: venueId, courtId } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { statusCode: 401, message: "يجب تسجيل الدخول", data: null },
        { status: 401 }
      );
    }

    const ownership = await verifyOwnership(venueId, courtId, session.user.id);
    if ("error" in ownership) {
      return NextResponse.json(
        { statusCode: ownership.status, message: ownership.error, data: null },
        { status: ownership.status }
      );
    }

    const body = await request.json();
    const parsed = courtSchema.partial().safeParse(body);

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

    const updated = await prisma.court.update({
      where: { id: courtId },
      data: parsed.data,
    });

    return NextResponse.json({
      statusCode: 200,
      message: "تم تحديث الكورت بنجاح",
      data: updated,
    });
  } catch (error) {
    console.error("Update court error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id: venueId, courtId } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { statusCode: 401, message: "يجب تسجيل الدخول", data: null },
        { status: 401 }
      );
    }

    const ownership = await verifyOwnership(venueId, courtId, session.user.id);
    if ("error" in ownership) {
      return NextResponse.json(
        { statusCode: ownership.status, message: ownership.error, data: null },
        { status: ownership.status }
      );
    }

    await prisma.court.update({
      where: { id: courtId },
      data: { isActive: false },
    });

    return NextResponse.json({
      statusCode: 200,
      message: "تم حذف الكورت بنجاح",
      data: null,
    });
  } catch (error) {
    console.error("Delete court error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
