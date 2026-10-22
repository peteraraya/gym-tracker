'use client';

/**
 * Lazy loaded components for the Home page (/)
 *
 * Reduces initial bundle size by loading heavy animation components
 * on demand. The critical path (session stats, streak, routine cards)
 * loads synchronously; animations load after hydration.
 */

import dynamic from 'next/dynamic';

// ── Skeletons ─────────────────────────────────────────────────────────

const FlameSkeleton = () => (
  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 w-10 rounded-full" />
);

// ── Lazy: AnimatedFlame (framer-motion animation) ─────────────────────

export const AnimatedFlame = dynamic(() =>
  import('@/components/ui/AnimatedFlame').then((mod) => ({ default: mod.AnimatedFlame })),
  {
    loading: () => <FlameSkeleton />,
    ssr: false,
  }
);