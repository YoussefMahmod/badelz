import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [venues, coaches, players] = await Promise.all([
      prisma.venue.count({ where: { isFoundingVenue: true } }),
      prisma.coach.count({ where: { isPioneerCoach: true } }),
      prisma.playerProfile.count({ where: { isEarlyAdopter: true } }),
    ]);

    return NextResponse.json({
      statusCode: 200,
      data: { venues, coaches, players },
    });
  } catch {
    return NextResponse.json({
      statusCode: 500,
      data: { venues: 0, coaches: 0, players: 0 },
    });
  }
}
