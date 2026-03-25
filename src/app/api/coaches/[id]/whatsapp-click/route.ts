import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.coach.update({
      where: { id },
      data: { whatsappClicks: { increment: 1 } },
    });

    return NextResponse.json({
      statusCode: 200,
      message: "تم التسجيل",
      data: null,
    });
  } catch {
    // Analytics should never fail visibly — swallow all errors
    return NextResponse.json({
      statusCode: 200,
      message: "ok",
      data: null,
    });
  }
}
