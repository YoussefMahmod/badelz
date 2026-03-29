import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validators";
import { customAlphabet } from "nanoid";
import { DayOfWeek } from "@prisma/client";
import { buildGameShareLink } from "@/lib/whatsapp";
import { sendBookingNotification } from "@/lib/email";
import { sendPushToPhone, sendPushToUser } from "@/lib/push";
import { getDayGroup, timeToMinutes, minutesToTime } from "@/lib/slot-templates";

const generateCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const phone = searchParams.get("phone");
    const session = await getServerSession(authOptions);

    // Authenticated user: find bookings by userId OR phone
    if (session?.user?.id) {
      const orConditions: Record<string, unknown>[] = [{ userId: session.user.id }];

      if (session.user.phone) {
        orConditions.push({ playerPhone: session.user.phone });
      }

      const bookings = await prisma.booking.findMany({
        where: { OR: orConditions },
        orderBy: [{ date: "desc" }, { startTime: "desc" }],
        take: 50,
        include: {
          court: { select: { name: true, nameAr: true } },
          venue: { select: { name: true, nameAr: true } },
        },
      });

      return NextResponse.json({
        statusCode: 200,
        message: "تم جلب الحجوزات",
        data: bookings,
      });
    }

    // Unauthenticated: require phone param (existing behavior)
    if (!phone || !/^01[0125]\d{8}$/.test(phone)) {
      return NextResponse.json(
        { statusCode: 400, message: "رقم تليفون غير صحيح", data: null },
        { status: 400 }
      );
    }

    const bookings = await prisma.booking.findMany({
      where: { playerPhone: phone },
      orderBy: [{ date: "desc" }, { startTime: "desc" }],
      take: 50,
      include: {
        court: { select: { name: true, nameAr: true } },
        venue: { select: { name: true, nameAr: true } },
      },
    });

    return NextResponse.json({
      statusCode: 200,
      message: "تم جلب الحجوزات",
      data: bookings,
    });
  } catch (error) {
    console.error("Get player bookings error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}

const DAY_MAP: Record<number, DayOfWeek> = {
  0: "SUNDAY",
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const parsed = bookingSchema.safeParse(body);

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

    const { courtId, date, startTime, blockCount, playerName, playerPhone, notes, level } =
      parsed.data;

    // Look up the court and its venue
    const court = await prisma.court.findUnique({
      where: { id: courtId },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            isActive: true,
            owner: { select: { id: true, email: true } },
          },
        },
      },
    });

    if (!court || !court.isActive) {
      return NextResponse.json(
        { statusCode: 404, message: "الكورت غير موجود", data: null },
        { status: 404 }
      );
    }

    if (!court.venue.isActive) {
      return NextResponse.json(
        { statusCode: 400, message: "الملعب غير متاح حاليا", data: null },
        { status: 400 }
      );
    }

    // Parse date and determine day of week
    const dateParts = date.split("-").map(Number);
    const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    const dayOfWeek = DAY_MAP[dateObj.getDay()];
    const dayGroup = getDayGroup(dayOfWeek);

    // Use a transaction for the availability check + booking + game creation
    const result = await prisma.$transaction(async (tx) => {
      // Try new ScheduleTemplate first, fall back to legacy TimeSlot
      const template = await tx.scheduleTemplate.findFirst({
        where: {
          courtId,
          dayGroup: { in: [dayGroup, "all"] },
          isActive: true,
        },
      });

      let endTime: string;
      let slotDuration: number;

      if (template) {
        // Validate against schedule template
        slotDuration = template.slotDuration;
        const requestedStartMin = timeToMinutes(startTime);
        const templateStartMin = timeToMinutes(template.startTime);
        const templateEndMin = timeToMinutes(template.endTime);
        const requestedEndMin = requestedStartMin + slotDuration * blockCount;

        // Check start time is within template range
        if (requestedStartMin < templateStartMin || requestedEndMin > templateEndMin) {
          throw new Error("SLOT_NOT_FOUND");
        }

        // Check start time aligns with slot grid
        if ((requestedStartMin - templateStartMin) % slotDuration !== 0) {
          throw new Error("SLOT_NOT_FOUND");
        }

        endTime = minutesToTime(requestedEndMin);
      } else {
        // Legacy fallback: check TimeSlot table
        const endTimeFromBody = parsed.data.endTime;
        if (!endTimeFromBody) {
          throw new Error("SLOT_NOT_FOUND");
        }
        endTime = endTimeFromBody;
        slotDuration = timeToMinutes(endTime) - timeToMinutes(startTime);

        const matchingSlot = await tx.timeSlot.findFirst({
          where: {
            courtId,
            dayOfWeek,
            startTime,
            endTime,
            isActive: true,
          },
        });

        if (!matchingSlot) {
          throw new Error("SLOT_NOT_FOUND");
        }
      }

      // Check for conflicting bookings (includes PENDING to block slots)
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

      // Calculate price based on duration
      const durationMinutes = timeToMinutes(endTime) - timeToMinutes(startTime);
      const durationHours = durationMinutes / 60;
      const totalPrice = court.pricePerHour.toNumber() * durationHours;

      const confirmationCode = generateCode();
      const gameCode = generateCode();

      const booking = await tx.booking.create({
        data: {
          courtId,
          venueId: court.venue.id,
          userId: session?.user?.id ?? null,
          playerName,
          playerPhone,
          date: new Date(date),
          startTime,
          endTime,
          blockCount,
          totalPrice,
          status: "PENDING",
          confirmationCode,
          notes: notes ?? null,
        },
      });

      // Create the Game and seed the creator as player 0
      const game = await tx.game.create({
        data: {
          bookingId: booking.id,
          gameCode,
          level: level ?? null,
          players: {
            create: {
              position: 0,
              playerName,
              playerPhone,
            },
          },
        },
      });

      return { booking, gameCode: game.gameCode, totalPrice, endTime };
    });

    const { booking, gameCode, totalPrice, endTime } = result;
    const venueName = court.venue.nameAr ?? court.venue.name;
    const courtName = court.nameAr ?? court.name;
    const pricePerPlayer = Math.ceil(Number(totalPrice) / 4);
    const gameLink = `https://badelz.app/game/${gameCode}`;

    // Fire-and-forget email notification to venue owner
    if (court.venue.owner?.email) {
      sendBookingNotification(court.venue.owner.email, {
        playerName,
        playerPhone,
        courtName,
        venueName,
        date,
        startTime,
        endTime,
        totalPrice: Number(totalPrice),
        confirmationCode: booking.confirmationCode,
      }).catch((err) => console.error("Email notification failed:", err));
    }

    // Fire-and-forget push notification to player (pending state)
    sendPushToPhone(playerPhone, {
      title: "تم إرسال طلب الحجز",
      body: `طلبك في ${venueName} الساعة ${startTime} - في انتظار تأكيد الملعب`,
      url: `/booking-confirmed/${booking.id}`,
      tag: `booking-${booking.confirmationCode}`,
      lang: "ar",
    }).catch((err) => console.error("Player push failed:", err));

    // Fire-and-forget push notification to venue owner
    if (court.venue.owner?.id) {
      sendPushToUser(court.venue.owner.id, {
        title: "طلب حجز جديد!",
        body: `${playerName} عايز يحجز ${courtName} الساعة ${startTime} - أكد أو ارفض`,
        url: "/bookings",
        tag: `owner-booking-${booking.confirmationCode}`,
        lang: "ar",
      }).catch((err) => console.error("Owner push failed:", err));
    }

    // Build WhatsApp share link using the game-aware format
    const whatsappShareLink = buildGameShareLink({
      gameCode,
      venueName,
      courtName,
      date,
      startTime,
      endTime,
      pricePerPlayer,
      spotsLeft: 3,
      level: level ?? undefined,
    });

    return NextResponse.json(
      {
        statusCode: 201,
        message: "تم إرسال طلب الحجز",
        data: {
          ...booking,
          venueName,
          courtName,
          gameCode,
          gameLink,
          whatsappShareLink,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "SLOT_NOT_FOUND") {
        return NextResponse.json(
          {
            statusCode: 400,
            message: "الميعاد ده مش متاح في الجدول",
            data: null,
          },
          { status: 400 }
        );
      }
      if (error.message === "SLOT_TAKEN") {
        return NextResponse.json(
          {
            statusCode: 409,
            message: "الميعاد ده محجوز بالفعل",
            data: null,
          },
          { status: 409 }
        );
      }
    }

    console.error("Create booking error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
