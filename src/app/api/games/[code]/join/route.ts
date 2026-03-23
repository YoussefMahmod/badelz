import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { joinGameSchema } from "@/lib/validators";

type RouteParams = { params: Promise<{ code: string }> };

const MAX_PLAYERS = 4;

const ERROR_RESPONSES = {
  GAME_NOT_FOUND: {
    statusCode: 404,
    status: 404 as const,
    message: "اللعبة غير موجودة",
  },
  GAME_CANCELLED: {
    statusCode: 410,
    status: 410 as const,
    message: "اللعبة دي اتلغت",
  },
  GAME_FULL: {
    statusCode: 409,
    status: 409 as const,
    message: "اللعبة مكتملة — مفيش أماكن فاضية",
  },
  ALREADY_JOINED: {
    statusCode: 409,
    status: 409 as const,
    message: "انت مسجل في اللعبة دي بالفعل",
  },
} as const;

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { code } = await params;

    const body = await request.json();
    const parsed = joinGameSchema.safeParse(body);

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
    const gameCode = code.toUpperCase();

    const result = await prisma.$transaction(async (tx) => {
      const game = await tx.game.findUnique({
        where: { gameCode },
        include: {
          players: {
            select: { position: true, playerPhone: true },
          },
        },
      });

      // --- Guard checks ---
      if (!game) {
        throw new Error("GAME_NOT_FOUND");
      }

      if (game.status === "CANCELLED") {
        throw new Error("GAME_CANCELLED");
      }

      if (game.status === "FULL" || game.players.length >= MAX_PLAYERS) {
        throw new Error("GAME_FULL");
      }

      if (game.players.some((p) => p.playerPhone === playerPhone)) {
        throw new Error("ALREADY_JOINED");
      }

      // Find next available position (0-3)
      const takenPositions = new Set(game.players.map((p) => p.position));
      let nextPosition = -1;
      for (let i = 0; i < MAX_PLAYERS; i++) {
        if (!takenPositions.has(i)) {
          nextPosition = i;
          break;
        }
      }

      const player = await tx.gamePlayer.create({
        data: {
          gameId: game.id,
          position: nextPosition,
          playerName,
          playerPhone,
        },
      });

      const newPlayerCount = game.players.length + 1;
      const isFull = newPlayerCount >= MAX_PLAYERS;

      // Transition to FULL when the 4th player joins
      if (isFull) {
        await tx.game.update({
          where: { id: game.id },
          data: { status: "FULL" },
        });
      }

      return {
        position: player.position,
        playerName: player.playerName,
        spotsLeft: MAX_PLAYERS - newPlayerCount,
        gameStatus: isFull ? ("FULL" as const) : game.status,
      };
    });

    return NextResponse.json(
      {
        statusCode: 200,
        message: "تم تسجيلك في اللعبة بنجاح",
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

    console.error("Join game error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
