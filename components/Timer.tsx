'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from '@/context/LocaleContext';
import { Button } from '@/components/ui/Button';
import { Plus, Minus } from '@/components/icons/lucide';
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
  onActualDurationChange?: (actualDuration: number) => void; // Callback con duración real
}

export const Timer: React.FC<TimerProps> = ({ 
  duration, 
  onComplete, 
  autoStart = false,
  title = undefined,
  nextExerciseName,
  showMotivation = true,
  onActualDurationChange
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isCompleted, setIsCompleted] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [plannedDuration] = useState(duration); // Guardar duración planificada original
  const [actualDuration, setActualDuration] = useState(0); // Tiempo real transcurrido
  const [hasAdjusted, setHasAdjusted] = useState(false); // Si el usuario ajustó el tiempo
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteCalledRef = useRef(false);
  const startTimeRef = useRef<number>(Date.now());
  const onActualDurationRef = useRef<typeof onActualDurationChange | null>(null);

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
    setHasAdjusted(false);
    onCompleteCalledRef.current = false;
    startTimeRef.current = Date.now();
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
            // Calcular duración real
            const realDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
            setActualDuration(realDuration);
            
            // Llamar onComplete automáticamente cuando el timer llega a 0
            if (onComplete && !onCompleteCalledRef.current) {
              onCompleteCalledRef.current = true;
              // Usar setTimeout para permitir que el estado se actualice primero
              setTimeout(() => {
                onComplete();
              }, 100);
            }
            
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
  }, [isRunning, onComplete]);

  // Efecto separado para notificar cambios en la duración real
  useEffect(() => {
    // Mantener referencia actualizada sin provocar re-ejecución del efecto
    onActualDurationRef.current = onActualDurationChange;
  }, [onActualDurationChange]);

  useEffect(() => {
    if (isCompleted && actualDuration > 0) {
      try {
        onActualDurationRef.current?.(actualDuration);
      } catch (e) {
        // evitar que errores en el handler rompan el timer
        // el error se ignora intencionalmente
      }
    }
  }, [isCompleted, actualDuration]);

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

  const handleStartPause = () => {
    if (!isRunning) {
      startTimeRef.current = Date.now() - (plannedDuration - timeLeft) * 1000;
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(plannedDuration);
    setIsCompleted(false);
    setHasAdjusted(false);
    onCompleteCalledRef.current = false; // Resetear la referencia
    startTimeRef.current = Date.now();
  };

  const handleSkip = (e: React.MouseEvent) => {
    // Prevenir propagación y comportamiento por defecto
    e.preventDefault();
    e.stopPropagation();
    
    // Prevenir múltiples llamadas
    if (onCompleteCalledRef.current) {
      console.log('[Timer] Skip ya fue llamado, ignorando');
      return;
    }
    
    console.log('[Timer] Ejecutando skip');
    onCompleteCalledRef.current = true;
    setIsRunning(false);
    
    const realDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    setActualDuration(realDuration);
    setTimeLeft(0);
    setIsCompleted(true);
    
    // Llamar onComplete inmediatamente sin setTimeout
    if (onComplete) {
      console.log('[Timer] Llamando onComplete');
      onComplete();
    }
  };

  // Ajuste rápido de tiempo
  const handleAdjustTime = (seconds: number) => {
    setTimeLeft(prev => {
      const newTime = Math.max(0, prev + seconds);
      setHasAdjusted(true);
      return newTime;
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const percentage = ((plannedDuration - timeLeft) / plannedDuration) * 100;
  const motivationMessage = showMotivation ? getRestMessage(timeLeft, plannedDuration) : '';
  const t = useTranslations('timer');

  const resolvedTitle = title ?? (t ? t('rest') : 'Descanso');

  // Calcular diferencia entre planificado y real
  const timeDifference = isCompleted ? actualDuration - plannedDuration : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
      <div className="text-center mb-4 sm:mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {resolvedTitle}
        </h3>
        {nextExerciseName && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t ? `${t('nextLabel')}: ` : 'Próximo: '}<span className="font-semibold">{nextExerciseName}</span>
          </p>
        )}
        {showMotivation && motivationMessage && (
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 animate-pulse">
            {motivationMessage}
          </p>
        )}
      </div>
        
      <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto mb-4">
        {/* Círculo de progreso */}
        <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet" className="w-full h-full transform -rotate-90">
          <circle
            cx="100"
            cy="100"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx="100"
            cy="100"
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
          <div className={`text-3xl sm:text-5xl md:text-6xl font-bold leading-tight tabular-nums ${
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
        <div className="mb-6">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-500 dark:border-green-400 mb-3">
            <div className="text-green-600 dark:text-green-400 text-xl font-bold text-center mb-2 animate-bounce">
              {t ? t('restCompleted') : '✓ ¡Descanso Completado!'}
            </div>
            <p className="text-green-700 dark:text-green-300 text-sm text-center">
              {nextExerciseName ? (t ? t('readyFor').replace('{0}', nextExerciseName) : `Listo para ${nextExerciseName}`) : (t ? t('cheer') : '¡Vamos con todo! 💪')}
            </p>
          </div>

          {/* Comparación de tiempo planificado vs real */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 text-center">
              Tiempo de descanso
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Planificado</div>
                <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
                  {formatTime(plannedDuration)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Real</div>
                <div className={`text-lg font-bold ${
                  timeDifference > 5 ? 'text-orange-600 dark:text-orange-400' :
                  timeDifference < -5 ? 'text-blue-600 dark:text-blue-400' :
                  'text-green-600 dark:text-green-400'
                }`}>
                  {formatTime(actualDuration)}
                  {timeDifference !== 0 && (
                    <span className="text-xs ml-1">
                      ({timeDifference > 0 ? '+' : ''}{timeDifference}s)
                    </span>
                  )}
                </div>
              </div>
            </div>
            {hasAdjusted && (
              <div className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
                ⚙️ Tiempo ajustado manualmente
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Información adicional */}
      {!isCompleted && timeLeft > 0 && (
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tiempo planificado: {formatRestTime(plannedDuration)}
          </p>
          {hasAdjusted && (
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              ⚙️ Ajustado manualmente
            </p>
          )}
        </div>
      )}

      {/* Botones de acción */}
      <div className="space-y-3">
        {!isCompleted ? (
          <>
            {/* Botones de ajuste rápido - Diseño limpio */}
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setTimeLeft(prev => Math.max(0, prev - 30));
                  setHasAdjusted(true);
                }}
                size="lg"
                className="flex items-center gap-2 px-6"
                disabled={timeLeft <= 30}
              >
                <Minus className="w-5 h-5" />
                <span className="font-semibold">30s</span>
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => {
                  setTimeLeft(prev => prev + 30);
                  setHasAdjusted(true);
                }}
                size="lg"
                className="flex items-center gap-2 px-6"
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">30s</span>
              </Button>
            </div>

            {/* Botones principales - Centrados y espaciados */}
            <div className="flex items-center justify-center gap-3">
              <Button
                variant={isRunning ? 'secondary' : 'primary'}
                onClick={handleStartPause}
                size="lg"
                className="px-8 py-3 text-base font-semibold"
              >
                {isRunning ? '⏸️ Pausar' : '▶️ Iniciar'}
              </Button>
              
              {/* Botón nativo para evitar problemas con el componente Button */}
              <button
                type="button"
                onClick={handleSkip}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 text-base font-semibold rounded-xl transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md bg-orange-600 hover:bg-orange-700 text-white"
              >
                ⏭️ Saltar
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <Button 
              variant="primary" 
              onClick={() => { 
                if (onComplete && !onCompleteCalledRef.current) {
                  onCompleteCalledRef.current = true;
                  onComplete();
                }
              }} 
              size="lg" 
              className="w-full py-4 text-lg font-bold"
            >
              ✅ Continuar
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleReset} 
              size="lg" 
              className="w-full"
            >
              🔄 Más descanso
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
