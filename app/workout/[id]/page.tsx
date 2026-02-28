'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGym } from '@/context/GymContext';
import { useWorkout } from '@/context/WorkoutContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Timer } from '@/components/Timer';
import { WorkoutGlobalTimer } from '@/components/WorkoutGlobalTimer';
import { PreparationCountdown } from '@/components/PreparationCountdown';
import { MinimizedTimer } from '@/components/MinimizedTimer';
import SetTypeSelector from '@/components/SetTypeSelector';
import { WeightSelector } from '@/components/WeightSelector';
import { Input } from '@/components/ui/Input';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ExerciseInfoPanel } from '@/components/ExerciseInfoPanel';
import { EXERCISE_DATABASE } from '@/data/exercises';
import * as storageService from '@/lib/storage/storage';
import { generateWorkoutSuggestions, generateLiveSuggestions, type WorkoutSuggestion } from '@/lib/workoutSuggestions';
import { 
  calculateNextRestTime, 
  calculateExerciseRestTime,
  updateNestedArray 
} from './utils/workoutCalculations';
import { calculateRestBetweenSets } from '@/lib/restCalculator';
import { useWorkoutState } from './hooks/useWorkoutState';
import { useWorkoutSuggestions } from './hooks/useWorkoutSuggestions';
import { WorkoutHeader } from './components/WorkoutHeader';
import { ExerciseCard } from './components/ExerciseCard';
import { SetControls } from './components/SetControls';
import { WorkoutSummary } from './components/WorkoutSummary';
import { SeriesTable } from './components/SeriesTable';
import { ExerciseList } from './components/ExerciseList';
import { SetExecutionModal } from '@/components/SetExecutionModal';
import { generateWeightSuggestion, formatWeightSuggestion } from '@/lib/weightSuggestions';
import { calculateAchievements, getRecentAchievements } from '@/lib/achievements';
import { predictWeight, validateWeight } from './utils/weightPrediction';

