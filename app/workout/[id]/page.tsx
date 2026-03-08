'use client';

import { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense, memo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGym } from '@/context/GymContext';
import { useWorkout } from '@/context/WorkoutContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Timer } from '@/components/Timer';
import { MinimizedTimer } from '@/components/MinimizedTimer';
import ProtectedRoute from '@/components/ProtectedRoute';
import * as storageService from '@/lib/storage/storage';
import { useWorkoutState } from './hooks/useWorkoutState';
import { useWorkoutTimer } from './hooks/useWorkoutTimer';
import { useWeightPrediction } from './hooks/useWeightPrediction';
import { useSetExecution } from './hooks/useSetExecution';
import { useWorkoutCompletion } from './hooks/useWorkoutCompletion';
import { useWorkoutSuggestions } from './hooks/useWorkoutSuggestions';
import { useWakeLock } from './hooks/useWakeLock';
import { useHapticFeedback } from './hooks/useHapticFeedback';
import { CompactWorkoutHeader } from './components/CompactWorkoutHeader';
import { ExerciseCard as ExerciseCardBase } from './components/ExerciseCard';
import { ExerciseList } from './components/ExerciseList';
import { QuickExerciseSwitcher } from './components/QuickExerciseSwitcher';
import { AddExerciseButton } from './components/AddExerciseButton';
import { QuickEditMode as QuickEditModeBase } from './components/QuickEditMode';
import { FinishWorkoutModal } from './components/FinishWorkoutModal';
import type { ExerciseTemplate } from '@/data/exercises';
import type { Exercise } from '@/types';
import { 
  calculateNextRestTime, 
  calculateExerciseRestTime,
  calculateSmartRestTime,
  applySmartRestToAllSets
} from './services/restCalculationService';
import { 
  getPersonalRecord, 
  compareWithRecord,
  type PersonalRecord,
  type RecordComparison
} from '@/lib/personalRecords';

// Lazy load componentes pesados que no se usan inmediatamente
const SeriesTable = lazy(() => import('./components/SeriesTable').then(m => ({ default: m.SeriesTable })));
const ExerciseInfoPanel = lazy(() => import('@/components/ExerciseInfoPanel').then(m => ({ default: m.ExerciseInfoPanel })));
const SetExecutionModal = lazy(() => import('@/components/SetExecutionModal').then(m => ({ default: m.SetExecutionModal })));

// ✅ Memoización de componentes pesados para evitar re-renders innecesarios
const ExerciseCard = memo(ExerciseCardBase);
const QuickEditMode = memo(QuickEditModeBase);

// Lazy load de datos pesados
let EXERCISE_DATABASE: any[] = [];
import('@/data/exercises').then(m => {
  EXERCISE_DATABASE = m.EXERCISE_DATABASE;
});

