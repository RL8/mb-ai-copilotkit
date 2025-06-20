import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_BUILD_DATE: new Date().toISOString(),
    NEXT_PUBLIC_VERSION: process.env.npm_package_version || '1.0.0',
  },
  // External packages for server components
  serverExternalPackages: [],
};

export default nextConfig;
