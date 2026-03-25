import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { joinLobbySchema } from "@/lib/validators";
import { sendPushToPhone } from "@/lib/push";

type RouteParams = { params: Promise<{ code: string }> };

const MAX_PLAYERS = 4;

const ERROR_RESPONSES = {
  LOBBY_NOT_FOUND: {
    statusCode: 404,
    status: 404 as const,
    message: "اللوبي غير موجود",
  },
  LOBBY_CANCELLED: {
    statusCode: 410,
    status: 410 as const,
    message: "اللوبي ده اتلغى",
  },
  LOBBY_EXPIRED: {
    statusCode: 410,
    status: 410 as const,
    message: "اللوبي ده انتهى",
  },
  LOBBY_FULL: {
    statusCode: 409,
    status: 409 as const,
    message: "اللوبي مكتمل — مفيش أماكن فاضية",
  },
  ALREADY_JOINED: {
    statusCode: 409,
    status: 409 as const,
    message: "انت مسجل في اللوبي ده بالفعل",
  },
} as const;

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { code } = await params;

    const body = await request.json();
    const parsed = joinLobbySchema.safeParse(body);

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

    const { playerName, playerPhone } = parsed.data;
    const lobbyCode = code.toUpperCase();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Find lobby with its current players
      const lobby = await tx.lobby.findUnique({
        where: { lobbyCode },
        include: {
          players: {
            select: { position: true, playerPhone: true },
          },
        },
      });

      // --- Guard checks ---
      if (!lobby) {
        throw new Error("LOBBY_NOT_FOUND");
      }

      if (lobby.status === "CANCELLED") {
        throw new Error("LOBBY_CANCELLED");
      }

      if (lobby.status === "EXPIRED") {
        throw new Error("LOBBY_EXPIRED");
      }

      if (lobby.status === "FULL" || lobby.players.length >= MAX_PLAYERS) {
        throw new Error("LOBBY_FULL");
      }

      if (lobby.players.some((p) => p.playerPhone === playerPhone)) {
        throw new Error("ALREADY_JOINED");
      }

      // 5. Find next available position (0-3)
      const takenPositions = new Set(lobby.players.map((p) => p.position));
      let nextPosition = -1;
      for (let i = 0; i < MAX_PLAYERS; i++) {
        if (!takenPositions.has(i)) {
          nextPosition = i;
          break;
        }
      }

      // 6. Create LobbyPlayer
      await tx.lobbyPlayer.create({
        data: {
          lobbyId: lobby.id,
          position: nextPosition,
          playerName,
          playerPhone,
        },
      });

      const newPlayerCount = lobby.players.length + 1;
      const isFull = newPlayerCount >= MAX_PLAYERS;

      // 7. Transition to FULL when 4th player joins
      if (isFull) {
        await tx.lobby.update({
          where: { id: lobby.id },
          data: { status: "FULL" },
        });
      }

      return {
        position: nextPosition,
        playerName,
        playerPhone,
        hostPhone: lobby.hostPhone,
        spotsLeft: MAX_PLAYERS - newPlayerCount,
        lobbyStatus: isFull ? ("FULL" as const) : lobby.status,
      };
    });

    // Fire-and-forget push notification to lobby host
    sendPushToPhone(result.hostPhone, {
      title: "لاعب جديد في اللوبي!",
      body: result.spotsLeft === 0
        ? `${result.playerName} انضم — اللوبي مكتمل!`
        : `${result.playerName} انضم — فاضل ${result.spotsLeft}`,
      url: `/lobby/${code.toUpperCase()}`,
      tag: `lobby-${code.toUpperCase()}`,
      lang: "ar",
    }).catch((err) => console.error("Lobby push failed:", err));

    return NextResponse.json(
      {
        statusCode: 200,
        message: "تم تسجيلك في اللوبي بنجاح",
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      const mapped =
        ERROR_RESPONSES[error.message as keyof typeof ERROR_RESPONSES];
      if (mapped) {
        return NextResponse.json(
          { statusCode: mapped.statusCode, message: mapped.message, data: null },
          { status: mapped.status }
        );
      }
    }

    console.error("Join lobby error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
