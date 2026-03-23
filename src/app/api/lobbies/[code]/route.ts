import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ code: string }> };

const MAX_PLAYERS = 4;

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { code } = await params;

    const lobby = await prisma.lobby.findUnique({
      where: { lobbyCode: code.toUpperCase() },
      include: {
        players: {
          orderBy: { position: "asc" },
          select: {
            position: true,
            playerName: true,
            playerPhone: true,
            confirmedAt: true,
          },
        },
      },
    });

    if (!lobby) {
      return NextResponse.json(
        { statusCode: 404, message: "اللوبي غير موجود", data: null },
        { status: 404 }
      );
    }

    // Fetch PlayerProfile for each player to get tier + gamesPlayed
    const playerPhones = lobby.players.map((p) => p.playerPhone);
    const profiles = await prisma.playerProfile.findMany({
      where: { phone: { in: playerPhones } },
      select: { phone: true, tier: true, gamesPlayed: true },
    });

    const profileMap = new Map(profiles.map((p) => [p.phone, p]));

    // Strip playerPhone from response (privacy) and enrich with profile data
    const enrichedPlayers = lobby.players.map((player) => {
      const profile = profileMap.get(player.playerPhone);
      return {
        position: player.position,
        playerName: player.playerName,
        confirmedAt: player.confirmedAt,
        tier: profile?.tier ?? "BRONZE",
        gamesPlayed: profile?.gamesPlayed ?? 0,
      };
    });

    const spotsLeft = MAX_PLAYERS - lobby.players.length;

    return NextResponse.json({
      statusCode: 200,
      message: "تم جلب بيانات اللوبي",
      data: {
        id: lobby.id,
        lobbyCode: lobby.lobbyCode,
        hostName: lobby.hostName,
        area: lobby.area,
        areaAr: lobby.areaAr,
        date: lobby.date,
        startTime: lobby.startTime,
        priceRange: lobby.priceRange,
        note: lobby.note,
        status: lobby.status,
        spotsLeft,
        playerCount: lobby.players.length,
        players: enrichedPlayers,
        createdAt: lobby.createdAt,
      },
    });
  } catch (error) {
    console.error("Get lobby error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { code } = await params;

    const body = await request.json();
    const hostPhone = body?.hostPhone;

    if (!hostPhone || typeof hostPhone !== "string") {
      return NextResponse.json(
        { statusCode: 400, message: "رقم الموبايل مطلوب", data: null },
        { status: 400 }
      );
    }

    const lobby = await prisma.lobby.findUnique({
      where: { lobbyCode: code.toUpperCase() },
    });

    if (!lobby) {
      return NextResponse.json(
        { statusCode: 404, message: "اللوبي غير موجود", data: null },
        { status: 404 }
      );
    }

    if (lobby.hostPhone !== hostPhone) {
      return NextResponse.json(
        { statusCode: 403, message: "فقط صاحب اللوبي يقدر يلغيه", data: null },
        { status: 403 }
      );
    }

    if (lobby.status === "CANCELLED") {
      return NextResponse.json(
        { statusCode: 410, message: "اللوبي ده اتلغى بالفعل", data: null },
        { status: 410 }
      );
    }

    await prisma.lobby.update({
      where: { id: lobby.id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({
      statusCode: 200,
      message: "تم إلغاء اللوبي بنجاح",
      data: { lobbyCode: lobby.lobbyCode, status: "CANCELLED" },
    });
  } catch (error) {
    console.error("Cancel lobby error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
