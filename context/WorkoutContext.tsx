'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode, useRef } from 'react';
import * as storageService from '@/lib/storage/storage';
import type { ActiveWorkout } from '@/lib/storage/storage';
import type { Routine } from '@/types';
import { useAppLifecycle } from '@/hooks/useAppLifecycle';
import { WorkoutStateSchema, validateDataWithLogging } from '@/lib/validation';

interface WorkoutState {
  routineId: string;
  routineName: string;
  currentExerciseIndex: number;
  currentSet: number;
  completedSets: { [key: string]: number };
  actualReps: { [key: string]: number[] };
  actualWeights: { [key: string]: number[] };
  startedAt: Date;
  // Estado del timer de descanso para persistencia
  isResting?: boolean;
  restTimerDuration?: number;
  restTimerTitle?: string;
  restTimerNextExercise?: string;
  restTimerStartedAt?: number; // timestamp de cuando empezó el descanso
}

interface WorkoutContextType {
  activeWorkout: WorkoutState | null;
  startWorkout: (routine: Routine) => void;
  updateWorkoutProgress: (
    exerciseIndex: number,
    set: number,
    completedSets: { [key: string]: number },
    actualReps: { [key: string]: number[] },
    actualWeights: { [key: string]: number[] },
    restState?: {
      isResting?: boolean;
      restTimerDuration?: number;
      restTimerTitle?: string;
      restTimerNextExercise?: string;
      restTimerStartedAt?: number;
    }
  ) => void;
  clearRestState: () => void;
  finishWorkout: () => Promise<void>;
  cancelWorkout: () => Promise<void>;
  isWorkoutActive: boolean;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [activeWorkout, setActiveWorkout] = useState<WorkoutState | null>(null);
  const [isLoadingActiveWorkout, setIsLoadingActiveWorkout] = useState(true);
  const activeWorkoutRef = useRef<WorkoutState | null>(null);

  // Normalizar datos validados a WorkoutState (convierte tipos robustamente)
  const normalizeActiveWorkout = (data: any): WorkoutState => {
    return {
      routineId: String(data.routineId),
      routineName: String(data.routineName),
      currentExerciseIndex: Number(data.currentExerciseIndex ?? 0),
      currentSet: Number(data.currentSet ?? 1),
      completedSets: (() => {
        const out: { [key: string]: number } = {};
        const src = data.completedSets || {};
        Object.keys(src).forEach(k => {
          const v = (src as any)[k];
          out[String(k)] = typeof v === 'number' ? v : Number(v ?? 0);
        });
        return out;
      })(),
      actualReps: (() => {
        const out: { [key: string]: number[] } = {};
        const src = data.actualReps || {};
        Object.keys(src).forEach(k => {
          const arr = (src as any)[k];
          out[String(k)] = Array.isArray(arr) ? arr.map(n => Number(n ?? 0)) : [];
        });
        return out;
      })(),
      actualWeights: (() => {
        const out: { [key: string]: number[] } = {};
        const src = data.actualWeights || {};
        Object.keys(src).forEach(k => {
          const arr = (src as any)[k];
          out[String(k)] = Array.isArray(arr) ? arr.map(n => Number(n ?? 0)) : [];
        });
        return out;
      })(),
      startedAt: data.startedAt ? new Date(data.startedAt) : new Date(),
      // Estado del timer de descanso para persistencia
      isResting: data.isResting ?? false,
      restTimerDuration: data.restTimerDuration,
      restTimerTitle: data.restTimerTitle,
      restTimerNextExercise: data.restTimerNextExercise,
      restTimerStartedAt: data.restTimerStartedAt
    };
  };

  // Mantener ref actualizada para acceso en callbacks
  useEffect(() => {
    activeWorkoutRef.current = activeWorkout;
  }, [activeWorkout]);

  // Cargar active workout desde storage unificado (DB o local)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored = await storageService.getActiveWorkout();
        if (!mounted) return;
        
