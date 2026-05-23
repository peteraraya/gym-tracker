'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { ChevronUp, ArrowRight } from '@/components/icons/lucide';

interface MinimizedTimerProps {
  timeLeft: number;
  duration: number;
  title?: string;
  onExpand: () => void;
  onSkip: () => void;
}

export function MinimizedTimer({ 
  timeLeft,
  duration, 
  title = 'Descanso',
  onExpand,
  onSkip 
}: MinimizedTimerProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressWidth = timeLeft <= 10 ? '100%' : `${(timeLeft / duration) * 100}%`;

  return (
    <div className="fixed bottom-6 left-4 right-4 z-40 md:right-20 md:left-auto px-4">
      <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-md border border-white/10 backdrop-blur-sm max-w-3xl md:w-80 mx-auto md:mx-0">
        <div className="px-3 py-2 flex items-center gap-3">
          <button
            onClick={onExpand}
            className="flex items-center gap-3 hover:opacity-95 transition-opacity flex-1 text-left"
            aria-label="Expandir temporizador"
          >
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold opacity-95">{title}</span>
              <span className="text-lg md:text-xl font-bold tabular-nums">{formatTime(timeLeft)}</span>
            </div>
          </button>

          <div className="flex items-center gap-2 border-l border-white/10 pl-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onExpand}
              className="text-white hover:bg-white/10 p-2 h-10 w-12 rounded-full flex items-center justify-center"
              title="Expandir"
              aria-label="Expandir"
            >
              <ChevronUp className="w-4 h-4 text-white" strokeWidth={3} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-white hover:bg-white/10 p-2 h-10 w-12 rounded-full flex items-center justify-center"
              title="Saltar"
              aria-label="Saltar"
            >
              <ArrowRight className="w-4 h-4 text-white" strokeWidth={3} />
            </Button>
          </div>
        </div>

        <div className="h-1 bg-white/20 rounded-b-2xl overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-1000"
            style={{ width: progressWidth }}
          />
        </div>
      </div>
    </div>
  );
}