export default function WorkoutPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const { getRoutineById, addSession, sessions, loading: gymLoading } = useGym();
  const { activeWorkout, startWorkout, updateWorkoutProgress, clearRestState, finishWorkout: finishWorkoutContext, cancelWorkout } = useWorkout();
  const { success, error } = useToast();
  const { confirm } = useConfirm();
  
  // ==================== STATE ====================
  const [routine, setRoutine] = useState<any>(getRoutineById(id));
  const workoutState = useWorkoutState(routine || null);
  
  // Timer and UI state
  const [showTimer, setShowTimer] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);
  const [timerTitle, setTimerTitle] = useState('');
  const [nextExerciseName, setNextExerciseName] = useState<string | undefined>(undefined);
  const [timerMinimized, setTimerMinimized] = useState(false);
  
  // Completion modal state
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [proposedDuration, setProposedDuration] = useState<number>(0);
  
  // Execution flow state
  const [showPreparation, setShowPreparation] = useState(false);
  const [showSetExecution, setShowSetExecution] = useState(false);
  const [isExecutingSet, setIsExecutingSet] = useState(false);
  const [setStartTime, setSetStartTime] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showExerciseInfo, setShowExerciseInfo] = useState(false);
  
  // Fase 2: Collapsible SeriesTable state
  const [isSeriesTableExpanded, setIsSeriesTableExpanded] = useState(false);
  
  // Workout tracking
  const [workoutStartTime] = useState(Date.now());
  const [totalPausedTime, setTotalPausedTime] = useState(0);
  const [useSmartRest, setUseSmartRest] = useState(true);
  const [suggestions, setSuggestions] = useState<WorkoutSuggestion[]>([]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<number>>(new Set());
  const [weightSuggestion, setWeightSuggestion] = useState<any>(null);
  const [shownAchievements, setShownAchievements] = useState<Set<string>>(new Set());
  const [pendingToast, setPendingToast] = useState<{message: string, duration: number} | null>(null);
  const [dismissedWeightSuggestion, setDismissedWeightSuggestion] = useState(false);
  
  // Drag and drop state
  const [draggedExerciseIndex, setDraggedExerciseIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  // Refs
  const timerCompleteProcessingRef = React.useRef(false);

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
      
      // Ensure all exercises have useSmartRest field (default to true for new exercises)
      const routineWithDefaults = {
        ...foundRoutine,
        exercises: foundRoutine.exercises.map((ex: any) => ({
          ...ex,
          useSmartRest: ex.useSmartRest !== undefined ? ex.useSmartRest : true
        }))
      };
      
      setRoutine(routineWithDefaults);
      
      // Verificar si hay un workout guardado
      const storedWorkout = await storageService.getActiveWorkout();
      
      console.log('[Workout Init] Stored workout:', storedWorkout);
      
      if (!mounted) return;
      
      // Si hay un workout guardado y coincide con esta rutina, restaurar el estado
      if (storedWorkout && storedWorkout.routineId === id) {
        const s = storedWorkout as any;
        console.log('[Workout Init] Restoring workout state:', {
          currentExerciseIndex: s.currentExerciseIndex,
          currentSet: s.currentSet,
          completedSets: s.completedSets,
          actualReps: s.actualReps,
          actualWeights: s.actualWeights
        });
        
        workoutState.setCurrentExerciseIndex(Number(s.currentExerciseIndex ?? 0));
        workoutState.setCurrentSet(Number(s.currentSet ?? 1));
        
        // ✅ CRÍTICO: Restaurar datos de series completadas
        if (s.completedSets) {
          Object.keys(s.completedSets).forEach(exerciseId => {
            workoutState.updateCompletedSets(exerciseId, Number(s.completedSets[exerciseId] ?? 0));
          });
        }
        
        // ✅ CRÍTICO: Restaurar repeticiones reales
        if (s.actualReps) {
          Object.keys(s.actualReps).forEach(exerciseId => {
            const reps = s.actualReps[exerciseId];
            if (Array.isArray(reps)) {
              workoutState.updateActualReps(exerciseId, reps.map((r: any) => Number(r ?? 0)));
            }
          });
        }
        
        // ✅ CRÍTICO: Restaurar pesos reales
        if (s.actualWeights) {
          Object.keys(s.actualWeights).forEach(exerciseId => {
            const weights = s.actualWeights[exerciseId];
            if (Array.isArray(weights)) {
              workoutState.updateActualWeights(exerciseId, weights.map((w: any) => Number(w ?? 0)));
            }
          });
        }
        
        // Restaurar estado del timer de descanso si estaba descansando
        if (s.isResting && s.restTimerDuration && s.restTimerStartedAt) {
          const elapsed = Math.floor((Date.now() - Number(s.restTimerStartedAt)) / 1000);
          const remaining = Number(s.restTimerDuration) - elapsed;
          if (remaining > 0) {
            setShowTimer(true);
            setTimerDuration(remaining);
            setTimerTitle(String(s.restTimerTitle || 'Descanso'));
            setNextExerciseName(s.restTimerNextExercise ? String(s.restTimerNextExercise) : undefined);
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
        // Solo iniciar un nuevo workout si NO hay ninguno guardado o es de otra rutina
        startWorkout(routineWithDefaults);
        
        // Inicializar valores del primer ejercicio (primera serie)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, gymLoading]);

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

  const elapsedTime = useMemo(() => {
    return Math.floor((Date.now() - workoutStartTime) / 1000);
  }, [workoutStartTime]);

  // ==================== EFFECTS ====================
  
  // Sync currentReps and currentWeight with actual values when currentSet changes
  useEffect(() => {
    if (!currentExercise || !isInitialized) return;
    
    const exerciseId = currentExercise.id;
    const setIndex = workoutState.currentSet - 1;
    
    // Get actual values if they exist (edited values)
    const actualReps = workoutState.workoutData.actualReps[exerciseId]?.[setIndex];
    const actualWeight = workoutState.workoutData.actualWeights[exerciseId]?.[setIndex];
    
    // Use actual values if they exist and are not 0, otherwise use routine values
    const repsToShow = (actualReps !== undefined && actualReps !== 0)
      ? actualReps
      : currentExercise.sets[setIndex]?.reps || 0;
    
    const weightToShow = (actualWeight !== undefined && actualWeight !== 0)
      ? actualWeight
      : currentExercise.sets[setIndex]?.weight || 0;
    
    // Only update if different to avoid infinite loops
    if (workoutState.currentReps !== repsToShow) {
      workoutState.setCurrentReps(repsToShow);
    }
    if (workoutState.currentWeight !== weightToShow) {
      workoutState.setCurrentWeight(weightToShow);
    }
  }, [currentExercise, workoutState.currentSet, workoutState.workoutData.actualReps, workoutState.workoutData.actualWeights, isInitialized]);
  
  // Sync workout state with context for persistence
  useEffect(() => {
    if (!routine || !isInitialized) return;
    
    console.log('[Workout Sync] Syncing state to context:', {
      currentExerciseIndex: workoutState.currentExerciseIndex,
      currentSet: workoutState.currentSet,
      completedSets: workoutState.workoutData.completedSets,
      actualReps: workoutState.workoutData.actualReps,
      actualWeights: workoutState.workoutData.actualWeights
    });
    
    updateWorkoutProgress(
      workoutState.currentExerciseIndex,
      workoutState.currentSet,
      workoutState.workoutData.completedSets,
      workoutState.workoutData.actualReps,
      workoutState.workoutData.actualWeights,
      showTimer ? {
        isResting: true,
        restTimerDuration: timerDuration,
        restTimerTitle: timerTitle,
        restTimerNextExercise: nextExerciseName,
        restTimerStartedAt: Date.now()
      } : undefined
    );
  }, [
    workoutState.currentExerciseIndex,
    workoutState.currentSet,
    workoutState.workoutData.completedSets,
    workoutState.workoutData.actualReps,
    workoutState.workoutData.actualWeights,
    showTimer,
    timerDuration,
    timerTitle,
    nextExerciseName,
    routine,
    isInitialized,
    updateWorkoutProgress
  ]);
  
  useEffect(() => {
    if (showTimer) {
      document.body.classList.add('hide-navbar');
    } else {
      document.body.classList.remove('hide-navbar');
    }

    return () => {
      document.body.classList.remove('hide-navbar');
    };
  }, [showTimer]);

  useEffect(() => {
    setDismissedSuggestions(new Set());
    setDismissedWeightSuggestion(false); // Reset cuando cambia ejercicio
    setIsSeriesTableExpanded(false); // Reset expansion state when exercise changes
  }, [workoutState.currentExerciseIndex]);

  // Generate weight suggestions for current exercise
  useEffect(() => {
    console.log('[Weight Suggestion] Checking conditions:', {
      hasExercise: !!currentExercise,
      exerciseName: currentExercise?.name,
      sessionsCount: sessions.length,
      currentSet: workoutState.currentSet
    });

    if (!currentExercise || sessions.length === 0) {
      console.log('[Weight Suggestion] No suggestion - missing exercise or sessions');
      setWeightSuggestion(null);
      return;
    }

    const suggestion = generateWeightSuggestion(
      currentExercise.name,
      sessions,
      currentExercise.sets[workoutState.currentSet - 1]?.reps || 10
    );

    console.log('[Weight Suggestion] Generated:', suggestion);
    setWeightSuggestion(suggestion);
  }, [currentExercise, workoutState.currentSet, sessions]);

  // Show pending toast when timer closes
  useEffect(() => {
    if (!showTimer && pendingToast) {
      // Small delay to ensure timer is fully closed
      const timer = setTimeout(() => {
        success(pendingToast.message, pendingToast.duration);
        setPendingToast(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showTimer, pendingToast, success]);

  // ==================== INTELLIGENT WEIGHT PREDICTION ====================
  useEffect(() => {
    if (!currentExercise || !isInitialized) return;
    
    const exerciseId = currentExercise.id;
    const setIndex = workoutState.currentSet - 1;
    
    // Skip if user has already edited this set
    const hasEditedValue = workoutState.workoutData.actualWeights[exerciseId]?.[setIndex];
    if (hasEditedValue !== undefined && hasEditedValue !== 0) return;
    
    // Predict weight
    const prediction = predictWeight({
      exerciseName: currentExercise.name,
      currentSet: workoutState.currentSet,
      sessions,
      currentExercise,
      actualWeights: workoutState.workoutData.actualWeights,
      exerciseId
    });
    
    // Apply prediction if different from current
    const validatedWeight = validateWeight(prediction.predictedWeight);
    if (validatedWeight !== workoutState.currentWeight) {
      workoutState.setCurrentWeight(validatedWeight);
      
      // Show reasoning as toast (only for high confidence predictions)
      if (prediction.confidence === 'high' && prediction.source !== 'routine_default') {
        success(`💡 ${prediction.reasoning}`, 3000);
      }
    }
  }, [currentExercise, workoutState.currentSet, isInitialized, sessions]);

  // ==================== SMART REST TIME ====================
  const smartRestTime = useMemo(() => {
    if (!currentExercise) return undefined;
    
    // Check if smart rest is enabled for this exercise (default to true if not specified)
    const useSmartRestForExercise = currentExercise.useSmartRest !== false;
    
    if (!useSmartRestForExercise) return undefined;
    
    const exerciseTemplate = EXERCISE_DATABASE.find(e => e.name === currentExercise.name);
    
    if (!exerciseTemplate) return undefined;
    
    // Calculate smart rest based on exercise characteristics (sets, reps)
    // Use average reps from all sets for a more accurate calculation
    const avgReps = Math.round(
      currentExercise.sets.reduce((sum: number, set: any) => sum + set.reps, 0) / currentExercise.sets.length
    );
    
    const restRecommendation = calculateRestBetweenSets(
      exerciseTemplate,
      currentExercise.sets.length,
      avgReps,
      'intermediate'
    );
    
    // Round to nearest 5-second interval to match selector options
    return Math.round(restRecommendation.recommended / 5) * 5;
  }, [currentExercise]);

  // ==================== WORKOUT SUGGESTIONS ====================
  useWorkoutSuggestions({
    currentExercise,
    routine,
    currentSet: workoutState.currentSet,
    currentWeight: workoutState.currentWeight,
    sessions: sessions as any,
    restOverrides: workoutState.workoutData.restOverrides,
    perSetRestOverrides: workoutState.workoutData.perSetRestOverrides,
    useSmartRest: useSmartRest,
    smartRestTime: smartRestTime,
    showTimer,
    showPreparation,
    isExecutingSet,
    onSuccess: success,
    onError: error
  });

  // ==================== HANDLERS ====================
  const handleStartSet = useCallback(() => {
    // Always show preparation countdown first
    setShowPreparation(true);
  }, []);

  const handleCancelSetExecution = useCallback(() => {
    setShowSetExecution(false);
    setIsExecutingSet(false);
    // Skip to next exercise
    if (routine && workoutState.currentExerciseIndex < routine.exercises.length - 1) {
      workoutState.setCurrentExerciseIndex(workoutState.currentExerciseIndex + 1);
      workoutState.setCurrentSet(1);
    }
  }, [routine, workoutState]);

  const handlePreparationComplete = useCallback(() => {
    setShowPreparation(false);
    
    // Check if execution modal is enabled (default: false for better UX)
    const useExecutionModal = typeof window !== 'undefined' 
      ? localStorage.getItem('useExecutionModal') === 'true'
      : false;
    
    // Start set timer
    setSetStartTime(Date.now());
    
    if (useExecutionModal) {
      // Open modal for execution
      setShowSetExecution(true);
      setIsExecutingSet(true);
    } else {
      // Direct completion mode - just mark as started
      setIsExecutingSet(true);
      success('✅ Serie iniciada - completa cuando termines', 2000);
    }
  }, [success]);

  const handleCompleteSet = useCallback(() => {
    if (!currentExercise || !routine) return;
    
    setIsExecutingSet(false); // Reset executing state
    setShowSetExecution(false); // Cerrar modal
    setSetStartTime(null); // Reset set timer
    
    const exerciseId = currentExercise.id;
    const setIndex = workoutState.currentSet - 1;
    const repsValue = typeof workoutState.currentReps === 'number' ? workoutState.currentReps : currentExercise.sets[setIndex]?.reps || 0;
    const weightValue = typeof workoutState.currentWeight === 'number' ? workoutState.currentWeight : currentExercise.sets[setIndex]?.weight || 0;

    // Update workout state
    workoutState.completeSet(exerciseId, repsValue, weightValue);

    // ✨ Improved feedback - vibration
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]); // Double vibration pattern
    }

    // Prepare toast message to show after rest
    if (weightSuggestion && weightSuggestion.suggested > weightValue) {
      setPendingToast({
        message: `💪 Próxima vez intenta con ${weightSuggestion.suggested}kg (+${weightSuggestion.increase}kg)`,
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
        setProposedDuration(Math.max(duration, 60));
        setShowNotesModal(true);
      } else {
        const nextExercise = routine.exercises[workoutState.currentExerciseIndex + 1];
        const restTime = calculateExerciseRestTime({
          currentExercise,
          nextExercise,
          routine,
          restOverrides: workoutState.workoutData.restOverrides,
          useSmartRest
        });
        
        setShowTimer(true);
        setTimerDuration(restTime);
        setTimerTitle('Descanso entre ejercicios');
        setNextExerciseName(nextExercise.name);
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
      
      setShowTimer(true);
      setTimerDuration(restTime);
      setTimerTitle(`Descanso - Serie ${workoutState.currentSet + 1}/${currentExercise.sets.length}`);
      setNextExerciseName(undefined);
    }
  }, [currentExercise, routine, workoutState, workoutStartTime, useSmartRest, weightSuggestion, success]);

  const handleTimerComplete = useCallback(() => {
    if (timerCompleteProcessingRef.current) return;
    
    timerCompleteProcessingRef.current = true;
    setShowTimer(false);
    setTimerMinimized(false); // Reset minimized state
    clearRestState();
    
    if (!currentExercise || !routine) {
      timerCompleteProcessingRef.current = false;
      return;
    }
    
    const exerciseId = currentExercise.id;
    const completedCount = workoutState.workoutData.completedSets[exerciseId] || 0;
    const totalSets = currentExercise.sets.length;
    const isLastSet = completedCount >= totalSets;
    const isLastExercise = workoutState.currentExerciseIndex >= routine.exercises.length - 1;
    
    if (isLastSet && isLastExercise) {
      const duration = Math.floor((Date.now() - workoutStartTime) / 1000);
      setProposedDuration(Math.max(duration, 60));
      setShowNotesModal(true);
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
    
    setTimeout(() => {
      timerCompleteProcessingRef.current = false;
    }, 100);
  }, [currentExercise, routine, workoutState, workoutStartTime, clearRestState]);

  const finishCompleteWorkout = useCallback(async () => {
    if (!routine) return;

    const totalDuration = proposedDuration && proposedDuration > 0
      ? proposedDuration
      : Math.floor((Date.now() - workoutStartTime) / 1000);

    const sessionExercises = routine.exercises.map((ex: any) => ({
      exerciseId: ex.id,
      exerciseName: ex.name,
      completedSets: workoutState.workoutData.completedSets[ex.id] || 0,
      actualReps: workoutState.workoutData.actualReps[ex.id] || [],
      actualWeight: workoutState.workoutData.actualWeights[ex.id] || [],
      setDurations: workoutState.workoutData.actualSetDurations[ex.id] || [],
      pauseDurations: workoutState.workoutData.actualPauseDurations[ex.id] || [],
      actualRestTimes: workoutState.workoutData.actualRestTimes[ex.id] || []
    }));

    try {
      await addSession({
        routineId: routine.id,
        date: new Date(),
        exercises: sessionExercises,
        notes: workoutState.sessionNotes.trim() || '',
        totalDuration,
        totalPausedTime
      });
      
      // Check for new achievements
      const updatedSessions = [...sessions, {
        routineId: routine.id,
        date: new Date(),
        exercises: sessionExercises,
        notes: workoutState.sessionNotes.trim() || '',
        totalDuration,
        totalPausedTime
      } as any];

      const achievements = calculateAchievements(updatedSessions);
      const recentAchievements = getRecentAchievements(achievements);
      
      // Show achievement notifications for newly unlocked achievements
      recentAchievements.forEach(achievement => {
        if (achievement.unlocked && !shownAchievements.has(achievement.id)) {
          success(`🏆 ¡Logro desbloqueado! ${achievement.name}`, 5000);
          setShownAchievements(prev => new Set([...prev, achievement.id]));
        }
      });
      
      finishWorkoutContext();
      success('Sesión guardada exitosamente');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      router.replace('/sessions');
      router.refresh();
    } catch (err) {
      console.error('Error saving session:', err);
      error('Error al guardar la sesión. Por favor, intenta nuevamente.');
    }
  }, [routine, workoutState, workoutStartTime, totalPausedTime, addSession, finishWorkoutContext, success, error, router, sessions, shownAchievements]);

  const handleCancelWorkout = useCallback(async () => {
    const confirmed = await confirm({
      title: 'Cancelar entrenamiento',
      message: '¿Estás seguro de que quieres cancelar el entrenamiento? Se perderá todo el progreso.',
      confirmText: 'Sí, cancelar',
      cancelText: 'Continuar entrenamiento',
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

  // ==================== SERIES TABLE HANDLERS ====================
  const handleEditReps = useCallback((setIndex: number, reps: number) => {
    if (!currentExercise) return;
    const exerciseId = currentExercise.id;
    workoutState.updateActualReps(exerciseId, [
      ...(workoutState.workoutData.actualReps[exerciseId] || []).slice(0, setIndex),
      reps,
      ...(workoutState.workoutData.actualReps[exerciseId] || []).slice(setIndex + 1)
    ]);
    // Note: currentReps will be updated automatically by the sync effect
  }, [currentExercise, workoutState]);

  const handleEditWeight = useCallback((setIndex: number, weight: number) => {
    if (!currentExercise) return;
    const exerciseId = currentExercise.id;
    workoutState.updateActualWeights(exerciseId, [
      ...(workoutState.workoutData.actualWeights[exerciseId] || []).slice(0, setIndex),
      weight,
      ...(workoutState.workoutData.actualWeights[exerciseId] || []).slice(setIndex + 1)
    ]);
    // Note: currentWeight will be updated automatically by the sync effect
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
    const exerciseId = currentExercise.id;
    
    // Apply smart rest to all sets
    for (let i = 0; i < currentExercise.sets.length; i++) {
      workoutState.updatePerSetRestOverride(exerciseId, i, smartRestTime);
    }
    success('Descanso inteligente aplicado a todas las series', 2000);
  }, [currentExercise, smartRestTime, workoutState, success]);

  const handleToggleSetComplete = useCallback((setIndex: number, isComplete: boolean) => {
    if (!currentExercise || !routine) return;
    
    const exerciseId = currentExercise.id;
    
    if (isComplete) {
      // Mark as complete - use values from actualReps/actualWeights if available, otherwise from routine
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
      
      // ✅ Update currentSet to next incomplete set
      const nextIncompleteSet = currentExercise.sets.findIndex((_: any, idx: number) => {
        return idx > setIndex && !newActualReps[idx];
      });
      
      if (nextIncompleteSet !== -1) {
        workoutState.setCurrentSet(nextIncompleteSet + 1);
        // Note: currentReps/currentWeight will be updated automatically by sync effect
      } else if (newCompletedCount >= currentExercise.sets.length) {
        // All sets complete
        const isLastExercise = workoutState.currentExerciseIndex >= routine.exercises.length - 1;
        
        if (isLastExercise) {
          // Show completion modal
          const duration = Math.floor((Date.now() - workoutStartTime) / 1000);
          setProposedDuration(Math.max(duration, 60));
          setShowNotesModal(true);
        } else {
          // Show rest timer before next exercise
          const nextExercise = routine.exercises[workoutState.currentExerciseIndex + 1];
          const restTime = calculateExerciseRestTime({
            currentExercise,
            nextExercise,
            routine,
            restOverrides: workoutState.workoutData.restOverrides,
            useSmartRest
          });
          
          setShowTimer(true);
          setTimerDuration(restTime);
          setTimerTitle('Descanso entre ejercicios');
          setNextExerciseName(nextExercise.name);
        }
      }
    } else {
      // Mark as incomplete
      const newActualReps = [...(workoutState.workoutData.actualReps[exerciseId] || [])];
      newActualReps[setIndex] = 0;
      
      const newActualWeights = [...(workoutState.workoutData.actualWeights[exerciseId] || [])];
      newActualWeights[setIndex] = 0;
      
      workoutState.updateActualReps(exerciseId, newActualReps);
      workoutState.updateActualWeights(exerciseId, newActualWeights);
      workoutState.updateCompletedSets(exerciseId, Math.max(0, (workoutState.workoutData.completedSets[exerciseId] || 0) - 1));
      
      // ✅ Update currentSet to the uncompleted set if it's before current
      if (setIndex + 1 < workoutState.currentSet) {
        workoutState.setCurrentSet(setIndex + 1);
        // Note: currentReps/currentWeight will be updated automatically by sync effect
      }
    }
  }, [currentExercise, routine, workoutState, workoutStartTime, useSmartRest]);

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
    setShowTimer(false);
    setIsExecutingSet(false);
    setShowPreparation(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [workoutState]);

  // ==================== REPEAT PREVIOUS LOGIC ====================
  const lastSetData = useMemo(() => {
    if (!currentExercise) return null;
    
    const exerciseId = currentExercise.id;
    const currentSetIndex = workoutState.currentSet - 1;
    
    // If first set, try to get data from last session
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
    
    // If set 2+, get data from previous set in current workout
    if (currentSetIndex > 0) {
      const prevReps = workoutState.workoutData.actualReps[exerciseId]?.[currentSetIndex - 1];
      const prevWeight = workoutState.workoutData.actualWeights[exerciseId]?.[currentSetIndex - 1];
      
      if (prevReps && prevWeight) {
        return {
          reps: prevReps,
          weight: prevWeight
        };
      }
    }
    
    return null;
  }, [currentExercise, workoutState.currentSet, workoutState.workoutData.actualReps, workoutState.workoutData.actualWeights, lastSessionForExercise]);

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

  // Show timer fullscreen or minimized
  if (showTimer && !timerMinimized) {
    return (
      <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
        <Timer
          duration={timerDuration}
          title={timerTitle}
          nextExerciseName={nextExerciseName}
          onComplete={handleTimerComplete}
          autoStart={true}
          showMotivation={true}
          onMinimize={() => setTimerMinimized(true)}
        />
      </div>
    );
  }

  // Show preparation countdown
  if (showPreparation) {
    return (
      <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
        <PreparationCountdown
          exerciseName={currentExercise.name}
          setNumber={workoutState.currentSet}
          onComplete={handlePreparationComplete}
        />
      </div>
    );
  }

  // Main workout view
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 pb-32">
        {/* Minimized timer overlay */}
        {showTimer && timerMinimized && (
          <MinimizedTimer
            timeLeft={timerDuration}
            title={timerTitle}
            onExpand={() => setTimerMinimized(false)}
            onSkip={handleTimerComplete}
          />
        )}

        {/* Global timer */}
        <WorkoutGlobalTimer startTime={workoutStartTime} />

        {/* Header */}
        <WorkoutHeader
          routine={routine}
          currentExerciseIndex={workoutState.currentExerciseIndex}
          totalExercises={routine.exercises.length}
          elapsedTime={elapsedTime}
          onCancel={handleCancelWorkout}
          onPause={() => {}} // TODO: Implement pause
        />

        {/* Action buttons - TOP */}
        {!isExecutingSet && (
          <div className="mb-6">
            <Button
              variant="primary"
              onClick={handleStartSet}
              className="w-full py-3 text-base font-semibold"
            >
              ▶️ Iniciar Serie
            </Button>
          </div>
        )}

        {/* Exercise card */}
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
          onSkipExercise={() => {
            workoutState.setCurrentExerciseIndex(workoutState.currentExerciseIndex + 1);
            workoutState.setCurrentSet(1);
          }}
          onShowInfo={() => setShowExerciseInfo(true)}
          isSetStarted={isExecutingSet}
          weightSuggestion={!dismissedWeightSuggestion ? weightSuggestion : null}
          onDismissWeightSuggestion={() => setDismissedWeightSuggestion(true)}
          lastSetData={lastSetData}
          onRepeatPrevious={handleRepeatPrevious}
          setStartTime={setStartTime}
        />

        {/* Set controls */}
        <SetControls
          currentSet={workoutState.currentSet}
          totalSets={currentExercise.sets.length}
          onSetChange={workoutState.setCurrentSet}
        />

        {/* Collapsible SeriesTable toggle button */}
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

        {/* Series table - conditional render */}
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

        {/* Exercise list */}
        <ExerciseList
          routine={routine}
          currentExerciseIndex={workoutState.currentExerciseIndex}
          completedSets={workoutState.workoutData.completedSets}
          onSelectExercise={handleSelectExercise}
          onMoveExercise={handleMoveExercise}
        />

        {/* Notes modal */}
        <Modal
          isOpen={showNotesModal}
          onClose={() => setShowNotesModal(false)}
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
                value={Math.floor(proposedDuration / 60)}
                onChange={(e) => setProposedDuration(Math.max(0, parseInt(e.target.value || '0')) * 60)}
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
                value={workoutState.sessionNotes}
                onChange={(e) => workoutState.setSessionNotes(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  workoutState.setSessionNotes('');
                  setShowNotesModal(false);
                  finishCompleteWorkout();
                }}
                className="flex-1"
              >
                Omitir
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowNotesModal(false);
                  finishCompleteWorkout();
                }}
                className="flex-1"
              >
                Guardar y finalizar
              </Button>
            </div>
          </div>
        </Modal>

        {/* Exercise info panel */}
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

        {/* Set execution modal */}
        <SetExecutionModal
          isOpen={showSetExecution}
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
          onCancel={handleCancelSetExecution}
        />
      </div>
    </ProtectedRoute>
  );
}
