import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slotSchema } from "@/lib/validators";
import { z } from "zod";
import { DayOfWeek } from "@prisma/client";

type RouteParams = { params: Promise<{ id: string; courtId: string }> };

const DAY_MAP: Record<number, DayOfWeek> = {
  0: "SUNDAY",
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
};

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function slotsOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  const a0 = timeToMinutes(aStart);
  const a1 = timeToMinutes(aEnd);
  const b0 = timeToMinutes(bStart);
  const b1 = timeToMinutes(bEnd);
  return a0 < b1 && b0 < a1;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: venueId, courtId } = await params;
    const allParam = request.nextUrl.searchParams.get("all");
    const dateParam = request.nextUrl.searchParams.get("date");

    // Verify the court belongs to this venue
    const court = await prisma.court.findUnique({
      where: { id: courtId },
      select: { id: true, venueId: true, pricePerHour: true, isActive: true },
    });

    if (!court || court.venueId !== venueId) {
      return NextResponse.json(
        { statusCode: 404, message: "الكورت غير موجود", data: null },
        { status: 404 }
      );
    }

    // Owner mode: return all slot templates for this court (all days)
    if (allParam === "true") {
      const slots = await prisma.timeSlot.findMany({
        where: { courtId, isActive: true },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      });

      const data = slots.map((slot) => ({
        id: slot.id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
      }));

      return NextResponse.json({
        statusCode: 200,
        message: "تم جلب كل المواعيد",
        data,
      });
    }

    // Player mode: return available slots for a specific date
    if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: "التاريخ مطلوب بصيغة YYYY-MM-DD",
          data: null,
        },
        { status: 400 }
      );
    }

    if (!court.isActive) {
      return NextResponse.json(
        { statusCode: 404, message: "الكورت غير موجود", data: null },
        { status: 404 }
      );
    }

    // Parse the date in Egypt timezone to get the correct day of week
    const dateParts = dateParam.split("-").map(Number);
    const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    const dayOfWeek = DAY_MAP[dateObj.getDay()];

    // Get all active time slot templates for this court + day
    const slots = await prisma.timeSlot.findMany({
      where: {
        courtId,
        dayOfWeek,
        isActive: true,
      },
      orderBy: { startTime: "asc" },
    });

    // Get all non-cancelled bookings for this court + date
    const bookings = await prisma.booking.findMany({
      where: {
        courtId,
        date: new Date(dateParam),
        status: { not: "CANCELLED" },
      },
      select: { startTime: true, endTime: true },
    });

    // Filter out slots that conflict with existing bookings
    const available = slots.filter((slot) => {
      return !bookings.some((booking) =>
        slotsOverlap(slot.startTime, slot.endTime, booking.startTime, booking.endTime)
      );
    });

    const data = available.map((slot) => ({
      id: slot.id,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      pricePerHour: court.pricePerHour,
    }));

    return NextResponse.json({
      statusCode: 200,
      message: "تم جلب المواعيد المتاحة",
      data,
    });
  } catch (error) {
    console.error("Get slots error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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
    const parsed = z.array(slotSchema).min(1).safeParse(body);

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

    // Validate that startTime < endTime for each slot
    for (const slot of parsed.data) {
      if (timeToMinutes(slot.startTime) >= timeToMinutes(slot.endTime)) {
        return NextResponse.json(
          {
            statusCode: 400,
            message: `وقت البداية ${slot.startTime} لازم يكون قبل وقت النهاية ${slot.endTime}`,
            data: null,
          },
          { status: 400 }
        );
      }
    }

    // Upsert each slot template using the unique constraint (courtId, dayOfWeek, startTime)
    const results = await prisma.$transaction(
      parsed.data.map((slot) =>
        prisma.timeSlot.upsert({
          where: {
            courtId_dayOfWeek_startTime: {
              courtId,
              dayOfWeek: slot.dayOfWeek as DayOfWeek,
              startTime: slot.startTime,
            },
          },
          update: {
            endTime: slot.endTime,
            isActive: true,
          },
          create: {
            courtId,
            dayOfWeek: slot.dayOfWeek as DayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
          },
        })
      )
    );

    return NextResponse.json(
      {
        statusCode: 201,
        message: `تم حفظ ${results.length} ميعاد بنجاح`,
        data: results,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create slots error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
