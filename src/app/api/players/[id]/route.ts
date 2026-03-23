import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const player = await prisma.playerProfile.findUnique({
      where: { id },
    });

    if (!player) {
      return NextResponse.json(
        { statusCode: 404, message: "غير موجود", data: null },
        { status: 404 }
      );
    }

    return NextResponse.json({
      statusCode: 200,
      message: "تم جلب البيانات بنجاح",
      data: player,
    });
  } catch (error) {
    console.error("Get player error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
