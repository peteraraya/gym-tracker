'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGym } from '@/context/GymContext';
import { useWorkout } from '@/context/WorkoutContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Timer } from '@/components/Timer';
import { SetTimer } from '@/components/SetTimer';
import { WorkoutGlobalTimer } from '@/components/WorkoutGlobalTimer';
import { PreparationCountdown } from '@/components/PreparationCountdown';
import SetTypeSelector, { SetTypeBadge } from '@/components/SetTypeSelector';
import { WeightSelector } from '@/components/WeightSelector';
import { Input } from '@/components/ui/Input';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  calculateRestBetweenSets, 
  calculateRestBetweenExercises,
  formatRestTime 
} from '@/lib/restCalculator';
import { EXERCISE_DATABASE } from '@/data/exercises';
import * as storageService from '@/lib/storage/storage';
import { generateWorkoutSuggestions, generateLiveSuggestions, type WorkoutSuggestion } from '@/lib/workoutSuggestions';

export default function WorkoutPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const { getRoutineById, addSession, sessions, loading: gymLoading } = useGym();
  const { activeWorkout, startWorkout, updateWorkoutProgress, clearRestState, finishWorkout: finishWorkoutContext, cancelWorkout } = useWorkout();
  const { success, error } = useToast();
  const { confirm } = useConfirm();
  
  const [routine, setRoutine] = useState(getRoutineById(id));
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [showTimer, setShowTimer] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);
  const [timerTitle, setTimerTitle] = useState('');
  const [nextExerciseName, setNextExerciseName] = useState<string | undefined>(undefined);
  const [completedSets, setCompletedSets] = useState<{[key: string]: number}>({});
  const [actualReps, setActualReps] = useState<{[key: string]: number[]}>({});
  const [actualWeights, setActualWeights] = useState<{[key: string]: number[]}>({});
  const [setTypes, setSetTypes] = useState<{[key: string]: import('@/types').SetType[]}>({});
  const [lastWeights, setLastWeights] = useState<{[key: string]: number[]}>({});
  const [restOverrides, setRestOverrides] = useState<{[key: string]: number}>({}); // Descanso global del ejercicio
  const [perSetRestOverrides, setPerSetRestOverrides] = useState<{[key: string]: number[]}>({});  // Descanso por serie individual
  const [actualSetDurations, setActualSetDurations] = useState<{[key: string]: number[]}>({});
  const [actualPauseDurations, setActualPauseDurations] = useState<{[key: string]: number[]}>({});
  const [actualRestTimes, setActualRestTimes] = useState<{[key: string]: number[]}>({});
  const [currentReps, setCurrentReps] = useState<number | ''>(0);
  const [currentWeight, setCurrentWeight] = useState<number | ''>(0);
  const [sessionNotes, setSessionNotes] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [proposedDuration, setProposedDuration] = useState<number>(0); // seconds
  const [workoutStartTime] = useState(Date.now());
  const [totalPausedTime, setTotalPausedTime] = useState(0);
  const [useSmartRest, setUseSmartRest] = useState(true); // Descanso inteligente activado por defecto
  const [suggestions, setSuggestions] = useState<WorkoutSuggestion[]>([]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<number>>(new Set());
  
  // Nuevos estados para UX mejorada
  const [showPreparation, setShowPreparation] = useState(false);
  const [isExecutingSet, setIsExecutingSet] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Estados para drag and drop
  const [draggedExerciseIndex, setDraggedExerciseIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  // Ref para sincronización de actualWeights
  const prevActualWeightsRef = React.useRef(actualWeights);

  // Inicialización del workout - solo se ejecuta una vez al montar
  useEffect(() => {
    // No hacer nada si GymContext aún está cargando
    if (gymLoading) {
      return;
    }
    
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
        setCurrentExerciseIndex(Number(s.currentExerciseIndex ?? 0));
        setCurrentSet(Number(s.currentSet ?? 1));
        setCompletedSets((s.completedSets && typeof s.completedSets === 'object') ? s.completedSets as { [key: string]: number } : {});
        setActualReps((s.actualReps && typeof s.actualReps === 'object') ? s.actualReps as { [key: string]: number[] } : {});
        setActualWeights((s.actualWeights && typeof s.actualWeights === 'object') ? s.actualWeights as { [key: string]: number[] } : {});
        
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
        
        // Cargar últimos pesos guardados para los ejercicios
        try {
          const parsed = await storageService.getLastWeights();
          if (parsed && mounted) setLastWeights(parsed as any);
        } catch (e) {
          // ignore
        }
        
        const currentExercise = foundRoutine.exercises[Number(s.currentExerciseIndex ?? 0)];
        if (currentExercise) {
          const currentSetData = currentExercise.sets[Number(s.currentSet ?? 1) - 1];
          if (currentSetData) {
            setCurrentReps(currentSetData.reps);
            setCurrentWeight(currentSetData.weight || 0);
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
            setCurrentReps(firstSet.reps);
            // Preferir último peso utilizado si existe
            try {
              const parsed = await storageService.getLastWeights();
              if (mounted) {
                const last = parsed[firstExercise.id] && parsed[firstExercise.id][0];
                setCurrentWeight(typeof last === 'number' ? last : (firstSet.weight || 0));
              }
            } catch (e) {
              if (mounted) {
                setCurrentWeight(firstSet.weight || 0);
              }
            }
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

  // Calcular ejercicio actual usando useMemo para evitar problemas de inicialización
  const currentExercise = React.useMemo(() => {
    if (!routine || !routine.exercises || routine.exercises.length === 0) return null;
    return routine.exercises[currentExerciseIndex] || null;
  }, [routine, currentExerciseIndex]);

  // Obtener la última sesión donde se hizo el ejercicio actual
  const lastSessionForExercise = React.useMemo(() => {
    if (!currentExercise || sessions.length === 0) return null;
    
    // Buscar la sesión más reciente que contenga este ejercicio
    const relevantSessions = sessions
      .filter(s => s.exercises.some(e => e.exerciseName === currentExercise.name))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return relevantSessions[0] || null;
  }, [currentExercise, sessions]);

  // Mostrar comparación con última sesión como toast
  useEffect(() => {
    if (!lastSessionForExercise || !currentExercise || typeof currentWeight !== 'number' || typeof currentReps !== 'number') return;
    
    // Buscar el ejercicio en la última sesión
    const lastExerciseData = lastSessionForExercise.exercises.find(e => e.exerciseName === currentExercise.name);
    if (!lastExerciseData) return;
    
    // Comparar con la serie actual
    const setIndex = currentSet - 1;
    const lastWeight = lastExerciseData.actualWeight?.[setIndex];
    const lastReps = lastExerciseData.actualReps?.[setIndex];
    
    if (typeof lastWeight === 'number' && typeof lastReps === 'number') {
      const weightDiff = currentWeight - lastWeight;
      const repsDiff = currentReps - lastReps;
      
      if (weightDiff > 0 || repsDiff > 0) {
        let message = '📈 ';
        if (weightDiff > 0) message += `+${weightDiff}kg `;
        if (repsDiff > 0) message += `+${repsDiff} reps `;
        message += 'vs última sesión';
        success(message, 4000);
      } else if (weightDiff < 0 || repsDiff < 0) {
        let message = '📉 ';
        if (weightDiff < 0) message += `${weightDiff}kg `;
        if (repsDiff < 0) message += `${repsDiff} reps `;
        message += 'vs última sesión';
        error(message, 4000);
      }
    }
  }, [currentExerciseIndex, currentSet, lastSessionForExercise, currentExercise, currentWeight, currentReps, success, error]);

  // Detectar cuando todas las series están completadas y avanzar automáticamente
  useEffect(() => {
    if (!currentExercise || !routine) return;
    
    const exerciseId = currentExercise.id;
    const totalSets = currentExercise.sets.length;
    const completedCount = completedSets[exerciseId] || 0;
    const isLastExercise = currentExerciseIndex >= routine.exercises.length - 1;
    
    console.log('[Auto-advance Check]', {
      exerciseId,
      exerciseName: currentExercise.name,
      totalSets,
      completedCount,
      actualReps: actualReps[exerciseId],
      showTimer,
      isExecutingSet,
      showPreparation
    });
    
    // Si todas las series están completadas
    if (completedCount === totalSets && completedCount > 0) {
      // Verificar que realmente todas las series tienen datos
      const allSetsHaveData = currentExercise.sets.every((_, idx) => {
        const hasReps = actualReps[exerciseId] && typeof actualReps[exerciseId][idx] === 'number' && actualReps[exerciseId][idx] > 0;
        return hasReps;
      });
      
      console.log('[Auto-advance] Todas las series marcadas como completadas. allSetsHaveData:', allSetsHaveData);
      
      // Solo avanzar automáticamente si:
      // 1. Todas las series tienen datos
      // 2. No hay timer activo
      // 3. No está ejecutando una serie
      // 4. No está en preparación
      
      // Verificar si está editando un ejercicio anterior
      // Estás editando un ejercicio anterior SOLO si el ejercicio actual NO es el último ejercicio completado
      // Es decir, si hay ejercicios posteriores que ya tienen series completadas
      let isEditingPreviousExercise = false;
      
      // Buscar el índice del último ejercicio que tiene al menos una serie completada
      let lastCompletedExerciseIndex = -1;
      for (let i = routine.exercises.length - 1; i >= 0; i--) {
        const ex = routine.exercises[i];
        const exCompletedSets = completedSets[ex.id] || 0;
        if (exCompletedSets > 0) {
          lastCompletedExerciseIndex = i;
          break;
        }
      }
      
      // Si el ejercicio actual NO es el último con series completadas, estás editando uno anterior
      if (lastCompletedExerciseIndex > currentExerciseIndex) {
        isEditingPreviousExercise = true;
      }
      
      console.log('[Auto-advance] Verificación de edición:', {
        currentExerciseIndex,
        lastCompletedExerciseIndex,
        isEditingPreviousExercise
      });
      
      if (allSetsHaveData && !showTimer && !isExecutingSet && !showPreparation && !isEditingPreviousExercise) {
        console.log('[Auto-advance] ✅ Todas las condiciones cumplidas, avanzando...');
        // Todas las series completadas, avanzar al siguiente ejercicio o finalizar
        if (isLastExercise) {
          // Último ejercicio, mostrar modal de finalización
          console.log('[Auto-advance] Último ejercicio, mostrando modal de finalización');
          const duration = Math.floor((Date.now() - workoutStartTime) / 1000);
          setProposedDuration(Math.max(duration, 60));
          setShowNotesModal(true);
        } else {
          // Pasar al siguiente ejercicio con descanso
          const nextExercise = routine.exercises[currentExerciseIndex + 1];
          console.log('[Auto-advance] Pasando al siguiente ejercicio:', nextExercise.name);
          const nextExerciseTemplate = EXERCISE_DATABASE.find(e => e.name === nextExercise.name);
          const currentExerciseTemplate = EXERCISE_DATABASE.find(e => e.name === currentExercise.name);
          
          let restTime = restOverrides[currentExercise.id] || routine.restBetweenExercises || 120;
          
          if (useSmartRest && currentExerciseTemplate && nextExerciseTemplate) {
            const restRecommendation = calculateRestBetweenExercises(
              currentExerciseTemplate,
              nextExerciseTemplate,
              'intermediate'
            );
            restTime = restRecommendation.recommended;
          }
          
          console.log('[Auto-advance] Iniciando timer de descanso:', restTime, 'segundos');
          setShowTimer(true);
          setTimerDuration(restTime);
          setTimerTitle('Descanso entre ejercicios');
          setNextExerciseName(nextExercise.name);
          
          updateWorkoutProgress(
            currentExerciseIndex,
            currentSet,
            completedSets,
            actualReps,
            actualWeights,
            { isResting: true, restTimerDuration: restTime, restTimerTitle: 'Descanso entre ejercicios', restTimerNextExercise: nextExercise.name, restTimerStartedAt: Date.now() }
          );
        }
      } else {
        console.log('[Auto-advance] ❌ Condiciones no cumplidas:', {
          allSetsHaveData,
          showTimer,
          isExecutingSet,
          showPreparation,
          isEditingPreviousExercise
        });
      }
    }
  }, [completedSets, actualReps, currentExercise, routine, currentExerciseIndex, showTimer, isExecutingSet, showPreparation, workoutStartTime, restOverrides, useSmartRest, actualWeights, currentSet, updateWorkoutProgress]);

  // Resetear sugerencias descartadas cuando cambia el ejercicio
  useEffect(() => {
    setDismissedSuggestions(new Set());
  }, [currentExerciseIndex]);

  // Generar sugerencias cuando cambie el ejercicio, peso o descanso
  useEffect(() => {
    if (!routine || !currentExercise) return;
    // No mostrar durante el timer, preparación o ejecución de serie
    if (showTimer || showPreparation || isExecutingSet) return;

    const currentRestTime = restOverrides[currentExercise.id] ?? 
                           currentExercise.restBetweenSets ?? 
                           routine.restBetweenSets ?? 
                           60;

    // Sugerencias generales
    const generalSuggestions = generateWorkoutSuggestions(
      sessions,
      currentExercise.name,
      typeof currentWeight === 'number' ? currentWeight : undefined,
      currentRestTime
    );

    // Sugerencias en vivo para el ejercicio actual
    const liveSuggestions = generateLiveSuggestions(
      currentExercise.name,
      currentSet,
      currentExercise.sets.length,
      typeof currentWeight === 'number' ? currentWeight : 0,
      sessions
    );

    const allSuggestions = [...generalSuggestions, ...liveSuggestions];
    
    // Mostrar sugerencias como toasts (solo las más importantes) - SOLO UNA VEZ
    if (allSuggestions.length > 0) {
      // Mostrar solo la primera sugerencia de advertencia como toast
      const warningSuggestion = allSuggestions.find(s => s.type === 'rest_warning' || s.type === 'overtraining');
      if (warningSuggestion && !dismissedSuggestions.has(0)) {
        error(`⚠️ ${warningSuggestion.message}`, 5000);
        setDismissedSuggestions(prev => new Set([...prev, 0]));
      } else if (!dismissedSuggestions.has(0)) {
        // Si no hay advertencias, mostrar la primera sugerencia positiva
        const positiveSuggestion = allSuggestions[0];
        if (positiveSuggestion) {
          success(`💡 ${positiveSuggestion.message}`, 4000);
          setDismissedSuggestions(prev => new Set([...prev, 0]));
        }
      }
    }
    
    setSuggestions(allSuggestions);
  }, [currentExerciseIndex, currentSet, currentExercise, routine, sessions, restOverrides, success, error, showTimer, showPreparation, isExecutingSet, dismissedSuggestions, currentWeight]);

  // Ocultar navbar cuando se muestra el timer
  useEffect(() => {
    if (showTimer) {
      // Agregar clase al body para ocultar navbar
      document.body.classList.add('hide-navbar');
    } else {
      document.body.classList.remove('hide-navbar');
    }

    // Cleanup al desmontar
    return () => {
      document.body.classList.remove('hide-navbar');
    };
  }, [showTimer]);

  // Sincronizar cambios de actualWeights con el contexto
  useEffect(() => {
    // Solo actualizar si realmente cambió
    if (prevActualWeightsRef.current !== actualWeights && Object.keys(actualWeights).length > 0) {
      updateWorkoutProgress(
        currentExerciseIndex,
        currentSet,
        completedSets,
        actualReps,
        actualWeights
      );
      prevActualWeightsRef.current = actualWeights;
    }
  }, [actualWeights, currentExerciseIndex, currentSet, completedSets, actualReps, updateWorkoutProgress]);


  // Mostrar loading mientras GymContext carga o mientras se inicializa
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

  const isLastSet = currentSet >= currentExercise.sets.length;
  const isLastExercise = currentExerciseIndex >= routine.exercises.length - 1;

  const handleStartSet = () => {
    setShowPreparation(true);
  };

  const handlePreparationComplete = () => {
    setShowPreparation(false);
    setIsExecutingSet(true);
  };

  const handleCompleteSet = () => {
    setIsExecutingSet(false);
    
    const exerciseId = currentExercise.id;
    
    // Obtener valores actuales de la serie
    const setIndex = currentSet - 1;
    const repsValue: number = (actualReps[exerciseId] && actualReps[exerciseId][setIndex]) 
      ? actualReps[exerciseId][setIndex]
      : (typeof currentReps === 'number' ? currentReps : currentExercise.sets[setIndex]?.reps || 0);
    
    const weightValue: number = (actualWeights[exerciseId] && actualWeights[exerciseId][setIndex])
      ? actualWeights[exerciseId][setIndex]
      : (typeof currentWeight === 'number' ? currentWeight : currentExercise.sets[setIndex]?.weight || 0);

    // Actualizar arrays con los valores de esta serie
    const newActualReps = {
      ...actualReps,
      [exerciseId]: [...(actualReps[exerciseId] || []).slice(0, setIndex), repsValue, ...(actualReps[exerciseId] || []).slice(setIndex + 1)]
    };
    
    const newActualWeights = {
      ...actualWeights,
      [exerciseId]: [...(actualWeights[exerciseId] || []).slice(0, setIndex), weightValue, ...(actualWeights[exerciseId] || []).slice(setIndex + 1)]
    };

    const newCompletedSets = {
      ...completedSets,
      [exerciseId]: (completedSets[exerciseId] || 0) + 1
    };

    setActualReps(newActualReps);
    setActualWeights(newActualWeights);
    
    // Persistir último peso para esta serie
    try {
      const parsed = { ...(lastWeights || {}) };
      parsed[exerciseId] = parsed[exerciseId] || [];
      parsed[exerciseId][setIndex] = weightValue;
      setLastWeights(parsed);
      storageService.saveLastWeights(parsed).catch(() => {});
    } catch (e) {
      // ignore
    }
    
    setCompletedSets(newCompletedSets);

    // Actualizar el contexto global
    updateWorkoutProgress(
      currentExerciseIndex,
      currentSet,
      newCompletedSets,
      newActualReps,
      newActualWeights
    );

    if (isLastSet) {
      if (isLastExercise) {
        // Mostrar modal para notas antes de finalizar
        const duration = Math.floor((Date.now() - workoutStartTime) / 1000);
        setProposedDuration(Math.max(duration, 60));
        setShowNotesModal(true);
      } else {
        // Pasar al siguiente ejercicio
        const nextExercise = routine.exercises[currentExerciseIndex + 1];
        const nextExerciseTemplate = EXERCISE_DATABASE.find(e => e.name === nextExercise.name);
        const currentExerciseTemplate = EXERCISE_DATABASE.find(e => e.name === currentExercise.name);
        
        let restTime = restOverrides[currentExercise.id] || routine.restBetweenExercises || 120;
        
        if (useSmartRest && currentExerciseTemplate && nextExerciseTemplate) {
          const restRecommendation = calculateRestBetweenExercises(
            currentExerciseTemplate,
            nextExerciseTemplate,
            'intermediate'
          );
          restTime = restRecommendation.recommended;
        }
        
        setShowTimer(true);
        setTimerDuration(restTime);
        setTimerTitle('Descanso entre ejercicios');
        setNextExerciseName(nextExercise.name);
        
        updateWorkoutProgress(
          currentExerciseIndex,
          currentSet,
          newCompletedSets,
          newActualReps,
          newActualWeights,
          { isResting: true, restTimerDuration: restTime, restTimerTitle: 'Descanso entre ejercicios', restTimerNextExercise: nextExercise.name, restTimerStartedAt: Date.now() }
        );
      }
    } else {
      // Descanso entre series
      let restTime: number;
      const setIndex = currentSet - 1; // Índice de la serie actual (0-based)
      
      // Prioridad: 1) Override individual de la serie, 2) Override del ejercicio, 3) Configurado en ejercicio, 4) Configurado en rutina, 5) Inteligente, 6) Default 60
      if (perSetRestOverrides[currentExercise.id] && perSetRestOverrides[currentExercise.id][setIndex]) {
        restTime = perSetRestOverrides[currentExercise.id][setIndex];
      } else if (restOverrides[currentExercise.id] && restOverrides[currentExercise.id] > 0) {
        restTime = restOverrides[currentExercise.id];
      } else if (currentExercise.restBetweenSets && currentExercise.restBetweenSets > 0) {
        restTime = currentExercise.restBetweenSets;
      } else if (routine.restBetweenSets && routine.restBetweenSets > 0) {
        restTime = routine.restBetweenSets;
      } else if (useSmartRest) {
        const exerciseTemplate = EXERCISE_DATABASE.find(e => e.name === currentExercise.name);
        if (exerciseTemplate) {
          const currentSetData = currentExercise.sets[currentSet - 1];
          const restRecommendation = calculateRestBetweenSets(
            exerciseTemplate,
            currentExercise.sets.length,
            currentSetData?.reps || 10,
            'intermediate'
          );
          restTime = restRecommendation.recommended;
        } else {
          restTime = 60;
        }
      } else {
        restTime = 60;
      }
      
      const timerTitleText = `Descanso - Serie ${currentSet + 1}/${currentExercise.sets.length}`;
      
      setShowTimer(true);
      setTimerDuration(restTime);
      setTimerTitle(timerTitleText);
      setNextExerciseName(undefined);
      
      updateWorkoutProgress(
        currentExerciseIndex,
        currentSet,
        newCompletedSets,
        newActualReps,
        newActualWeights,
        { isResting: true, restTimerDuration: restTime, restTimerTitle: timerTitleText, restTimerStartedAt: Date.now() }
      );
    }
  };

  // Helpers para gestionar pesos recientes en localStorage
  const saveLastWeight = (exerciseId: string, setIndex: number, weight: number) => {
    try {
      const copy = { ...(lastWeights || {}) };
      copy[exerciseId] = copy[exerciseId] || [];
      copy[exerciseId][setIndex] = weight;
      setLastWeights(copy);
      try {
        storageService.saveLastWeights(copy).catch(() => {});
      } catch (e) {}
    } catch (e) {
      console.warn('Failed to save last weight', e);
    }
  };

  const handleEditWeight = (exerciseId: string, setIndex: number, value: number) => {
    // actualizar actualWeights en memoria
    setActualWeights(prev => {
      const copy = { ...prev };
      copy[exerciseId] = copy[exerciseId] ? [...copy[exerciseId]] : [];
      copy[exerciseId][setIndex] = value;
      return copy;
    });
    // guardar como último peso
    saveLastWeight(exerciseId, setIndex, value);
    // Si estamos editando la serie actual, actualizar el input principal
    if (exerciseId === currentExercise.id && setIndex === currentSet - 1) {
      setCurrentWeight(value);
    }
  };

  const handleEditSetType = (exerciseId: string, setIndex: number, type: import('@/types').SetType) => {
    setSetTypes(prev => {
      const copy = { ...prev };
      copy[exerciseId] = copy[exerciseId] ? [...copy[exerciseId]] : [];
      copy[exerciseId][setIndex] = type;
      return copy;
    });
  };

  const handleEditRestOverride = (exerciseId: string, value: number) => {
    setRestOverrides(prev => {
      const copy = { ...prev, [exerciseId]: value };
      return copy;
    });
  };

  const handleEditSetRestOverride = (exerciseId: string, setIndex: number, value: number) => {
    setPerSetRestOverrides(prev => {
      const copy = { ...prev };
      copy[exerciseId] = copy[exerciseId] || [];
      copy[exerciseId][setIndex] = value;
      return copy;
    });
  };

  const handleMoveExercise = (fromIndex: number, toIndex: number) => {
    if (!routine || fromIndex === toIndex) return;
    
    const newExercises = [...routine.exercises];
    const [movedExercise] = newExercises.splice(fromIndex, 1);
    newExercises.splice(toIndex, 0, movedExercise);
    
    // Actualizar la rutina con el nuevo orden
    const updatedRoutine = { ...routine, exercises: newExercises };
    setRoutine(updatedRoutine);
    
    // Ajustar el índice del ejercicio actual si es necesario
    if (currentExerciseIndex === fromIndex) {
      setCurrentExerciseIndex(toIndex);
    } else if (fromIndex < currentExerciseIndex && toIndex >= currentExerciseIndex) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    } else if (fromIndex > currentExerciseIndex && toIndex <= currentExerciseIndex) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
    
    success('Orden de ejercicios actualizado', 2000);
  };

  const handleActualRestDuration = (actualDuration: number) => {
    const exerciseId = currentExercise.id;
    
    // Guardar el tiempo real de descanso para esta serie
    const newActualRestTimes = {
      ...actualRestTimes,
      [exerciseId]: [...(actualRestTimes[exerciseId] || []), actualDuration]
    };
    
    setActualRestTimes(newActualRestTimes);
  };

  const handleTimerComplete = () => {
    console.log('[handleTimerComplete] Iniciando - showTimer:', showTimer);
    setShowTimer(false);
    clearRestState(); // Limpiar estado de descanso persistido
    
    // Calcular si es la última serie y el último ejercicio
    const isLastSet = currentSet >= currentExercise.sets.length;
    const isLastExercise = currentExerciseIndex >= routine.exercises.length - 1;
    
    console.log('[handleTimerComplete] isLastSet:', isLastSet, 'isLastExercise:', isLastExercise);
    
    if (isLastSet && !isLastExercise) {
      // Siguiente ejercicio
      const nextIndex = currentExerciseIndex + 1;
      if (routine.exercises[nextIndex]) {
        console.log('[handleTimerComplete] Avanzando al siguiente ejercicio:', nextIndex);
        setCurrentExerciseIndex(nextIndex);
        setCurrentSet(1);
        const nextExercise = routine.exercises[nextIndex];
        const firstSet = nextExercise.sets[0];
        if (firstSet) {
          setCurrentReps(firstSet.reps);
          setCurrentWeight(firstSet.weight || 0);
        }
        
        // Actualizar contexto
        updateWorkoutProgress(
          nextIndex,
          1,
          completedSets,
          actualReps,
          actualWeights
        );
      }
    } else if (!isLastSet) {
      // Siguiente serie
      const newSet = currentSet + 1;
      console.log('[handleTimerComplete] Avanzando a la siguiente serie:', newSet);
      setCurrentSet(newSet);
      
      // Actualizar valores con los de la siguiente serie
      const nextSetData = currentExercise.sets[newSet - 1];
      if (nextSetData) {
        setCurrentReps(nextSetData.reps);
        setCurrentWeight(nextSetData.weight || 0);
      }
      
      // Actualizar contexto
      updateWorkoutProgress(
        currentExerciseIndex,
        newSet,
        completedSets,
        actualReps,
        actualWeights
      );
    }
    
    console.log('[handleTimerComplete] Completado - showTimer debería ser false');
  };

  const finishCompleteWorkout = async () => {
    // Prevenir guardados duplicados
    if (showNotesModal === false) {
      console.warn('[finishCompleteWorkout] Already processing, ignoring duplicate call');
      return;
    }

    // Usar la duración confirmada por el usuario si existe, sino calcular
    const totalDuration = proposedDuration && proposedDuration > 0
      ? proposedDuration
      : Math.floor((Date.now() - workoutStartTime) / 1000);

    // Guardar sesión
    const sessionExercises = routine.exercises.map(ex => ({
      exerciseId: ex.id,
      exerciseName: ex.name, // Guardar el nombre para facilitar búsquedas
      completedSets: completedSets[ex.id] || 0,
      actualReps: actualReps[ex.id] || [],
      // Preferir los pesos registrados en la sesión; si no hay, usar los últimos pesos guardados
      actualWeight: (actualWeights[ex.id] && actualWeights[ex.id].length) ? actualWeights[ex.id] : (lastWeights[ex.id] || []),
      setDurations: actualSetDurations[ex.id] || [],
      pauseDurations: actualPauseDurations[ex.id] || [],
      actualRestTimes: actualRestTimes[ex.id] || []
    }));

    try {
      await addSession({
        routineId: routine.id,
        date: new Date(),
        exercises: sessionExercises,
        notes: sessionNotes.trim() || '',
        totalDuration,
        totalPausedTime
      });
      
      // Limpiar el contexto de workout activo
      finishWorkoutContext();
      
      success('Sesión guardada exitosamente');
      
      // Pequeña espera para asegurar que el estado se propague
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Usar replace en lugar de push para prevenir volver atrás
      router.replace('/sessions');
      router.refresh();
    } catch (err) {
      console.error('Error saving session:', err);
      error('Error al guardar la sesión. Por favor, intenta nuevamente.');
    }
  };

  const handleCancelWorkout = async () => {
    const confirmed = await confirm({
      title: 'Cancelar entrenamiento',
      message: '¿Estás seguro de que quieres cancelar el entrenamiento? Se perderá todo el progreso.',
      confirmText: 'Sí, cancelar',
      cancelText: 'Continuar entrenamiento',
      variant: 'danger'
    });
    
    if (confirmed) {
      try {
        localStorage.setItem('gym-tracker-cancelled', Date.now().toString());
      } catch (e) {}

      // Remove any modal/backdrop elements that might have been left behind
      try {
        document.querySelectorAll('.modal-backdrop, .modal-overlay, [data-backdrop]').forEach(el => el.remove());
      } catch (e) {}

      cancelWorkout();
      // Use replace so user doesn't return to the canceled workout via back
      router.replace('/routines');
    }
  };

  const handleFinishNow = () => {
    const duration = Math.floor((Date.now() - workoutStartTime) / 1000);
    setProposedDuration(Math.max(duration, 60));
    setShowNotesModal(true);
  };

  if (showTimer) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Timer
              duration={timerDuration}
              onComplete={handleTimerComplete}
              autoStart={true}
              title={timerTitle}
              nextExerciseName={nextExerciseName}
              showMotivation={true}
              onActualDurationChange={handleActualRestDuration}
            />
            {/* Información adicional */}
            <div className="mt-6 text-center space-y-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>⏱️ Tiempo configurado: {Math.floor(timerDuration / 60)}:{(timerDuration % 60).toString().padStart(2, '0')}</p>
                <p>💡 Tip: Aprovecha este tiempo para hidratarte y respirar profundo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header con Timer Global */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {routine.name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>Ejercicio {currentExerciseIndex + 1}/{routine.exercises.length}</span>
              <span>•</span>
              <span>Serie {currentSet}/{currentExercise.sets.length}</span>
            </div>
          </div>
          <WorkoutGlobalTimer startTime={workoutStartTime} />
        </div>

        {/* Progreso */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{
                width: `${((currentExerciseIndex * currentExercise.sets.length + currentSet - 1) / 
                  (routine.exercises.reduce((acc, ex) => acc + ex.sets.length, 0))) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Ejercicio actual */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{currentExercise.name}</CardTitle>
            {currentExercise.notes && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {currentExercise.notes}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Countdown de Preparación */}
              {showPreparation && (
                <PreparationCountdown
                  duration={3}
                  onComplete={handlePreparationComplete}
                  exerciseName={currentExercise.name}
                  setNumber={currentSet}
                />
              )}

              {/* Botón para iniciar serie */}
              {!isExecutingSet && !showPreparation && (
                <Button
                  onClick={handleStartSet}
                  className="w-full py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  ▶️ Iniciar Serie {currentSet}
                </Button>
              )}

              {/* Botón grande para completar serie */}
              {isExecutingSet && (
                <div className="space-y-4">
                  <div className="text-center py-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                    <p className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      🏋️ Ejecuta tu serie
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Presiona el botón cuando termines
                    </p>
                  </div>
                  
                  <Button
                    onClick={handleCompleteSet}
                    className="w-full py-6 text-xl font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all hover:scale-105"
                  >
                    <span className="text-2xl mr-2">✓</span>
                    Completar Serie
                  </Button>
                </div>
              )}

              {/* Información del ejercicio */}
              {!isExecutingSet && !showPreparation && (
                <>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {currentExercise.sets.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Series totales</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {currentExercise.sets[currentSet - 1]?.reps || 10}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Reps (Serie {currentSet})</div>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-3">
                {/* <Input
                  type="number"
                  label="Repeticiones realizadas"
                  value={currentReps}
                  onChange={(e) => setCurrentReps(e.target.value === '' ? '' : parseInt(e.target.value))}
                  min="0"
                />
                <Input
                  type="number"
                  label="Peso utilizado (kg)"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  min="0"
                  step="0.5"
                /> */}
                
                  {/* Lista de series - Diseño compacto con collapse */}
                  <div className="mt-3">
                    <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Series</h4>
                    <div className="space-y-2">
                      {currentExercise.sets.map((set, idx) => {
                        const exerciseId = currentExercise.id;
                        const doneReps = (actualReps[exerciseId] && actualReps[exerciseId][idx]) ?? null;
                        const doneWeight = (actualWeights[exerciseId] && actualWeights[exerciseId][idx]) ?? lastWeights[exerciseId]?.[idx] ?? set.weight ?? '';
                        const setType = (setTypes[exerciseId] && setTypes[exerciseId][idx]) || set.type || 'normal';
                        const isCompleted = typeof doneReps === 'number' && doneReps > 0;
                        
                        return (
                          <div key={`${exerciseId}-s-${idx}`} className={`rounded-lg border transition-all ${
                            isCompleted 
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600' 
                              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                          }`}>
                            {/* Header - siempre visible */}
                            <div className="p-2 flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1">
                                {/* Checkbox */}
                                <input
                                  type="checkbox"
                                  checked={isCompleted}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    if (checked) {
                                      const repsToUse = doneReps || set.reps;
                                      const weightToUse = typeof doneWeight === 'number' ? doneWeight : (set.weight || 0);
                                      
                                      setActualReps(prev => {
                                        const copy = { ...prev };
                                        copy[exerciseId] = copy[exerciseId] || [];
                                        copy[exerciseId][idx] = repsToUse;
                                        return copy;
                                      });
                                      
                                      setActualWeights(prev => {
                                        const copy = { ...prev };
                                        copy[exerciseId] = copy[exerciseId] || [];
                                        copy[exerciseId][idx] = weightToUse;
                                        return copy;
                                      });
                                      
                                      setCompletedSets(prev => {
                                        const newCount = (prev[exerciseId] || 0) + 1;
                                        if (idx + 1 === currentSet) {
                                          setCurrentSet(Math.min(currentSet + 1, currentExercise.sets.length));
                                        }
                                        return {
                                          ...prev,
                                          [exerciseId]: newCount
                                        };
                                      });
                                    } else {
                                      setActualReps(prev => {
                                        const copy = { ...prev };
                                        if (copy[exerciseId]) {
                                          copy[exerciseId][idx] = null as any;
                                        }
                                        return copy;
                                      });
                                      
                                      setActualWeights(prev => {
                                        const copy = { ...prev };
                                        if (copy[exerciseId]) {
                                          copy[exerciseId][idx] = null as any;
                                        }
                                        return copy;
                                      });
                                      
                                      setCompletedSets(prev => ({
                                        ...prev,
                                        [exerciseId]: Math.max(0, (prev[exerciseId] || 0) - 1)
                                      }));
                                    }
                                  }}
                                  className="w-5 h-5 rounded border-2 border-gray-400 dark:border-gray-500 text-green-600 focus:ring-2 focus:ring-green-500 cursor-pointer flex-shrink-0"
                                />
                                
                                {/* Info de la serie */}
                                <div className="flex items-center gap-2 flex-1">
                                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">#{idx + 1}</span>
                                  
                                  {isCompleted ? (
                                    // Vista colapsada - Resumen compacto
                                    <div className="flex items-center gap-2 text-sm">
                                      <span className="text-green-700 dark:text-green-300 font-semibold">
                                        ✓ {doneReps} × {typeof doneWeight === 'number' ? doneWeight : 0}kg
                                      </span>
                                      {setType && setType !== 'normal' && (
                                        <SetTypeBadge type={setType} />
                                      )}
                                    </div>
                                  ) : (
                                    // Vista expandida - Info básica
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                      {set.reps} reps • {set.weight || 0}kg
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Tipo de serie - solo visible cuando NO está completada */}
                              {!isCompleted && (
                                <SetTypeSelector
                                  value={setType}
                                  onChange={(type) => handleEditSetType(exerciseId, idx, type)}
                                  compact
                                />
                              )}
                            </div>

                            {/* Inputs - solo visible cuando NO está completada */}
                            {!isCompleted && (
                              <div className="px-2 pb-2">
                                <div className="grid grid-cols-3 gap-1.5">
                                  <div>
                                    <input
                                      type="number"
                                      className="w-full px-2 py-2 border rounded-md bg-white dark:bg-gray-700 text-sm font-medium text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      value={doneReps || ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        const num = val === '' ? 0 : parseInt(val);
                                        setActualReps(prev => {
                                          const copy = { ...prev };
                                          copy[exerciseId] = copy[exerciseId] || [];
                                          copy[exerciseId][idx] = isNaN(num) ? 0 : Math.max(0, num);
                                          return copy;
                                        });
                                      }}
                                      min="0"
                                      placeholder={set.reps.toString()}
                                      aria-label="Repeticiones"
                                    />
                                    <div className="text-[10px] text-center text-gray-500 dark:text-gray-400 mt-0.5">reps</div>
                                  </div>
                                  
                                  <div>
                                    <WeightSelector
                                      value={doneWeight === 0 ? '' : doneWeight}
                                      onChange={(weight) => handleEditWeight(currentExercise.id, idx, weight)}
                                      exerciseId={currentExercise.id}
                                      placeholder={(set.weight || 0).toString()}
                                    />
                                    <div className="text-[10px] text-center text-gray-500 dark:text-gray-400 mt-0.5">kg</div>
                                  </div>
                                  
                                  <div>
                                    <select
                                      className="w-full px-1 py-2 border rounded-md bg-white dark:bg-gray-700 text-xs font-medium text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                                      value={
                                        (perSetRestOverrides[exerciseId] && perSetRestOverrides[exerciseId][idx]) ?? 
                                        restOverrides[currentExercise.id] ?? 
                                        currentExercise.restBetweenSets ?? 
                                        routine.restBetweenSets ?? 
                                        60
                                      }
                                      onChange={(e) => {
                                        const v = parseInt(e.target.value || '0');
                                        handleEditSetRestOverride(currentExercise.id, idx, v);
                                      }}
                                      aria-label="Descanso"
                                    >
                                      {(() => {
                                        const currentValue = (perSetRestOverrides[exerciseId] && perSetRestOverrides[exerciseId][idx]) ?? 
                                                            restOverrides[currentExercise.id] ?? 
                                                            currentExercise.restBetweenSets ?? 
                                                            routine.restBetweenSets ?? 
                                                            60;
                                        const standardOptions = Array.from({ length: 60 }, (_, i) => (i + 1) * 5);
                                        
                                        const formatTime = (sec: number) => {
                                          if (sec < 60) return `${sec}s`;
                                          const mins = Math.floor(sec / 60);
                                          const secs = sec % 60;
                                          return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
                                        };
                                        
                                        if (!standardOptions.includes(currentValue)) {
                                          const allOptions = [...standardOptions, currentValue].sort((a, b) => a - b);
                                          return allOptions.map(sec => (
                                            <option key={sec} value={sec}>
                                              {formatTime(sec)}
                                            </option>
                                          ));
                                        }
                                        
                                        return standardOptions.map(sec => (
                                          <option key={sec} value={sec}>
                                            {formatTime(sec)}
                                          </option>
                                        ));
                                      })()}
                                    </select>
                                    <div className="text-[10px] text-center text-gray-500 dark:text-gray-400 mt-0.5">desc</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
              </div>
              
              {/* Información de descanso - Compacta */}
              <div className="mt-3 space-y-2">
                {/* Descanso configurado - más compacto */}
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-blue-900 dark:text-blue-100">
                      ⏱️ Descanso base
                    </span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {(() => {
                        const restSecs = currentExercise.restBetweenSets || routine.restBetweenSets || 60;
                        return restSecs >= 60 ? `${Math.floor(restSecs / 60)}min` : `${restSecs}s`;
                      })()}
                    </span>
                  </div>
                </div>

                {/* Descanso inteligente - más compacto */}
                {(() => {
                  const exerciseTemplate = EXERCISE_DATABASE.find(e => e.name === currentExercise.name);
                  if (exerciseTemplate) {
                    const currentSetData = currentExercise.sets[currentSet - 1];
                    const restRecommendation = calculateRestBetweenSets(
                      exerciseTemplate,
                      currentExercise.sets.length,
                      currentSetData?.reps || 10,
                      'intermediate'
                    );
                    return (
                      <div className={`p-2 rounded-md border ${
                        useSmartRest 
                          ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' 
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      }`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs font-medium ${
                            useSmartRest 
                              ? 'text-purple-900 dark:text-purple-100' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            🧠 Inteligente
                          </span>
                          <button
                            type="button"
                            onClick={() => setUseSmartRest(!useSmartRest)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              useSmartRest ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                              useSmartRest ? 'translate-x-5' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                        {useSmartRest && (
                          <>
                            <div className="text-base font-bold text-purple-600 dark:text-purple-400 mb-1">
                              {formatRestTime(restRecommendation.recommended)}
                            </div>
                            <p className="text-xs text-purple-700 dark:text-purple-300 mb-1.5">
                              {restRecommendation.description}
                            </p>
                            
                            {/* Botón compacto para aplicar a todas */}
                            <button
                              type="button"
                              onClick={() => {
                                handleEditRestOverride(currentExercise.id, restRecommendation.recommended);
                              }}
                              className="w-full py-1.5 px-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-md transition-colors"
                            >
                              ⚡ Aplicar a todas
                            </button>
                          </>
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex gap-3 mb-6">
          <Button
            variant="ghost"
            onClick={handleCancelWorkout}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleFinishNow}
            className="flex-1"
          >
            Terminar sesión
          </Button>
        </div>

        {/* Lista compacta de todos los ejercicios */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ejercicios de la rutina</CardTitle>
            {routine.exercises.length > 1 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                💡 Arrastra los ejercicios para cambiar el orden
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {routine.exercises.map((exercise, idx) => {
                const isCurrentExercise = idx === currentExerciseIndex;
                const isCompleted = idx < currentExerciseIndex;
                const isNext = idx === currentExerciseIndex + 1;
                const exerciseCompletedSets = completedSets[exercise.id] || 0;
                const totalSets = exercise.sets.length;
                const allSetsCompleted = exerciseCompletedSets === totalSets;
                
                return (
                  <details
                    key={exercise.id}
                    open={isCurrentExercise}
                    draggable={true}
                    onDragStart={(e) => {
                      setDraggedExerciseIndex(idx);
                      e.currentTarget.style.opacity = '0.5';
                    }}
                    onDragEnd={(e) => {
                      setDraggedExerciseIndex(null);
                      setDragOverIndex(null);
                      e.currentTarget.style.opacity = '1';
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverIndex(idx);
                    }}
                    onDragLeave={() => {
                      setDragOverIndex(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedExerciseIndex !== null && draggedExerciseIndex !== idx) {
                        handleMoveExercise(draggedExerciseIndex, idx);
                      }
                      setDraggedExerciseIndex(null);
                      setDragOverIndex(null);
                    }}
                    className={`group rounded-lg border-2 transition-all ${
                      dragOverIndex === idx && draggedExerciseIndex !== idx
                        ? 'border-blue-500 scale-105 shadow-lg'
                        : isCurrentExercise
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : isCompleted && allSetsCompleted
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : isNext
                        ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                    } ${draggedExerciseIndex === idx ? 'cursor-grabbing' : 'cursor-grab'}`}
                  >
                    <summary className="cursor-pointer p-3 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Drag handle */}
                        <div className="flex-shrink-0 text-gray-400 dark:text-gray-500 cursor-grab active:cursor-grabbing">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <circle cx="4" cy="4" r="1.5" />
                            <circle cx="4" cy="8" r="1.5" />
                            <circle cx="4" cy="12" r="1.5" />
                            <circle cx="12" cy="4" r="1.5" />
                            <circle cx="12" cy="8" r="1.5" />
                            <circle cx="12" cy="12" r="1.5" />
                          </svg>
                        </div>
                        
                        {/* Indicador de estado */}
                        <div className="flex-shrink-0">
                          {isCurrentExercise ? (
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                              {idx + 1}
                            </div>
                          ) : isCompleted && allSetsCompleted ? (
                            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white">
                              ✓
                            </div>
                          ) : isNext ? (
                            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                              {idx + 1}
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-sm">
                              {idx + 1}
                            </div>
                          )}
                        </div>
                        
                        {/* Nombre y progreso */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`font-semibold truncate ${
                              isCurrentExercise
                                ? 'text-blue-900 dark:text-blue-100'
                                : isCompleted && allSetsCompleted
                                ? 'text-green-900 dark:text-green-100'
                                : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {exercise.name}
                            </p>
                            {isCurrentExercise && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded-full">
                                Actual
                              </span>
                            )}
                            {isCompleted && allSetsCompleted && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-green-600 text-white rounded-full">
                                Completado
                              </span>
                            )}
                            {isNext && !isCompleted && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-orange-500 text-white rounded-full">
                                Siguiente
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            {exerciseCompletedSets}/{totalSets} series
                          </p>
                        </div>
                        
                        {/* Icono de expandir/colapsar */}
                        <div className="flex-shrink-0 text-gray-400 group-open:rotate-180 transition-transform">
                          ▼
                        </div>
                      </div>
                    </summary>
                    
                    {/* Contenido expandido - Series del ejercicio */}
                    <div className="px-3 pb-3 pt-2 space-y-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                      {exercise.sets.map((set, setIdx) => {
                        const doneReps = (actualReps[exercise.id] && actualReps[exercise.id][setIdx]) ?? null;
                        const doneWeight = (actualWeights[exercise.id] && actualWeights[exercise.id][setIdx]) ?? set.weight ?? '';
                        const isSetCompleted = typeof doneReps === 'number' && doneReps > 0;
                        
                        return (
                          <div
                            key={`${exercise.id}-set-${setIdx}`}
                            className={`p-2 rounded-md text-sm ${
                              isSetCompleted
                                ? 'bg-green-100 dark:bg-green-900/30'
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                Serie {setIdx + 1}
                              </span>
                              {isSetCompleted ? (
                                <span className="text-green-700 dark:text-green-300 font-semibold">
                                  ✓ {doneReps} × {typeof doneWeight === 'number' ? doneWeight : 0}kg
                                </span>
                              ) : (
                                <span className="text-gray-600 dark:text-gray-400">
                                  {set.reps} × {set.weight || 0}kg (planeado)
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Botón para ir a este ejercicio (solo si no es el actual) */}
                      {!isCurrentExercise && isCompleted && (
                        <button
                          onClick={() => {
                            console.log('[Editar ejercicio] Cambiando a ejercicio:', idx);
                            // Cambiar al ejercicio seleccionado
                            setCurrentExerciseIndex(idx);
                            // Ir a la primera serie
                            setCurrentSet(1);
                            // Asegurar que no hay timer activo
                            setShowTimer(false);
                            // Asegurar que no está en modo de ejecución
                            setIsExecutingSet(false);
                            setShowPreparation(false);
                            // Scroll al inicio
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="w-full mt-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                        >
                          Editar este ejercicio
                        </button>
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de notas y duración al finalizar */}
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duración del entrenamiento</label>
            <select
              value={Math.floor(proposedDuration / 60)}
              onChange={(e) => setProposedDuration(Math.max(0, parseInt(e.target.value || '0')) * 60)}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700"
            >
              {/* minutes 1..59 */}
              {Array.from({ length: 59 }, (_, i) => i + 1).map(m => (
                <option key={`m-${m}`} value={m}>{m} min</option>
              ))}
              {/* hours 1..5 */}
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
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setSessionNotes('');
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
    </div>
    </ProtectedRoute>
  );
}
