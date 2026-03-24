import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const playerOnboardingSchema = z.object({
  area: z.string().min(1, "المنطقة مطلوبة"),
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

    if (session.user.role !== "PLAYER") {
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
    const parsed = playerOnboardingSchema.safeParse(body);

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

    const { area } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      const profile = await tx.playerProfile.update({
        where: { userId: session.user.id },
        data: { area },
      });

      await tx.user.update({
        where: { id: session.user.id },
        data: { isOnboarded: true },
      });

      return profile;
    });

    return NextResponse.json(
      {
        statusCode: 200,
        message: "تم اكمال التسجيل",
        data: { profile: result, isOnboarded: true },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Player onboarding error:", error);
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
