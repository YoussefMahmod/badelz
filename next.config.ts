import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

// Serwist (service worker) only in production builds — it requires webpack,
// which conflicts with Turbopack used in dev mode.
let config: NextConfig = nextConfig;
if (process.env.NODE_ENV === "production") {
  const withSerwist = require("@serwist/next").default;
  config = withSerwist({
    swSrc: "src/app/sw.ts",
    swDest: "public/sw.js",
  })(nextConfig);
}

export default config;
