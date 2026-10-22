'use client';

/**
 * Lazy loaded components for the Achievements page (/achievements)
 *
 * Reduces initial bundle size by loading the achievements grid on demand.
 */

import dynamic from 'next/dynamic';

const AchievementsSkeleton = () => (
  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-2xl" />
);

export const AchievementsGrid = dynamic(() =>
  import('@/components/features/achievements/AchievementsGrid').then(
    (mod) => ({ default: mod.default })
  ),
  {
    loading: () => <AchievementsSkeleton />,
    ssr: false,
  }
);

export const AchievementDebugPanel = dynamic(() =>
  import('@/components/features/achievements/AchievementDebugPanel').then(
    (mod) => ({ default: mod.AchievementDebugPanel })
  ),
  {
    loading: () => null,
    ssr: false,
  }
);