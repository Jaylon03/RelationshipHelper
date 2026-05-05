import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack is default in Next.js 16 — empty config silences the warning
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
