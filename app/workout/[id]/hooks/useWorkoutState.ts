'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { Routine, Exercise } from '@/types';

/**
 * Hook que centraliza todo el estado del workout
 * 
 * Maneja:
 * - Estado de ejercicios y series
 * - Pesos y repeticiones
 * - Tiempos de descanso
 * - Notas de sesión
 */

interface WorkoutData {
  completedSets: { [key: string]: number };
  actualReps: { [key: string]: number[] };
  actualWeights: { [key: string]: number[] };
  setTypes: { [key: string]: string[] };
  lastWeights: { [key: string]: number[] };
  restOverrides: { [key: string]: number };
  perSetRestOverrides: { [key: string]: number[] };
  actualSetDurations: { [key: string]: number[] };
  actualPauseDurations: { [key: string]: number[] };
  actualRestTimes: { [key: string]: number[] };
  skippedExercises: string[]; // ✅ Array de exerciseIds omitidos
  // ✅ Flags explícitos de completado por serie: solo se activan al pulsar el botón naranja
  completedSetFlags: { [exerciseId: string]: boolean[] };
  // ✅ Timestamp para forzar re-renders cuando cambia el estado
  _lastUpdate?: number;
}

interface UseWorkoutStateOptions {
  onDataChange?: (data: WorkoutData) => void;
}

interface UseWorkoutStateReturn {
  // Estado
  workoutData: WorkoutData;
  currentExerciseIndex: number;
  currentSet: number;
  currentReps: number | '';
  currentWeight: number | '';
  sessionNotes: string;
  
  // Setters
  setCurrentExerciseIndex: (index: number) => void;
  setCurrentSet: (set: number) => void;
  setCurrentReps: (reps: number | '') => void;
  setCurrentWeight: (weight: number | '') => void;
  setSessionNotes: (notes: string) => void;
  
  // Acciones
  completeSet: (exerciseId: string, reps: number, weight: number) => void;
  completeSetAt: (exerciseId: string, setIndex: number, reps: number, weight: number) => void;
  updateCompletedSets: (exerciseId: string, count: number) => void;
  updateActualReps: (exerciseId: string, reps: number[]) => void;
  updateActualWeights: (exerciseId: string, weights: number[]) => void;
  updateSetType: (exerciseId: string, setIndex: number, type: string) => void;
  updateRestOverride: (exerciseId: string, duration: number) => void;
  updatePerSetRestOverride: (exerciseId: string, setIndex: number, duration: number) => void;
  updateSetDuration: (exerciseId: string, setIndex: number, duration: number) => void;
  updatePauseDuration: (exerciseId: string, setIndex: number, duration: number) => void;
  updateRestTime: (exerciseId: string, setIndex: number, duration: number) => void;
  skipExercise: (exerciseId: string) => void;
  unskipExercise: (exerciseId: string) => void;
  // ✅ Actualiza el flag explícito de completado de una serie específica
  updateCompletedSetFlag: (exerciseId: string, setIndex: number, flag: boolean) => void;
  
  // Utilidades
  reset: () => void;
  restoreData: (data: Partial<WorkoutData>) => void;
  getExerciseData: (exerciseId: string) => {
    completedSets: number;
    actualReps: number[];
    actualWeights: number[];
    setTypes: string[];
    lastWeights: number[];
  };
}

