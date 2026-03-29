import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ownerBookingSchema } from "@/lib/validators";
import { customAlphabet } from "nanoid";
import { getDayGroup, timeToMinutes, minutesToTime } from "@/lib/slot-templates";
import { DayOfWeek } from "@prisma/client";

const generateCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

const DAY_MAP: Record<number, DayOfWeek> = {
  0: "SUNDAY",
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { statusCode: 401, message: "يجب تسجيل الدخول", data: null },
        { status: 401 }
      );
    }

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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { statusCode: 401, message: "يجب تسجيل الدخول", data: null },
        { status: 401 }
      );
    }

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

    const body = await request.json();
    const parsed = ownerBookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { statusCode: 400, message: "بيانات غير صحيحة", data: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { courtId, date, startTime, blockCount, playerName, playerPhone, notes } = parsed.data;

    // Verify court belongs to owner's venue
    const court = await prisma.court.findFirst({
      where: { id: courtId, venueId: venue.id },
    });

    if (!court) {
      return NextResponse.json(
        { statusCode: 404, message: "الكورت مش موجود", data: null },
        { status: 404 }
      );
    }

    // Determine endTime from schedule template or legacy
    const dateParts = date.split("-").map(Number);
    const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    const dayOfWeek = DAY_MAP[dateObj.getDay()];
    const dayGroup = getDayGroup(dayOfWeek);

    // Transaction: conflict check + create booking
    const result = await prisma.$transaction(async (tx) => {
      let endTime: string;

      // Try schedule template first
      const template = await tx.scheduleTemplate.findFirst({
        where: {
          courtId,
          dayGroup: { in: [dayGroup, "all"] },
          isActive: true,
        },
      });

      if (template) {
        const requestedEndMin = timeToMinutes(startTime) + template.slotDuration * blockCount;
        endTime = minutesToTime(requestedEndMin);
      } else if (parsed.data.endTime) {
        endTime = parsed.data.endTime;
      } else {
        // Default to 1 hour blocks
        const requestedEndMin = timeToMinutes(startTime) + 60 * blockCount;
        endTime = minutesToTime(requestedEndMin);
      }

      // Check for conflicting bookings
      const conflicting = await tx.booking.findFirst({
        where: {
          courtId,
          date: new Date(date),
          status: { not: "CANCELLED" },
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gt: startTime } },
          ],
        },
      });

      if (conflicting) {
        throw new Error("SLOT_TAKEN");
      }

      // Calculate price
      const durationMinutes = timeToMinutes(endTime) - timeToMinutes(startTime);
      const totalPrice = court.pricePerHour.toNumber() * (durationMinutes / 60);

      // Owner bookings skip PENDING — go directly to CONFIRMED
      const booking = await tx.booking.create({
        data: {
          courtId,
          venueId: venue.id,
          playerName,
          playerPhone: playerPhone || "",
          date: new Date(date),
          startTime,
          endTime,
          blockCount,
          totalPrice,
          status: "CONFIRMED",
          confirmationCode: generateCode(),
          notes: notes ?? null,
        },
        include: {
          court: { select: { name: true, nameAr: true } },
        },
      });

      return booking;
    });

    return NextResponse.json(
      { statusCode: 201, message: "تم الحجز بنجاح", data: result },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "SLOT_TAKEN") {
      return NextResponse.json(
        { statusCode: 409, message: "الميعاد ده محجوز بالفعل", data: null },
        { status: 409 }
      );
    }

    console.error("Owner create booking error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
