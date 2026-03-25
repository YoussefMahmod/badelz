import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") || "بادلز - Badelz";
  const subtitle = searchParams.get("subtitle") || "احجز كورت بادل في مصر في ثواني";

  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0a0f1a"/>
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#c8ff00" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#0a0f1a" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <text x="600" y="175" text-anchor="middle" font-family="Arial,sans-serif" font-size="30" font-weight="700" fill="#c8ff00" letter-spacing="5">BADELZ</text>
  <rect x="560" y="200" width="80" height="3" rx="1.5" fill="#c8ff00"/>
  <text x="600" y="310" text-anchor="middle" font-family="Arial,sans-serif" font-size="46" font-weight="800" fill="white">${escapeXml(title)}</text>
  <text x="600" y="380" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" fill="#ffffff99">${escapeXml(subtitle)}</text>
  <text x="600" y="575" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" font-weight="600" fill="#c8ff00">badelz.app</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
