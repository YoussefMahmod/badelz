import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const action = body?.action;

    if (action !== "heart" && action !== "unheart") {
      return NextResponse.json(
        { statusCode: 400, message: "Invalid action", data: null },
        { status: 400 }
      );
    }

    if (action === "heart") {
      const coach = await prisma.coach.update({
        where: { id },
        data: { heartCount: { increment: 1 } },
        select: { heartCount: true },
      });

      return NextResponse.json({
        statusCode: 200,
        message: "تم",
        data: { heartCount: coach.heartCount },
      });
    }

    // unheart — decrement but floor at 0
    const current = await prisma.coach.findUnique({
      where: { id },
      select: { heartCount: true },
    });

    if (!current) {
      return NextResponse.json(
        { statusCode: 404, message: "غير موجود", data: null },
        { status: 404 }
      );
    }

    const newCount = Math.max(0, current.heartCount - 1);
    const coach = await prisma.coach.update({
      where: { id },
      data: { heartCount: newCount },
      select: { heartCount: true },
    });

    return NextResponse.json({
      statusCode: 200,
      message: "تم",
      data: { heartCount: coach.heartCount },
    });
  } catch {
    return NextResponse.json({
      statusCode: 200,
      message: "ok",
      data: null,
    });
  }
}
