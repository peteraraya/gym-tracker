'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

interface MinimizedTimerProps {
  timeLeft: number;
  title?: string;
  onExpand: () => void;
  onSkip: () => void;
}

export function MinimizedTimer({ 
  timeLeft, 
  title = 'Descanso',
  onExpand,
  onSkip 
}: MinimizedTimerProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-2xl border-2 border-white/20 backdrop-blur-sm">
        <div className="px-4 py-3 flex items-center gap-3">
          {/* Timer display */}
          <button
            onClick={onExpand}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-xs font-semibold opacity-90">{title}</span>
            <span className="text-2xl font-bold tabular-nums">
              {formatTime(timeLeft)}
            </span>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-1 border-l border-white/20 pl-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onExpand}
              className="text-white hover:bg-white/20 p-2 h-8 w-8"
              title="Expandir"
            >
              ⬆️
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-white hover:bg-white/20 p-2 h-8 w-8"
              title="Saltar"
            >
              ⏭️
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/20 rounded-b-2xl overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-1000"
            style={{ 
              width: timeLeft <= 10 ? '100%' : `${(timeLeft % 60) / 60 * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
}
