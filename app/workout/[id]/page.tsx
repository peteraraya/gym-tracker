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
import { useWorkoutState } from './hooks/useWorkoutState';
import { WorkoutHeader } from './components/WorkoutHeader';
import { ExerciseCard } from './components/ExerciseCard';
import { SetControls } from './components/SetControls';
import { WorkoutSummary } from './components/WorkoutSummary';
import { SeriesTable } from './components/SeriesTable';
import { ExerciseList } from './components/ExerciseList';

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
  
  // Completion modal state
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [proposedDuration, setProposedDuration] = useState<number>(0);
  
  // Execution flow state
  const [showPreparation, setShowPreparation] = useState(false);
  const [isExecutingSet, setIsExecutingSet] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showExerciseInfo, setShowExerciseInfo] = useState(false);
  
  // Workout tracking
  const [workoutStartTime] = useState(Date.now());
  const [totalPausedTime, setTotalPausedTime] = useState(0);
  const [useSmartRest, setUseSmartRest] = useState(true);
  const [suggestions, setSuggestions] = useState<WorkoutSuggestion[]>([]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<number>>(new Set());
  
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
      setRoutine(foundRoutine);
      
      // Verificar si hay un workout guardado
      const storedWorkout = await storageService.getActiveWorkout();
      
      if (!mounted) return;
      
      // Si hay un workout guardado y coincide con esta rutina, restaurar el estado
      if (storedWorkout && storedWorkout.routineId === id) {
        const s = storedWorkout as any;
        workoutState.setCurrentExerciseIndex(Number(s.currentExerciseIndex ?? 0));
        workoutState.setCurrentSet(Number(s.currentSet ?? 1));
        
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
        
        const currentExercise = foundRoutine.exercises[Number(s.currentExerciseIndex ?? 0)];
        if (currentExercise) {
          const currentSetData = currentExercise.sets[Number(s.currentSet ?? 1) - 1];
          if (currentSetData) {
            workoutState.setCurrentReps(currentSetData.reps);
            workoutState.setCurrentWeight(currentSetData.weight || 0);
          }
        }
      } else if (!storedWorkout || storedWorkout.routineId !== id) {
        // Solo iniciar un nuevo workout si NO hay ninguno guardado o es de otra rutina
        startWorkout(foundRoutine);
        
        // Inicializar valores del primer ejercicio (primera serie)
        if (foundRoutine.exercises && foundRoutine.exercises.length > 0 && foundRoutine.exercises[0]) {
          const firstExercise = foundRoutine.exercises[0];
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
  }, [workoutState.currentExerciseIndex]);

  // ==================== HANDLERS ====================
  const handleStartSet = useCallback(() => {
    setShowPreparation(true);
  }, []);

  const handlePreparationComplete = useCallback(() => {
    setShowPreparation(false);
    setIsExecutingSet(true);
  }, []);

  const handleCompleteSet = useCallback(() => {
    if (!currentExercise || !routine) return;
    
    setIsExecutingSet(false);
    
    const exerciseId = currentExercise.id;
    const setIndex = workoutState.currentSet - 1;
    const repsValue = typeof workoutState.currentReps === 'number' ? workoutState.currentReps : currentExercise.sets[setIndex]?.reps || 0;
    const weightValue = typeof workoutState.currentWeight === 'number' ? workoutState.currentWeight : currentExercise.sets[setIndex]?.weight || 0;

    // Update workout state
    workoutState.completeSet(exerciseId, repsValue, weightValue);

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
  }, [currentExercise, routine, workoutState, workoutStartTime, useSmartRest]);

  const handleTimerComplete = useCallback(() => {
    if (timerCompleteProcessingRef.current) return;
    
    timerCompleteProcessingRef.current = true;
    setShowTimer(false);
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
      
      finishWorkoutContext();
      success('Sesión guardada exitosamente');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      router.replace('/sessions');
      router.refresh();
    } catch (err) {
      console.error('Error saving session:', err);
      error('Error al guardar la sesión. Por favor, intenta nuevamente.');
    }
  }, [routine, workoutState, workoutStartTime, totalPausedTime, addSession, finishWorkoutContext, success, error, router]);

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

  const handleToggleSetComplete = useCallback((setIndex: number, isComplete: boolean) => {
    if (!currentExercise || !routine) return;
    
    const exerciseId = currentExercise.id;
    
    if (isComplete) {
      // Mark as complete
      const repsToUse = currentExercise.sets[setIndex].reps;
      const weightToUse = currentExercise.sets[setIndex].weight || 0;
      
      const newActualReps = [...(workoutState.workoutData.actualReps[exerciseId] || [])];
      newActualReps[setIndex] = repsToUse;
      
      const newActualWeights = [...(workoutState.workoutData.actualWeights[exerciseId] || [])];
      newActualWeights[setIndex] = weightToUse;
      
      workoutState.updateActualReps(exerciseId, newActualReps);
      workoutState.updateActualWeights(exerciseId, newActualWeights);
      workoutState.updateCompletedSets(exerciseId, (workoutState.workoutData.completedSets[exerciseId] || 0) + 1);
    } else {
      // Mark as incomplete
      const newActualReps = [...(workoutState.workoutData.actualReps[exerciseId] || [])];
      newActualReps[setIndex] = 0;
      
      const newActualWeights = [...(workoutState.workoutData.actualWeights[exerciseId] || [])];
      newActualWeights[setIndex] = 0;
      
      workoutState.updateActualReps(exerciseId, newActualReps);
      workoutState.updateActualWeights(exerciseId, newActualWeights);
      workoutState.updateCompletedSets(exerciseId, Math.max(0, (workoutState.workoutData.completedSets[exerciseId] || 0) - 1));
    }
  }, [currentExercise, routine, workoutState]);

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

  // Show timer fullscreen
  if (showTimer) {
    return (
      <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
        <Timer
          duration={timerDuration}
          title={timerTitle}
          nextExerciseName={nextExerciseName}
          onComplete={handleTimerComplete}
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
        />

        {/* Set controls */}
        <SetControls
          currentSet={workoutState.currentSet}
          totalSets={currentExercise.sets.length}
          onSetChange={workoutState.setCurrentSet}
        />

        {/* Series table */}
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
        />

        {/* Exercise list */}
        <ExerciseList
          routine={routine}
          currentExerciseIndex={workoutState.currentExerciseIndex}
          completedSets={workoutState.workoutData.completedSets}
          onSelectExercise={handleSelectExercise}
          onMoveExercise={handleMoveExercise}
        />

        {/* Action buttons */}
        <div className="flex gap-2 mb-6">
          <Button
            variant="primary"
            onClick={handleStartSet}
            className="flex-1 py-3 text-base font-semibold"
          >
            ▶️ Iniciar Serie
          </Button>
          <Button
            variant="ghost"
            onClick={handleCancelWorkout}
            className="flex-1"
          >
            ✕ Cancelar
          </Button>
        </div>

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
      </div>
    </ProtectedRoute>
  );
}
