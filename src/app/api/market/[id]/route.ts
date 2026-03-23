import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { phoneSchema } from "@/lib/validators";

const markSoldSchema = z.object({
  sellerPhone: phoneSchema,
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const listing = await prisma.listing.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({
      statusCode: 200,
      message: "تم جلب البيانات بنجاح",
      data: listing,
    });
  } catch (error) {
    // Prisma P2025 = record not found for update
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      return NextResponse.json(
        { statusCode: 404, message: "غير موجود", data: null },
        { status: 404 }
      );
    }

    console.error("Get listing error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();
    const parsed = markSoldSchema.safeParse(body);

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

    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      return NextResponse.json(
        { statusCode: 404, message: "غير موجود", data: null },
        { status: 404 }
      );
    }

    if (listing.sellerPhone !== parsed.data.sellerPhone) {
      return NextResponse.json(
        { statusCode: 403, message: "غير مصرح لك", data: null },
        { status: 403 }
      );
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: { status: "SOLD" },
    });

    return NextResponse.json({
      statusCode: 200,
      message: "تم تحديث الإعلان بنجاح",
      data: updated,
    });
  } catch (error) {
    console.error("Mark listing sold error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
