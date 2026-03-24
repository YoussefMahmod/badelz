import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface ChecklistItem {
  id: string;
  completed: boolean;
  href?: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { statusCode: 401, message: "Unauthorized", data: null },
        { status: 401 }
      );
    }

    const { role, id: userId } = session.user;
    let items: ChecklistItem[] = [];

    if (role === "VENUE_OWNER") {
      // Fetch venue with courts, time slots, and bookings count
      const venue = await prisma.venue.findFirst({
        where: { ownerId: userId },
        select: {
          id: true,
          courts: {
            select: {
              id: true,
              slots: { select: { id: true }, take: 1 },
            },
          },
          _count: { select: { bookings: true } },
        },
      });

      const hasVenue = !!venue;
      const hasCourts = (venue?.courts?.length ?? 0) > 0;
      const hasTimeSlots = venue?.courts?.some((c) => c.slots.length > 0) ?? false;
      const hasBookings = (venue?._count?.bookings ?? 0) > 0;

      items = [
        { id: "createAccount", completed: true },
        { id: "addVenueInfo", completed: hasVenue, href: "/onboarding" },
        { id: "addFirstCourt", completed: hasCourts, href: hasVenue ? "/courts" : "/onboarding" },
        {
          id: "setupTimeSlots",
          completed: hasTimeSlots,
          href: hasCourts ? `/courts/${venue?.courts?.[0]?.id}/slots` : "/courts",
        },
        { id: "getFirstBooking", completed: hasBookings },
      ];
    } else if (role === "PLAYER") {
      // Fetch player profile and bookings
      const [playerProfile, bookingsCount] = await Promise.all([
        prisma.playerProfile.findUnique({
          where: { userId },
          select: { area: true, gamesPlayed: true, tier: true },
        }),
        prisma.booking.count({
          where: { userId },
        }),
      ]);

      const hasArea = !!playerProfile?.area;
      const hasBooking = bookingsCount > 0;
      const hasPlayedGame = (playerProfile?.gamesPlayed ?? 0) > 0;
      const isAboveBronze = !!playerProfile?.tier && playerProfile.tier !== "BRONZE";

      items = [
        { id: "createAccount", completed: true },
        { id: "selectArea", completed: hasArea, href: "/onboarding" },
        { id: "bookFirstCourt", completed: hasBooking, href: "/browse" },
        { id: "playFirstGame", completed: hasPlayedGame },
        { id: "reachGold", completed: isAboveBronze },
      ];
    } else if (role === "COACH") {
      // Fetch coach profile
      const coachProfile = await prisma.coach.findUnique({
        where: { userId },
        select: { bio: true, pricePerHour: true },
      });

      const isOnboarded = session.user.isOnboarded as boolean;
      const hasBio = !!coachProfile?.bio && coachProfile.bio.trim().length > 0;
      const hasPricing = coachProfile?.pricePerHour !== null && coachProfile?.pricePerHour !== undefined;

      items = [
        { id: "createAccount", completed: true },
        { id: "setupProfile", completed: isOnboarded, href: "/onboarding" },
        { id: "addBio", completed: hasBio, href: "/coach-dashboard" },
        { id: "setPricing", completed: hasPricing, href: "/coach-dashboard" },
        { id: "getFirstContact", completed: false },
      ];
    }

    const completed = items.filter((item) => item.completed).length;
    const total = items.length;

    return NextResponse.json({
      statusCode: 200,
      message: "Checklist fetched",
      data: { items, completed, total },
    });
  } catch (error) {
    console.error("Checklist error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "Server error", data: null },
      { status: 500 }
    );
  }
}
