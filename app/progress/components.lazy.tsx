'use client';

/**
 * Lazy loaded components for Progress page
 * 
 * Reduces initial bundle size by loading visualization components on demand
 */

import dynamic from 'next/dynamic';

// Skeleton component for loading state
const ChartSkeleton = () => (
  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-lg" />
);

// Lazy loaded visualization components
export const ActivityHeatmap = dynamic(() => import('@/components/features/progress/ActivityHeatmap').then(mod => ({ default: mod.ActivityHeatmap })), {
  loading: () => <ChartSkeleton />,
  ssr: false
});

export const ProgressCharts = dynamic(() => import('@/components/features/progress/ProgressCharts').then(mod => ({ default: mod.ProgressCharts })), {
  loading: () => <ChartSkeleton />,
  ssr: false
});
