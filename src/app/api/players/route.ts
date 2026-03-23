import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const area = searchParams.get("area");
    const tier = searchParams.get("tier");
    const phone = searchParams.get("phone");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const skip = (page - 1) * limit;

    // Phone lookup — find a single player by phone
    if (phone) {
      const player = await prisma.playerProfile.findUnique({
        where: { phone },
      });

      if (!player) {
        return NextResponse.json(
          { statusCode: 404, message: "مفيش كارت لسه", data: null },
          { status: 404 }
        );
      }

      return NextResponse.json({
        statusCode: 200,
        message: "تم جلب البيانات بنجاح",
        data: player,
      });
    }

    // Leaderboard — list players with gamesPlayed > 0
    const where: Prisma.PlayerProfileWhereInput = {
      gamesPlayed: { gt: 0 },
    };

    if (area) {
      where.area = area;
    }

    if (tier) {
      where.tier = tier as Prisma.EnumPlayerTierFilter;
    }

    const [players, total] = await Promise.all([
      prisma.playerProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { gamesPlayed: "desc" },
      }),
      prisma.playerProfile.count({ where }),
    ]);

    return NextResponse.json({
      statusCode: 200,
      message: "تم جلب البيانات بنجاح",
      data: players,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("List players error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
