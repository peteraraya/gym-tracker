import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Only use static export for mobile builds
  // output: "export", // Commented out - only uncomment for mobile build
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
