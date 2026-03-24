import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const coachOnboardingSchema = z.object({
  areas: z.array(z.string()).min(1, "اختار منطقة واحدة على الأقل"),
  whatsapp: z.string().optional(),
  pricePerHour: z.number().positive().optional(),
  experience: z.string().optional(),
  bio: z.string().max(500).optional(),
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

    if (session.user.role !== "COACH") {
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
    const parsed = coachOnboardingSchema.safeParse(body);

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

    const { areas, whatsapp, pricePerHour, experience, bio } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      const coach = await tx.coach.update({
        where: { userId: session.user.id },
        data: {
          areas,
          ...(whatsapp !== undefined && { whatsapp }),
          ...(pricePerHour !== undefined && { pricePerHour }),
          ...(experience !== undefined && { experience }),
          ...(bio !== undefined && { bio }),
        },
      });

      await tx.user.update({
        where: { id: session.user.id },
        data: { isOnboarded: true },
      });

      return coach;
    });

    return NextResponse.json(
      {
        statusCode: 200,
        message: "تم اكمال التسجيل",
        data: { coach: result, isOnboarded: true },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Coach onboarding error:", error);
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
