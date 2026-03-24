import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ownerOnboardingSchema = z.object({
  venue: z.object({
    name: z.string().min(2),
    nameAr: z.string().optional(),
    address: z.string().min(5),
    addressAr: z.string().optional(),
    city: z.string().min(2),
    cityAr: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    phone: z.string().min(8),
    whatsapp: z.string().optional(),
  }),
  court: z.object({
    name: z.string().min(1),
    nameAr: z.string().optional(),
    pricePerHour: z.number().positive(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          statusCode: 401,
          message: "يجب تسجيل الدخول",
          data: null,
        },
        { status: 401 }
      );
    }

    if (session.user.role !== "VENUE_OWNER") {
      return NextResponse.json(
        {
          statusCode: 403,
          message: "غير مسموح لك بهذا الإجراء",
          data: null,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = ownerOnboardingSchema.safeParse(body);

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

    const { venue: venueData, court: courtData } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      const venue = await tx.venue.create({
        data: {
          ownerId: session.user.id,
          name: venueData.name,
          nameAr: venueData.nameAr,
          address: venueData.address,
          addressAr: venueData.addressAr,
          city: venueData.city,
          cityAr: venueData.cityAr,
          latitude: venueData.latitude,
          longitude: venueData.longitude,
          phone: venueData.phone,
          whatsapp: venueData.whatsapp,
          sportTypes: ["PADEL"],
        },
      });

      const court = await tx.court.create({
        data: {
          venueId: venue.id,
          name: courtData.name,
          nameAr: courtData.nameAr,
          pricePerHour: courtData.pricePerHour,
        },
      });

      await tx.user.update({
        where: { id: session.user.id },
        data: { isOnboarded: true },
      });

      return { venue, court };
    });

    return NextResponse.json(
      {
        statusCode: 201,
        message: "تم اكمال التسجيل",
        data: { venue: result.venue, court: result.court, isOnboarded: true },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Owner onboarding error:", error);
    return NextResponse.json(
      {
        statusCode: 500,
        message: "حدث خطأ في السيرفر",
        data: null,
      },
      { status: 500 }
    );
  }
}
