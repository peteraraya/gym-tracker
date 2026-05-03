import type { NextConfig } from "next";

let bundleAnalyzer = (c: NextConfig) => c;
try {
   
  const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' });
  bundleAnalyzer = withBundleAnalyzer;
} catch (e) {
  // bundle analyzer not installed — skip
}

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Only use static export for mobile builds
  // output: "export", // Commented out - only uncomment for mobile build
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hplrrjqgzefkdevbporx.supabase.co',
        pathname: '/storage/v1/object/public/routine-images/**',
      },
    ],
  },
  trailingSlash: true,
};

export default bundleAnalyzer(nextConfig);
