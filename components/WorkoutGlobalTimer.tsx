'use client';

import React, { useState, useEffect } from 'react';
import { Timer } from '@/components/icons/lucide';

interface WorkoutGlobalTimerProps {
  startTime: number;
  isPaused?: boolean;
}

export function WorkoutGlobalTimer({ startTime, isPaused = false }: WorkoutGlobalTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.floor((now - startTime) / 1000);
      setElapsed(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isPaused]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <Timer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      <span className="text-sm font-mono font-semibold text-blue-900 dark:text-blue-100 tabular-nums">
        {formatTime(elapsed)}
      </span>
    </div>
  );
}
