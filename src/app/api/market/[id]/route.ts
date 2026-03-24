import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listingUpdateSchema } from "@/lib/validators";

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

/**
 * Check if the authenticated user owns the listing.
 * If the listing has a sellerId, compare directly.
 * For legacy listings (no sellerId), fall back to phone match and opportunistically link.
 */
async function checkOwnership(
  listingId: string,
  userId: string,
  userPhone: string | null | undefined
): Promise<{ owned: boolean; listing: Awaited<ReturnType<typeof prisma.listing.findUnique>> }> {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });

  if (!listing) return { owned: false, listing: null };

  // Direct sellerId match
  if (listing.sellerId === userId) return { owned: true, listing };

  // Legacy: no sellerId yet, match by phone and opportunistically link
  if (!listing.sellerId && userPhone && listing.sellerPhone === userPhone) {
    await prisma.listing.update({
      where: { id: listingId },
      data: { sellerId: userId },
    });
    return { owned: true, listing };
  }

  return { owned: false, listing };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { statusCode: 401, message: "سجل دخولك الأول عشان تعدل", data: null },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { owned, listing } = await checkOwnership(id, session.user.id, session.user.phone);

    if (!listing) {
      return NextResponse.json(
        { statusCode: 404, message: "غير موجود", data: null },
        { status: 404 }
      );
    }

    if (!owned) {
      return NextResponse.json(
        { statusCode: 403, message: "غير مصرح لك", data: null },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = listingUpdateSchema.safeParse(body);

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

    const updated = await prisma.listing.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({
      statusCode: 200,
      message: "تم تحديث الإعلان بنجاح",
      data: updated,
    });
  } catch (error) {
    console.error("Update listing error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { statusCode: 401, message: "سجل دخولك الأول", data: null },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { owned, listing } = await checkOwnership(id, session.user.id, session.user.phone);

    if (!listing) {
      return NextResponse.json(
        { statusCode: 404, message: "غير موجود", data: null },
        { status: 404 }
      );
    }

    if (!owned) {
      return NextResponse.json(
        { statusCode: 403, message: "غير مصرح لك", data: null },
        { status: 403 }
      );
    }

    const removed = await prisma.listing.update({
      where: { id },
      data: { status: "REMOVED" },
    });

    return NextResponse.json({
      statusCode: 200,
      message: "تم حذف الإعلان",
      data: removed,
    });
  } catch (error) {
    console.error("Delete listing error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
