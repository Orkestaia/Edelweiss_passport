import type { NextConfig } from "next";
const config: NextConfig = {
  turbopack: { root: process.cwd() },
  logging: { incomingRequests: false, fetches: { fullUrl: false } },
  images: { deviceSizes: [640, 828, 1200, 2048], imageSizes: [48, 96, 192, 384] },
  async headers() {
    return [
      { source: "/:path*", headers: [{ key: "Referrer-Policy", value: "no-referrer" }, { key: "X-Content-Type-Options", value: "nosniff" }, { key: "X-Frame-Options", value: "DENY" }] },
      { source: "/p/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }] }
    ];
  }
};
export default config;
