'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGym } from '@/context/GymContext';
import { useWorkout } from '@/context/WorkoutContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Timer } from '@/components/Timer';
import { PreparationCountdown } from '@/components/PreparationCountdown';
import { MinimizedTimer } from '@/components/MinimizedTimer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ExerciseInfoPanel } from '@/components/ExerciseInfoPanel';
import { EXERCISE_DATABASE } from '@/data/exercises';
import * as storageService from '@/lib/storage/storage';
import { useWorkoutState } from './hooks/useWorkoutState';
import { useWorkoutTimer } from './hooks/useWorkoutTimer';
import { useWeightPrediction } from './hooks/useWeightPrediction';
import { useSetExecution } from './hooks/useSetExecution';
import { useWorkoutCompletion } from './hooks/useWorkoutCompletion';
import { useWorkoutSuggestions } from './hooks/useWorkoutSuggestions';
import { CompactWorkoutHeader } from './components/CompactWorkoutHeader';
import { ExerciseCard } from './components/ExerciseCard';
import { SetControls } from './components/SetControls';
import { SeriesTable } from './components/SeriesTable';
import { ExerciseList } from './components/ExerciseList';
import { QuickExerciseSwitcher } from './components/QuickExerciseSwitcher';
import { SetExecutionModal } from '@/components/SetExecutionModal';
import { 
  calculateNextRestTime, 
  calculateExerciseRestTime,
  calculateSmartRestTime,
  applySmartRestToAllSets
} from './services/restCalculationService';

