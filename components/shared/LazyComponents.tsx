"use client";

import { lazy, Suspense } from "react";
import { Loader2 } from "@/components/icons/lucide";

// Componente de loading reutilizable
const LoadingSpinner = ({ message = "Cargando..." }: { message?: string }) => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-6 h-6 animate-spin mr-2" />
    <span className="text-gray-600 dark:text-gray-400">{message}</span>
  </div>
);

// Lazy loading de componentes pesados
// BodyMap y ActivityHeatmap solo tienen named export → mapeamos al default esperado por lazy()
export const LazyBodyMap = lazy(() =>
  import("../features/body-map/BodyMap").then((mod) => ({ default: mod.BodyMap })),
);
export const LazyActivityHeatmap = lazy(() =>
  import("../features/progress/ActivityHeatmap").then((mod) => ({ default: mod.ActivityHeatmap })),
);
// ProgressCharts tiene default export → import directo
export const LazyProgressCharts = lazy(() => import("../features/progress/ProgressCharts"));

// HOC para wrappear componentes lazy con Suspense
export function withLazyLoading<T extends object>(
  Component: React.ComponentType<T>,
  loadingMessage?: string,
) {
  return function LazyWrapper(props: T) {
    return (
      <Suspense fallback={<LoadingSpinner message={loadingMessage} />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

// Componentes lazy pre-configurados
export const BodyMapLazy = withLazyLoading(
  LazyBodyMap,
  "Cargando mapa corporal...",
);
export const ActivityHeatmapLazy = withLazyLoading(
  LazyActivityHeatmap,
  "Cargando estadísticas...",
);
export const ProgressChartsLazy = withLazyLoading(
  LazyProgressCharts,
  "Cargando gráficos...",
);
