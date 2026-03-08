'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
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
  updateCompletedSets: (exerciseId: string, count: number) => void;
  updateActualReps: (exerciseId: string, reps: number[]) => void;
  updateActualWeights: (exerciseId: string, weights: number[]) => void;
  updateSetType: (exerciseId: string, setIndex: number, type: string) => void;
  updateRestOverride: (exerciseId: string, duration: number) => void;
  updatePerSetRestOverride: (exerciseId: string, setIndex: number, duration: number) => void;
  updateSetDuration: (exerciseId: string, setIndex: number, duration: number) => void;
  updatePauseDuration: (exerciseId: string, setIndex: number, duration: number) => void;
  updateRestTime: (exerciseId: string, setIndex: number, duration: number) => void;
  
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
      console.log('[useWorkoutState] ✅ Initialization complete, ready to save');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Notificar cambios cuando workoutData cambia (después de inicialización)
  useEffect(() => {
    if (isInitializingRef.current) {
      console.log('[useWorkoutState] ⏸️ Skipping notification - initializing');
      return;
    }
    
    if (!workoutData._lastUpdate) {
      console.log('[useWorkoutState] ⏸️ Skipping notification - no timestamp');
      return;
    }

    if (onDataChangeRef.current) {
      console.log('[useWorkoutState] 📢 Notifying data change:', workoutData);
      onDataChangeRef.current(workoutData);
    }
  }, [workoutData]);

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
      
      // ✅ Guardar inmediatamente después de actualizar estado
      if (!isInitializingRef.current && onDataChangeRef.current) {
        setTimeout(() => {
          console.log('[useWorkoutState] 💾 Saving after completeSet');
          onDataChangeRef.current?.(newData);
        }, 0);
      }
      
      return newData;
    });
  }, []);

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
      
      // ✅ Guardar inmediatamente
      if (!isInitializingRef.current && onDataChangeRef.current) {
        setTimeout(() => {
          console.log('[useWorkoutState] 💾 Saving after updateCompletedSets');
          onDataChangeRef.current?.(newData);
        }, 0);
      }
      
      return newData;
    });
  }, []);

  /**
   * Actualiza las repeticiones reales
   */
  const updateActualReps = useCallback((exerciseId: string, reps: number[]) => {
    setWorkoutData(prev => {
      const newData = {
        ...prev,
        actualReps: { ...prev.actualReps, [exerciseId]: reps },
        _lastUpdate: Date.now()
      };
      
      // ✅ Guardar inmediatamente
      if (!isInitializingRef.current && onDataChangeRef.current) {
        setTimeout(() => {
          console.log('[useWorkoutState] 💾 Saving after updateActualReps');
          onDataChangeRef.current?.(newData);
        }, 0);
      }
      
      return newData;
    });
  }, []);

  /**
   * Actualiza los pesos reales
   */
  const updateActualWeights = useCallback((exerciseId: string, weights: number[]) => {
    setWorkoutData(prev => {
      const newData = {
        ...prev,
        actualWeights: { ...prev.actualWeights, [exerciseId]: weights },
        _lastUpdate: Date.now()
      };
      
      // ✅ Guardar inmediatamente
      if (!isInitializingRef.current && onDataChangeRef.current) {
        setTimeout(() => {
          console.log('[useWorkoutState] 💾 Saving after updateActualWeights');
          onDataChangeRef.current?.(newData);
        }, 0);
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
      
      // ✅ Guardar inmediatamente
      if (!isInitializingRef.current && onDataChangeRef.current) {
        setTimeout(() => {
          console.log('[useWorkoutState] 💾 Saving after updateSetType');
          onDataChangeRef.current?.(newData);
        }, 0);
      }
      
      return newData;
    });
  }, []);

  /**
   * Actualiza el descanso global del ejercicio
   */
  const updateRestOverride = useCallback((exerciseId: string, duration: number) => {
    setWorkoutData(prev => ({
      ...prev,
      restOverrides: { ...prev.restOverrides, [exerciseId]: duration },
      _lastUpdate: Date.now()
    }));
  }, []);

  /**
   * Actualiza el descanso de una serie específica
   */
  const updatePerSetRestOverride = useCallback((exerciseId: string, setIndex: number, duration: number) => {
    setWorkoutData(prev => {
      const overrides = [...(prev.perSetRestOverrides[exerciseId] || [])];
      overrides[setIndex] = duration;
      return {
        ...prev,
        perSetRestOverrides: { ...prev.perSetRestOverrides, [exerciseId]: overrides },
        _lastUpdate: Date.now()
      };
    });
  }, []);

  /**
   * Actualiza la duración de una serie
   */
  const updateSetDuration = useCallback((exerciseId: string, setIndex: number, duration: number) => {
    setWorkoutData(prev => {
      const durations = [...(prev.actualSetDurations[exerciseId] || [])];
      durations[setIndex] = duration;
      return {
        ...prev,
        actualSetDurations: { ...prev.actualSetDurations, [exerciseId]: durations },
        _lastUpdate: Date.now()
      };
    });
  }, []);

  /**
   * Actualiza el tiempo pausado de una serie
   */
  const updatePauseDuration = useCallback((exerciseId: string, setIndex: number, duration: number) => {
    setWorkoutData(prev => {
      const durations = [...(prev.actualPauseDurations[exerciseId] || [])];
      durations[setIndex] = duration;
      return {
        ...prev,
        actualPauseDurations: { ...prev.actualPauseDurations, [exerciseId]: durations },
        _lastUpdate: Date.now()
      };
    });
  }, []);

  /**
   * Actualiza el tiempo de descanso real
   */
  const updateRestTime = useCallback((exerciseId: string, setIndex: number, duration: number) => {
    setWorkoutData(prev => {
      const times = [...(prev.actualRestTimes[exerciseId] || [])];
      times[setIndex] = duration;
      return {
        ...prev,
        actualRestTimes: { ...prev.actualRestTimes, [exerciseId]: times },
        _lastUpdate: Date.now()
      };
    });
  }, []);

  /**
   * Restaura datos desde storage
   */
  const restoreData = useCallback((data: Partial<WorkoutData>) => {
    console.log('[useWorkoutState] 🔄 Restoring data:', data);
    setWorkoutData(prev => ({
      ...prev,
      ...data,
      _lastUpdate: Date.now() // ✅ Agregar timestamp para que se detecte el cambio
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

  return {
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
    updateCompletedSets,
    updateActualReps,
    updateActualWeights,
    updateSetType,
    updateRestOverride,
    updatePerSetRestOverride,
    updateSetDuration,
    updatePauseDuration,
    updateRestTime,
    
    // Utilidades
    reset,
    restoreData,
    getExerciseData,
  };
}
