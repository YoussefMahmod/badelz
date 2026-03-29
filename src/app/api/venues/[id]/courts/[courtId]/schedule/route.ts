import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scheduleTemplateSchema } from "@/lib/validators";

type RouteParams = { params: Promise<{ id: string; courtId: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id: venueId, courtId } = await params;

    const court = await prisma.court.findUnique({
      where: { id: courtId },
      select: { id: true, venueId: true },
    });

    if (!court || court.venueId !== venueId) {
      return NextResponse.json(
        { statusCode: 404, message: "الكورت غير موجود", data: null },
        { status: 404 }
      );
    }

    const schedules = await prisma.scheduleTemplate.findMany({
      where: { courtId, isActive: true },
      orderBy: { dayGroup: "asc" },
    });

    return NextResponse.json({
      statusCode: 200,
      message: "تم جلب جدول المواعيد",
      data: schedules.map((s) => ({
        id: s.id,
        dayGroup: s.dayGroup,
        startTime: s.startTime,
        endTime: s.endTime,
        slotDuration: s.slotDuration,
      })),
    });
  } catch (error) {
    console.error("Get schedule error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
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
        { statusCode: 403, message: "غير مصرح لك بتعديل المواعيد", data: null },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = scheduleTemplateSchema.safeParse(body);

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

    const { slotDuration } = parsed.data;

    // Deactivate old schedule templates for this court
    await prisma.scheduleTemplate.updateMany({
      where: { courtId },
      data: { isActive: false },
    });

    const upserts: Promise<unknown>[] = [];

    if (parsed.data.all) {
      upserts.push(
        prisma.scheduleTemplate.upsert({
          where: { courtId_dayGroup: { courtId, dayGroup: "all" } },
          update: {
            startTime: parsed.data.all.startTime,
            endTime: parsed.data.all.endTime,
            slotDuration,
            isActive: true,
          },
          create: {
            courtId,
            dayGroup: "all",
            startTime: parsed.data.all.startTime,
            endTime: parsed.data.all.endTime,
            slotDuration,
          },
        })
      );
    } else {
      if (parsed.data.weekdays) {
        upserts.push(
          prisma.scheduleTemplate.upsert({
            where: { courtId_dayGroup: { courtId, dayGroup: "weekdays" } },
            update: {
              startTime: parsed.data.weekdays.startTime,
              endTime: parsed.data.weekdays.endTime,
              slotDuration,
              isActive: true,
            },
            create: {
              courtId,
              dayGroup: "weekdays",
              startTime: parsed.data.weekdays.startTime,
              endTime: parsed.data.weekdays.endTime,
              slotDuration,
            },
          })
        );
      }
      if (parsed.data.weekends) {
        upserts.push(
          prisma.scheduleTemplate.upsert({
            where: { courtId_dayGroup: { courtId, dayGroup: "weekends" } },
            update: {
              startTime: parsed.data.weekends.startTime,
              endTime: parsed.data.weekends.endTime,
              slotDuration,
              isActive: true,
            },
            create: {
              courtId,
              dayGroup: "weekends",
              startTime: parsed.data.weekends.startTime,
              endTime: parsed.data.weekends.endTime,
              slotDuration,
            },
          })
        );
      }
    }

    await Promise.all(upserts);

    // Fetch the saved schedules
    const schedules = await prisma.scheduleTemplate.findMany({
      where: { courtId, isActive: true },
      orderBy: { dayGroup: "asc" },
    });

    return NextResponse.json({
      statusCode: 200,
      message: "تم حفظ جدول المواعيد",
      data: schedules.map((s) => ({
        id: s.id,
        dayGroup: s.dayGroup,
        startTime: s.startTime,
        endTime: s.endTime,
        slotDuration: s.slotDuration,
      })),
    });
  } catch (error) {
    console.error("Save schedule error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
