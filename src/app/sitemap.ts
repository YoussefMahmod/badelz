import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://badelz.app";

  // Static pages
  const staticPages = [
    "/",
    "/browse",
    "/coaches",
    "/market",
    "/play",
    "/players",
    "/welcome",
  ];

  // Dynamic: active venues, active coaches, active listings
  const [venues, coaches, listings] = await Promise.all([
    prisma.venue.findMany({
      where: { isActive: true },
      select: { id: true, updatedAt: true },
    }),
    prisma.coach.findMany({
      where: { isActive: true },
      select: { id: true, updatedAt: true },
    }),
    prisma.listing.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, updatedAt: true },
    }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.8,
  }));

  const venueEntries: MetadataRoute.Sitemap = venues.map((venue) => ({
    url: `${baseUrl}/venues/${venue.id}`,
    lastModified: venue.updatedAt,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  const coachEntries: MetadataRoute.Sitemap = coaches.map((coach) => ({
    url: `${baseUrl}/coaches/${coach.id}`,
    lastModified: coach.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const listingEntries: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: `${baseUrl}/market/${listing.id}`,
    lastModified: listing.updatedAt,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  return [
    ...staticEntries,
    ...venueEntries,
    ...coachEntries,
    ...listingEntries,
  ];
}
