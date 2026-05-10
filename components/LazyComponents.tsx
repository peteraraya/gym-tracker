'use client';

import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Componente de loading reutilizable
const LoadingSpinner = ({ message = 'Cargando...' }: { message?: string }) => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-6 h-6 animate-spin mr-2" />
    <span className="text-gray-600 dark:text-gray-400">{message}</span>
  </div>
);

// Lazy loading de componentes pesados
export const LazyBodyMap = lazy(() => import('./BodyMap').then((mod: any) => ({ default: mod.BodyMap || mod.default })));
export const LazyActivityHeatmap = lazy(() => import('./ActivityHeatmap').then((mod: any) => ({ default: mod.ActivityHeatmap || mod.default })));
export const LazyProgressCharts = lazy(() => import('./ProgressCharts').then((mod: any) => ({ default: mod.default || mod.ProgressCharts })));
// Note: AIAssistant and ExerciseDatabase components are not present as separate files.
// If/when they are added, map their named/default exports here like the others.

// HOC para wrappear componentes lazy con Suspense
export function withLazyLoading<T extends object>(
  Component: React.ComponentType<T>,
  loadingMessage?: string
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
export const BodyMapLazy = withLazyLoading(LazyBodyMap, 'Cargando mapa corporal...');
export const ActivityHeatmapLazy = withLazyLoading(LazyActivityHeatmap, 'Cargando estadísticas...');
export const ProgressChartsLazy = withLazyLoading(LazyProgressCharts, 'Cargando gráficos...');
// Aliases for heavy components
export const AIAssistantLazy = undefined as unknown as React.ComponentType<any>;
export const ExerciseDatabaseLazy = undefined as unknown as React.ComponentType<any>;