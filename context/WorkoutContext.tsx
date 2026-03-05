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
  // ✅ Rutina modificada durante el entrenamiento (con series agregadas/eliminadas)
  modifiedRoutine?: Routine;
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
  updateModifiedRoutine: (routine: Routine) => void;
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
    // Manejar caso donde completedSets es un número (dato corrupto)
    let completedSets: { [key: string]: number } = {};
    if (typeof data.completedSets === 'object' && data.completedSets !== null && !Array.isArray(data.completedSets)) {
      const src = data.completedSets;
      Object.keys(src).forEach(k => {
        const v = (src as any)[k];
        completedSets[String(k)] = typeof v === 'number' ? v : Number(v ?? 0);
      });
    } else if (typeof data.completedSets === 'number') {
      // Dato corrupto: completedSets es un número en lugar de un objeto
      console.warn('[WorkoutContext] completedSets is a number, resetting to empty object');
      completedSets = {};
    }

    return {
      routineId: String(data.routineId),
      routineName: String(data.routineName),
      currentExerciseIndex: typeof data.currentExerciseIndex === 'string' 
        ? parseInt(data.currentExerciseIndex) || 0 
        : Number(data.currentExerciseIndex ?? 0),
      currentSet: typeof data.currentSet === 'string'
        ? parseInt(data.currentSet) || 1
        : Number(data.currentSet ?? 1),
      completedSets,
      actualReps: (() => {
        const out: { [key: string]: number[] } = {};
        const src = data.actualReps || {};
        if (typeof src === 'object' && src !== null && !Array.isArray(src)) {
          Object.keys(src).forEach(k => {
            const arr = (src as any)[k];
            out[String(k)] = Array.isArray(arr) ? arr.map(n => Number(n ?? 0)) : [];
          });
        }
        return out;
      })(),
      actualWeights: (() => {
        const out: { [key: string]: number[] } = {};
        const src = data.actualWeights || {};
        if (typeof src === 'object' && src !== null && !Array.isArray(src)) {
          Object.keys(src).forEach(k => {
            const arr = (src as any)[k];
            out[String(k)] = Array.isArray(arr) ? arr.map(n => Number(n ?? 0)) : [];
          });
        }
        return out;
      })(),
      startedAt: data.startedAt ? new Date(data.startedAt) : new Date(),
      // ✅ Rutina modificada durante el entrenamiento
      modifiedRoutine: data.modifiedRoutine || undefined,
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
          // ✅ Intentar normalizar primero, luego validar
          try {
            const normalized = normalizeActiveWorkout(stored);
            
            // Validar el dato normalizado
            const validationResult = validateDataWithLogging(
              WorkoutStateSchema,
              normalized,
              '[WorkoutContext] Loading active workout'
            );

            if (validationResult.success && validationResult.data) {
              setActiveWorkout(normalized);
            } else {
              // Datos corruptos incluso después de normalizar - limpiar
              console.error('[WorkoutContext] Invalid workout state after normalization, clearing:', validationResult.error);
              await storageService.clearActiveWorkout();
              setActiveWorkout(null);
            }
          } catch (normalizeError) {
            // Error durante normalización - datos muy corruptos
            console.error('[WorkoutContext] Error normalizing workout state, clearing:', normalizeError);
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

  const updateModifiedRoutine = useCallback((routine: Routine) => {
    console.log('[WorkoutContext] updateModifiedRoutine called with', routine.exercises.map((ex: any) => `${ex.id}:${ex.sets.length}`).join('|'));
    setActiveWorkout(prev => {
      if (!prev) return null;
      const newState = {
        ...prev,
        modifiedRoutine: routine
      };
      (async () => {
        try {
          await storageService.saveActiveWorkout(newState as unknown as ActiveWorkout);
          console.log('[WorkoutContext] Modified routine saved to storage');
        } catch (e) {
          console.warn('[Workout] Failed to persist modified routine:', e);
        }
      })();
      return newState;
    });
  }, []);

  const finishWorkout = useCallback(async () => {
    console.log('[WorkoutContext] finishWorkout called');
    
    // Marcar que el workout fue finalizado intencionalmente
    // Esto evita que onResume lo restaure
    if (typeof window !== 'undefined') {
      const timestamp = Date.now().toString();
      sessionStorage.setItem('workout_finished', timestamp);
      localStorage.setItem('workout_finished_persistent', timestamp);
      console.log('[WorkoutContext] Set finish markers:', timestamp);
    }
    
    // Actualizar la ref inmediatamente para evitar restauración
    activeWorkoutRef.current = null;
    setActiveWorkout(null);
    
    try {
      await storageService.clearActiveWorkout();
      console.log('[WorkoutContext] Active workout finished and cleared from storage');
    } catch (e) {
      console.error('[WorkoutContext] Error limpiando active workout:', e);
    }
  }, []);

  const cancelWorkout = useCallback(async () => {
    console.log('[WorkoutContext] cancelWorkout called');
    
    // Marcar que el workout fue cancelado intencionalmente
    // Esto evita que onResume lo restaure
    if (typeof window !== 'undefined') {
      const timestamp = Date.now().toString();
      sessionStorage.setItem('workout_cancelled', timestamp);
      localStorage.setItem('workout_cancelled_persistent', timestamp);
      console.log('[WorkoutContext] Set cancellation markers:', timestamp);
    }
    
    // Actualizar la ref inmediatamente para evitar restauración
    activeWorkoutRef.current = null;
    setActiveWorkout(null);
    
    try {
      await storageService.clearActiveWorkout();
      console.log('[WorkoutContext] Active workout cancelled and cleared from storage');
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
          // Verificar si el workout fue cancelado o finalizado recientemente
          if (typeof window !== 'undefined') {
            // Verificar sessionStorage (últimos 5 segundos)
            const cancelledAt = sessionStorage.getItem('workout_cancelled');
            const finishedAt = sessionStorage.getItem('workout_finished');
            
            // Verificar localStorage persistente (últimos 30 segundos)
            const cancelledPersistent = localStorage.getItem('workout_cancelled_persistent');
            const finishedPersistent = localStorage.getItem('workout_finished_persistent');
            
            if (cancelledAt || cancelledPersistent) {
              const timestamp = cancelledAt || cancelledPersistent;
              const timeSinceCancelled = Date.now() - parseInt(timestamp || '0');
              if (timeSinceCancelled < 30000) { // 30 segundos
                console.log('[WorkoutContext] Workout was recently cancelled, skipping restore. Time since:', timeSinceCancelled);
                sessionStorage.removeItem('workout_cancelled');
                if (timeSinceCancelled > 5000) {
                  // Limpiar el marcador persistente después de 5 segundos
                  localStorage.removeItem('workout_cancelled_persistent');
                }
                return;
              }
              sessionStorage.removeItem('workout_cancelled');
              localStorage.removeItem('workout_cancelled_persistent');
            }
            
            if (finishedAt || finishedPersistent) {
              const timestamp = finishedAt || finishedPersistent;
              const timeSinceFinished = Date.now() - parseInt(timestamp || '0');
              if (timeSinceFinished < 30000) { // 30 segundos
                console.log('[WorkoutContext] Workout was recently finished, skipping restore. Time since:', timeSinceFinished);
                sessionStorage.removeItem('workout_finished');
                if (timeSinceFinished > 5000) {
                  // Limpiar el marcador persistente después de 5 segundos
                  localStorage.removeItem('workout_finished_persistent');
                }
                return;
              }
              sessionStorage.removeItem('workout_finished');
              localStorage.removeItem('workout_finished_persistent');
            }
          }
          
          const stored = await storageService.getActiveWorkout();
          // Solo restaurar si hay datos en storage Y no hay workout en memoria
          if (stored && !activeWorkoutRef.current) {
            if (process.env.NODE_ENV === 'development') {
              console.debug('[WorkoutContext] Restoring workout from storage');
            }
            
            // ✅ Intentar normalizar primero, luego validar
            try {
              const normalized = normalizeActiveWorkout(stored);
              
              // Validar el dato normalizado
              const validationResult = validateDataWithLogging(
                WorkoutStateSchema,
                normalized,
                '[WorkoutContext] Restoring workout on resume'
              );

              if (validationResult.success && validationResult.data) {
                setActiveWorkout(normalized);
                activeWorkoutRef.current = normalized;
              } else {
                // Datos corruptos incluso después de normalizar - limpiar
                console.error('[WorkoutContext] Invalid workout state on resume after normalization, clearing:', validationResult.error);
                await storageService.clearActiveWorkout();
              }
            } catch (normalizeError) {
              // Error durante normalización - datos muy corruptos
              console.error('[WorkoutContext] Error normalizing workout state on resume, clearing:', normalizeError);
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
    updateModifiedRoutine,
    clearRestState,
    finishWorkout,
    cancelWorkout,
    isWorkoutActive: activeWorkout !== null
  }), [activeWorkout, startWorkout, updateWorkoutProgress, updateModifiedRoutine, clearRestState, finishWorkout, cancelWorkout]);

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
