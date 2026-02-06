'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  getRestMessage, 
  showRestCompleteNotification, 
  playRestCompleteSound,
  requestNotificationPermission,
  formatRestTime
} from '@/lib/restCalculator';

interface TimerProps {
  duration: number; // duración en segundos
  onComplete?: () => void;
  autoStart?: boolean;
  title?: string;
  nextExerciseName?: string; // Para mostrar en la notificación
  showMotivation?: boolean; // Mostrar mensajes motivacionales
}

export const Timer: React.FC<TimerProps> = ({ 
  duration, 
  onComplete, 
  autoStart = false,
  title = 'Descanso',
  nextExerciseName,
  showMotivation = true
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isCompleted, setIsCompleted] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteCalledRef = useRef(false);

  // Cargar preferencias del usuario
  const soundEnabled = typeof window !== 'undefined' 
    ? (localStorage.getItem('restSoundEnabled') ?? 'true') === 'true'
    : true;

  // Solicitar permiso de notificaciones al montar
  useEffect(() => {
    requestNotificationPermission().then(setNotificationPermission);
  }, []);

  useEffect(() => {
    setTimeLeft(duration);
    setIsCompleted(false);
    onCompleteCalledRef.current = false; // Reset al cambiar duración
    if (autoStart) {
      setIsRunning(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  // Efecto separado para notificaciones al completar
  useEffect(() => {
    if (isCompleted) {
      if (notificationPermission) {
        showRestCompleteNotification(nextExerciseName);
      }
      if (soundEnabled) {
        playRestCompleteSound();
      }
    }
  }, [isCompleted, notificationPermission, nextExerciseName, soundEnabled]);

  // Efecto separado para llamar a onComplete cuando se completa el timer
  useEffect(() => {
    if (isCompleted && onComplete && !onCompleteCalledRef.current) {
      onCompleteCalledRef.current = true;
      // Usar setTimeout para asegurar que se ejecuta después del render
      setTimeout(() => {
        onComplete();
      }, 0);
    }
  }, [isCompleted, onComplete]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(duration);
    setIsCompleted(false);
  };

  const handleSkip = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setIsCompleted(true);
    if (onComplete) onComplete();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const percentage = ((duration - timeLeft) / duration) * 100;
  const motivationMessage = showMotivation ? getRestMessage(timeLeft, duration) : '';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h3>
        {nextExerciseName && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Próximo: <span className="font-semibold">{nextExerciseName}</span>
          </p>
        )}
        {showMotivation && motivationMessage && (
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 animate-pulse">
            {motivationMessage}
          </p>
        )}
      </div>
        
      <div className="relative w-48 h-48 mx-auto mb-4">
        {/* Círculo de progreso */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 88}`}
            strokeDashoffset={`${2 * Math.PI * 88 * (1 - percentage / 100)}`}
            className={`transition-all duration-1000 ${
              isCompleted 
                ? 'text-green-500' 
                : timeLeft <= 10 
                  ? 'text-red-500' 
                  : 'text-blue-500'
            }`}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Tiempo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`text-5xl font-bold ${
            isCompleted 
              ? 'text-green-600 dark:text-green-400' 
              : timeLeft <= 10 
                ? 'text-red-600 dark:text-red-400 animate-pulse' 
                : 'text-gray-900 dark:text-gray-100'
          }`}>
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {isCompleted && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-500 dark:border-green-400">
          <div className="text-green-600 dark:text-green-400 text-xl font-bold text-center mb-2 animate-bounce">
            ✓ ¡Descanso Completado!
          </div>
          <p className="text-green-700 dark:text-green-300 text-sm text-center">
            {nextExerciseName ? `Listo para ${nextExerciseName}` : '¡Vamos con todo! 💪'}
          </p>
        </div>
      )}
      
      {/* Información adicional */}
      {!isCompleted && timeLeft > 0 && (
        <div className="mb-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Tiempo total: {formatRestTime(duration)}</p>
        </div>
      )}

      <div className="flex gap-2 justify-center">
        {!isCompleted ? (
          <>
            <Button
              variant={isRunning ? 'secondary' : 'primary'}
              onClick={handleStartPause}
              size="lg"
            >
              {isRunning ? '⏸️ Pausar' : '▶️ Iniciar'}
            </Button>
            <Button variant="ghost" onClick={handleReset} size="lg">
              🔄 Reiniciar
            </Button>
            <Button variant="ghost" onClick={handleSkip} size="lg">
              ⏭️ Saltar
            </Button>
          </>
        ) : (
          <Button variant="primary" onClick={handleReset} size="lg">
            🔄 Nuevo descanso
          </Button>
        )}
      </div>
    </div>
  );
};
