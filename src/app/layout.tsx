import type { Metadata, Viewport } from "next";
import { Cairo, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["600", "700", "800"],
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
  themeColor: "#0a0f1a",
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
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${barlowCondensed.variable} antialiased`}>
      <body className="min-h-screen bg-white text-gray-900 font-sans selection:bg-lime-300/40">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
