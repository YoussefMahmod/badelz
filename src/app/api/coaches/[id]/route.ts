import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const coach = await prisma.coach.findUnique({
      where: { id },
    });

    if (!coach || !coach.isActive) {
      return NextResponse.json(
        { statusCode: 404, message: "غير موجود", data: null },
        { status: 404 }
      );
    }

    // Increment view count in the background (fire-and-forget)
    prisma.coach.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});

    return NextResponse.json({
      statusCode: 200,
      message: "تم جلب البيانات بنجاح",
      data: coach,
    });
  } catch (error) {
    console.error("Get coach error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
