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
    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-xl border border-blue-500/30 dark:border-blue-600/30 shadow-lg">
      <Timer className="w-5 h-5 text-blue-100" />
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-blue-100/80 uppercase tracking-wide">
          Duración entrenamiento
        </span>
        <span className="text-lg font-mono font-bold text-white tabular-nums">
          {formatTime(elapsed)}
        </span>
      </div>
    </div>
  );
}
