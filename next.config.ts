import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensures Next.js OG image generation and metadata use the correct base URL
  // in all environments (local, preview, production).
  env: {
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"),
  },
};

export default nextConfig;
