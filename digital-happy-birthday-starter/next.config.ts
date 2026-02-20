import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Externalize native Node modules that can't be bundled
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
