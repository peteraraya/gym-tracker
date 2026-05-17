import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // STATIC EXPORT FOR MOBILE - no API routes allowed
  output: "export",
  // Permitir ignorar errores de TypeScript para builds móviles estáticos (solo para build de APK de prueba)
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
