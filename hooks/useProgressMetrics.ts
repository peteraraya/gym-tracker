import { useSessions } from "@/context/GymContext";
import { useMemo } from "react";
import { calculateProgressMetrics } from "@/lib/progress/progressAggregator";
import type { ProgressMetrics } from "@/lib/progress/progressAggregator";
import type { WorkoutSession } from "@/types";

/**
 * Custom hook that computes progress metrics from user's workout sessions
 * Provides memoized metrics that update when sessions change
 */
export function useProgressMetrics() {
  const { sessions } = useSessions();
  
  // In a real app, we would get user's weight and gender from profile
  // For now, using default values - this could be enhanced with useUserProfile hook
  const DEFAULT_USER_WEIGHT_KG = 75;
  const DEFAULT_USER_GENDER: 'male' | 'female' = 'male';

  const progressMetrics = useMemo<ProgressMetrics>(() => {
    return calculateProgressMetrics(
      sessions || [],
      DEFAULT_USER_WEIGHT_KG,
      DEFAULT_USER_GENDER
    );
  }, [sessions]);

  return progressMetrics;
}

export default useProgressMetrics;