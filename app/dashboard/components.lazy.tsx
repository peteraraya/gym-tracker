'use client';

/**
 * Lazy loaded components for Dashboard
 * 
 * Reduces initial bundle size by loading heavy components on demand
 */

import dynamic from 'next/dynamic';

// Skeleton component for loading state
const ChartSkeleton = () => (
  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-lg" />
);

const StatsSkeleton = () => (
  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-48 rounded-lg" />
);

// Lazy loaded chart components
export const VolumeChart = dynamic(() => import('@/components/features/progress/VolumeChart').then(mod => ({ default: mod.VolumeChart })), {
  loading: () => <ChartSkeleton />,
  ssr: false
});

export const ActivityHeatmap = dynamic(() => import('@/components/features/progress/ActivityHeatmap').then(mod => ({ default: mod.ActivityHeatmap })), {
  loading: () => <ChartSkeleton />,
  ssr: false
});

// Lazy loaded stats components
export const MuscleGroupStats = dynamic(() => import('@/components/features/progress/MuscleGroupStats').then(mod => ({ default: mod.MuscleGroupStats })), {
  loading: () => <StatsSkeleton />,
  ssr: false
});

export const PersonalRecords = dynamic(() => import('@/components/features/progress/PersonalRecords').then(mod => ({ default: mod.PersonalRecords })), {
  loading: () => <StatsSkeleton />,
  ssr: false
});

export const TrainingFrequency = dynamic(() => import('@/components/features/progress/TrainingFrequency').then(mod => ({ default: mod.TrainingFrequency })), {
  loading: () => <StatsSkeleton />,
  ssr: false
});

export const StrengthProgression = dynamic(() => import('@/components/features/progress/StrengthProgression').then(mod => ({ default: mod.StrengthProgression })), {
  loading: () => <StatsSkeleton />,
  ssr: false
});

export const ProgressDashboard = dynamic(() => import('@/components/features/progress/ProgressDashboard').then(mod => ({ default: mod.ProgressDashboard })), {
  loading: () => <StatsSkeleton />,
  ssr: false
});
