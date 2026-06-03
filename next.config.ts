import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma generates the client into src/generated/prisma — exclude from server bundles
  serverExternalPackages: ["@prisma/client", "bcryptjs"],

  // Tighten image security
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