        if (stored) {
          // ✅ Validar con Zod
          const validationResult = validateDataWithLogging(
            WorkoutStateSchema,
            stored,
            '[WorkoutContext] Loading active workout'
          );

          if (validationResult.success && validationResult.data) {
            setActiveWorkout(normalizeActiveWorkout(validationResult.data));
          } else {
            // Datos corruptos - limpiar
            console.error('[WorkoutContext] Invalid workout state, clearing:', validationResult.error);
            await storageService.clearActiveWorkout();
            setActiveWorkout(null);
          }
        }
      } catch (e) {
        console.error('[WorkoutContext] Error cargando active workout:', e);
      } finally {
        if (mounted) {
          setIsLoadingActiveWorkout(false);
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Persistir cambios del activeWorkout en storage unificado
  // SOLO cuando hay un workout activo (no limpiar automáticamente)
  useEffect(() => {
    if (isLoadingActiveWorkout) {
      return;
    }
    if (!activeWorkout) {
      return; // No hacer nada si no hay workout activo
    }
    
    (async () => {
      try {
        await storageService.saveActiveWorkout(activeWorkout as unknown as ActiveWorkout);
      } catch (e) {
        console.error('[WorkoutContext] Error guardando active workout:', e);
      }
    })();
  }, [activeWorkout, isLoadingActiveWorkout]);

  const startWorkout = useCallback((routine: Routine) => {
    const newWorkout: WorkoutState = {
      routineId: routine.id,
      routineName: routine.name,
      currentExerciseIndex: 0,
      currentSet: 1,
      completedSets: {},
      actualReps: {},
      actualWeights: {},
      startedAt: new Date()
    };
    setActiveWorkout(newWorkout);
    // Persist immediately to avoid losing state if the page reloads quickly
    (async () => {
      try {
        await storageService.saveActiveWorkout(newWorkout as unknown as ActiveWorkout);
      } catch (e) {
        console.error('[WorkoutContext] Error guardando workout en start:', e);
      }
    })();
  }, []);
  const updateWorkoutProgress = useCallback((
    exerciseIndex: number,
    set: number,
    completedSets: { [key: string]: number },
    actualReps: { [key: string]: number[] },
    actualWeights: { [key: string]: number[] },
    restState?: {
      isResting?: boolean;
      restTimerDuration?: number;
      restTimerTitle?: string;
      restTimerNextExercise?: string;
      restTimerStartedAt?: number;
    }
  ) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      const newState: WorkoutState = {
        ...prev,
        currentExerciseIndex: exerciseIndex,
        currentSet: set,
        completedSets,
        actualReps,
        actualWeights,
        // Persistir estado del timer de descanso
        isResting: restState?.isResting ?? false,
        restTimerDuration: restState?.restTimerDuration,
        restTimerTitle: restState?.restTimerTitle,
        restTimerNextExercise: restState?.restTimerNextExercise,
        restTimerStartedAt: restState?.restTimerStartedAt
      };

      // Guardar inmediatamente en storage unificado
      (async () => {
        try {
          await storageService.saveActiveWorkout(newState as unknown as ActiveWorkout);
        } catch (e) {
          console.warn('[Workout] Failed to persist active workout on update:', e);
        }
      })();

      return newState;
    });
  }, []);

  const clearRestState = useCallback(() => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      const newState = {
        ...prev,
        isResting: false,
        restTimerDuration: undefined,
        restTimerTitle: undefined,
        restTimerNextExercise: undefined,
        restTimerStartedAt: undefined
      };
      (async () => {
        try {
          await storageService.saveActiveWorkout(newState as unknown as ActiveWorkout);
        } catch (e) {
          console.warn('[Workout] Failed to persist active workout on clearRestState:', e);
        }
      })();
      return newState;
    });
  }, []);

  const finishWorkout = useCallback(async () => {
    // Marcar que el workout fue finalizado intencionalmente
    // Esto evita que onResume lo restaure
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('workout_finished', Date.now().toString());
    }
    
    // Actualizar la ref inmediatamente para evitar restauración
    activeWorkoutRef.current = null;
    setActiveWorkout(null);
    
    try {
      await storageService.clearActiveWorkout();
      console.log('[WorkoutContext] Active workout finished and cleared');
    } catch (e) {
      console.error('[WorkoutContext] Error limpiando active workout:', e);
    }
  }, []);

  const cancelWorkout = useCallback(async () => {
    // Marcar que el workout fue cancelado intencionalmente
    // Esto evita que onResume lo restaure
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('workout_cancelled', Date.now().toString());
    }
    
    // Actualizar la ref inmediatamente para evitar restauración
    activeWorkoutRef.current = null;
    setActiveWorkout(null);
    
    try {
      await storageService.clearActiveWorkout();
      console.log('[WorkoutContext] Active workout cancelled and cleared');
    } catch (e) {
      console.error('[WorkoutContext] Error limpiando active workout:', e);
    }
  }, []);

  // Manejar ciclo de vida de la app para persistir workout
  useAppLifecycle({
    onPause: useCallback(() => {
      // Cuando la app se pone en segundo plano, forzar guardado del workout
      const currentWorkout = activeWorkoutRef.current;
      if (currentWorkout) {
        if (process.env.NODE_ENV === 'development') {
          console.debug('[WorkoutContext] App paused, persisting workout...');
        }
        (async () => {
          try {
            await storageService.saveActiveWorkout(currentWorkout as unknown as ActiveWorkout);
            if (process.env.NODE_ENV === 'development') {
              console.debug('[WorkoutContext] Workout persisted successfully on pause');
            }
          } catch (e) {
            console.error('[WorkoutContext] Error persisting workout on pause:', e);
          }
        })();
      }
    }, []),
    onResume: useCallback(() => {
      // Cuando la app vuelve a primer plano, recargar workout si es necesario
      if (process.env.NODE_ENV === 'development') {
        console.debug('[WorkoutContext] App resumed, checking workout state...');
      }
      
      // Esperar un poco para asegurar que clearActiveWorkout se completó
      setTimeout(async () => {
        try {
          // Verificar si el workout fue cancelado o finalizado recientemente (últimos 5 segundos)
          if (typeof window !== 'undefined') {
            const cancelledAt = sessionStorage.getItem('workout_cancelled');
            const finishedAt = sessionStorage.getItem('workout_finished');
            
            if (cancelledAt) {
              const timeSinceCancelled = Date.now() - parseInt(cancelledAt);
              if (timeSinceCancelled < 5000) {
                console.log('[WorkoutContext] Workout was recently cancelled, skipping restore');
                sessionStorage.removeItem('workout_cancelled');
                return;
              }
              sessionStorage.removeItem('workout_cancelled');
            }
            
            if (finishedAt) {
              const timeSinceFinished = Date.now() - parseInt(finishedAt);
              if (timeSinceFinished < 5000) {
                console.log('[WorkoutContext] Workout was recently finished, skipping restore');
                sessionStorage.removeItem('workout_finished');
                return;
              }
              sessionStorage.removeItem('workout_finished');
            }
          }
          
          const stored = await storageService.getActiveWorkout();
          // Solo restaurar si hay datos en storage Y no hay workout en memoria
          if (stored && !activeWorkoutRef.current) {
            if (process.env.NODE_ENV === 'development') {
              console.debug('[WorkoutContext] Restoring workout from storage');
            }
            
            // ✅ Validar con Zod
            const validationResult = validateDataWithLogging(
              WorkoutStateSchema,
              stored,
              '[WorkoutContext] Restoring workout on resume'
            );

            if (validationResult.success && validationResult.data) {
              const normalized = normalizeActiveWorkout(validationResult.data);
              setActiveWorkout(normalized);
              activeWorkoutRef.current = normalized;
            } else {
              // Datos corruptos - limpiar
              console.error('[WorkoutContext] Invalid workout state on resume, clearing:', validationResult.error);
              await storageService.clearActiveWorkout();
            }
          }
        } catch (e) {
          console.error('[WorkoutContext] Error restoring workout on resume:', e);
        }
      }, 100); // Pequeño delay para asegurar que clearActiveWorkout se completó
    }, [])
  });

  const value = useMemo(() => ({
    activeWorkout,
    startWorkout,
    updateWorkoutProgress,
    clearRestState,
    finishWorkout,
    cancelWorkout,
    isWorkoutActive: activeWorkout !== null
  }), [activeWorkout, startWorkout, updateWorkoutProgress, clearRestState, finishWorkout, cancelWorkout]);

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}