export function useWorkoutState(
  routine: Routine | null,
  options: UseWorkoutStateOptions = {}
): UseWorkoutStateReturn {
  const { onDataChange } = options;
  
  // Estado principal
  const [workoutData, setWorkoutData] = useState<WorkoutData>({
    completedSets: {},
    actualReps: {},
    actualWeights: {},
    setTypes: {},
    lastWeights: {},
    restOverrides: {},
    perSetRestOverrides: {},
    actualSetDurations: {},
    actualPauseDurations: {},
    actualRestTimes: {},
    skippedExercises: [], // ✅ Inicializar array vacío
    completedSetFlags: {}, // ✅ Flags explícitos de completado
  });

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentReps, setCurrentReps] = useState<number | ''>('');
  const [currentWeight, setCurrentWeight] = useState<number | ''>('');
  const [sessionNotes, setSessionNotes] = useState('');

  // Refs para evitar closures stale
  const workoutDataRef = useRef(workoutData);
  const onDataChangeRef = useRef(onDataChange);
  const isInitializingRef = useRef(true);

  useEffect(() => {
    workoutDataRef.current = workoutData;
  }, [workoutData]);

  useEffect(() => {
    onDataChangeRef.current = onDataChange;
  }, [onDataChange]);

  // Marcar como inicializado después del primer render
  useEffect(() => {
    const timer = setTimeout(() => {
      isInitializingRef.current = false;
      // console.log('[useWorkoutState] ✅ Initialization complete, ready to save');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // ✅ ELIMINADO: El efecto de notificación ya no es necesario
  // El guardado ahora se hace directamente en los callbacks de cada acción
  // Esto evita guardados duplicados y loops infinitos

  // ==================== ACCIONES ====================

  /**
   * Completa una serie con reps y peso
   */
  const completeSet = useCallback((exerciseId: string, reps: number, weight: number) => {
    setWorkoutData(prev => {
      const newReps = [...(prev.actualReps[exerciseId] || []), reps];
      const newWeights = [...(prev.actualWeights[exerciseId] || []), weight];
      
      const newData = {
        ...prev,
        actualReps: { ...prev.actualReps, [exerciseId]: newReps },
        actualWeights: { ...prev.actualWeights, [exerciseId]: newWeights },
        completedSets: { ...prev.completedSets, [exerciseId]: newReps.length },
        _lastUpdate: Date.now() // ✅ Forzar detección de cambios
      };
      
      // ✅ Guardar inmediatamente usando queueMicrotask para garantizar orden
      if (!isInitializingRef.current && onDataChangeRef.current) {
        queueMicrotask(() => {
          // console.log('[useWorkoutState] 💾 Saving after completeSet');
          onDataChangeRef.current?.(newData);
        });
      }
      
      return newData;
    });
  }, []);

  /**
   * Completa (o actualiza) una serie en un índice específico.
   * Esto escribe las reps/peso en la posición `setIndex` en lugar de hacer append.
   */
  const completeSetAt = useCallback(
    (exerciseId: string, setIndex: number, reps: number, weight: number) => {
      setWorkoutData((prev) => {
        const prevReps = [...(prev.actualReps[exerciseId] || [])];
        const prevWeights = [...(prev.actualWeights[exerciseId] || [])];

        // Asegurar longitud suficiente
        while (prevReps.length <= setIndex) prevReps.push(0);
        while (prevWeights.length <= setIndex) prevWeights.push(0);

        prevReps[setIndex] = reps;
        prevWeights[setIndex] = weight;

        // Usar el conteo previo como base y sólo incrementar hasta setIndex+1.
        // Esto evita que reps pre-editadas de series futuras inflen el contador.
        const completedCount = Math.max(
          prev.completedSets[exerciseId] ?? 0,
          setIndex + 1,
        );

        // ✅ Actualizar flag explícito de completado para este set
        const prevFlags = [...((prev.completedSetFlags || {})[exerciseId] || [])];
        while (prevFlags.length <= setIndex) prevFlags.push(false);
        prevFlags[setIndex] = true;

        const newData = {
          ...prev,
          actualReps: { ...prev.actualReps, [exerciseId]: prevReps },
          actualWeights: { ...prev.actualWeights, [exerciseId]: prevWeights },
          completedSets: { ...prev.completedSets, [exerciseId]: completedCount },
          completedSetFlags: { ...(prev.completedSetFlags || {}), [exerciseId]: prevFlags },
          _lastUpdate: Date.now(),
        };

        if (!isInitializingRef.current && onDataChangeRef.current) {
          queueMicrotask(() => {
            // console.log('[useWorkoutState] 💾 Saving after completeSetAt');
            onDataChangeRef.current?.(newData);
          });
        }

        return newData;
      });
    },
    [],
  );

  /**
   * Actualiza el número de series completadas
   */
  const updateCompletedSets = useCallback((exerciseId: string, count: number) => {
    setWorkoutData(prev => {
      const newData = {
        ...prev,
        completedSets: { ...prev.completedSets, [exerciseId]: count },
        _lastUpdate: Date.now()
      };
      
      // ✅ Guardar inmediatamente usando queueMicrotask
      if (!isInitializingRef.current && onDataChangeRef.current) {
        queueMicrotask(() => {
          // console.log('[useWorkoutState] 💾 Saving after updateCompletedSets');
          onDataChangeRef.current?.(newData);
        });
      }
      
      return newData;
    });
  }, []);

  /**
   * Valida un número para asegurar que sea válido y esté en rango
   */
  const validateNumber = (value: any, max: number): number => {
    const num = Number(value);
    if (!Number.isFinite(num) || num < 0) {
      return 0;
    }
    const rounded = Math.round(num * 100) / 100; // Redondear a 2 decimales
    return Math.min(rounded, max);
  };

  /**
   * Actualiza las repeticiones reales
   */
  const updateActualReps = useCallback((exerciseId: string, reps: number[]) => {
    // ✅ Validar cada repetición
    const validatedReps = reps.map(r => validateNumber(r, 999)); // Máximo 999 reps
    
    setWorkoutData(prev => {
      const newData = {
        ...prev,
        actualReps: { ...prev.actualReps, [exerciseId]: validatedReps },
        _lastUpdate: Date.now()
      };
      
      // ✅ Guardar inmediatamente usando queueMicrotask
      if (!isInitializingRef.current && onDataChangeRef.current) {
        queueMicrotask(() => {
          // console.log('[useWorkoutState] 💾 Saving after updateActualReps');
          onDataChangeRef.current?.(newData);
        });
      }
      
      return newData;
    });
  }, []);

  /**
   * Actualiza los pesos reales
   */
  const updateActualWeights = useCallback((exerciseId: string, weights: number[]) => {
    // ✅ Validar cada peso
    const validatedWeights = weights.map(w => validateNumber(w, 9999)); // Máximo 9999 kg
    
    setWorkoutData(prev => {
      const newData = {
        ...prev,
        actualWeights: { ...prev.actualWeights, [exerciseId]: validatedWeights },
        _lastUpdate: Date.now()
      };
      
      // ✅ Guardar inmediatamente usando queueMicrotask
      if (!isInitializingRef.current && onDataChangeRef.current) {
        queueMicrotask(() => {
          // console.log('[useWorkoutState] 💾 Saving after updateActualWeights');
          onDataChangeRef.current?.(newData);
        });
      }
      
      return newData;
    });
  }, []);

  /**
   * Actualiza el tipo de serie
   */
  const updateSetType = useCallback((exerciseId: string, setIndex: number, type: string) => {
    setWorkoutData(prev => {
      const types = [...(prev.setTypes[exerciseId] || [])];
      types[setIndex] = type;
      const newData = {
        ...prev,
        setTypes: { ...prev.setTypes, [exerciseId]: types },
        _lastUpdate: Date.now()
      };
      
      // ✅ Guardar inmediatamente usando queueMicrotask
      if (!isInitializingRef.current && onDataChangeRef.current) {
        queueMicrotask(() => {
          // console.log('[useWorkoutState] 💾 Saving after updateSetType');
          onDataChangeRef.current?.(newData);
        });
      }
      
      return newData;
    });
  }, []);

  /**
   * Actualiza el descanso global del ejercicio
   */
  const updateRestOverride = useCallback((exerciseId: string, duration: number) => {
    setWorkoutData(prev => {
      // Limpiar per-set overrides del ejercicio para que el override de nivel ejercicio tenga efecto
      const newPerSetOverrides = { ...prev.perSetRestOverrides };
      delete newPerSetOverrides[exerciseId];

      const newData = {
        ...prev,
        restOverrides: { ...prev.restOverrides, [exerciseId]: duration },
        perSetRestOverrides: newPerSetOverrides,
        _lastUpdate: Date.now()
      };

      if (!isInitializingRef.current && onDataChangeRef.current) {
        queueMicrotask(() => {
          onDataChangeRef.current?.(newData);
        });
      }

      return newData;
    });
  }, []);

  /**
   * Actualiza el descanso de una serie específica
   */
  const updatePerSetRestOverride = useCallback((exerciseId: string, setIndex: number, duration: number) => {
    setWorkoutData(prev => {
      const overrides = [...(prev.perSetRestOverrides[exerciseId] || [])];
      overrides[setIndex] = duration;
      const newData = {
        ...prev,
        perSetRestOverrides: { ...prev.perSetRestOverrides, [exerciseId]: overrides },
        _lastUpdate: Date.now()
      };

      if (!isInitializingRef.current && onDataChangeRef.current) {
        queueMicrotask(() => {
          onDataChangeRef.current?.(newData);
        });
      }

      return newData;
    });
  }, []);

  /**
   * Actualiza la duración de una serie
   */
  const updateSetDuration = useCallback((exerciseId: string, setIndex: number, duration: number) => {
    setWorkoutData(prev => {
      const durations = [...(prev.actualSetDurations[exerciseId] || [])];
      durations[setIndex] = duration;
      const newData = {
        ...prev,
        actualSetDurations: { ...prev.actualSetDurations, [exerciseId]: durations },
        _lastUpdate: Date.now()
      };

      if (!isInitializingRef.current && onDataChangeRef.current) {
        queueMicrotask(() => {
          onDataChangeRef.current?.(newData);
        });
      }

      return newData;
    });
  }, []);

  /**
   * Actualiza el tiempo pausado de una serie
   */
  const updatePauseDuration = useCallback((exerciseId: string, setIndex: number, duration: number) => {
    setWorkoutData(prev => {
      const durations = [...(prev.actualPauseDurations[exerciseId] || [])];
      durations[setIndex] = duration;
      const newData = {
        ...prev,
        actualPauseDurations: { ...prev.actualPauseDurations, [exerciseId]: durations },
        _lastUpdate: Date.now()
      };

      if (!isInitializingRef.current && onDataChangeRef.current) {
        queueMicrotask(() => {
          onDataChangeRef.current?.(newData);
        });
      }

      return newData;
    });
  }, []);

  /**
   * Actualiza el tiempo de descanso real
   */
  const updateRestTime = useCallback((exerciseId: string, setIndex: number, duration: number) => {
    setWorkoutData(prev => {
      const times = [...(prev.actualRestTimes[exerciseId] || [])];
      times[setIndex] = duration;
      const newData = {
        ...prev,
        actualRestTimes: { ...prev.actualRestTimes, [exerciseId]: times },
        _lastUpdate: Date.now()
      };

      if (!isInitializingRef.current && onDataChangeRef.current) {
        queueMicrotask(() => {
          onDataChangeRef.current?.(newData);
        });
      }

      return newData;
    });
  }, []);

  /**
   * Omite un ejercicio (lo agrega a la lista de omitidos)
   */
  const skipExercise = useCallback((exerciseId: string) => {
    setWorkoutData(prev => {
      const skippedExercises = prev.skippedExercises || [];
      if (skippedExercises.includes(exerciseId)) {
        return prev; // Ya está omitido
      }
      
      const newData = {
        ...prev,
        skippedExercises: [...skippedExercises, exerciseId],
        _lastUpdate: Date.now()
      };

      if (!isInitializingRef.current && onDataChangeRef.current) {
        queueMicrotask(() => {
          // console.log('[useWorkoutState] 💾 Saving after skipExercise');
          onDataChangeRef.current?.(newData);
        });
      }

      return newData;
    });
  }, []);

  /**
   * Actualiza el flag explícito de completado de una serie.
   * Solo debe llamarse al pulsar el botón naranja (completar/descompletar).
   */
  const updateCompletedSetFlag = useCallback((exerciseId: string, setIndex: number, flag: boolean) => {
    setWorkoutData(prev => {
      const prevFlags = [...((prev.completedSetFlags || {})[exerciseId] || [])];
      while (prevFlags.length <= setIndex) prevFlags.push(false);
      prevFlags[setIndex] = flag;
      const newData = {
        ...prev,
        completedSetFlags: { ...(prev.completedSetFlags || {}), [exerciseId]: prevFlags },
        _lastUpdate: Date.now(),
      };
      if (!isInitializingRef.current && onDataChangeRef.current) {
        queueMicrotask(() => {
          onDataChangeRef.current?.(newData);
        });
      }
      return newData;
    });
  }, []);

  /**
   * Desomite un ejercicio (lo remueve de la lista de omitidos)
   */
  const unskipExercise = useCallback((exerciseId: string) => {
    setWorkoutData(prev => {
      const skippedExercises = prev.skippedExercises || [];
      const newData = {
        ...prev,
        skippedExercises: skippedExercises.filter(id => id !== exerciseId),
        _lastUpdate: Date.now()
      };

      if (!isInitializingRef.current && onDataChangeRef.current) {
        queueMicrotask(() => {
          // console.log('[useWorkoutState] 💾 Saving after unskipExercise');
          onDataChangeRef.current?.(newData);
        });
      }

      return newData;
    });
  }, []);

  /**
   * Valida la estructura de WorkoutData
   */
  const validateWorkoutData = (data: any): boolean => {
    if (!data || typeof data !== 'object') return false;
    
    // Validar que los campos requeridos sean objetos
    const requiredFields = [
      'completedSets', 'actualReps', 'actualWeights', 'setTypes',
      'lastWeights', 'restOverrides', 'perSetRestOverrides',
      'actualSetDurations', 'actualPauseDurations', 'actualRestTimes'
    ];
    
    for (const field of requiredFields) {
      if (data[field] && typeof data[field] !== 'object') {
        console.warn(`[useWorkoutState] Invalid field type: ${field}`);
        return false;
      }
    }
    
    // Validar que skippedExercises sea un array si existe
    if (data.skippedExercises && !Array.isArray(data.skippedExercises)) {
      console.warn(`[useWorkoutState] Invalid field type: skippedExercises must be array`);
      return false;
    }
    
    return true;
  };

  /**
   * Restaura datos desde storage
   */
  const restoreData = useCallback((data: Partial<WorkoutData>) => {
    // console.log('[useWorkoutState] 🔄 Restoring data:', data);
    
    // ✅ Validar estructura antes de restaurar
    if (!validateWorkoutData(data)) {
      console.error('[useWorkoutState] ❌ Invalid data structure, skipping restore');
      return;
    }
    
    // ✅ Validar y limpiar arrays numéricos
    const sanitizedData: Partial<WorkoutData> = { ...data };
    
    if (data.actualReps) {
      sanitizedData.actualReps = {};
      for (const [key, value] of Object.entries(data.actualReps)) {
        if (Array.isArray(value)) {
          sanitizedData.actualReps[key] = value.map(r => validateNumber(r, 999));
        }
      }
    }
    
    if (data.actualWeights) {
      sanitizedData.actualWeights = {};
      for (const [key, value] of Object.entries(data.actualWeights)) {
        if (Array.isArray(value)) {
          sanitizedData.actualWeights[key] = value.map(w => validateNumber(w, 9999));
        }
      }
    }
    
    // ✅ Validar y limpiar skippedExercises
    if (data.skippedExercises) {
      if (Array.isArray(data.skippedExercises)) {
        sanitizedData.skippedExercises = data.skippedExercises.filter(id => typeof id === 'string');
      } else {
        sanitizedData.skippedExercises = [];
      }
    }

    // ✅ Compatibilidad hacia atrás: si no hay completedSetFlags guardados,
    // derivarlos desde actualReps (sets con reps > 0 se consideran completados)
    if (!data.completedSetFlags && sanitizedData.actualReps) {
      const derivedFlags: { [exerciseId: string]: boolean[] } = {};
      for (const [exId, reps] of Object.entries(sanitizedData.actualReps)) {
        if (Array.isArray(reps)) {
          derivedFlags[exId] = reps.map(r => typeof r === 'number' && r > 0);
        }
      }
      sanitizedData.completedSetFlags = derivedFlags;
    }
    
    setWorkoutData(prev => ({
      ...prev,
      ...sanitizedData,
      _lastUpdate: Date.now()
    }));
  }, []);

  /**
   * Resetea todo el estado
   */
  const reset = useCallback(() => {
    setWorkoutData({
      completedSets: {},
      actualReps: {},
      actualWeights: {},
      setTypes: {},
      lastWeights: {},
      restOverrides: {},
      perSetRestOverrides: {},
      actualSetDurations: {},
      actualPauseDurations: {},
      actualRestTimes: {},
      skippedExercises: [], // ✅ Resetear ejercicios omitidos
      completedSetFlags: {}, // ✅ Resetear flags de completado
    });
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
    setCurrentReps('');
    setCurrentWeight('');
    setSessionNotes('');
  }, []);

  /**
   * Obtiene los datos de un ejercicio específico
   */
  const getExerciseData = useCallback((exerciseId: string) => {
    return {
      completedSets: workoutDataRef.current.completedSets[exerciseId] || 0,
      actualReps: workoutDataRef.current.actualReps[exerciseId] || [],
      actualWeights: workoutDataRef.current.actualWeights[exerciseId] || [],
      setTypes: workoutDataRef.current.setTypes[exerciseId] || [],
      lastWeights: workoutDataRef.current.lastWeights[exerciseId] || [],
    };
  }, []);

  // Memoizar el objeto devuelto para evitar re-ejecución de efectos
  const returnValue = useMemo(() => ({
    // Estado
    workoutData,
    currentExerciseIndex,
    currentSet,
    currentReps,
    currentWeight,
    sessionNotes,

    // Setters
    setCurrentExerciseIndex,
    setCurrentSet,
    setCurrentReps,
    setCurrentWeight,
    setSessionNotes,

    // Acciones
    completeSet,
    completeSetAt,
    updateCompletedSets,
    updateActualReps,
    updateActualWeights,
    updateSetType,
    updateRestOverride,
    updatePerSetRestOverride,
    updateSetDuration,
    updatePauseDuration,
    updateRestTime,
    skipExercise,
    unskipExercise,
    updateCompletedSetFlag,

    // Utilidades
    reset,
    restoreData,
    getExerciseData,
  }), [
    workoutData,
    currentExerciseIndex,
    currentSet,
    currentReps,
    currentWeight,
    sessionNotes,
    completeSet,
    completeSetAt,
    updateCompletedSets,
    updateActualReps,
    updateActualWeights,
    updateSetType,
    updateRestOverride,
    updatePerSetRestOverride,
    updateSetDuration,
    updatePauseDuration,
    updateRestTime,
    skipExercise,
    unskipExercise,
    updateCompletedSetFlag,
    reset,
    restoreData,
    getExerciseData,
  ]);

  return returnValue;
}
