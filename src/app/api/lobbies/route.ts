import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { lobbySchema } from "@/lib/validators";
import { customAlphabet } from "nanoid";
import { buildLobbyShareLink } from "@/lib/whatsapp";
import { notifyAreaPlayers } from "@/lib/push-notify-area";

const generateCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

const MAX_PLAYERS = 4;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const area = searchParams.get("area");
    const date = searchParams.get("date");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const skip = (page - 1) * limit;

    // Build today's date at midnight in Africa/Cairo for expiration filtering
    const now = new Date();
    const cairoDate = new Date(
      now.toLocaleString("en-US", { timeZone: "Africa/Cairo" })
    );
    const todayStart = new Date(
      cairoDate.getFullYear(),
      cairoDate.getMonth(),
      cairoDate.getDate()
    );

    const where: Record<string, unknown> = {
      status: "OPEN",
      date: { gte: todayStart },
    };

    if (area && area !== "all") {
      where.area = area;
    }

    const level = searchParams.get("level");
    if (level) {
      where.level = level;
    }

    if (date) {
      const [y, m, d] = date.split("-").map(Number);
      const filterDate = new Date(y, m - 1, d);
      where.date = filterDate;
    }

    const [lobbies, total] = await Promise.all([
      prisma.lobby.findMany({
        where,
        orderBy: { date: "asc" },
        skip,
        take: limit,
        select: {
          id: true,
          lobbyCode: true,
          hostName: true,
          area: true,
          areaAr: true,
          date: true,
          startTime: true,
          priceRange: true,
          note: true,
          level: true,
          status: true,
          createdAt: true,
          _count: { select: { players: true } },
        },
      }),
      prisma.lobby.count({ where }),
    ]);

    const data = lobbies.map((lobby) => ({
      ...lobby,
      playerCount: lobby._count.players,
      spotsLeft: MAX_PLAYERS - lobby._count.players,
      _count: undefined,
    }));

    return NextResponse.json({
      statusCode: 200,
      message: "تم جلب اللوبيات",
      data,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("List lobbies error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = lobbySchema.safeParse(body);

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

    const { hostName, hostPhone, area, areaAr, date, startTime, priceRange, note, level } =
      parsed.data;

    const session = await getServerSession(authOptions);
    const lobbyCode = generateCode();

    // Parse the date string to a Date object
    const [y, m, d] = date.split("-").map(Number);
    const lobbyDate = new Date(y, m - 1, d);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Lobby
      const lobby = await tx.lobby.create({
        data: {
          lobbyCode,
          hostName,
          hostPhone,
          hostUserId: session?.user?.id ?? null,
          area,
          areaAr: areaAr ?? null,
          date: lobbyDate,
          startTime: startTime ?? null,
          priceRange: priceRange ?? null,
          note: note ?? null,
          level: level ?? null,
        },
      });

      // 2. Create host as LobbyPlayer at position 0
      await tx.lobbyPlayer.create({
        data: {
          lobbyId: lobby.id,
          position: 0,
          playerName: hostName,
          playerPhone: hostPhone,
        },
      });

      return { lobby };
    });

    const { lobby } = result;

    const shareLink = buildLobbyShareLink({
      lobbyCode: lobby.lobbyCode,
      area: lobby.areaAr ?? lobby.area,
      date,
      startTime: lobby.startTime ?? undefined,
      priceRange: lobby.priceRange ?? undefined,
      level: lobby.level ?? undefined,
      spotsLeft: MAX_PLAYERS - 1, // Host is already in
    });

    // Fire-and-forget: notify area subscribers about new lobby
    notifyAreaPlayers(lobby.area, [hostPhone], {
      title: `لوبي جديد في ${lobby.areaAr ?? lobby.area}`,
      body: `${lobby.hostName} فتح لوبي — ${date}`,
      url: `/lobby/${lobby.lobbyCode}`,
      tag: `lobby-new-${lobby.area}`,
      lang: "ar",
    }).catch((err) => console.error("Area push (new lobby) failed:", err));

    return NextResponse.json(
      {
        statusCode: 201,
        message: "تم إنشاء اللوبي بنجاح",
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
          level: lobby.level,
          status: lobby.status,
          spotsLeft: MAX_PLAYERS - 1,
          shareLink,
          lobbyLink: `https://badelz.app/lobby/${lobby.lobbyCode}`,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create lobby error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
