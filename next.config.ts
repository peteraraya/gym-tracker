import type { NextConfig } from "next";

let bundleAnalyzer = (c: NextConfig) => c;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
  });
  bundleAnalyzer = withBundleAnalyzer;
} catch {
  // bundle analyzer not installed — skip
}

let withSentry = (c: NextConfig) => c;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sentryPlugin = require("@sentry/nextjs/plugin");
  withSentry = sentryPlugin();
} catch {
  // Sentry plugin not installed — skip
}

const isMobileBuild = process.env.NEXT_MOBILE_BUILD === 'true';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@phosphor-icons/react",
      "phosphor-react",
    ],
    // typedRoutes: true, // Requiere migrar todas las rutas string a Route<T> — pendiente
  },
  output: isMobileBuild ? "export" : "standalone",
  // Only use static export for mobile builds
  // output: "export", // Commented out - only uncomment for mobile build
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hplrrjqgzefkdevbporx.supabase.co",
        pathname: "/storage/v1/object/public/routine-images/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [320, 420, 768, 1024, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 200, 256, 300],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  trailingSlash: true,
};

export default withSentry(bundleAnalyzer(nextConfig));