export default function WorkoutPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const { getRoutineById, addSession, sessions, loading: gymLoading, updateRoutine } = useGym();
  const { activeWorkout, startWorkout, updateWorkoutProgress, updateModifiedRoutine, clearRestState, finishWorkout: finishWorkoutContext, cancelWorkout, skipExercise, unskipExercise } = useWorkout();
  const { success, error } = useToast();
  const { confirm } = useConfirm();
  
  // ==================== STATE ====================
  const [routine, setRoutine] = useState<any>(null);
  const workoutState = useWorkoutState(routine || null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showExerciseInfo, setShowExerciseInfo] = useState(false);
  const [isSeriesTableExpanded, setIsSeriesTableExpanded] = useState(false);
  const [isQuickEditMode, setIsQuickEditMode] = useState(false);
  const [useSmartRest] = useState(true);
  const [pendingToast, setPendingToast] = useState<{message: string, duration: number} | null>(null);
  const [newRecord, setNewRecord] = useState<{exerciseId: string, exerciseName: string, weight: number, previousRecord: number} | null>(null);
  const [showRecordCelebration, setShowRecordCelebration] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState(() => {
    // Solo acceder a localStorage en el cliente
    if (typeof window === 'undefined') {
      return Date.now();
    }
    
    // Intentar leer el tiempo de inicio guardado para evitar el flash
    try {
      const stored = localStorage.getItem('gym-tracker-active-workout');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.startedAt) {
          const startTime = new Date(parsed.startedAt).getTime();
          console.log('[Workout Init] Loaded start time from storage:', new Date(startTime).toISOString());
          return startTime;
        }
      }
    } catch (e) {
      console.warn('[Workout] Could not read stored start time:', e);
    }
    return Date.now();
  });
  const [totalPausedTime, setTotalPausedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showEditTimeModal, setShowEditTimeModal] = useState(false);
  const [editingTime, setEditingTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  
  // Actualizar tiempo transcurrido cada segundo SOLO si NO está pausado
  useEffect(() => {
    if (isPaused) {
      // Si está pausado, no actualizar el tiempo
      return;
    }
    
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - workoutStartTime - totalPausedTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [workoutStartTime, totalPausedTime, isPaused]);
  
  // ==================== COMPUTED VALUES ====================
  const currentExercise = useMemo(() => {
    if (!routine?.exercises?.length) return null;
    return routine.exercises[workoutState.currentExerciseIndex] || null;
  }, [routine?.exercises, workoutState.currentExerciseIndex]);

  const lastSessionForExercise = useMemo(() => {
    if (!currentExercise || sessions.length === 0) return null;
    
    const relevantSessions = sessions
      .filter(s => s.exercises.some(e => e.exerciseName === currentExercise.name))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return relevantSessions[0] || null;
  }, [currentExercise, sessions]);

  const smartRestTime = useMemo(() => {
    if (!currentExercise) return undefined;
    const useSmartRestForExercise = currentExercise.useSmartRest !== false;
    if (!useSmartRestForExercise) return undefined;
    return calculateSmartRestTime(currentExercise);
  }, [currentExercise]);

  const currentExerciseRecord = useMemo(() => {
    if (!currentExercise || sessions.length === 0) return null;
    return getPersonalRecord(currentExercise.id, sessions);
  }, [currentExercise?.id, sessions]);

  const lastSetData = useMemo(() => {
    if (!currentExercise) return null;
    
    const exerciseId = currentExercise.id;
    const currentSetIndex = workoutState.currentSet - 1;
    
    if (currentSetIndex === 0 && lastSessionForExercise) {
      const lastExerciseData = lastSessionForExercise.exercises.find(
        e => e.exerciseName === currentExercise.name
      );
      if (lastExerciseData && lastExerciseData.actualReps[0] && lastExerciseData.actualWeight[0]) {
        return {
          reps: lastExerciseData.actualReps[0],
          weight: lastExerciseData.actualWeight[0]
        };
      }
    }
    
    if (currentSetIndex > 0) {
      const prevReps = workoutState.workoutData.actualReps[exerciseId]?.[currentSetIndex - 1];
      const prevWeight = workoutState.workoutData.actualWeights[exerciseId]?.[currentSetIndex - 1];
      
      if (prevReps && prevWeight) {
        return { reps: prevReps, weight: prevWeight };
      }
    }
    
    return null;
  }, [currentExercise, workoutState.currentSet, workoutState.workoutData.actualReps, workoutState.workoutData.actualWeights, lastSessionForExercise]);

  // ✅ Memoizar cálculo de progreso total para evitar recalcular en cada render
  const workoutProgress = useMemo(() => {
    if (!routine?.exercises?.length) {
      return { totalSets: 0, completedSets: 0, percentage: 0 };
    }

    const totalSets = routine.exercises.reduce((sum: number, ex: Exercise) => sum + ex.sets.length, 0);
    const completedSets = routine.exercises.reduce((sum: number, ex: Exercise) => {
      const exerciseCompletedSets = workoutState.workoutData.completedSets[ex.id] || 0;
      return sum + Math.min(exerciseCompletedSets, ex.sets.length);
    }, 0);
    const percentage = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

    return { totalSets, completedSets, percentage };
  }, [routine?.exercises, workoutState.workoutData.completedSets]);

  // ==================== CUSTOM HOOKS ====================
    const handleTimerCompleteRef = useRef(() => {});
    const timerHandlers = useWorkoutTimer(() => handleTimerCompleteRef.current());
    
    const weightPrediction = useWeightPrediction({
      currentExercise,
      currentSet: workoutState.currentSet,
      sessions,
      actualWeights: workoutState.workoutData.actualWeights,
      isInitialized
    });
  
  const setExecution = useSetExecution({
    onSetStart: () => haptic.setStart(),
  });
  
  // Debug: Log setExecution state changes
  useEffect(() => {
    console.log('[Workout] setExecution state:', {
      showSetExecution: setExecution.showSetExecution,
      isExecutingSet: setExecution.isExecutingSet
    });
  }, [setExecution.showSetExecution, setExecution.isExecutingSet]);
  
  const completion = useWorkoutCompletion({
    routine,
    workoutStartTime,
    totalPausedTime,
    sessions,
    addSession,
    finishWorkoutContext,
    onSuccess: success,
    onError: error,
    router,
    onWorkoutComplete: () => haptic.workoutComplete(),
    onAchievementUnlocked: () => haptic.achievement(),
  });
  
  useWorkoutSuggestions({
    currentExercise,
    routine,
    currentSet: workoutState.currentSet,
    currentWeight: workoutState.currentWeight,
    sessions: sessions as any,
    restOverrides: workoutState.workoutData.restOverrides,
    perSetRestOverrides: workoutState.workoutData.perSetRestOverrides,
    useSmartRest,
    smartRestTime,
    showTimer: timerHandlers.showTimer,
    isExecutingSet: setExecution.isExecutingSet,
    onSuccess: success,
    onError: error
  });

  // Wake Lock para mantener la pantalla activa
  const wakeLock = useWakeLock();
  
  // Haptic Feedback mejorado
  const haptic = useHapticFeedback();

  // ==================== INITIALIZATION ====================
  const lastSyncedRoutineRef = useRef<string | null>(null);
  const hasLoadedModifiedRoutineRef = useRef(false);
  const lastRoutineIdRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (gymLoading) return;
    
    // ✅ Resetear el flag cuando cambia el id del workout
    if (lastRoutineIdRef.current !== id) {
      hasLoadedModifiedRoutineRef.current = false;
      lastRoutineIdRef.current = id;
    }
    
    let mounted = true;
    
    const initializeWorkout = async () => {
      
      // ✅ Priorizar la rutina modificada del activeWorkout si existe
      // Solo cargar una vez para evitar loops
      let foundRoutine = null;
      
      if (activeWorkout?.modifiedRoutine && !hasLoadedModifiedRoutineRef.current) {
        foundRoutine = activeWorkout.modifiedRoutine;
        hasLoadedModifiedRoutineRef.current = true;
      }
      
      if (!foundRoutine) {
        foundRoutine = getRoutineById(id);
      }
      
      if (!foundRoutine) {
        router.push('/routines');
        return;
      }
      
      if (!mounted) return;
      
      // Optimización: Preparar rutina con defaults de forma más eficiente
      const routineWithDefaults = {
        ...foundRoutine,
        exercises: foundRoutine.exercises.map((ex: any) => ({
          ...ex,
          useSmartRest: ex.useSmartRest ?? true
        }))
      };
      
      setRoutine(routineWithDefaults);
      
      // Optimización: Leer storage de forma síncrona si es posible
      const storedWorkout = await storageService.getActiveWorkout();
      
      if (!mounted) return;
      
      if (storedWorkout && storedWorkout.routineId === id) {
        const s = storedWorkout as any;
        
        // Restaurar el tiempo de inicio del entrenamiento
        if (s.startedAt) {
          const startTime = new Date(s.startedAt).getTime();
          setWorkoutStartTime(startTime);
        }
        
        // Optimización: Batch state updates
        const exerciseIndex = Number(s.currentExerciseIndex ?? 0);
        const currentSet = Number(s.currentSet ?? 1);
        
        workoutState.setCurrentExerciseIndex(exerciseIndex);
        workoutState.setCurrentSet(currentSet);
        
        // Optimización: Procesar completedSets de forma más eficiente
        if (s.completedSets) {
          for (const [exerciseId, count] of Object.entries(s.completedSets)) {
            workoutState.updateCompletedSets(exerciseId, Number(count ?? 0));
          }
        }
        
        // Optimización: Procesar actualReps de forma más eficiente
        if (s.actualReps) {
          for (const [exerciseId, reps] of Object.entries(s.actualReps)) {
            if (Array.isArray(reps)) {
              workoutState.updateActualReps(exerciseId, reps.map((r: any) => Number(r ?? 0)));
            }
          }
        }
        
        // Optimización: Procesar actualWeights de forma más eficiente
        if (s.actualWeights) {
          for (const [exerciseId, weights] of Object.entries(s.actualWeights)) {
            if (Array.isArray(weights)) {
              workoutState.updateActualWeights(exerciseId, weights.map((w: any) => Number(w ?? 0)));
            }
          }
        }
        
        // Restaurar timer si estaba en descanso
        if (s.isResting && s.restTimerDuration && s.restTimerStartedAt) {
          const elapsed = Math.floor((Date.now() - Number(s.restTimerStartedAt)) / 1000);
          const remaining = Number(s.restTimerDuration) - elapsed;
          if (remaining > 0) {
            timerHandlers.startTimer(remaining, String(s.restTimerTitle || 'Descanso'), s.restTimerNextExercise ? String(s.restTimerNextExercise) : undefined);
          }
        }
        
        // Restaurar valores actuales del ejercicio
        const currentExercise = routineWithDefaults.exercises[exerciseIndex];
        if (currentExercise) {
          const currentSetData = currentExercise.sets[currentSet - 1];
          if (currentSetData) {
            workoutState.setCurrentReps(currentSetData.reps);
            workoutState.setCurrentWeight(currentSetData.weight || 0);
          }
        }
      } else {
        // Nuevo entrenamiento
        startWorkout(routineWithDefaults);
        
        const firstExercise = routineWithDefaults.exercises[0];
        if (firstExercise) {
          const firstSet = firstExercise.sets[0];
          if (firstSet) {
            workoutState.setCurrentReps(firstSet.reps);
            workoutState.setCurrentWeight(firstSet.weight || 0);
          }
          
          // NO iniciar automáticamente la primera serie en modo guiado
          // El usuario presionará el botón "Iniciar Serie" cuando esté listo
        }
      }
      
      if (mounted) {
        setIsInitialized(true);
        console.log('[Init] Initialization complete');
      }
    };
    
    initializeWorkout();
    
    return () => {
      mounted = false;
    };
  }, [id, gymLoading]);

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (!currentExercise || !isInitialized) return;
    
    const exerciseId = currentExercise.id;
    const setIndex = workoutState.currentSet - 1;
    
    const actualReps = workoutState.workoutData.actualReps[exerciseId]?.[setIndex];
    const actualWeight = workoutState.workoutData.actualWeights[exerciseId]?.[setIndex];
    
    const repsToShow = (actualReps !== undefined && actualReps !== 0)
      ? actualReps
      : currentExercise.sets[setIndex]?.reps || 0;
    
    const weightToShow = (actualWeight !== undefined && actualWeight !== 0)
      ? actualWeight
      : currentExercise.sets[setIndex]?.weight || 0;
    
    if (workoutState.currentReps !== repsToShow) {
      workoutState.setCurrentReps(repsToShow);
    }
    if (workoutState.currentWeight !== weightToShow) {
      workoutState.setCurrentWeight(weightToShow);
    }
  }, [currentExercise, workoutState.currentSet, workoutState.workoutData.actualReps, workoutState.workoutData.actualWeights, isInitialized]);
  
  useEffect(() => {
    if (!routine || !isInitialized) return;
    
    updateWorkoutProgress(
      workoutState.currentExerciseIndex,
      workoutState.currentSet,
      workoutState.workoutData.completedSets,
      workoutState.workoutData.actualReps,
      workoutState.workoutData.actualWeights,
      timerHandlers.showTimer ? {
        isResting: true,
        restTimerDuration: timerHandlers.timerDuration,
        restTimerTitle: timerHandlers.timerTitle,
        restTimerNextExercise: timerHandlers.nextExerciseName,
        restTimerStartedAt: Date.now()
      } : undefined,
      totalPausedTime
    );
  }, [
    workoutState.currentExerciseIndex,
    workoutState.currentSet,
    workoutState.workoutData.completedSets,
    workoutState.workoutData.actualReps,
    workoutState.workoutData.actualWeights,
    timerHandlers.showTimer,
    routine,
    isInitialized,
    totalPausedTime
  ]);
  
  useEffect(() => {
    if (timerHandlers.showTimer) {
      document.body.classList.add('hide-navbar');
    } else {
      document.body.classList.remove('hide-navbar');
    }

    return () => {
      document.body.classList.remove('hide-navbar');
    };
  }, [timerHandlers.showTimer]);

  // Sincronizar estado cuando se cambia de modo de edición rápida a modo guiado
  useEffect(() => {
    if (!isQuickEditMode && currentExercise && isInitialized) {
      const exerciseId = currentExercise.id;
      
      // Calcular cuántas series están realmente completadas
      const actualReps = workoutState.workoutData.actualReps[exerciseId] || [];
      const completedCount = actualReps.filter((r: number) => typeof r === 'number' && r > 0).length;
      
      // ✅ Usar un flag para evitar múltiples ejecuciones
      const hasCompletedAllSets = completedCount >= currentExercise.sets.length;
      
      // Si todas las series están completadas, avanzar al siguiente ejercicio
      if (hasCompletedAllSets) {
        const isLastExercise = workoutState.currentExerciseIndex >= routine.exercises.length - 1;
        
        if (isLastExercise) {
          // Último ejercicio completado - abrir modal de finalización solo si no está ya abierto
          if (!completion.showNotesModal) {
            const duration = Math.floor((Date.now() - workoutStartTime - totalPausedTime) / 1000);
            completion.openCompletionModal(duration);
          }
        } else {
          // ✅ Usar setTimeout para evitar cambios de estado en cascada
          setTimeout(() => {
            const nextIndex = workoutState.currentExerciseIndex + 1;
            const nextExercise = routine.exercises[nextIndex];
            
            if (nextExercise) {
              workoutState.setCurrentExerciseIndex(nextIndex);
              workoutState.setCurrentSet(1);
              
              // Cargar datos del siguiente ejercicio
              if (nextExercise.sets[0]) {
                workoutState.setCurrentReps(nextExercise.sets[0].reps);
                workoutState.setCurrentWeight(nextExercise.sets[0].weight || 0);
              }
            }
          }, 0);
        }
        return;
      }
      
      // ✅ Sincronizar currentSet solo si es necesario
      const nextIncompleteIndex = actualReps.findIndex((r: number) => !r || r === 0);
      const nextSet = nextIncompleteIndex !== -1 ? nextIncompleteIndex + 1 : completedCount + 1;
      
      // Actualizar currentSet si es diferente
      if (nextSet !== workoutState.currentSet && nextSet <= currentExercise.sets.length) {
        workoutState.setCurrentSet(nextSet);
        
        // ✅ Cargar datos de la serie actual
        const nextSetData = currentExercise.sets[nextSet - 1];
        if (nextSetData) {
          const savedReps = actualReps[nextSet - 1];
          const savedWeight = workoutState.workoutData.actualWeights[exerciseId]?.[nextSet - 1];
          
          workoutState.setCurrentReps(savedReps && savedReps > 0 ? savedReps : nextSetData.reps);
          workoutState.setCurrentWeight(savedWeight !== undefined ? savedWeight : (nextSetData.weight || 0));
        }
      }
    }
  }, [isQuickEditMode, currentExercise?.id, isInitialized, workoutState, routine?.exercises, workoutStartTime, completion]);

  // Limpiar datos residuales de series que ya no existen y corregir currentSet
  useEffect(() => {
    if (!routine || !isInitialized || !currentExercise) return;
    
    let hasChanges = false;
    
    routine.exercises.forEach((exercise: Exercise) => {
      const exerciseId = exercise.id;
      const maxSets = exercise.sets.length;
      
      // Limpiar actualReps
      const currentReps = workoutState.workoutData.actualReps[exerciseId];
      if (currentReps && currentReps.length > maxSets) {
        console.log(`[Cleanup] Trimming actualReps for ${exerciseId} from ${currentReps.length} to ${maxSets}`);
        workoutState.updateActualReps(exerciseId, currentReps.slice(0, maxSets));
        hasChanges = true;
      }
      
      // Limpiar actualWeights
      const currentWeights = workoutState.workoutData.actualWeights[exerciseId];
      if (currentWeights && currentWeights.length > maxSets) {
        console.log(`[Cleanup] Trimming actualWeights for ${exerciseId} from ${currentWeights.length} to ${maxSets}`);
        workoutState.updateActualWeights(exerciseId, currentWeights.slice(0, maxSets));
        hasChanges = true;
      }
      
      // NO recalcular completedSets automáticamente - debe ser manual con el checkbox
      // El usuario controla explícitamente qué series están completadas
      
      // Si es el ejercicio actual, corregir currentSet si está fuera de rango
      if (exerciseId === currentExercise.id) {
        if (workoutState.currentSet > maxSets) {
          console.log(`[Cleanup] Correcting currentSet from ${workoutState.currentSet} to ${maxSets}`);
          workoutState.setCurrentSet(maxSets);
          hasChanges = true;
        } else if (workoutState.currentSet < 1) {
          console.log(`[Cleanup] Correcting currentSet from ${workoutState.currentSet} to 1`);
          workoutState.setCurrentSet(1);
          hasChanges = true;
        }
      }
    });
    
    if (hasChanges) {
      console.log('[Cleanup] Data inconsistencies were corrected');
    }
  }, [routine, isInitialized, currentExercise, workoutState]);

  // Activar Wake Lock cuando el entrenamiento está activo
  useEffect(() => {
    if (isInitialized && wakeLock.isSupported) {
      wakeLock.requestWakeLock().then((activated) => {
        if (activated) {
          success('🔋 Pantalla activa durante el entrenamiento', 2000);
        }
      });
    }

    // Liberar wake lock al salir
    return () => {
      wakeLock.releaseWakeLock();
    };
  }, [isInitialized, wakeLock.isSupported]);

  useEffect(() => {
    // Defer closing the series table to the next tick to avoid synchronous setState within an effect
    const timer = setTimeout(() => {
      setIsSeriesTableExpanded(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [workoutState.currentExerciseIndex]);

  useEffect(() => {
    if (!timerHandlers.showTimer && pendingToast) {
      const timer = setTimeout(() => {
        success(pendingToast.message, pendingToast.duration);
        setPendingToast(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [timerHandlers.showTimer, pendingToast, success]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - workoutStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [workoutStartTime]);

  useEffect(() => {
    if (!currentExercise || !isInitialized) return;
    
    const currentWeightValue = typeof workoutState.currentWeight === 'number' ? workoutState.currentWeight : 0;
    const prediction = weightPrediction.predictWeightForSet(currentWeightValue);
    
    if (prediction.weight !== workoutState.currentWeight) {
      workoutState.setCurrentWeight(prediction.weight);
      
      if (prediction.reasoning) {
        success(`💡 ${prediction.reasoning}`, 3000);
      }
    }
  }, [currentExercise, workoutState.currentSet, isInitialized]);

  // ==================== HANDLERS ====================
  const checkAndCelebrateRecord = useCallback((exerciseId: string, exerciseName: string, weight: number) => {
    if (weight <= 0) return; // No celebrar peso 0
    
    const comparison = compareWithRecord(exerciseId, weight, sessions);
    
    if (comparison.isNewRecord) {
      // Haptic feedback especial para récord
      haptic.achievement();
      
      // Guardar datos del récord para mostrar celebración
      setNewRecord({
        exerciseId,
        exerciseName,
        weight,
        previousRecord: comparison.previousRecord || 0
      });
      setShowRecordCelebration(true);
      
      // Ocultar celebración después de 4 segundos
      setTimeout(() => {
        setShowRecordCelebration(false);
      }, 4000);
      
      // Toast motivacional
      if (comparison.previousRecord) {
        const improvement = comparison.improvement || 0;
        const improvementPercent = comparison.improvementPercentage || 0;
        success(
          `🏆 ¡NUEVO RÉCORD! ${weight}kg (+${improvement.toFixed(1)}kg, +${improvementPercent.toFixed(1)}%)`,
          5000
        );
      } else {
        success(`🏆 ¡PRIMER RÉCORD! ${weight}kg en ${exerciseName}`, 5000);
      }
    }
  }, [sessions, haptic, success]);

  const handleCompleteSet = useCallback(() => {
    if (!currentExercise || !routine) return;
    
    const exerciseId = currentExercise.id;
    const setIndex = workoutState.currentSet - 1;
    
    // Verificar si esta serie ya está completada
    const existingReps = workoutState.workoutData.actualReps[exerciseId]?.[setIndex];
    if (existingReps && existingReps > 0) {
      // Serie ya completada, no hacer nada
      console.log('[Workout] Serie ya completada, ignorando');
      return;
    }
    
    // ✅ Resetear el timer de serie al completar
    setExecution.completeSet();
    
    const repsValue = typeof workoutState.currentReps === 'number' ? workoutState.currentReps : currentExercise.sets[setIndex]?.reps || 0;
    const weightValue = typeof workoutState.currentWeight === 'number' ? workoutState.currentWeight : currentExercise.sets[setIndex]?.weight || 0;

    workoutState.completeSet(exerciseId, repsValue, weightValue);

    // ✅ Detectar récord personal
    checkAndCelebrateRecord(exerciseId, currentExercise.name, weightValue);

    // Haptic feedback al completar serie
    haptic.setComplete();

    if (weightPrediction.weightSuggestion && weightPrediction.weightSuggestion.suggested > weightValue) {
      setPendingToast({
        message: `💪 Próxima vez intenta con ${weightPrediction.weightSuggestion.suggested}kg (+${weightPrediction.weightSuggestion.increase}kg)`,
        duration: 4000
      });
    } else if (repsValue >= (currentExercise.sets[setIndex]?.reps || 10)) {
      setPendingToast({
        message: `✅ ¡Excelente serie! Completaste todas las repeticiones`,
        duration: 3000
      });
    }

    const isLastSet = workoutState.currentSet >= currentExercise.sets.length;
    const isLastExercise = workoutState.currentExerciseIndex >= routine.exercises.length - 1;

    if (isLastSet) {
      if (isLastExercise) {
        const duration = Math.floor((Date.now() - workoutStartTime - totalPausedTime) / 1000);
        completion.openCompletionModal(duration);
      } else {
        const nextExercise = routine.exercises[workoutState.currentExerciseIndex + 1];
        const restTime = calculateExerciseRestTime({
          currentExercise,
          nextExercise,
          routine,
          restOverrides: workoutState.workoutData.restOverrides,
          perSetOverrides: workoutState.workoutData.perSetRestOverrides,
          useSmartRest
        });
        
        // Haptic feedback al iniciar descanso entre ejercicios
        haptic.restStart();
        timerHandlers.startTimer(restTime, 'Descanso entre ejercicios', nextExercise.name);
      }
    } else {
      const restTime = calculateNextRestTime({
        currentExercise,
        routine,
        restOverrides: workoutState.workoutData.restOverrides,
        perSetOverrides: workoutState.workoutData.perSetRestOverrides,
        currentSet: workoutState.currentSet,
        useSmartRest
      });
      
      // Haptic feedback al iniciar descanso entre series
      haptic.restStart();
      timerHandlers.startTimer(restTime, `Descanso - Serie ${workoutState.currentSet + 1}/${currentExercise.sets.length}`);
    }
  }, [
    currentExercise, 
    routine?.exercises, 
    workoutState.currentSet,
    workoutState.currentExerciseIndex,
    workoutState.currentReps,
    workoutState.currentWeight,
    workoutState.workoutData.actualReps,
    workoutState.workoutData.restOverrides,
    workoutState.workoutData.perSetRestOverrides,
    workoutState.completeSet,
    workoutStartTime, 
    totalPausedTime, 
    useSmartRest, 
    weightPrediction.weightSuggestion, 
    timerHandlers.startTimer,
    haptic.setComplete,
    haptic.restStart,
    completion.openCompletionModal,
    setExecution.completeSet,
    checkAndCelebrateRecord
  ]);

  const handleTimerComplete = useCallback(() => {
    timerHandlers.stopTimer();
    clearRestState();
    
    // Haptic feedback al terminar descanso
    haptic.restComplete();
    
    if (!currentExercise || !routine) return;
    
    const exerciseId = currentExercise.id;
    const completedCount = workoutState.workoutData.completedSets[exerciseId] || 0;
    const totalSets = currentExercise.sets.length;
    const isLastSet = completedCount >= totalSets;
    const isLastExercise = workoutState.currentExerciseIndex >= routine.exercises.length - 1;
    
    if (isLastSet && isLastExercise) {
      const duration = Math.floor((Date.now() - workoutStartTime - totalPausedTime) / 1000);
      completion.openCompletionModal(duration);
    } else if (isLastSet && !isLastExercise) {
      const nextIndex = workoutState.currentExerciseIndex + 1;
      if (routine.exercises[nextIndex]) {
        // Haptic feedback al cambiar de ejercicio
        haptic.exerciseChange();
        
        workoutState.setCurrentExerciseIndex(nextIndex);
        workoutState.setCurrentSet(1);
        const nextExercise = routine.exercises[nextIndex];
        const firstSet = nextExercise.sets[0];
        if (firstSet) {
          workoutState.setCurrentReps(firstSet.reps);
          workoutState.setCurrentWeight(firstSet.weight || 0);
        }
        
        // ✅ Iniciar preparación automáticamente después del descanso
        setExecution.startSet();
      }
    } else if (!isLastSet) {
      const newSet = workoutState.currentSet + 1;
      workoutState.setCurrentSet(newSet);
      const nextSetData = currentExercise.sets[newSet - 1];
      if (nextSetData) {
        workoutState.setCurrentReps(nextSetData.reps);
        workoutState.setCurrentWeight(nextSetData.weight || 0);
      }
      
      // ✅ Iniciar preparación automáticamente después del descanso
      setExecution.startSet();
    }
  }, [
    currentExercise, 
    routine, 
    workoutState,
    workoutStartTime, 
    totalPausedTime, 
    clearRestState, 
    timerHandlers,
    completion, 
    haptic,
    setExecution
  ]);

  useEffect(() => {
    // keep the ref updated so the timer hook can call the latest handler
    handleTimerCompleteRef.current = handleTimerComplete;
  }, [handleTimerComplete]);

  const handleCancelWorkout = useCallback(async () => {
    const confirmed = await confirm({
      title: 'Cancelar entrenamiento',
      message: '¿Estás seguro de que quieres cancelar el entrenamiento? Se perderá todo el progreso.',
      confirmText: 'Sí, cancelar',
      variant: 'danger'
    });
    
    if (confirmed) {
      cancelWorkout();
      router.push('/routines');
    }
  }, [confirm, cancelWorkout, router]);

  const handlePauseWorkout = useCallback(() => {
    if (isPaused) {
      // Reanudar
      if (pauseStartTime) {
        const pauseDuration = Date.now() - pauseStartTime;
        setTotalPausedTime(prev => prev + pauseDuration);
        console.log('[Workout] Resuming - pause duration:', Math.floor(pauseDuration / 1000), 'seconds');
      }
      setIsPaused(false);
      setPauseStartTime(null);
      success('⏯️ Entrenamiento reanudado', 2000);
    } else {
      // Pausar
      setPauseStartTime(Date.now());
      setIsPaused(true);
      console.log('[Workout] Paused at:', new Date().toISOString());
      success('⏸️ Entrenamiento pausado', 2000);
    }
  }, [isPaused, pauseStartTime, success]);

  const handleOpenEditTime = useCallback(() => {
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = elapsedTime % 60;
    setEditingTime({ hours, minutes, seconds });
    setShowEditTimeModal(true);
  }, [elapsedTime]);

  const handleSaveEditedTime = useCallback(() => {
    const newElapsedSeconds = editingTime.hours * 3600 + editingTime.minutes * 60 + editingTime.seconds;
    
    // Ajustar workoutStartTime y totalPausedTime para que elapsedTime sea el nuevo valor
    const now = Date.now();
    const newStartTime = now - (newElapsedSeconds * 1000);
    setWorkoutStartTime(newStartTime);
    setTotalPausedTime(0);
    setElapsedTime(newElapsedSeconds);
    
    setShowEditTimeModal(false);
    success('⏱️ Tiempo actualizado', 2000);
  }, [editingTime, success]);

  const handleMoveExercise = useCallback((fromIndex: number, toIndex: number) => {
    if (!routine || fromIndex === toIndex) return;
    
    const newExercises = [...routine.exercises];
    const [movedExercise] = newExercises.splice(fromIndex, 1);
    newExercises.splice(toIndex, 0, movedExercise);
    
    const updatedRoutine = { ...routine, exercises: newExercises };
    setRoutine(updatedRoutine);
    
    if (workoutState.currentExerciseIndex === fromIndex) {
      workoutState.setCurrentExerciseIndex(toIndex);
    } else if (fromIndex < workoutState.currentExerciseIndex && toIndex >= workoutState.currentExerciseIndex) {
      workoutState.setCurrentExerciseIndex(workoutState.currentExerciseIndex - 1);
    } else if (fromIndex > workoutState.currentExerciseIndex && toIndex <= workoutState.currentExerciseIndex) {
      workoutState.setCurrentExerciseIndex(workoutState.currentExerciseIndex + 1);
    }
    
    success('Orden de ejercicios actualizado', 2000);
  }, [routine, workoutState, success]);

  const handleEditReps = useCallback((setIndex: number, reps: number) => {
    if (!currentExercise) return;
    const exerciseId = currentExercise.id;
    workoutState.updateActualReps(exerciseId, [
      ...(workoutState.workoutData.actualReps[exerciseId] || []).slice(0, setIndex),
      reps,
      ...(workoutState.workoutData.actualReps[exerciseId] || []).slice(setIndex + 1)
    ]);
  }, [currentExercise?.id, workoutState.updateActualReps, workoutState.workoutData.actualReps]);

  const handleEditWeight = useCallback((setIndex: number, weight: number) => {
    if (!currentExercise) return;
    const exerciseId = currentExercise.id;
    workoutState.updateActualWeights(exerciseId, [
      ...(workoutState.workoutData.actualWeights[exerciseId] || []).slice(0, setIndex),
      weight,
      ...(workoutState.workoutData.actualWeights[exerciseId] || []).slice(setIndex + 1)
    ]);
    
    // ✅ Detectar récord personal al editar peso
    checkAndCelebrateRecord(exerciseId, currentExercise.name, weight);
  }, [currentExercise?.id, currentExercise?.name, workoutState.updateActualWeights, workoutState.workoutData.actualWeights, checkAndCelebrateRecord]);

  const handleEditSetType = useCallback((setIndex: number, type: any) => {
    if (!currentExercise) return;
    const exerciseId = currentExercise.id;
    workoutState.updateSetType(exerciseId, setIndex, type);
  }, [currentExercise?.id, workoutState.updateSetType]);

  const handleEditRestTime = useCallback((setIndex: number, restTime: number) => {
    if (!currentExercise) return;
    const exerciseId = currentExercise.id;
    workoutState.updatePerSetRestOverride(exerciseId, setIndex, restTime);
  }, [currentExercise?.id, workoutState.updatePerSetRestOverride]);

  const handleApplySmartRest = useCallback(() => {
    if (!currentExercise || !smartRestTime) return;
    applySmartRestToAllSets(currentExercise, workoutState.updatePerSetRestOverride);
    success('Descanso inteligente aplicado a todas las series', 2000);
  }, [currentExercise, smartRestTime, workoutState.updatePerSetRestOverride, success]);

  const handleDeleteSet = useCallback(async (setIndex: number) => {
    if (!currentExercise || !routine) return;
    
    // No permitir eliminar si solo hay una serie
    if (currentExercise.sets.length <= 1) {
      error('No puedes eliminar la última serie');
      return;
    }
    
    const exerciseId = currentExercise.id;
    
    // Eliminar la serie del ejercicio
    const updatedSets = currentExercise.sets.filter((_: any, idx: number) => idx !== setIndex);
    const updatedExercise = { ...currentExercise, sets: updatedSets };
    
    // Actualizar la rutina
    const updatedRoutine = {
      ...routine,
      exercises: routine.exercises.map((ex: Exercise) => 
        ex.id === exerciseId ? updatedExercise : ex
      )
    };
    
    setRoutine(updatedRoutine);
    
    // ✅ Guardar la rutina modificada en el activeWorkout para que persista al refrescar
    updateModifiedRoutine(updatedRoutine);
    
    // Limpiar datos de la serie eliminada
    const currentReps = workoutState.workoutData.actualReps[exerciseId] || [];
    const currentWeights = workoutState.workoutData.actualWeights[exerciseId] || [];
    
    workoutState.updateActualReps(exerciseId, currentReps.filter((_, idx) => idx !== setIndex));
    workoutState.updateActualWeights(exerciseId, currentWeights.filter((_, idx) => idx !== setIndex));
    
    // Recalcular series completadas
    const newReps = currentReps.filter((_, idx) => idx !== setIndex);
    const completedCount = newReps.filter((r: number) => typeof r === 'number' && r > 0).length;
    workoutState.updateCompletedSets(exerciseId, completedCount);
    
    // Ajustar currentSet si es necesario
    if (workoutState.currentSet > updatedSets.length) {
      workoutState.setCurrentSet(updatedSets.length);
    }
    
    // Persistir la rutina actualizada
    try {
      await updateRoutine(id, updatedRoutine);
      success('Serie eliminada', 2000);
    } catch (err) {
      error('Error al eliminar serie');
      console.error('Error deleting set:', err);
    }
  }, [currentExercise, routine, workoutState, id, updateRoutine, updateModifiedRoutine, success, error]);

  const handleDeleteExercise = useCallback(async (exerciseIndex: number) => {
    if (!routine) return;
    
    // No permitir eliminar si solo hay un ejercicio
    if (routine.exercises.length <= 1) {
      error('No puedes eliminar el último ejercicio');
      return;
    }
    
    const exerciseToDelete = routine.exercises[exerciseIndex];
    
    // Confirmar eliminación
    const confirmed = await confirm({
      title: 'Eliminar ejercicio',
      message: `¿Estás seguro de que quieres eliminar "${exerciseToDelete.name}"? Esta acción no se puede deshacer.`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      variant: 'danger'
    });
    
    if (!confirmed) return;
    
    // Eliminar el ejercicio
    const updatedExercises = routine.exercises.filter((_: Exercise, idx: number) => idx !== exerciseIndex);
    const updatedRoutine = { ...routine, exercises: updatedExercises };
    
    setRoutine(updatedRoutine);
    updateModifiedRoutine(updatedRoutine);
    
    // Limpiar datos del ejercicio eliminado
    const exerciseId = exerciseToDelete.id;
    const newActualReps = { ...workoutState.workoutData.actualReps };
    const newActualWeights = { ...workoutState.workoutData.actualWeights };
    const newCompletedSets = { ...workoutState.workoutData.completedSets };
    
    delete newActualReps[exerciseId];
    delete newActualWeights[exerciseId];
    delete newCompletedSets[exerciseId];
    
    workoutState.updateActualReps(exerciseId, []);
    workoutState.updateActualWeights(exerciseId, []);
    workoutState.updateCompletedSets(exerciseId, 0);
    
    // Ajustar currentExerciseIndex si es necesario
    if (workoutState.currentExerciseIndex >= updatedExercises.length) {
      // Si estábamos en el último ejercicio, retroceder
      workoutState.setCurrentExerciseIndex(Math.max(0, updatedExercises.length - 1));
      workoutState.setCurrentSet(1);
      
      // Actualizar valores del nuevo ejercicio actual
      const newCurrentExercise = updatedExercises[Math.max(0, updatedExercises.length - 1)];
      if (newCurrentExercise && newCurrentExercise.sets[0]) {
        workoutState.setCurrentReps(newCurrentExercise.sets[0].reps);
        workoutState.setCurrentWeight(newCurrentExercise.sets[0].weight || 0);
      }
    } else if (exerciseIndex < workoutState.currentExerciseIndex) {
      // Si eliminamos un ejercicio anterior, ajustar el índice
      workoutState.setCurrentExerciseIndex(workoutState.currentExerciseIndex - 1);
    } else if (exerciseIndex === workoutState.currentExerciseIndex) {
      // Si eliminamos el ejercicio actual, mantener el índice pero actualizar datos
      const newCurrentExercise = updatedExercises[exerciseIndex];
      if (newCurrentExercise && newCurrentExercise.sets[0]) {
        workoutState.setCurrentSet(1);
        workoutState.setCurrentReps(newCurrentExercise.sets[0].reps);
        workoutState.setCurrentWeight(newCurrentExercise.sets[0].weight || 0);
      }
    }
    
    // Persistir la rutina actualizada
    try {
      await updateRoutine(id, updatedRoutine);
      success(`Ejercicio "${exerciseToDelete.name}" eliminado`, 2000);
    } catch (err) {
      error('Error al eliminar ejercicio');
      console.error('Error deleting exercise:', err);
    }
    
    // Haptic feedback
    haptic.error();
  }, [routine, workoutState, updateModifiedRoutine, confirm, success, error, haptic]);

  const handleQuickDeleteSet = useCallback(async (exerciseId: string, setIndex: number) => {
    const exercise = routine?.exercises.find((ex: Exercise) => ex.id === exerciseId);
    if (!exercise || !routine) return;
    
    // No permitir eliminar si solo hay una serie
    if (exercise.sets.length <= 1) {
      error('No puedes eliminar la última serie');
      return;
    }
    
    // Eliminar la serie del ejercicio
    const updatedSets = exercise.sets.filter((_: any, idx: number) => idx !== setIndex);
    const updatedExercise = { ...exercise, sets: updatedSets };
    
    // Actualizar la rutina
    const updatedRoutine = {
      ...routine,
      exercises: routine.exercises.map((ex: Exercise) => 
        ex.id === exerciseId ? updatedExercise : ex
      )
    };
    
    setRoutine(updatedRoutine);
    
    // ✅ Guardar la rutina modificada en el activeWorkout para que persista al refrescar
    updateModifiedRoutine(updatedRoutine);
    
    // Limpiar datos de la serie eliminada
    const currentReps = workoutState.workoutData.actualReps[exerciseId] || [];
    const currentWeights = workoutState.workoutData.actualWeights[exerciseId] || [];
    
    workoutState.updateActualReps(exerciseId, currentReps.filter((_, idx) => idx !== setIndex));
    workoutState.updateActualWeights(exerciseId, currentWeights.filter((_, idx) => idx !== setIndex));
    
    // Recalcular series completadas
    const newReps = currentReps.filter((_, idx) => idx !== setIndex);
    const completedCount = newReps.filter((r: number) => typeof r === 'number' && r > 0).length;
    workoutState.updateCompletedSets(exerciseId, completedCount);
    
    // Persistir la rutina actualizada
    try {
      await updateRoutine(id, updatedRoutine);
      success('Serie eliminada', 2000);
    } catch (err) {
      error('Error al eliminar serie');
      console.error('Error deleting set:', err);
    }
  }, [routine, workoutState, id, updateRoutine, updateModifiedRoutine, success, error]);

  const handleToggleSetComplete = useCallback((setIndex: number, isComplete: boolean) => {
    if (!currentExercise || !routine) return;
    
    const exerciseId = currentExercise.id;
    
    if (isComplete) {
      const existingReps = workoutState.workoutData.actualReps[exerciseId]?.[setIndex];
      const existingWeight = workoutState.workoutData.actualWeights[exerciseId]?.[setIndex];
      
      const repsToUse = existingReps !== undefined && existingReps !== 0 
        ? existingReps 
        : currentExercise.sets[setIndex].reps;
      const weightToUse = existingWeight !== undefined && existingWeight !== 0
        ? existingWeight
        : (currentExercise.sets[setIndex].weight || 0);
      
      const newActualReps = [...(workoutState.workoutData.actualReps[exerciseId] || [])];
      newActualReps[setIndex] = repsToUse;
      
      const newActualWeights = [...(workoutState.workoutData.actualWeights[exerciseId] || [])];
      newActualWeights[setIndex] = weightToUse;
      
      workoutState.updateActualReps(exerciseId, newActualReps);
      workoutState.updateActualWeights(exerciseId, newActualWeights);
      const newCompletedCount = (workoutState.workoutData.completedSets[exerciseId] || 0) + 1;
      workoutState.updateCompletedSets(exerciseId, newCompletedCount);
      
      const nextIncompleteSet = currentExercise.sets.findIndex((_: any, idx: number) => {
        return idx > setIndex && !newActualReps[idx];
      });
      
      if (nextIncompleteSet !== -1) {
        workoutState.setCurrentSet(nextIncompleteSet + 1);
      } else if (newCompletedCount >= currentExercise.sets.length) {
        const isLastExercise = workoutState.currentExerciseIndex >= routine.exercises.length - 1;
        
        if (isLastExercise) {
          const duration = Math.floor((Date.now() - workoutStartTime) / 1000);
          completion.openCompletionModal(duration);
        } else {
          const nextExercise = routine.exercises[workoutState.currentExerciseIndex + 1];
          const restTime = calculateExerciseRestTime({
            currentExercise,
            nextExercise,
            routine,
            restOverrides: workoutState.workoutData.restOverrides,
            perSetOverrides: workoutState.workoutData.perSetRestOverrides,
            useSmartRest
          });
          
          timerHandlers.startTimer(restTime, 'Descanso entre ejercicios', nextExercise.name);
        }
      }
    } else {
      const newActualReps = [...(workoutState.workoutData.actualReps[exerciseId] || [])];
      newActualReps[setIndex] = 0;
      
      const newActualWeights = [...(workoutState.workoutData.actualWeights[exerciseId] || [])];
      newActualWeights[setIndex] = 0;
      
      workoutState.updateActualReps(exerciseId, newActualReps);
      workoutState.updateActualWeights(exerciseId, newActualWeights);
      workoutState.updateCompletedSets(exerciseId, Math.max(0, (workoutState.workoutData.completedSets[exerciseId] || 0) - 1));
      
      if (setIndex + 1 < workoutState.currentSet) {
        workoutState.setCurrentSet(setIndex + 1);
      }
    }
  }, [currentExercise, routine, workoutState, workoutStartTime, useSmartRest, timerHandlers, completion]);

  const handleAddSet = useCallback(async () => {
    if (!currentExercise || !routine) return;
    
    const exerciseId = currentExercise.id;
    
    // Obtener la última serie como referencia
    const lastSet = currentExercise.sets[currentExercise.sets.length - 1];
    
    // Crear nueva serie con los mismos valores que la última
    const newSet = {
      reps: lastSet.reps,
      weight: lastSet.weight || 0,
      restAfter: lastSet.restAfter || currentExercise.restBetweenSets || 90
    };
    
    // Agregar la serie al ejercicio
    const updatedSets = [...currentExercise.sets, newSet];
    const updatedExercise = { ...currentExercise, sets: updatedSets };
    
    // Actualizar la rutina
    const updatedRoutine = {
      ...routine,
      exercises: routine.exercises.map((ex: Exercise) => 
        ex.id === exerciseId ? updatedExercise : ex
      )
    };
    
    console.log('[handleAddSet] Adding set:', {
      exerciseId,
      oldSetsCount: currentExercise.sets.length,
      newSetsCount: updatedSets.length,
      updatedRoutine
    });
    
    setRoutine(updatedRoutine);
    
    // ✅ Guardar la rutina modificada en el activeWorkout para que persista al refrescar
    updateModifiedRoutine(updatedRoutine);
    
    // Persistir la rutina actualizada
    try {
      await updateRoutine(id, updatedRoutine);
      console.log('[handleAddSet] Successfully saved to storage');
      success('Serie agregada', 2000);
    } catch (err) {
      console.error('[handleAddSet] Error saving:', err);
      error('Error al agregar serie');
    }
  }, [currentExercise, routine, id, updateRoutine, updateModifiedRoutine, success, error]);

  const handleSelectExercise = useCallback((index: number) => {
    workoutState.setCurrentExerciseIndex(index);
    workoutState.setCurrentSet(1);
    timerHandlers.stopTimer();
    setExecution.cancelSetExecution();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [workoutState, timerHandlers, setExecution]);

  const handleRepeatPrevious = useCallback(() => {
    if (!lastSetData) return;
    
    workoutState.setCurrentReps(lastSetData.reps);
    workoutState.setCurrentWeight(lastSetData.weight);
    success(`Copiado: ${lastSetData.reps} reps × ${lastSetData.weight}kg`, 2000);
  }, [lastSetData, workoutState, success]);

  const handleAddExercises = useCallback(async (exercises: ExerciseTemplate[]) => {
    if (!routine || exercises.length === 0) return;
    
    try {
      // Convertir los ejercicios seleccionados al formato de la rutina
      const newExercises = exercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        sets: Array.from({ length: ex.defaultSets || 3 }, () => ({
          reps: ex.defaultReps || 10,
          weight: 0,
          type: 'normal' as const
        })),
        equipment: ex.equipment,
        notes: ex.description,
        restBetweenSets: ex.restTime ? parseInt(String(ex.restTime)) : routine.restBetweenSets || 60,
        useSmartRest: true
      }));

      // Agregar los nuevos ejercicios a la rutina
      const updatedRoutine = {
        ...routine,
        exercises: [...routine.exercises, ...newExercises]
      };

      // Actualizar la rutina en el estado local
      setRoutine(updatedRoutine);

      // Guardar la rutina actualizada en el storage
      await updateRoutine(id, updatedRoutine);

      // IMPORTANTE: Actualizar el activeWorkout para mantener los registros existentes
      // Los nuevos ejercicios no tendrán registros aún, pero los existentes se preservan
      updateWorkoutProgress(
        workoutState.currentExerciseIndex,
        workoutState.currentSet,
        workoutState.workoutData.completedSets,
        workoutState.workoutData.actualReps,
        workoutState.workoutData.actualWeights,
        undefined,
        totalPausedTime
      );

      success(`${exercises.length} ejercicio${exercises.length > 1 ? 's' : ''} agregado${exercises.length > 1 ? 's' : ''} a la rutina`, 3000);
    } catch (err) {
      console.error('Error adding exercises:', err);
      error('Error al agregar ejercicios');
    }
  }, [routine, id, updateRoutine, success, error, workoutState, updateWorkoutProgress, totalPausedTime]);

  // ==================== QUICK EDIT MODE HANDLERS ====================
  const handleQuickEditReps = useCallback((exerciseId: string, setIndex: number, reps: number) => {
    console.log('[handleQuickEditReps] Called:', { exerciseId, setIndex, reps });
    const currentReps = workoutState.workoutData.actualReps[exerciseId] || [];
    const newReps = [...currentReps];
    newReps[setIndex] = reps;
    workoutState.updateActualReps(exerciseId, newReps);
    
    console.log('[handleQuickEditReps] completedSets BEFORE:', workoutState.workoutData.completedSets[exerciseId]);
    // NO actualizar completed sets automáticamente - debe ser manual con el checkbox
    console.log('[handleQuickEditReps] completedSets AFTER:', workoutState.workoutData.completedSets[exerciseId]);
  }, [workoutState]);

  const handleQuickEditWeight = useCallback((exerciseId: string, setIndex: number, weight: number) => {
    console.log('[handleQuickEditWeight] Called:', { exerciseId, setIndex, weight });
    const currentWeights = workoutState.workoutData.actualWeights[exerciseId] || [];
    const newWeights = [...currentWeights];
    newWeights[setIndex] = weight;
    workoutState.updateActualWeights(exerciseId, newWeights);
    
    // ✅ Detectar récord personal al editar peso en modo rápido
    const exercise = routine?.exercises.find((ex: Exercise) => ex.id === exerciseId);
    if (exercise) {
      checkAndCelebrateRecord(exerciseId, exercise.name, weight);
    }
    
    console.log('[handleQuickEditWeight] completedSets BEFORE:', workoutState.workoutData.completedSets[exerciseId]);
    console.log('[handleQuickEditWeight] completedSets AFTER:', workoutState.workoutData.completedSets[exerciseId]);
  }, [workoutState, routine?.exercises, checkAndCelebrateRecord]);

  const handleQuickEditSetType = useCallback((exerciseId: string, setIndex: number, type: any) => {
    workoutState.updateSetType(exerciseId, setIndex, type);
  }, [workoutState]);

  const handleQuickToggleSetComplete = useCallback((exerciseId: string, setIndex: number, isComplete: boolean) => {
    console.log('[handleQuickToggleSetComplete] Called:', { exerciseId, setIndex, isComplete });
    const exercise = routine?.exercises.find((ex: Exercise) => ex.id === exerciseId);
    if (!exercise || !routine) return;

    const currentReps = workoutState.workoutData.actualReps[exerciseId] || [];
    const currentWeights = workoutState.workoutData.actualWeights[exerciseId] || [];
    
    // Asegurar que los arrays tengan el tamaño correcto (todas las series del ejercicio)
    const newReps = Array(exercise.sets.length).fill(0).map((_, i) => currentReps[i] || 0);
    const newWeights = Array(exercise.sets.length).fill(0).map((_, i) => currentWeights[i] || 0);
    
    if (isComplete) {
      // Marcar como completada - usar valores actuales o defaults
      if (!newReps[setIndex] || newReps[setIndex] === 0) {
        newReps[setIndex] = exercise.sets[setIndex]?.reps || 10;
      }
      if (!newWeights[setIndex]) {
        newWeights[setIndex] = exercise.sets[setIndex]?.weight || 0;
      }
    } else {
      // Desmarcar - poner en 0
      newReps[setIndex] = 0;
    }
    
    workoutState.updateActualReps(exerciseId, newReps);
    workoutState.updateActualWeights(exerciseId, newWeights);
    
    // Actualizar completed sets - contar solo las series con reps > 0
    const completedCount = newReps.filter(r => r > 0).length;
    workoutState.updateCompletedSets(exerciseId, completedCount);
    
    // Si estamos en el ejercicio actual, actualizar también currentSet
    if (currentExercise && currentExercise.id === exerciseId) {
      // Encontrar la siguiente serie no completada
      const nextIncompleteSet = newReps.findIndex((r, idx) => !r || r === 0);
      if (nextIncompleteSet !== -1) {
        workoutState.setCurrentSet(nextIncompleteSet + 1);
      } else {
        // Todas completadas, ir a la última
        workoutState.setCurrentSet(exercise.sets.length);
      }
    }
    
    // ✅ NUEVO: Iniciar temporizador de descanso si se completó una serie
    if (isComplete) {
      // Feedback háptico
      haptic.success();
      
      // Determinar si es la última serie del ejercicio
      const isLastSetOfExercise = completedCount >= exercise.sets.length;
      
      if (isLastSetOfExercise) {
        // Descanso entre ejercicios
        const exerciseIndex = routine.exercises.findIndex((ex: Exercise) => ex.id === exerciseId);
        const isLastExercise = exerciseIndex >= routine.exercises.length - 1;
        
        if (!isLastExercise) {
          const nextExercise = routine.exercises[exerciseIndex + 1];
          const restTime = calculateExerciseRestTime({
            currentExercise: exercise,
            nextExercise,
            routine,
            restOverrides: workoutState.workoutData.restOverrides,
            perSetOverrides: workoutState.workoutData.perSetRestOverrides,
            useSmartRest
          });
          
          timerHandlers.startTimer(restTime, 'Descanso entre ejercicios', nextExercise.name);
        }
      } else {
        // Descanso entre series - solo si no es la última serie
        // Calcular tiempo de descanso
        const perSetOverride = workoutState.workoutData.perSetRestOverrides[exerciseId]?.[setIndex];
        const exerciseOverride = workoutState.workoutData.restOverrides[exerciseId];
        
        let restTime: number;
        if (perSetOverride) {
          restTime = perSetOverride;
        } else if (exerciseOverride) {
          restTime = exerciseOverride;
        } else if (exercise.restBetweenSets) {
          restTime = exercise.restBetweenSets;
        } else {
          restTime = routine.restBetweenSets || 90;
        }
        
        // Buscar la siguiente serie no completada DESPUÉS de la actual
        const nextIncompleteIndex = newReps.findIndex((r, idx) => idx > setIndex && (!r || r === 0));
        const nextSetNumber = nextIncompleteIndex !== -1 ? nextIncompleteIndex + 1 : setIndex + 2;
        
        console.log('[QuickToggle] Rest timer:', {
          setIndex,
          nextIncompleteIndex,
          nextSetNumber,
          totalSets: exercise.sets.length,
          newReps: newReps.map((r, i) => `${i + 1}:${r || 0}`)
        });
        
        timerHandlers.startTimer(restTime, `Descanso - ${exercise.name}`, `Serie ${nextSetNumber}`);
      }
    }
  }, [routine, workoutState, haptic, currentExercise, useSmartRest, timerHandlers]);

  const handleQuickAddSet = useCallback(async (exerciseId: string) => {
    const exercise = routine?.exercises.find((ex: Exercise) => ex.id === exerciseId);
    if (!exercise || !routine) return;
    
    // Obtener la última serie como referencia
    const lastSet = exercise.sets[exercise.sets.length - 1];
    
    // Crear nueva serie con los mismos valores que la última
    const newSet = {
      reps: lastSet.reps,
      weight: lastSet.weight || 0,
      restAfter: lastSet.restAfter || exercise.restBetweenSets || 90
    };
    
    // Agregar la serie al ejercicio
    const updatedSets = [...exercise.sets, newSet];
    const updatedExercise = { ...exercise, sets: updatedSets };
    
    // Actualizar la rutina
    const updatedRoutine = {
      ...routine,
      exercises: routine.exercises.map((ex: Exercise) => 
        ex.id === exerciseId ? updatedExercise : ex
      )
    };
    
    console.log('[handleQuickAddSet] Adding set to exercise:', exerciseId, 'New count:', updatedSets.length);
    
    setRoutine(updatedRoutine);
    
    // ✅ Guardar la rutina modificada en el activeWorkout para que persista al refrescar
    updateModifiedRoutine(updatedRoutine);
    
    // Persistir la rutina actualizada
    try {
      await updateRoutine(id, updatedRoutine);
      success('Serie agregada', 2000);
    } catch (err) {
      console.error('[handleQuickAddSet] Error saving:', err);
      error('Error al agregar serie');
    }
  }, [routine, id, updateRoutine, updateModifiedRoutine, success, error]);

  // ==================== RENDER ====================
  // Optimización: Mostrar contenido inmediatamente si la rutina está disponible
  if (!routine || !routine.exercises || routine.exercises.length === 0) {
    if (gymLoading) {
      return (
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-8">
              <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              Cargando entrenamiento...
            </p>
          </CardContent>
        </Card>
      </div>
    );
    }
    
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Esta rutina no tiene ejercicios configurados.
            </p>
            <Button onClick={() => router.push('/routines')}>
              Volver a rutinas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Optimización: No esperar isInitialized para mostrar la UI
  if (!currentExercise) {
    return null;
  }

  if (timerHandlers.showTimer && !timerHandlers.timerMinimized) {
    return (
      <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
        <Timer
          duration={timerHandlers.timerDuration}
          initialTimeLeft={timerHandlers.currentTimeLeft}
          title={timerHandlers.timerTitle}
          nextExerciseName={timerHandlers.nextExerciseName}
          onComplete={handleTimerComplete}
          onSkip={timerHandlers.skipAndAdvance}
          autoStart={true}
          showMotivation={true}
          onMinimize={timerHandlers.minimizeTimer}
        />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 pb-32">
        {timerHandlers.showTimer && timerHandlers.timerMinimized && (
          <MinimizedTimer
            timeLeft={timerHandlers.currentTimeLeft}
            title={timerHandlers.timerTitle}
            onExpand={timerHandlers.expandTimer}
            onSkip={timerHandlers.skipAndAdvance}
          />
        )}

        <div className="sticky top-16 z-10 mb-4">
          <div className="rounded-lg bg-white dark:bg-gray-800 shadow-lg">
            <CompactWorkoutHeader
              routine={routine}
              currentExerciseIndex={workoutState.currentExerciseIndex}
              totalExercises={routine.exercises.length}
              elapsedTime={elapsedTime}
              completedSets={workoutState.workoutData.completedSets}
              actualReps={workoutState.workoutData.actualReps}
              actualWeights={workoutState.workoutData.actualWeights}
              exercises={routine.exercises}
              onCancel={handleCancelWorkout}
              isPaused={isPaused}
              onPauseToggle={handlePauseWorkout}
              onEditTime={handleOpenEditTime}
            />
          </div>
        </div>

        {/* Toggle entre modo guiado y modo edición rápida */}
        <div className="mb-4 flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setIsQuickEditMode(false)}
            className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
              !isQuickEditMode
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            🎯 Modo Guiado
          </button>
          <button
            onClick={() => setIsQuickEditMode(true)}
            className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
              isQuickEditMode
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            📝 Edición Rápida
          </button>
        </div>

        {isQuickEditMode ? (
          /* Modo de edición rápida - Vista tipo Excel */
          <QuickEditMode
            routine={routine}
            workoutData={workoutState.workoutData}
            onEditReps={handleQuickEditReps}
            onEditWeight={handleQuickEditWeight}
            onEditSetType={handleQuickEditSetType}
            onToggleSetComplete={handleQuickToggleSetComplete}
            onAddSet={handleQuickAddSet}
            onDeleteSet={handleQuickDeleteSet}
            onFinishWorkout={() => completion.openCompletionModal()}
            onMoveExercise={handleMoveExercise}
            onSkipExercise={skipExercise}
            onUnskipExercise={unskipExercise}
            onEditRestTime={(exerciseId, restTime) => {
              workoutState.updateRestOverride(exerciseId, restTime);
              
              // Formatear tiempo en minutos y segundos para el toast
              let timeDisplay;
              if (restTime >= 60) {
                const minutes = Math.floor(restTime / 60);
                const seconds = restTime % 60;
                timeDisplay = seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
              } else {
                timeDisplay = `${restTime}s`;
              }
              
              success(`⏱️ Descanso actualizado a ${timeDisplay}`, 2000);
            }}
            onApplySmartRest={(exerciseId) => {
              const exercise = routine.exercises.find((ex: Exercise) => ex.id === exerciseId);
              if (!exercise) return;
              
              // Aplicar descanso inteligente a TODAS las series individuales
              const appliedRestTime = applySmartRestToAllSets(exercise, workoutState.updatePerSetRestOverride);
              
              if (appliedRestTime) {
                // Formatear tiempo en minutos y segundos para el toast
                let timeDisplay;
                if (appliedRestTime >= 60) {
                  const minutes = Math.floor(appliedRestTime / 60);
                  const seconds = appliedRestTime % 60;
                  timeDisplay = seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
                } else {
                  timeDisplay = `${appliedRestTime}s`;
                }
                
                success(`⚡ Descanso inteligente aplicado a todas las series: ${timeDisplay}`, 2000);
              } else {
                error('No se pudo calcular el descanso inteligente para este ejercicio');
              }
            }}
          />
        ) : (
          /* Modo guiado - Flujo normal */
          <>
        {/* Botón flotante grande - Iniciar o Completar Serie */}
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-linear-to-t from-white via-white/95 to-transparent dark:from-gray-900 dark:via-gray-900/95 dark:to-transparent pointer-events-none z-20" />
        
        <div className="fixed bottom-0 left-0 right-0 z-30 px-0">
          {!setExecution.isExecutingSet ? (
            // Botón Iniciar Serie
            <Button
              variant="primary"
              onClick={() => {
                console.log('[Workout] Iniciar Serie button clicked');
                setExecution.startSet();
              }}
              className="w-full py-6 text-lg font-bold bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3 rounded-2xl border-2 border-white/20"
            >
              <span className="text-2xl">▶️</span>
              <div className="flex flex-col items-start">
                <span>Iniciar Serie {Math.min(workoutState.currentSet, currentExercise.sets.length)}</span>
                <span className="text-xs font-normal opacity-90">
                  {workoutState.currentReps} reps × {workoutState.currentWeight}kg
                </span>
              </div>
            </Button>
          ) : (
            // Botón Completar Serie (cuando está en ejecución)
            <Button
              variant="primary"
              onClick={handleCompleteSet}
              disabled={workoutState.currentReps === '' || workoutState.currentWeight === ''}
              className="w-full py-6 text-lg font-bold bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3 rounded-2xl border-2 border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-2xl">✅</span>
              <div className="flex flex-col items-start">
                <span>Completar Serie {Math.min(workoutState.currentSet, currentExercise.sets.length)}</span>
                <span className="text-xs font-normal opacity-90">
                  {workoutState.currentReps} reps × {workoutState.currentWeight}kg
                </span>
              </div>
            </Button>
          )}
        </div>

        <ExerciseCard
          exercise={currentExercise}
          exerciseIndex={workoutState.currentExerciseIndex}
          currentSet={workoutState.currentSet}
          completedSets={workoutState.workoutData.completedSets[currentExercise.id] || 0}
          currentReps={workoutState.currentReps}
          currentWeight={workoutState.currentWeight}
          onRepsChange={workoutState.setCurrentReps}
          onWeightChange={workoutState.setCurrentWeight}
          onCompleteSet={handleCompleteSet}
          onShowInfo={() => setShowExerciseInfo(true)}
          isSetStarted={setExecution.isExecutingSet}
          weightSuggestion={weightPrediction.weightSuggestion}
          onDismissWeightSuggestion={() => weightPrediction.setDismissedWeightSuggestion(true)}
          lastSetData={lastSetData}
          onRepeatPrevious={handleRepeatPrevious}
          setStartTime={setExecution.setStartTime}
          personalRecord={currentExerciseRecord}
          quickSwitcher={
            <QuickExerciseSwitcher
              routine={routine}
              currentExerciseIndex={workoutState.currentExerciseIndex}
              completedSets={workoutState.workoutData.completedSets}
              onSelectExercise={(index) => {
                workoutState.setCurrentExerciseIndex(index);
                workoutState.setCurrentSet(1);
              }}
            />
          }
        />

        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => setIsSeriesTableExpanded(!isSeriesTableExpanded)}
            className="w-full text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 py-2"
          >
            {isSeriesTableExpanded ? (
              <>▼ Ocultar series ({currentExercise.sets.length})</>
            ) : (
              <>▶ Ver todas las series ({currentExercise.sets.length})</>
            )}
          </Button>
        </div>

        {isSeriesTableExpanded && (
          <Suspense fallback={
            <div className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg h-64 mb-4" />
          }>
            <SeriesTable
              exercise={currentExercise}
              exerciseId={currentExercise.id}
              completedSets={workoutState.workoutData.completedSets[currentExercise.id] || 0}
              actualReps={workoutState.workoutData.actualReps[currentExercise.id] || []}
              actualWeights={workoutState.workoutData.actualWeights[currentExercise.id] || []}
              setTypes={workoutState.workoutData.setTypes[currentExercise.id] || []}
              currentSet={workoutState.currentSet}
              onEditReps={handleEditReps}
              onEditWeight={handleEditWeight}
              onEditSetType={handleEditSetType}
              onToggleSetComplete={handleToggleSetComplete}
              onAddSet={handleAddSet}
              onDeleteSet={handleDeleteSet}
              perSetRestOverrides={workoutState.workoutData.perSetRestOverrides}
              onEditRestTime={handleEditRestTime}
              onApplySmartRest={handleApplySmartRest}
              smartRestTime={smartRestTime}
              routine={routine}
              restOverrides={workoutState.workoutData.restOverrides}
              useSmartRest={useSmartRest}
            />
          </Suspense>
        )}

        <ExerciseList
          routine={routine}
          currentExerciseIndex={workoutState.currentExerciseIndex}
          completedSets={workoutState.workoutData.completedSets}
          onSelectExercise={handleSelectExercise}
          onMoveExercise={handleMoveExercise}
        />

        <div className="mb-6">
          <AddExerciseButton onAddExercises={handleAddExercises} />
        </div>
          </>
        )}

        {/* Modales compartidos entre ambos modos */}
        <Modal
          isOpen={showEditTimeModal}
          onClose={() => setShowEditTimeModal(false)}
          title="⏱️ Editar tiempo de entrenamiento"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ajusta el tiempo transcurrido del entrenamiento
            </p>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Horas
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={editingTime.hours}
                  onChange={(e) => setEditingTime(prev => ({ ...prev, hours: Math.max(0, Math.min(23, parseInt(e.target.value) || 0)) }))}
                  className="w-full p-3 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Minutos
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={editingTime.minutes}
                  onChange={(e) => setEditingTime(prev => ({ ...prev, minutes: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)) }))}
                  className="w-full p-3 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Segundos
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={editingTime.seconds}
                  onChange={(e) => setEditingTime(prev => ({ ...prev, seconds: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)) }))}
                  className="w-full p-3 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setShowEditTimeModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveEditedTime}
                className="flex-1"
              >
                Guardar
              </Button>
            </div>
          </div>
        </Modal>
        
        <FinishWorkoutModal
          isOpen={completion.showNotesModal}
          onClose={() => completion.setShowNotesModal(false)}
          proposedDuration={completion.proposedDuration}
          onDurationChange={completion.setProposedDuration}
          sessionNotes={completion.sessionNotes}
          onNotesChange={completion.setSessionNotes}
          onFinish={() => completion.finishWorkout(workoutState.workoutData)}
          isSaving={false}
        />

        {showExerciseInfo && currentExercise && (
          <Suspense fallback={<div />}>
            <ExerciseInfoPanel
              exercise={EXERCISE_DATABASE.find(e => e.name === currentExercise.name) || {
                id: currentExercise.id,
                name: currentExercise.name,
                muscleGroup: 'pecho'
              } as any}
              onClose={() => setShowExerciseInfo(false)}
            />
          </Suspense>
        )}

        {/* ✅ Celebración de récord personal */}
        {showRecordCelebration && newRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="animate-bounce-in pointer-events-auto">
              <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 transform scale-110">
                <div className="text-center space-y-4">
                  {/* Trofeo animado */}
                  <div className="text-8xl animate-pulse">
                    🏆
                  </div>
                  
                  {/* Título */}
                  <h2 className="text-3xl font-bold tracking-tight">
                    ¡NUEVO RÉCORD!
                  </h2>
                  
                  {/* Ejercicio */}
                  <p className="text-xl font-semibold opacity-90">
                    {newRecord.exerciseName}
                  </p>
                  
                  {/* Peso */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-5xl font-black">
                      {newRecord.weight}kg
                    </div>
                    {newRecord.previousRecord > 0 && (
                      <div className="text-sm mt-2 opacity-90">
                        Anterior: {newRecord.previousRecord}kg
                        <span className="ml-2 text-green-200">
                          (+{(newRecord.weight - newRecord.previousRecord).toFixed(1)}kg)
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Mensaje motivacional */}
                  <p className="text-lg font-medium opacity-90">
                    ¡Sigue así, campeón! 💪
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <Suspense fallback={<div />}>
          <SetExecutionModal
            isOpen={setExecution.showSetExecution}
            exerciseName={currentExercise.name}
            equipment={currentExercise.equipment}
            currentSet={workoutState.currentSet}
            totalSets={currentExercise.sets.length}
            currentReps={workoutState.currentReps}
            currentWeight={workoutState.currentWeight}
            exerciseId={currentExercise.id}
            onRepsChange={workoutState.setCurrentReps}
            onWeightChange={workoutState.setCurrentWeight}
            onComplete={handleCompleteSet}
            onCancel={() => {
              setExecution.cancelSetExecution();
              if (routine && workoutState.currentExerciseIndex < routine.exercises.length - 1) {
                workoutState.setCurrentExerciseIndex(workoutState.currentExerciseIndex + 1);
                workoutState.setCurrentSet(1);
            }
          }}
        />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}
