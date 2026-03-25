import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/bookings",
        "/courts",
        "/settings",
        "/coach-dashboard",
      ],
    },
    sitemap: `${process.env.NEXT_PUBLIC_BASE_URL || "https://badelz.app"}/sitemap.xml`,
  };
}
