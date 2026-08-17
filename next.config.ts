import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Image Docker minimale : ne copie que server.js + les deps effectivement
  // utilisees au runtime, au lieu de node_modules complet (voir Dockerfile).
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: process.env.INTERNAL_BACKEND_URL
          ? `${process.env.INTERNAL_BACKEND_URL}/api/v1/:path*`
          : "http://127.0.0.1:8000/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