export default function WorkoutPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const { getRoutineById, addSession, sessions, loading: gymLoading } = useGym();
  const { startWorkout, updateWorkoutProgress, clearRestState, finishWorkout: finishWorkoutContext, cancelWorkout } = useWorkout();
  const { success, error } = useToast();
  const { confirm } = useConfirm();
  
  // ==================== STATE ====================
  const [routine, setRoutine] = useState<any>(() => getRoutineById(id));
  const workoutState = useWorkoutState(routine || null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showExerciseInfo, setShowExerciseInfo] = useState(false);
  const [isSeriesTableExpanded, setIsSeriesTableExpanded] = useState(false);
  const [useSmartRest] = useState(true);
  const [pendingToast, setPendingToast] = useState<{message: string, duration: number} | null>(null);
  const [workoutStartTime, setWorkoutStartTime] = useState(() => {
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
  const [totalPausedTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // ==================== COMPUTED VALUES ====================
  const currentExercise = useMemo(() => {
    if (!routine || !routine.exercises || routine.exercises.length === 0) return null;
    return routine.exercises[workoutState.currentExerciseIndex] || null;
  }, [routine, workoutState.currentExerciseIndex]);

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
  
  const setExecution = useSetExecution();
  
  const completion = useWorkoutCompletion({
    routine,
    workoutStartTime,
    totalPausedTime,
    sessions,
    addSession,
    finishWorkoutContext,
    onSuccess: success,
    onError: error,
    router
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
    showPreparation: setExecution.showPreparation,
    isExecutingSet: setExecution.isExecutingSet,
    onSuccess: success,
    onError: error
  });

  // ==================== INITIALIZATION ====================
  useEffect(() => {
    if (gymLoading) return;
    
    let mounted = true;
    
    const initializeWorkout = async () => {
      const foundRoutine = getRoutineById(id);
      
      if (!foundRoutine) {
        router.push('/routines');
        return;
      }
      
      if (!mounted) return;
      
      const routineWithDefaults = {
        ...foundRoutine,
        exercises: foundRoutine.exercises.map((ex: any) => ({
          ...ex,
          useSmartRest: ex.useSmartRest !== undefined ? ex.useSmartRest : true
        }))
      };
      
      setRoutine(routineWithDefaults);
      
      const storedWorkout = await storageService.getActiveWorkout();
      
      if (!mounted) return;
      
      if (storedWorkout && storedWorkout.routineId === id) {
        const s = storedWorkout as any;
        
        // Restaurar el tiempo de inicio del entrenamiento
        if (s.startedAt) {
          const startTime = new Date(s.startedAt).getTime();
          setWorkoutStartTime(startTime);
          console.log('[Workout Init] Restored workout start time:', new Date(startTime).toISOString());
        }
        
        workoutState.setCurrentExerciseIndex(Number(s.currentExerciseIndex ?? 0));
        workoutState.setCurrentSet(Number(s.currentSet ?? 1));
        
        if (s.completedSets) {
          Object.keys(s.completedSets).forEach(exerciseId => {
            workoutState.updateCompletedSets(exerciseId, Number(s.completedSets[exerciseId] ?? 0));
          });
        }
        
        if (s.actualReps) {
          Object.keys(s.actualReps).forEach(exerciseId => {
            const reps = s.actualReps[exerciseId];
            if (Array.isArray(reps)) {
              workoutState.updateActualReps(exerciseId, reps.map((r: any) => Number(r ?? 0)));
            }
          });
        }
        
        if (s.actualWeights) {
          Object.keys(s.actualWeights).forEach(exerciseId => {
            const weights = s.actualWeights[exerciseId];
            if (Array.isArray(weights)) {
              workoutState.updateActualWeights(exerciseId, weights.map((w: any) => Number(w ?? 0)));
            }
          });
        }
        
        if (s.isResting && s.restTimerDuration && s.restTimerStartedAt) {
          const elapsed = Math.floor((Date.now() - Number(s.restTimerStartedAt)) / 1000);
          const remaining = Number(s.restTimerDuration) - elapsed;
          if (remaining > 0) {
            timerHandlers.startTimer(remaining, String(s.restTimerTitle || 'Descanso'), s.restTimerNextExercise ? String(s.restTimerNextExercise) : undefined);
          }
        }
        
        const currentExercise = routineWithDefaults.exercises[Number(s.currentExerciseIndex ?? 0)];
        if (currentExercise) {
          const currentSetData = currentExercise.sets[Number(s.currentSet ?? 1) - 1];
          if (currentSetData) {
            workoutState.setCurrentReps(currentSetData.reps);
            workoutState.setCurrentWeight(currentSetData.weight || 0);
          }
        }
      } else if (!storedWorkout || storedWorkout.routineId !== id) {
        startWorkout(routineWithDefaults);
        
        if (routineWithDefaults.exercises && routineWithDefaults.exercises.length > 0 && routineWithDefaults.exercises[0]) {
          const firstExercise = routineWithDefaults.exercises[0];
          const firstSet = firstExercise.sets[0];
          if (firstSet) {
            workoutState.setCurrentReps(firstSet.reps);
            workoutState.setCurrentWeight(firstSet.weight || 0);
          }
        }
      }
      
      if (mounted) {
        setIsInitialized(true);
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
      } : undefined
    );
  }, [
    workoutState.currentExerciseIndex,
    workoutState.currentSet,
    workoutState.workoutData.completedSets,
    workoutState.workoutData.actualReps,
    workoutState.workoutData.actualWeights,
    timerHandlers.showTimer,
    routine,
    isInitialized
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
  const handleCompleteSet = useCallback(() => {
    if (!currentExercise || !routine) return;
    
    setExecution.completeSet();
    
    const exerciseId = currentExercise.id;
    const setIndex = workoutState.currentSet - 1;
    const repsValue = typeof workoutState.currentReps === 'number' ? workoutState.currentReps : currentExercise.sets[setIndex]?.reps || 0;
    const weightValue = typeof workoutState.currentWeight === 'number' ? workoutState.currentWeight : currentExercise.sets[setIndex]?.weight || 0;

    workoutState.completeSet(exerciseId, repsValue, weightValue);

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

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
    } else {
      const restTime = calculateNextRestTime({
        currentExercise,
        routine,
        restOverrides: workoutState.workoutData.restOverrides,
        perSetOverrides: workoutState.workoutData.perSetRestOverrides,
        currentSet: workoutState.currentSet,
        useSmartRest
      });
      
      timerHandlers.startTimer(restTime, `Descanso - Serie ${workoutState.currentSet + 1}/${currentExercise.sets.length}`);
    }
  }, [currentExercise, routine, workoutState, workoutStartTime, useSmartRest, weightPrediction.weightSuggestion, timerHandlers, setExecution, completion]);

  const handleTimerComplete = useCallback(() => {
    timerHandlers.stopTimer();
    clearRestState();
    
    if (!currentExercise || !routine) return;
    
    const exerciseId = currentExercise.id;
    const completedCount = workoutState.workoutData.completedSets[exerciseId] || 0;
    const totalSets = currentExercise.sets.length;
    const isLastSet = completedCount >= totalSets;
    const isLastExercise = workoutState.currentExerciseIndex >= routine.exercises.length - 1;
    
    if (isLastSet && isLastExercise) {
      const duration = Math.floor((Date.now() - workoutStartTime) / 1000);
      completion.openCompletionModal(duration);
    } else if (isLastSet && !isLastExercise) {
      const nextIndex = workoutState.currentExerciseIndex + 1;
      if (routine.exercises[nextIndex]) {
        workoutState.setCurrentExerciseIndex(nextIndex);
        workoutState.setCurrentSet(1);
        const nextExercise = routine.exercises[nextIndex];
        const firstSet = nextExercise.sets[0];
        if (firstSet) {
          workoutState.setCurrentReps(firstSet.reps);
          workoutState.setCurrentWeight(firstSet.weight || 0);
        }
      }
    } else if (!isLastSet) {
      const newSet = workoutState.currentSet + 1;
      workoutState.setCurrentSet(newSet);
      const nextSetData = currentExercise.sets[newSet - 1];
      if (nextSetData) {
        workoutState.setCurrentReps(nextSetData.reps);
        workoutState.setCurrentWeight(nextSetData.weight || 0);
      }
    }
  }, [currentExercise, routine, workoutState, workoutStartTime, clearRestState, timerHandlers, completion]);

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
  }, [currentExercise, workoutState]);

  const handleEditWeight = useCallback((setIndex: number, weight: number) => {
    if (!currentExercise) return;
    const exerciseId = currentExercise.id;
    workoutState.updateActualWeights(exerciseId, [
      ...(workoutState.workoutData.actualWeights[exerciseId] || []).slice(0, setIndex),
      weight,
      ...(workoutState.workoutData.actualWeights[exerciseId] || []).slice(setIndex + 1)
    ]);
  }, [currentExercise, workoutState]);

  const handleEditSetType = useCallback((setIndex: number, type: any) => {
    if (!currentExercise) return;
    const exerciseId = currentExercise.id;
    workoutState.updateSetType(exerciseId, setIndex, type);
  }, [currentExercise, workoutState]);

  const handleEditRestTime = useCallback((setIndex: number, restTime: number) => {
    if (!currentExercise) return;
    const exerciseId = currentExercise.id;
    workoutState.updatePerSetRestOverride(exerciseId, setIndex, restTime);
  }, [currentExercise, workoutState]);

  const handleApplySmartRest = useCallback(() => {
    if (!currentExercise || !smartRestTime) return;
    applySmartRestToAllSets(currentExercise, workoutState.updatePerSetRestOverride);
    success('Descanso inteligente aplicado a todas las series', 2000);
  }, [currentExercise, smartRestTime, workoutState, success]);

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

  const handleAddSet = useCallback(() => {
    if (!routine || !currentExercise) return;
    
    const lastSet = currentExercise.sets[currentExercise.sets.length - 1];
    const newSet = {
      reps: lastSet?.reps || 10,
      weight: lastSet?.weight || 0,
      type: 'normal' as const
    };
    
    const updatedExercises = routine.exercises.map((ex: any, idx: any) => {
      if (idx === workoutState.currentExerciseIndex) {
        return {
          ...ex,
          sets: [...ex.sets, newSet]
        };
      }
      return ex;
    });
    
    setRoutine({
      ...routine,
      exercises: updatedExercises
    });
    
    success('Serie agregada', 2000);
  }, [routine, currentExercise, workoutState, success]);

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

  // ==================== RENDER ====================
  if (gymLoading || !isInitialized) {
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

  if (!routine || !routine.exercises || routine.exercises.length === 0) {
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

  if (setExecution.showPreparation) {
    return (
      <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
        <PreparationCountdown
          exerciseName={currentExercise.name}
          setNumber={workoutState.currentSet}
          onComplete={() => {
            const useExecutionModal = typeof window !== 'undefined' 
              ? localStorage.getItem('useExecutionModal') === 'true'
              : false;
            setExecution.completePreparation(useExecutionModal, success);
          }}
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
            />
          </div>
        </div>

        {/* Botón flotante grande - Iniciar o Completar Serie */}
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-linear-to-t from-white via-white/95 to-transparent dark:from-gray-900 dark:via-gray-900/95 dark:to-transparent pointer-events-none z-20" />
        
        <div className="fixed bottom-0 left-0 right-0 z-30 px-0">
          {!setExecution.isExecutingSet ? (
            // Botón Iniciar Serie
            <Button
              variant="primary"
              onClick={setExecution.startSet}
              className="w-full py-6 text-lg font-bold bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3 rounded-2xl border-2 border-white/20"
            >
              <span className="text-2xl">▶️</span>
              <div className="flex flex-col items-start">
                <span>Iniciar Serie {workoutState.currentSet}</span>
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
                <span>Completar Serie {workoutState.currentSet}</span>
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

        <SetControls
          currentSet={workoutState.currentSet}
          totalSets={currentExercise.sets.length}
          onSetChange={workoutState.setCurrentSet}
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
            perSetRestOverrides={workoutState.workoutData.perSetRestOverrides}
            onEditRestTime={handleEditRestTime}
            onApplySmartRest={handleApplySmartRest}
            smartRestTime={smartRestTime}
            routine={routine}
            restOverrides={workoutState.workoutData.restOverrides}
            useSmartRest={useSmartRest}
          />
        )}

        <ExerciseList
          routine={routine}
          currentExerciseIndex={workoutState.currentExerciseIndex}
          completedSets={workoutState.workoutData.completedSets}
          onSelectExercise={handleSelectExercise}
          onMoveExercise={handleMoveExercise}
        />

        <Modal
          isOpen={completion.showNotesModal}
          onClose={() => completion.setShowNotesModal(false)}
          title="¡Entrenamiento completado! 🎉"
        >
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Revisa la duración y agrega una nota antes de guardar la sesión.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duración del entrenamiento
              </label>
              <select
                value={Math.floor(completion.proposedDuration / 60)}
                onChange={(e) => {
                  const minutes = parseInt(e.target.value || '0', 10);
                  completion.setProposedDuration(Math.max(0, isNaN(minutes) ? 0 : minutes) * 60);
                }}
                className="w-full p-2 border rounded bg-white dark:bg-gray-700"
              >
                {Array.from({ length: 59 }, (_, i) => i + 1).map(m => (
                  <option key={`m-${m}`} value={m}>{m} min</option>
                ))}
                {Array.from({ length: 5 }, (_, i) => i + 1).map(h => (
                  <option key={`h-${h}`} value={h * 60}>{h} h</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notas (opcional)
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Ej: Me sentí muy fuerte hoy, aumentar peso la próxima vez..."
                value={completion.sessionNotes}
                onChange={(e) => completion.setSessionNotes(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  completion.setSessionNotes('');
                  completion.setShowNotesModal(false);
                  completion.finishWorkout(workoutState.workoutData);
                }}
                className="flex-1"
              >
                Omitir
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  completion.setShowNotesModal(false);
                  completion.finishWorkout(workoutState.workoutData);
                }}
                className="flex-1"
              >
                Guardar y finalizar
              </Button>
            </div>
          </div>
        </Modal>

        {showExerciseInfo && currentExercise && (
          <ExerciseInfoPanel
            exercise={EXERCISE_DATABASE.find(e => e.name === currentExercise.name) || {
              id: currentExercise.id,
              name: currentExercise.name,
              muscleGroup: 'pecho'
            } as any}
            onClose={() => setShowExerciseInfo(false)}
          />
        )}

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
      </div>
    </ProtectedRoute>
  );
}
