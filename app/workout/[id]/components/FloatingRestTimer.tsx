'use client';

import { useState, useEffect } from 'react';

interface FloatingRestTimerProps {
  duration: number; // en segundos
  onComplete?: () => void;
  onDismiss?: () => void;
}

/**
 * Mini temporizador flotante que aparece al completar una serie
 * Muestra el tiempo de descanso restante de forma no intrusiva
 */
export function FloatingRestTimer({ duration, onComplete, onDismiss }: FloatingRestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, onComplete]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((duration - timeLeft) / duration) * 100;

  return (
    <div className="fixed top-20 right-4 z-40 animate-slide-in-right">
      <div className="bg-linear-to-br from-blue-500 to-purple-600 text-white rounded-2xl shadow-2xl p-4 min-w-[160px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-semibold">Descanso</span>
          </div>
          <button
            onClick={handleDismiss}
            className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tiempo */}
        <div className="text-center mb-2">
          <div className="text-3xl font-bold tabular-nums">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-white rounded-full h-1.5 transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Mensaje motivacional cuando queda poco tiempo */}
        {timeLeft <= 10 && timeLeft > 0 && (
          <div className="text-center mt-2 text-xs font-medium animate-pulse">
            ¡Casi listo! 💪
          </div>
        )}

        {/* Mensaje de completado */}
        {timeLeft === 0 && (
          <div className="text-center mt-2 text-xs font-bold animate-bounce">
            ¡Tiempo! 🔥
          </div>
        )}
      </div>
    </div>
  );
}
