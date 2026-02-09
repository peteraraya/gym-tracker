'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Play, Pause, Square, Timer as TimerIcon } from 'lucide-react';
import { useTranslations } from '@/context/LocaleContext';

interface SetTimerProps {
  onComplete?: (duration: number, pausedTime: number) => void;
  autoStart?: boolean;
}

export const SetTimer: React.FC<SetTimerProps> = ({ 
  onComplete, 
  autoStart = true
}) => {
  const [elapsedTime, setElapsedTime] = useState(0); // Tiempo transcurrido en segundos
  const [pausedTime, setPausedTime] = useState(0); // Tiempo total pausado
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pauseStartRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused]);

  const handleStartPause = () => {
    if (isPaused) {
      // Reanudar
      if (pauseStartRef.current > 0) {
        const pauseDuration = Math.floor((Date.now() - pauseStartRef.current) / 1000);
        setPausedTime(prev => prev + pauseDuration);
        pauseStartRef.current = 0;
      }
      setIsPaused(false);
      setIsRunning(true);
    } else {
      // Pausar
      pauseStartRef.current = Date.now();
      setIsPaused(true);
      setIsRunning(false);
    }
  };

  const handleStop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    let finalPausedTime = pausedTime;
    if (isPaused && pauseStartRef.current > 0) {
      const pauseDuration = Math.floor((Date.now() - pauseStartRef.current) / 1000);
      finalPausedTime += pauseDuration;
    }

    setIsRunning(false);
    if (onComplete) {
      onComplete(elapsedTime, finalPausedTime);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeTime = elapsedTime - pausedTime;

  const t = useTranslations('setTimer');

  return (
    <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TimerIcon className={`w-5 h-5 ${isPaused ? 'text-amber-600' : 'text-blue-600'}`} />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {t ? t('title') : 'Cronómetro de Serie'}
          </h3>
        </div>
        {isPaused && (
          <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-xs font-semibold rounded-full animate-pulse">
            {t ? t('paused') : 'PAUSADO'}
          </span>
        )}
      </div>

      {/* Display principal */}
      <div className="text-center mb-6">
        <div className="text-6xl font-bold font-mono text-blue-600 dark:text-blue-400 mb-2 tabular-nums">
          {formatTime(elapsedTime)}
        </div>
        <div className="flex justify-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>{t ? `${t('active')}: ${formatTime(activeTime)}` : `Activo: ${formatTime(activeTime)}`}</span>
          </div>
          {pausedTime > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span>{t ? `${t('pausedLabel')}: ${formatTime(pausedTime)}` : `Pausado: ${formatTime(pausedTime)}`}</span>
            </div>
          )}
        </div>
      </div>

      {/* Controles */}
      <div className="flex gap-3">
        <Button
          variant={isPaused ? "primary" : "secondary"}
          onClick={handleStartPause}
          className="flex-1"
        >
          {isPaused ? (
            <>
              <Play className="w-5 h-5" />
              {t ? t('resume') : 'Reanudar'}
            </>
          ) : (
            <>
              <Pause className="w-5 h-5" />
              {t ? t('pause') : 'Pausar'}
            </>
          )}
        </Button>
        
        <Button
          variant="primary"
          onClick={handleStop}
          className="flex-1"
        >
          <Square className="w-5 h-5" />
          {t ? t('completeSet') : 'Completar Serie'}
        </Button>
      </div>

      {/* Info adicional */}
      <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-200 text-center">
          {t ? t('helper') : '💡 El cronómetro mide el tiempo de cada serie. Puedes pausar si necesitas un descanso.'}
        </p>
      </div>
    </div>
  );
};
