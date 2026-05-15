'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from '@/context/LocaleContext';
import { Button } from '@/components/ui/Button';
import {
  Plus,
  Minus,
  Play,
  Pause,
  Minimize2,
  ArrowRight,
  Check,
  RefreshCw,
} from '@/components/icons/lucide';
import { 
  getRestMessage, 
  formatRestTime
} from '@/lib/workout/restCalculator';
import { soundManager } from '@/lib/audio/soundSystem';
import { useRestNotifications } from '@/lib/notifications/pwaNotifications';

interface TimerProps {
  duration: number; // duración en segundos
  onComplete?: () => void;
  onSkip?: () => void; // ✨ NEW: Callback específico para cuando se salta el timer
  autoStart?: boolean;
  title?: string;
  nextExerciseName?: string; // Para mostrar en la notificación
  showMotivation?: boolean; // Mostrar mensajes motivacionales
  onActualDurationChange?: (actualDuration: number) => void; // Callback con duración real
  onMinimize?: (timeLeft: number) => void; // Callback para minimizar con tiempo restante
  initialTimeLeft?: number; // ✨ NEW: Tiempo inicial cuando se expande desde minimizado
}

export const Timer: React.FC<TimerProps> = ({ 
  duration, 
  onComplete,
  onSkip, // ✨ NEW: Receive onSkip callback
  autoStart = false,
  title = undefined,
  nextExerciseName,
  showMotivation = true,
  onActualDurationChange,
  onMinimize,
  initialTimeLeft // ✨ NEW: Receive initial time
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft ?? duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isCompleted, setIsCompleted] = useState(false);
  const [plannedDuration] = useState(duration);
  const [actualDuration, setActualDuration] = useState(0);
  const [hasAdjusted, setHasAdjusted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteCalledRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const startTimeRef = useRef<number>(0);
  const onActualDurationRef = useRef<typeof onActualDurationChange | null>(null);
  
  // ✨ NEW: Hooks para notificaciones y sonidos mejorados
  const notifications = useRestNotifications();
  const [notificationPermission, setNotificationPermission] = useState(false);
  
  // Mantener onCompleteRef actualizado
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // ✨ NEW: Configurar manejadores de acciones de notificación
  useEffect(() => {
    notifications.setupActionHandlers();
    
    // Escuchar eventos de acciones de notificación
    const handleSkipFromNotification = () => {
      if (onSkip) {
        onSkip();
      } else if (onComplete) {
        onComplete();
      }
    };
    
    const handleAddTimeFromNotification = (event: CustomEvent) => {
      const { seconds } = event.detail;
      setTimeLeft(prev => prev + seconds);
      setHasAdjusted(true);
    };
    
    const handleContinueFromNotification = () => {
      if (onComplete) {
        onComplete();
      }
    };
    
    const handleMoreRestFromNotification = () => {
      setTimeLeft(prev => prev + 60); // Añadir 1 minuto más
      setHasAdjusted(true);
      setIsCompleted(false);
      setIsRunning(true);
    };

    window.addEventListener('rest-timer-skip', handleSkipFromNotification);
    window.addEventListener('rest-timer-add-time', handleAddTimeFromNotification as EventListener);
    window.addEventListener('rest-timer-continue', handleContinueFromNotification);
    window.addEventListener('rest-timer-more-rest', handleMoreRestFromNotification);

    return () => {
      window.removeEventListener('rest-timer-skip', handleSkipFromNotification);
      window.removeEventListener('rest-timer-add-time', handleAddTimeFromNotification as EventListener);
      window.removeEventListener('rest-timer-continue', handleContinueFromNotification);
      window.removeEventListener('rest-timer-more-rest', handleMoreRestFromNotification);
    };
  }, [onSkip, onComplete]);

  // ✨ NEW: Solicitar permiso de notificaciones al montar
  useEffect(() => {
    notifications.requestPermission().then(setNotificationPermission);
  }, []);

  useEffect(() => {
    // Solo actualizar cuando cambia la duración (nuevo timer)
    // console.log('[Timer] Init effect - duration:', duration, 'initialTimeLeft:', initialTimeLeft);
    onCompleteCalledRef.current = false;

    // Calcular startTimeRef basado en el tiempo restante
    const elapsed = duration - (initialTimeLeft ?? duration);
    startTimeRef.current = Date.now() - elapsed * 1000;
    // console.log('[Timer] Set startTimeRef, elapsed:', elapsed);

    // Deferir actualizaciones de estado para evitar setState síncrono en efecto
    const id = setTimeout(() => {
      setTimeLeft(initialTimeLeft ?? duration);
      setIsCompleted(false);
      setHasAdjusted(false);
      if (autoStart && !isRunning) {
        setIsRunning(true);
      }
    }, 0);

    return () => clearTimeout(id);
  }, [duration, initialTimeLeft, autoStart]); // Incluir initialTimeLeft; NO incluir `isRunning` para evitar reinicios al pausar

  useEffect(() => {
    // console.log('[Timer] Interval effect - isRunning:', isRunning);
    if (isRunning) {
      // ✨ NEW: Iniciar notificaciones de progreso si están habilitadas
      // Nota: no dependemos de `timeLeft` aquí para evitar reiniciar
      // las notificaciones en cada tick (evita notificaciones cada segundo).
      if (notificationPermission && timeLeft > 10) {
        notifications.startTimerNotifications({
          timeLeft,
          totalTime: plannedDuration,
          nextExercise: nextExerciseName,
          routineName: title
        });
      }

      // console.log('[Timer] Starting interval');
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          // console.log('[Timer] Interval tick - prev:', prev);
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);

            // ✨ NEW: Detener notificaciones de progreso
            notifications.stopTimerNotifications();

            // Calcular duración real
            const realDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
            setActualDuration(realDuration);

            // Llamar onComplete automáticamente cuando el timer llega a 0
            if (onCompleteRef.current && !onCompleteCalledRef.current) {
              onCompleteCalledRef.current = true;
              // Usar setTimeout para permitir que el estado se actualice primero
              setTimeout(() => {
                onCompleteRef.current?.();
              }, 100);
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // ✨ NEW: Detener notificaciones cuando se pausa
      notifications.stopTimerNotifications();
      // console.log('[Timer] Clearing interval');
    }

    return () => {
      if (intervalRef.current) {
        // console.log('[Timer] Cleanup - clearing interval');
        clearInterval(intervalRef.current);
      }
      // ✨ NEW: Limpiar notificaciones al desmontar
      notifications.stopTimerNotifications();
    };
  }, [isRunning, notificationPermission, plannedDuration, nextExerciseName, title]); // Removido timeLeft de las dependencias para evitar reinicios frecuentes

  // Si el tiempo se ajusta manualmente mientras el timer está corriendo,
  // reiniciamos las notificaciones con el nuevo valor una sola vez.
  useEffect(() => {
    if (hasAdjusted && isRunning && notificationPermission) {
      notifications.startTimerNotifications({
        timeLeft,
        totalTime: plannedDuration,
        nextExercise: nextExerciseName,
        routineName: title
      });
      // Resetear la bandera de forma asíncrona para evitar setState sincrónico en effect
      setTimeout(() => setHasAdjusted(false), 0);
    }
  }, [hasAdjusted]);

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

  // ✨ NEW: Efecto mejorado para notificaciones y sonidos al completar
  useEffect(() => {
    if (isCompleted) {
      // Mostrar notificación de completado
      if (notificationPermission) {
        notifications.showRestComplete({
          totalTime: plannedDuration,
          nextExercise: nextExerciseName,
          routineName: title
        });
      }
      
      // Reproducir sonido mejorado
      soundManager.playRestCompleteSound().catch(error => {
        console.warn('Error reproduciendo sonido:', error);
      });
    }
  }, [isCompleted, notificationPermission, nextExerciseName, title, plannedDuration]);

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
    // console.log('[Timer] handleSkip called, onCompleteCalledRef:', onCompleteCalledRef.current);
    
    // Prevenir múltiples llamadas
    if (onCompleteCalledRef.current) {
      // console.log('[Timer] Skip already called, ignoring');
      return;
    }
    
    // console.log('[Timer] Executing skip');
    onCompleteCalledRef.current = true;
    setIsRunning(false);
    
    const realDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    setActualDuration(realDuration);
    
    // Llamar onSkip si está definido, sino onComplete
    if (onSkip) {
      // console.log('[Timer] Calling onSkip');
      onSkip();
    } else if (onComplete) {
      // console.log('[Timer] Calling onComplete from skip (no onSkip defined)');
      onComplete();
    } else {
      // console.log('[Timer] ERROR: Neither onSkip nor onComplete is defined!');
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
  const circumference = 2 * Math.PI * 88;
  const strokeDashoffset = circumference * (1 - Math.max(0, Math.min(percentage, 100)) / 100);
  const motivationMessage = showMotivation ? getRestMessage(timeLeft, plannedDuration) : '';
  const t = useTranslations('timer');

  const resolvedTitle = title ?? (t ? t('rest') : 'Descanso');

  // Calcular diferencia entre planificado y real
  const timeDifference = isCompleted ? actualDuration - plannedDuration : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
      {/* Minimize button - top right */}
      {onMinimize && !isCompleted && (
        <div className="flex justify-end mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMinimize(timeLeft)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-2"
          >
            <Minimize2 className="w-4 h-4" />
            <span className="hidden sm:inline">Minimizar</span>
            <span className="sm:hidden">Min.</span>
          </Button>
        </div>
      )}

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
            strokeDasharray={`${circumference}`}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 1000ms linear' }}
            className={`transition-colors duration-300 ${
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
          <div className={`text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight tabular-nums tracking-tight ${
              isCompleted 
                ? 'text-green-600 dark:text-green-400' 
                : timeLeft <= 10 
                  ? 'text-red-600 dark:text-red-400 animate-pulse' 
                  : 'text-gray-900 dark:text-gray-100'
            }`} style={{ transition: 'color 200ms ease, transform 150ms ease' }}>
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
                Tiempo ajustado manualmente
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
              Ajustado manualmente
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
                className="px-8 py-3 text-base font-semibold flex items-center justify-center gap-2"
              >
                {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                <span>{isRunning ? 'Pausar' : 'Iniciar'}</span>
              </Button>
              
              <Button
                variant="secondary"
                onClick={handleSkip}
                size="lg"
                className="px-8 py-3 text-base font-semibold bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
              >
                <ArrowRight className="w-5 h-5" />
                <span>Saltar</span>
              </Button>
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
              className="w-full py-4 text-lg font-bold flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              <span>Continuar</span>
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleReset} 
              size="lg" 
              className="w-full flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Más descanso</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
