import type { Metadata, Viewport } from "next";
import { Cairo, Lalezar, Anton } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { buildOrganizationJsonLd, buildWebAppJsonLd } from "@/lib/json-ld";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const lalezar = Lalezar({
  subsets: ["arabic", "latin"],
  variable: "--font-display-ar",
  display: "swap",
  weight: ["400"],
});

const anton = Anton({
  subsets: ["latin"],
  variable: "--font-display-en",
  display: "swap",
  weight: ["400"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://badelz.app"),
  title: "بادلز - Badelz | احجز كورت بادل",
  description: "احجز كورت بادل في مصر في ثواني. بدون مكالمات، بدون انتظار.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "بادلز",
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "بادلز - Badelz",
    description: "احجز كورت بادل في مصر في ثواني",
    type: "website",
    images: [{ url: "/icons/og-image.png", width: 1200, height: 630 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0d0d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${lalezar.variable} ${anton.variable} antialiased`}>
      <body className="min-h-screen bg-[#0d0d0d] text-white font-sans selection:bg-[#d4ff00]/30">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildWebAppJsonLd()) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
