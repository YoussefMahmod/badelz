import { prisma } from "@/lib/prisma";

export async function getGameForMeta(code: string) {
  const game = await prisma.game.findUnique({
    where: { gameCode: code.toUpperCase() },
    select: {
      status: true,
      players: { select: { position: true } },
      booking: {
        select: {
          date: true,
          startTime: true,
          endTime: true,
          totalPrice: true,
          venue: { select: { name: true, nameAr: true, coverPhoto: true } },
          court: { select: { name: true, nameAr: true } },
        },
      },
    },
  });

  return game;
}

export async function getBookingForMeta(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      date: true,
      startTime: true,
      endTime: true,
      venue: { select: { name: true, nameAr: true, coverPhoto: true } },
      court: { select: { name: true, nameAr: true } },
    },
  });

  return booking;
}

export async function getLobbyForMeta(code: string) {
  return prisma.lobby.findUnique({
    where: { lobbyCode: code.toUpperCase() },
    select: {
      status: true,
      area: true,
      areaAr: true,
      date: true,
      startTime: true,
      priceRange: true,
      players: { select: { position: true } },
    },
  });
}
