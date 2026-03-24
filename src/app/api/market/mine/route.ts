import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { statusCode: 401, message: "سجل دخولك الأول", data: null },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userPhone = session.user.phone;

    // Build OR conditions: match by sellerId, or by phone for legacy unlinked listings
    const orConditions: Record<string, unknown>[] = [{ sellerId: userId }];

    if (userPhone) {
      orConditions.push({ sellerPhone: userPhone, sellerId: null });
    }

    const listings = await prisma.listing.findMany({
      where: { OR: orConditions },
      orderBy: { createdAt: "desc" },
    });

    // Opportunistically link any unlinked listings found by phone match
    const unlinkedIds = listings
      .filter((l) => !l.sellerId && userPhone && l.sellerPhone === userPhone)
      .map((l) => l.id);

    if (unlinkedIds.length > 0) {
      await prisma.listing.updateMany({
        where: { id: { in: unlinkedIds } },
        data: { sellerId: userId },
      });
    }

    return NextResponse.json({
      statusCode: 200,
      message: "تم جلب إعلاناتك",
      data: listings,
    });
  } catch (error) {
    console.error("My listings error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
