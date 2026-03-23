import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validators";
import { customAlphabet } from "nanoid";
import { DayOfWeek } from "@prisma/client";
import { buildGameShareLink } from "@/lib/whatsapp";

const generateCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const phone = searchParams.get("phone");

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

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export async function POST(request: NextRequest) {
  try {
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

    const { courtId, date, startTime, endTime, playerName, playerPhone, notes } =
      parsed.data;

    // Validate startTime < endTime
    if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: "وقت البداية لازم يكون قبل وقت النهاية",
          data: null,
        },
        { status: 400 }
      );
    }

    // Look up the court and its venue
    const court = await prisma.court.findUnique({
      where: { id: courtId },
      include: { venue: { select: { id: true, name: true, nameAr: true, isActive: true } } },
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

    // Use a transaction for the availability check + booking + game creation
    const result = await prisma.$transaction(async (tx) => {
      // Check that a matching TimeSlot template exists
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

      // Check for conflicting bookings on the same court + date
      const conflicting = await tx.booking.findFirst({
        where: {
          courtId,
          date: new Date(date),
          status: { not: "CANCELLED" },
          OR: [
            {
              // Existing booking starts before new one ends, and existing ends after new one starts
              AND: [
                { startTime: { lt: endTime } },
                { endTime: { gt: startTime } },
              ],
            },
          ],
        },
      });

      if (conflicting) {
        throw new Error("SLOT_TAKEN");
      }

      // Calculate duration in hours for pricing
      const durationMinutes = timeToMinutes(endTime) - timeToMinutes(startTime);
      const durationHours = durationMinutes / 60;
      const totalPrice = court.pricePerHour.toNumber() * durationHours;

      const confirmationCode = generateCode();
      const gameCode = generateCode();

      const booking = await tx.booking.create({
        data: {
          courtId,
          venueId: court.venue.id,
          playerName,
          playerPhone,
          date: new Date(date),
          startTime,
          endTime,
          totalPrice,
          status: "CONFIRMED",
          confirmationCode,
          notes: notes ?? null,
        },
      });

      // Create the Game and seed the creator as player 0
      const game = await tx.game.create({
        data: {
          bookingId: booking.id,
          gameCode,
          players: {
            create: {
              position: 0,
              playerName,
              playerPhone,
            },
          },
        },
      });

      return { booking, gameCode: game.gameCode, totalPrice };
    });

    const { booking, gameCode, totalPrice } = result;
    const venueName = court.venue.nameAr ?? court.venue.name;
    const courtName = court.nameAr ?? court.name;
    const pricePerPlayer = Math.ceil(Number(totalPrice) / 4);
    const gameLink = `https://badelz.app/game/${gameCode}`;

    // Build WhatsApp share link using the game-aware format
    const whatsappShareLink = buildGameShareLink({
      gameCode,
      venueName,
      courtName,
      date,
      startTime,
      endTime,
      pricePerPlayer,
      spotsLeft: 3, // creator is already in, 3 spots remain
    });

    return NextResponse.json(
      {
        statusCode: 201,
        message: "تم الحجز بنجاح",
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
