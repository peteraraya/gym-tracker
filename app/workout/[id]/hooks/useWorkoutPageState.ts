import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { useGym } from "@/context/GymContext";
import { useWorkout } from "@/context/WorkoutContext";
import { useToast, useConfirm } from "@/context/NotificationContext";
import * as storageService from "@/lib/storage/storage";
import type { ActiveWorkout } from "@/lib/storage/storage";
import { useWorkoutState, type WorkoutData } from "./useWorkoutState";
import { useWorkoutTimer } from "./useWorkoutTimer";
import { useWeightPrediction } from "./useWeightPrediction";
import { useSetExecution } from "./useSetExecution";
import { useWorkoutCompletion } from "./useWorkoutCompletion";
import { useWorkoutSuggestions } from "./useWorkoutSuggestions";
import { useWakeLock } from "./useWakeLock";
import { useHapticFeedback } from "./useHapticFeedback";
import { useAppLifecycle } from "@/hooks/useAppLifecycle";
import { useSoundSettingsModal } from "@/components/features/settings/SoundSettings";
import { EXERCISE_DATABASE } from "@/data/exercises";
import type { Routine, Exercise, Set, SetType, UserProfile } from "@/types";
import type { ExerciseTemplate } from "@/data/exercises";
import { getProfileLocally } from '@/lib/user/localProfile';
import { useEquipment } from '@/context/EquipmentContext';
import { generateRoutine } from '@/lib/routines/routineGenerator';
import {
  calculateNextRestTime,
  calculateExerciseRestTime,
  calculateSmartRestTime,
  applySmartRestToAllSets,
} from "../services/restCalculationService";
import { saveQueue } from '@/lib/utils/saveQueue';
import { updateRestNotification } from '@/lib/notifications/restNotification';
import logger from '@/lib/logger';
import { initializeWorkout } from "../services/workoutInitService";
import { WorkoutSession } from "../types/workout.types";
import { getExerciseRecommendations } from '@/lib/exercises/exerciseRecommendations';

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) & { cancel: () => void; flush: () => void } {
  let timeout: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;
  const executedFunction = function(...args: Parameters<T>) {
    lastArgs = args;
    const later = () => {
      timeout = null;
      lastArgs = null;
      func(...args);
    };
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
  executedFunction.cancel = function() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    lastArgs = null;
  };
  // Ejecuta inmediatamente la última llamada pendiente (si hay una) y
  // cancela el timeout, en vez de esperar los `wait` ms restantes.
  // Se usa al pausar/backgroundear la app para no perder la última
  // actualización que quedó atrapada dentro de la ventana del debounce.
  executedFunction.flush = function() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    if (lastArgs) {
      const args = lastArgs;
      lastArgs = null;
      func(...args);
    }
  };
  return executedFunction;
}

function countCompletedFlags(flags: boolean[] = [], totalSets = flags.length): number {
  return flags.slice(0, totalSets).filter(Boolean).length;
}

function getCompletionFlagsForExercise(params: {
  completedSetFlags?: Record<string, boolean[]>;
  completedSets?: Record<string, number>;
  exerciseId: string;
  totalSets: number;
}): boolean[] {
  const explicitFlags = params.completedSetFlags?.[params.exerciseId];
  if (Array.isArray(explicitFlags)) {
    return explicitFlags.slice(0, params.totalSets).map(Boolean);
  }
  const completedCount = Math.min(
    params.completedSets?.[params.exerciseId] ?? 0,
    params.totalSets,
  );
  return Array.from({ length: params.totalSets }, (_, idx) => idx < completedCount);
}

export function useWorkoutPageState(id: string) {
  const router = useRouter();
  const {
    getRoutineById,
    addSession,
    sessions,
    loading: gymLoading,
    updateRoutine,
  } = useGym();
  
  const {
    activeWorkout,
    startWorkout,
    updateWorkoutProgress,
    updateModifiedRoutine,
    clearRestState,
    finishWorkout: finishWorkoutContext,
    cancelWorkout,
  } = useWorkout();

  const { success, error } = useToast();
  const { confirm } = useConfirm();

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [originalRoutine, setOriginalRoutine] = useState<Routine | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showStartSplash, setShowStartSplash] = useState(false);
  
  const [isQuickEditMode, setIsQuickEditMode] = useState(true);
  const [skipRestTimers, setSkipRestTimers] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);

  const handleWorkoutDataChangeRef = useRef<(data: WorkoutData) => void>(() => {});
  const workoutState = useWorkoutState(routine || null, {
    onDataChange: (data) => handleWorkoutDataChangeRef.current(data),
  });

  const prepareRoutineForSave = useCallback(
    (r: Routine): Routine => {
      try {
        const actualWeightsMap = workoutState?.workoutData?.actualWeights || {};
        const exercises = (r.exercises || []).map((ex: Exercise) => {
          const exWeights = actualWeightsMap[ex.id] || [];
          const sets = (ex.sets || []).map((s: Set, idx: number) => {
            const aw = exWeights[idx];
            const mergedWeight = aw !== undefined && aw !== null ? aw : (s.weight ?? 0);
            return { ...s, weight: mergedWeight };
          });
          return { ...ex, sets } as Exercise;
        });
        return { ...r, exercises } as Routine;
      } catch (_e) {
        return r as Routine;
      }
    },
    [workoutState],
  );

  const [showExerciseInfo, setShowExerciseInfo] = useState(false);
  const [selectedExerciseName, setSelectedExerciseName] = useState<string>("");
  const [exerciseInfo, setExerciseInfo] = useState<ExerciseTemplate | null>(null);
  const [loadingExerciseInfo, setLoadingExerciseInfo] = useState(false);
  const [isSeriesTableExpanded, setIsSeriesTableExpanded] = useState(false);
  const useSmartRest = true;
  const [pendingToast, setPendingToast] = useState<{ message: string; duration: number; } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const equipment = useEquipment();
  const [suggestedRoutines, setSuggestedRoutines] = useState<Routine[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [preMinutesPerSession, setPreMinutesPerSession] = useState<number>(45);
  const [preRestBetweenSets, setPreRestBetweenSets] = useState<number>(60);
  const [preRestBetweenExercises, setPreRestBetweenExercises] = useState<number>(120);
  
  const [workoutStartTime, setWorkoutStartTime] = useState(() => {
    if (typeof window === "undefined") return Date.now();
    try {
      const stored = localStorage.getItem("gym-tracker-active-workout");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.startedAt) return new Date(parsed.startedAt).getTime();
      }
    } catch (e) {}
    return Date.now();
  });
  
  const [totalPausedTime, setTotalPausedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showEditTimeModal, setShowEditTimeModal] = useState(false);
  const [editingTime, setEditingTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [prInfo, setPrInfo] = useState<{ show: boolean; title: string; subtitle: string }>({ show: false, title: '', subtitle: '' });

  useEffect(() => {
    let mounted = true;
    if (showExerciseInfo && selectedExerciseName) {
      const local = EXERCISE_DATABASE.find(
        (e) => e.name === selectedExerciseName || e.id === selectedExerciseName,
      );
      if (local) {
        setTimeout(() => {
          setExerciseInfo(local);
          setLoadingExerciseInfo(false);
        }, 0);
        return;
      }
      setTimeout(() => setLoadingExerciseInfo(true), 0);
      (async () => {
        try {
          const mod = await import("@/data/exercises");
          const byName = await mod.getExerciseByName(selectedExerciseName);
          if (mounted && byName) {
            setExerciseInfo(byName);
            return;
          }
          const byId = await mod.getExerciseById(selectedExerciseName);
          if (mounted && byId) {
            setExerciseInfo(byId);
            return;
          }
        } catch (err) {} finally {
          if (mounted) setLoadingExerciseInfo(false);
        }
      })();
    } else {
      setTimeout(() => {
        if (mounted) {
          setExerciseInfo(null);
          setLoadingExerciseInfo(false);
        }
      }, 0);
    }
    return () => { mounted = false; };
  }, [showExerciseInfo, selectedExerciseName]);

  useEffect(() => {
    let mounted = true;
    async function loadSuggestions() {
      setIsGeneratingSuggestions(true);
      try {
        const profile = userProfile ?? getProfileLocally();
        const level = (profile?.fitnessLevel as any) || 'intermedio';
        const days = profile?.weeklyWorkouts ?? 3;
        const goals = profile?.fitnessGoal ? [profile.fitnessGoal] : ['general'];
        const eqSet = Array.from(equipment?.selectedEquipment || []);
        const mappedEquip: string[] = [];
        if (eqSet.some((e) => /barra|barbell/i.test(e))) mappedEquip.push('barbell');
        if (eqSet.some((e) => /mancuernas|dumbbell/i.test(e))) mappedEquip.push('dumbbells');
        if (eqSet.some((e) => /máquina|machine/i.test(e))) mappedEquip.push('machines');
        if (eqSet.some((e) => /polea|cable|cables/i.test(e))) mappedEquip.push('cables');

        const generated = await generateRoutine({
          name: profile?.fitnessGoal ? `${profile.fitnessGoal} - Sugerida` : 'Entrenamiento sugerido',
          daysPerWeek: days,
          minutesPerSession: preMinutesPerSession,
          level: level as any,
          equipment: mappedEquip,
          goal: goals,
          focusAreas: [],
        });

        if (!mounted) return;
        setSuggestedRoutines(generated || []);
        setSelectedSuggestionIndex(0);

        if (generated && generated[0]) {
          setPreRestBetweenSets(generated[0].restBetweenSets ?? 60);
          setPreRestBetweenExercises(generated[0].restBetweenExercises ?? 120);
        }
      } catch (err) {} finally {
        if (mounted) setIsGeneratingSuggestions(false);
      }
    }
    loadSuggestions();
    return () => { mounted = false; };
  }, [userProfile, equipment, preMinutesPerSession]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - workoutStartTime - totalPausedTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);
    return () => clearInterval(interval);
  }, [workoutStartTime, totalPausedTime, isPaused]);

  const exercises = useMemo(() => routine?.exercises || [], [routine?.exercises]);
  const currentExercise = useMemo(() => {
    if (!exercises.length) return null;
    return exercises[workoutState.currentExerciseIndex] || null;
  }, [exercises, workoutState.currentExerciseIndex]);

  const lastSessionForExercise = useMemo(() => {
    if (!currentExercise || sessions.length === 0) return null;
    const relevantSessions = sessions
      .filter((s) => s.exercises.some((e) => e.exerciseName === currentExercise.name))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return relevantSessions[0] || null;
  }, [currentExercise, sessions]);

  const lastSessionForRoutine = useMemo(() => {
    if (!sessions || sessions.length === 0 || !routine) return null;
    const routineSessions = sessions.filter(s => s.routineId === routine.id);
    routineSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return routineSessions[0] || null;
  }, [sessions, routine]);

  const smartRestTime = useMemo(() => {
    if (!currentExercise) return undefined;
    if (currentExercise.useSmartRest === false) return undefined;
    return calculateSmartRestTime(currentExercise);
  }, [currentExercise]);

  const lastSetData = useMemo(() => {
    if (!currentExercise) return null;
    const exerciseId = currentExercise.id;
    const currentSetIndex = workoutState.currentSet - 1;
    if (currentSetIndex === 0 && lastSessionForExercise) {
      const lastExerciseData = lastSessionForExercise.exercises.find(
        (e) => e.exerciseName === currentExercise.name,
      );
      if (
        lastExerciseData &&
        lastExerciseData.actualReps[0] !== undefined &&
        lastExerciseData.actualWeight[0] !== undefined
      ) {
        return { reps: lastExerciseData.actualReps[0], weight: lastExerciseData.actualWeight[0] };
      }
    }
    if (currentSetIndex > 0) {
      const prevReps = workoutState.workoutData.actualReps[exerciseId]?.[currentSetIndex - 1];
      const prevWeight = workoutState.workoutData.actualWeights[exerciseId]?.[currentSetIndex - 1];
      if (prevReps !== undefined && prevWeight !== undefined) return { reps: prevReps, weight: prevWeight };
    }
    return null;
  }, [currentExercise, workoutState.currentSet, workoutState.workoutData.actualReps, workoutState.workoutData.actualWeights, lastSessionForExercise]);

  const workoutProgress = useMemo(() => {
    if (!exercises.length) return { totalSets: 0, completedSets: 0, percentage: 0 };
    const totalSets = exercises.reduce((sum: number, ex: Exercise) => sum + ex.sets.length, 0);
    const completedSets = exercises.reduce((sum: number, ex: Exercise) => {
      const exerciseCompletedSets = workoutState.workoutData.completedSets[ex.id] || 0;
      return sum + Math.min(exerciseCompletedSets, ex.sets.length);
    }, 0);
    const percentage = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
    return { totalSets, completedSets, percentage };
  }, [exercises, workoutState.workoutData.completedSets]);

  const handleTimerCompleteRef = useRef(() => {});
  const timerHandlers = useWorkoutTimer(() => handleTimerCompleteRef.current());
  const timerHandlersRef = useRef(timerHandlers);
  
  useEffect(() => {
    timerHandlersRef.current = timerHandlers;
  }, [timerHandlers]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.type !== 'notification-action') return;
      const action = data.action;
      const handlers = timerHandlersRef.current;
      if (!handlers) return;
      if (action === 'skip') {
        if (handlers.skipAndAdvance) handlers.skipAndAdvance();
        else handlers.skipTimer();
      } else if (action === 'add-30s' || action === 'more-rest') {
        const added = 30;
        const newTime = Math.max(0, (handlers.currentTimeLeft || 0) + added);
        handlers.setCurrentTimeLeft(newTime);
        updateRestNotification(newTime).catch(() => {});
      } else if (action === 'continue') {
        handlers.expandTimer();
      }
    };
    navigator.serviceWorker.addEventListener('message', onMessage);
    return () => navigator.serviceWorker.removeEventListener('message', onMessage);
  }, []);

  const currentExerciseIndexRef = useRef(workoutState.currentExerciseIndex);
  const currentSetRef = useRef(workoutState.currentSet);
  
  useEffect(() => { currentExerciseIndexRef.current = workoutState.currentExerciseIndex; }, [workoutState.currentExerciseIndex]);
  useEffect(() => { currentSetRef.current = workoutState.currentSet; }, [workoutState.currentSet]);

  const performSave = useCallback((data: WorkoutData) => {
    if (!routine || !isInitialized) return;
    const th = timerHandlersRef.current;
    try {
      updateWorkoutProgress(
        currentExerciseIndexRef.current,
        currentSetRef.current,
        data.completedSets,
        data.actualReps,
        data.actualWeights,
        th.showTimer ? {
          isResting: true,
          restTimerDuration: th.timerDuration,
          restTimerTitle: th.timerTitle,
          restTimerNextExercise: th.nextExerciseName,
          restTimerStartedAt: Date.now(),
        } : undefined,
        totalPausedTime,
        {
          setTypes: data.setTypes,
          restOverrides: data.restOverrides,
          perSetRestOverrides: data.perSetRestOverrides,
          skippedExercises: data.skippedExercises,
        },
      );
    } catch (err) {}
  }, [routine, isInitialized, updateWorkoutProgress, totalPausedTime]);

  const performSaveRef = useRef(performSave);
  useEffect(() => { performSaveRef.current = performSave; }, [performSave]);

  const saveWrapper = useCallback((data: WorkoutData) => {
    if (performSaveRef.current) performSaveRef.current(data);
  }, []);

  const debouncedSaveRef = useRef<ReturnType<typeof debounce> | null>(null);

  useEffect(() => {
    debouncedSaveRef.current = debounce(saveWrapper, 500);
    return () => { if (debouncedSaveRef.current) debouncedSaveRef.current.cancel(); };
  }, [saveWrapper]);

  const handleWorkoutDataChange = useCallback((data: WorkoutData) => {
    if (debouncedSaveRef.current) debouncedSaveRef.current(data);
  }, []);

  // Si la app se va a segundo plano mientras el guardado sigue debounceado
  // (hasta 500ms), forzamos que se ejecute ya mismo en vez de esperar: sin
  // esto, useWorkoutLifecycle's onPause puede persistir el estado antes de
  // que este debounce llegue a propagar la última serie completada.
  useAppLifecycle({
    onPause: useCallback(() => {
      if (debouncedSaveRef.current) debouncedSaveRef.current.flush();
    }, []),
  });

  useEffect(() => {
    handleWorkoutDataChangeRef.current = handleWorkoutDataChange;
  }, [handleWorkoutDataChange]);

  const weightPrediction = useWeightPrediction({
    currentExercise,
    currentSet: workoutState.currentSet,
    sessions,
    actualWeights: workoutState.workoutData.actualWeights,
    isInitialized,
  });

  const haptic = useHapticFeedback();
  const setExecution = useSetExecution({ onSetStart: () => haptic.setStart() });

  const [tutElapsedQEM, setTutElapsedQEM] = useState(0);
  useEffect(() => {
    if (!isQuickEditMode || !setExecution.isExecutingSet || !setExecution.setStartTime) {
      setTimeout(() => setTutElapsedQEM(0), 0);
      return;
    }
    const tick = () => setTutElapsedQEM(Math.floor((Date.now() - setExecution.setStartTime!) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isQuickEditMode, setExecution.isExecutingSet, setExecution.setStartTime]);

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

  const soundSettingsModal = useSoundSettingsModal();

  useWorkoutSuggestions({
    currentExercise,
    routine,
    currentSet: workoutState.currentSet,
    currentWeight: workoutState.currentWeight,
    sessions: sessions as unknown as WorkoutSession[],
    restOverrides: workoutState.workoutData.restOverrides,
    perSetRestOverrides: workoutState.workoutData.perSetRestOverrides,
    useSmartRest,
    smartRestTime,
    showTimer: timerHandlers.showTimer,
    isExecutingSet: setExecution.isExecutingSet,
    onSuccess: success,
    onError: error,
  });

  const wakeLock = useWakeLock();
  const { isSupported: wakeLockSupported, requestWakeLock, releaseWakeLock } = wakeLock;

  const qemTotalSets = useMemo(() => {
    if (!routine) return 1;
    return routine.exercises.reduce((sum: number, ex: Exercise) => sum + ex.sets.length, 0) || 1;
  }, [routine]);
  
  const qemCompletedSets = useMemo(
    () => Object.values(workoutState.workoutData.completedSets || {}).reduce((sum: number, n: unknown) => sum + ((n as number) || 0), 0),
    [workoutState.workoutData.completedSets],
  );
  
  const qemProgressPercent = Math.round((qemCompletedSets / qemTotalSets) * 100);
  
  const qemCurrentExerciseId = useMemo(() => {
    if (!routine) return null;
    const skipped = workoutState.workoutData.skippedExercises || [];
    const found = routine.exercises.find((ex: Exercise) => {
      if (skipped.includes(ex.id)) return false;
      return (workoutState.workoutData.completedSets?.[ex.id] || 0) < ex.sets.length;
    });
    return found?.id ?? routine.exercises[0]?.id ?? null;
  }, [routine, workoutState.workoutData.completedSets, workoutState.workoutData.skippedExercises]);

  const [initState, setInitState] = useState({
    lastRoutineId: null as string | null,
    hasLoadedModified: false,
    isInitialized: false,
  });

  useEffect(() => {
    if (gymLoading) return;
    initializeWorkout({
      id,
      activeWorkout,
      getRoutineById,
      startWorkout,
      workoutState,
      timerHandlers,
      setWorkoutStartTime,
      setShowStartSplash,
      setRoutine,
      setOriginalRoutine,
      setIsInitialized,
      setInitState,
      routerPush: router.push,
      initState,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, gymLoading, initState.lastRoutineId, initState.hasLoadedModified]);

  useEffect(() => {
    if (!currentExercise || !isInitialized) return;
    const exerciseId = currentExercise.id;
    const setIndex = workoutState.currentSet - 1;
    const actualReps = workoutState.workoutData.actualReps[exerciseId]?.[setIndex];
    const actualWeight = workoutState.workoutData.actualWeights[exerciseId]?.[setIndex];
    const repsToShow = actualReps !== undefined && actualReps !== 0 ? actualReps : currentExercise.sets[setIndex]?.reps || 0;
    const weightToShow = actualWeight !== undefined && actualWeight !== 0 ? actualWeight : currentExercise.sets[setIndex]?.weight || 0;
    if (workoutState.currentReps !== repsToShow) workoutState.setCurrentReps(repsToShow);
    if (workoutState.currentWeight !== weightToShow) workoutState.setCurrentWeight(weightToShow);
  }, [currentExercise, workoutState.currentSet, workoutState.workoutData.actualReps, workoutState.workoutData.actualWeights, isInitialized, workoutState]);

  useEffect(() => {
    if (timerHandlers.showTimer) document.body.classList.add("hide-navbar");
    else document.body.classList.remove("hide-navbar");
    return () => document.body.classList.remove("hide-navbar");
  }, [timerHandlers.showTimer]);

  useEffect(() => {
    if (skipRestTimers && timerHandlers.showTimer) {
      timerHandlers.stopTimer();
      clearRestState();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipRestTimers]);

  useEffect(() => {
    if (!isQuickEditMode && currentExercise && isInitialized && !timerHandlers.showTimer) {
      const exerciseId = currentExercise.id;
      const actualReps = workoutState.workoutData.actualReps[exerciseId] || [];
      const completionFlags = getCompletionFlagsForExercise({
        completedSetFlags: workoutState.workoutData.completedSetFlags,
        completedSets: workoutState.workoutData.completedSets,
        exerciseId,
        totalSets: currentExercise.sets.length,
      });
      const completedCount = countCompletedFlags(completionFlags, currentExercise.sets.length);
      const nextIncompleteIndex = currentExercise.sets.findIndex((_s: Set, _idx: number) => !completionFlags[_idx]);
      const nextSet = nextIncompleteIndex !== -1 ? nextIncompleteIndex + 1 : completedCount + 1;

      if (nextSet !== workoutState.currentSet && nextSet <= currentExercise.sets.length) {
        workoutState.setCurrentSet(nextSet);
        const nextSetData = currentExercise.sets[nextSet - 1];
        if (nextSetData) {
          const savedReps = actualReps[nextSet - 1];
          const savedWeight = workoutState.workoutData.actualWeights[exerciseId]?.[nextSet - 1];
          const prevWeight = workoutState.workoutData.actualWeights[exerciseId]?.[nextSet - 2];
          workoutState.setCurrentReps(savedReps && savedReps > 0 ? savedReps : nextSetData.reps);
          workoutState.setCurrentWeight(savedWeight !== undefined && savedWeight > 0 ? savedWeight : (prevWeight !== undefined && prevWeight > 0 ? prevWeight : nextSetData.weight || 0));
        }
      }
    }
  }, [isQuickEditMode, currentExercise, isInitialized, timerHandlers.showTimer, workoutState]);

  useEffect(() => {
    if (!isQuickEditMode && currentExercise && isInitialized && routine && !timerHandlers.showTimer) {
      const exerciseId = currentExercise.id;
      const completionFlags = getCompletionFlagsForExercise({
        completedSetFlags: workoutState.workoutData.completedSetFlags,
        completedSets: workoutState.workoutData.completedSets,
        exerciseId,
        totalSets: currentExercise.sets.length,
      });
      const completedCount = countCompletedFlags(completionFlags, currentExercise.sets.length);
      const hasCompletedAllSets = completedCount >= currentExercise.sets.length;

      if (hasCompletedAllSets) {
        const skippedIdsEff = workoutState.workoutData.skippedExercises || [];
        const hasNextActiveExercise = routine.exercises.slice(workoutState.currentExerciseIndex + 1).some((ex: Exercise) => !skippedIdsEff.includes(ex.id));
        const isLastExercise = !hasNextActiveExercise;

        if (!isLastExercise) {
          setTimeout(() => {
            const skippedIdsNext = workoutState.workoutData.skippedExercises || [];
            let nextIndex: number | null = null;
            for (let i = workoutState.currentExerciseIndex + 1; i < routine.exercises.length; i++) {
              if (!skippedIdsNext.includes(routine.exercises[i].id)) {
                nextIndex = i;
                break;
              }
            }
            if (nextIndex !== null) {
              const nextExercise = routine.exercises[nextIndex];
              workoutState.setCurrentExerciseIndex(nextIndex);
              workoutState.setCurrentSet(1);
              if (nextExercise.sets[0]) {
                workoutState.setCurrentReps(nextExercise.sets[0].reps);
                workoutState.setCurrentWeight(nextExercise.sets[0].weight || 0);
              }
            }
          }, 0);
        }
      }
    }
  }, [isQuickEditMode, currentExercise, isInitialized, routine, workoutState, timerHandlers.showTimer]);

  useEffect(() => {
    if (!routine || !isInitialized || !currentExercise) return;
    let hasChanges = false;
    routine.exercises.forEach((exercise: Exercise) => {
      const exerciseId = exercise.id;
      const maxSets = exercise.sets.length;
      const currentReps = workoutState.workoutData.actualReps[exerciseId];
      if (currentReps && currentReps.length > maxSets) {
        workoutState.updateActualReps(exerciseId, currentReps.slice(0, maxSets));
        hasChanges = true;
      }
      const currentWeights = workoutState.workoutData.actualWeights[exerciseId];
      if (currentWeights && currentWeights.length > maxSets) {
        workoutState.updateActualWeights(exerciseId, currentWeights.slice(0, maxSets));
        hasChanges = true;
      }
      const currentFlags = workoutState.workoutData.completedSetFlags?.[exerciseId];
      const completedCount = workoutState.workoutData.completedSets?.[exerciseId] ?? 0;
      if (currentFlags && (currentFlags.length > maxSets || completedCount !== countCompletedFlags(currentFlags, maxSets))) {
        workoutState.updateCompletedSetFlags(exerciseId, currentFlags.slice(0, maxSets));
        hasChanges = true;
      } else if (!currentFlags && completedCount > maxSets) {
        workoutState.updateCompletedSets(exerciseId, maxSets);
        hasChanges = true;
      }
    });
  }, [routine, isInitialized, currentExercise, workoutState]);

  useEffect(() => {
    if (!currentExercise || !isInitialized) return;
    const maxSets = currentExercise.sets.length;
    if (workoutState.currentSet > maxSets) {
      workoutState.setCurrentSet(maxSets);
    } else if (workoutState.currentSet < 1) {
      workoutState.setCurrentSet(1);
    }
  }, [currentExercise, workoutState, isInitialized]);

  useEffect(() => {
    if (!isInitialized || !wakeLockSupported) return;
    let mounted = true;
    (async () => {
      try {
        const activated = await requestWakeLock();
        if (activated && mounted) success("🔋 Pantalla activa durante el entrenamiento", 2000);
      } catch (err) {}
    })();
    return () => {
      mounted = false;
      void releaseWakeLock();
    };
  }, [isInitialized, wakeLockSupported, requestWakeLock, releaseWakeLock, success]);

  useEffect(() => {
    const timer = setTimeout(() => setIsSeriesTableExpanded(false), 0);
    return () => clearTimeout(timer);
  }, [workoutState.currentExerciseIndex]);

  const currentWeightRef = useRef<number | ''>(workoutState.currentWeight);
  const weightPredictionRef = useRef(weightPrediction);
  
  useEffect(() => {
    currentWeightRef.current = workoutState.currentWeight;
    weightPredictionRef.current = weightPrediction;
  }, [workoutState.currentWeight, weightPrediction]);

  useEffect(() => {
    if (!currentExercise || !isInitialized) return;
    const currentWeightValue = typeof currentWeightRef.current === "number" ? currentWeightRef.current : 0;
    const prediction = weightPredictionRef.current.predictWeightForSet(currentWeightValue);
    if (prediction.weight !== currentWeightRef.current) {
      workoutState.setCurrentWeight(prediction.weight);
      if (prediction.reasoning) success(`💡 ${prediction.reasoning}`, 3000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentExercise?.id, workoutState.currentSet, isInitialized]);

  const completeSetLogic = useCallback((params: { exerciseId: string; setIndex: number; reps: number; weight: number; isFromQuickMode?: boolean; }) => {
    const { exerciseId, setIndex, reps, weight, isFromQuickMode = false } = params;
    if (!(reps > 0)) {
      error("No puedes completar la serie sin repeticiones");
      return { success: false, reason: "invalid-data", nextAction: "none" as const };
    }
    const exercise = routine?.exercises.find((ex: Exercise) => ex.id === exerciseId);
    if (!exercise || !routine) return { success: false, reason: "exercise-not-found", nextAction: "none" as const };

    const prevExerciseData = workoutState.getExerciseData(exerciseId);
    const completedFlagsLocal = [...(prevExerciseData.completedSetFlags || [])];
    while (completedFlagsLocal.length <= setIndex) completedFlagsLocal.push(false);
    completedFlagsLocal[setIndex] = true;
    const completedCount = countCompletedFlags(completedFlagsLocal, exercise.sets.length);

    const skippedIds = workoutState.workoutData.skippedExercises || [];
    const { restOverrides, perSetRestOverrides: perSetOverrides } = workoutState.workoutData;

    workoutState.completeSetAt(exerciseId, setIndex, reps, weight);

    if (isFromQuickMode) haptic.success();
    else haptic.setComplete();

    const isLastSetOfExercise = completedCount >= exercise.sets.length;
    const exerciseIndex = routine.exercises.findIndex((ex: Exercise) => ex.id === exerciseId);
    let nextExerciseIdx: number | null = null;
    for (let i = exerciseIndex + 1; i < routine.exercises.length; i++) {
      if (!skippedIds.includes(routine.exercises[i].id)) {
        nextExerciseIdx = i;
        break;
      }
    }
    const isLastExercise = nextExerciseIdx === null;

    let nextAction: "next-set" | "next-exercise" | "finish-workout" | "none" = "none";
    let restTime = 0;
    let restTitle = "";
    let nextExerciseName = "";

    if (isLastSetOfExercise) {
      if (isLastExercise) {
        nextAction = "finish-workout";
      } else {
        nextAction = "next-exercise";
        const nextExercise = routine.exercises[nextExerciseIdx!];
        nextExerciseName = nextExercise.name;
        restTime = calculateExerciseRestTime({ currentExercise: exercise, nextExercise, routine, restOverrides, perSetOverrides, useSmartRest });
        restTitle = "Descanso entre ejercicios";
        haptic.restStart();
      }
    } else {
      nextAction = "next-set";
      restTime = calculateNextRestTime({ currentExercise: exercise, routine, restOverrides: workoutState.workoutData.restOverrides, perSetOverrides: workoutState.workoutData.perSetRestOverrides, currentSet: setIndex + 1, useSmartRest });
      if (isFromQuickMode) {
        const nextIncompleteIndex = exercise.sets.findIndex((_s: Set, idx: number) => idx > setIndex && !completedFlagsLocal[idx]);
        const nextSetNumber = nextIncompleteIndex !== -1 ? nextIncompleteIndex + 1 : setIndex + 2;
        restTitle = `Descanso - ${exercise.name}`;
        nextExerciseName = `Serie ${nextSetNumber}`;
      } else {
        restTitle = `Descanso - Serie ${setIndex + 2}/${exercise.sets.length}`;
      }
      haptic.restStart();
    }

    return { success: true, nextAction, restTime, restTitle, nextExerciseName, isLastSetOfExercise, isLastExercise, exerciseIndex, nextExerciseIndex: nextExerciseIdx };
  }, [workoutState, routine, error, haptic, useSmartRest]);

  const handleTimerComplete = useCallback(() => {
    timerHandlers.stopTimer();
    clearRestState();
    haptic.restComplete();
    if (!currentExercise || !routine) return;
    const exerciseId = currentExercise.id;
    const totalSets = currentExercise.sets.length;
    const exerciseData = workoutState.getExerciseData(exerciseId);
    const completionFlags = getCompletionFlagsForExercise({
      completedSetFlags: { [exerciseId]: exerciseData.completedSetFlags },
      completedSets: { [exerciseId]: exerciseData.completedSets },
      exerciseId,
      totalSets,
    });
    const completedCount = countCompletedFlags(completionFlags, totalSets);
    const isLastSet = completedCount >= totalSets;
    const skippedIdsTimer = workoutState.workoutData.skippedExercises || [];
    const hasNextActive = routine.exercises.slice(workoutState.currentExerciseIndex + 1).some((ex: Exercise) => !skippedIdsTimer.includes(ex.id));
    const isLastExercise = !hasNextActive;

    if (isLastSet && isLastExercise) {
    } else if (isLastSet && !isLastExercise) {
      let nextIndex: number | null = null;
      for (let i = workoutState.currentExerciseIndex + 1; i < routine.exercises.length; i++) {
        if (!skippedIdsTimer.includes(routine.exercises[i].id)) {
          nextIndex = i;
          break;
        }
      }
      if (nextIndex !== null) {
        haptic.exerciseChange();
        workoutState.setCurrentExerciseIndex(nextIndex);
        workoutState.setCurrentSet(1);
        const nextExercise = routine.exercises[nextIndex];
        const firstSet = nextExercise.sets[0];
        if (firstSet) {
          workoutState.setCurrentReps(firstSet.reps);
          workoutState.setCurrentWeight(firstSet.weight || 0);
        }
        setExecution.startSet();
      }
    } else if (!isLastSet) {
      const nextIncompleteIndex = currentExercise.sets.findIndex((_set: Set, idx: number) => !completionFlags[idx]);
      const newSet = nextIncompleteIndex !== -1 ? nextIncompleteIndex + 1 : totalSets;
      workoutState.setCurrentSet(newSet);
      const nextSetData = currentExercise.sets[newSet - 1];
      if (nextSetData) {
        const savedWeight = workoutState.workoutData.actualWeights[exerciseId]?.[newSet - 1];
        const prevWeight = workoutState.workoutData.actualWeights[exerciseId]?.[newSet - 2];
        workoutState.setCurrentReps(nextSetData.reps);
        workoutState.setCurrentWeight(savedWeight !== undefined && savedWeight > 0 ? savedWeight : (prevWeight !== undefined && prevWeight > 0 ? prevWeight : nextSetData.weight || 0));
      }
      setExecution.startSet();
    }
  }, [currentExercise, routine, workoutState, clearRestState, timerHandlers, haptic, setExecution]);

  useEffect(() => { handleTimerCompleteRef.current = handleTimerComplete; }, [handleTimerComplete]);

  const hasRoutineChanges = useCallback((orig: Routine | null, curr: Routine | null) => {
    if (!orig || !curr) return false;
    const origEx = orig.exercises || [];
    const currEx = curr.exercises || [];
    if (origEx.length !== currEx.length) return true;

    const sessionReps = workoutState.workoutData.actualReps || {};
    const sessionWeights = workoutState.workoutData.actualWeights || {};

    for (const ce of currEx) {
      const oe = origEx.find((e: Exercise) => e.id === ce.id);
      if (!oe) return true;

      const origSets = oe.sets || [];
      const currSets = ce.sets || [];
      if (origSets.length !== currSets.length) return true;

      for (let i = 0; i < currSets.length; i++) {
        const os: Set = origSets[i] || {};
        const cs: Set = currSets[i] || {};

        const sr = sessionReps[ce.id] && typeof sessionReps[ce.id][i] !== 'undefined'
          ? Number(sessionReps[ce.id][i])
          : Number(cs.reps || 0);
        const sw = sessionWeights[ce.id] && typeof sessionWeights[ce.id][i] !== 'undefined'
          ? Number(sessionWeights[ce.id][i])
          : Number(cs.weight || 0);

        if (Number(os.reps || 0) !== sr) return true;
        if (Number(os.weight || 0) !== sw) return true;
      }
    }
    return false;
  }, [workoutState.workoutData.actualReps, workoutState.workoutData.actualWeights]);

  const handleFinish = useCallback(async (confirmedDuration?: number) => {
    try {
      if (originalRoutine && routine && hasRoutineChanges(originalRoutine, routine)) {
        const confirmed = await confirm({
          title: "Actualizar rutina original",
          message: "Has modificado pesos/series durante el entrenamiento. ¿Deseas actualizar la rutina original con estos cambios?",
          confirmText: "Sí, actualizar",
          cancelText: "No, solo guardar sesión",
        });

        if (confirmed) {
          try {
            const sessionReps = workoutState.workoutData.actualReps || {};
            const sessionWeights = workoutState.workoutData.actualWeights || {};

            await updateRoutine(id, {
               name: routine.name,
               description: routine.description,
               image: routine.image,
               exercises: routine.exercises.map((ex: Exercise) => {
                 const exReps = sessionReps[ex.id] || [];
                 const exWeights = sessionWeights[ex.id] || [];
                
                 return {
                   id: ex.id,
                   name: ex.name,
                   sets: ex.sets.map((s: Set, idx: number) => {
                     const finalReps = exReps[idx] !== undefined ? exReps[idx] : s.reps;
                     const finalWeight = exWeights[idx] !== undefined ? exWeights[idx] : (s.weight || 0);
                    
                     return {
                       reps: finalReps,
                       weight: finalWeight,
                       type: s.type,
                       notes: s.notes,
                     };
                   }),
                   notes: ex.notes,
                   equipment: ex.equipment,
                   technique: ex.technique,
                   recommendedSets: ex.recommendedSets,
                   recommendedReps: ex.recommendedReps,
                   restTime: ex.restTime,
                   restBetweenSets: ex.restBetweenSets,
                   useSmartRest: ex.useSmartRest,
                 };
               }),
               restBetweenSets: routine.restBetweenSets,
               restBetweenExercises: routine.restBetweenExercises,
             });
            success("Rutina actualizada", 2000);
          } catch (err) {
            error("No se pudo actualizar la rutina");
          }
        }
      }

      try { await saveQueue.flush(); } catch (e) {}
      await completion.finishWorkout(workoutState.workoutData, confirmedDuration);
    } catch (err) {
      error("Error al finalizar el entrenamiento");
    }
  }, [originalRoutine, routine, hasRoutineChanges, confirm, updateRoutine, id, success, error, completion, workoutState]);

  const handleCancelWorkout = useCallback(async () => {
    const confirmed = await confirm({
      title: "Cancelar entrenamiento",
      message: "¿Estás seguro de que quieres cancelar el entrenamiento? Se perderá todo el progreso.",
      confirmText: "Sí, cancelar",
      variant: "danger",
    });
    if (confirmed) {
      cancelWorkout();
      router.push("/routines");
    }
  }, [confirm, cancelWorkout, router]);

  const handlePauseWorkout = useCallback(() => {
    if (isPaused) {
      if (pauseStartTime) setTotalPausedTime((prev) => prev + (Date.now() - pauseStartTime));
      setIsPaused(false);
      setPauseStartTime(null);
      success("⏯️ Entrenamiento reanudado", 2000);
    } else {
      setPauseStartTime(Date.now());
      setIsPaused(true);
      success("⏸️ Entrenamiento pausado", 2000);
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
    const now = Date.now();
    const newStartTime = now - newElapsedSeconds * 1000;
    setWorkoutStartTime(newStartTime);
    setTotalPausedTime(0);
    setElapsedTime(newElapsedSeconds);
    setShowEditTimeModal(false);
    success("⏱️ Tiempo actualizado", 2000);
  }, [editingTime, success]);

  const handleMoveExercise = useCallback(async (fromIndex: number, toIndex: number) => {
    if (!routine || fromIndex === toIndex) return;
    const prevRoutine = routine;
    const prevCurrentIndex = workoutState.currentExerciseIndex;
    const newExercises = [...routine.exercises];
    const [movedExercise] = newExercises.splice(fromIndex, 1);
    newExercises.splice(toIndex, 0, movedExercise);
    const updatedRoutine = { ...routine, exercises: newExercises };
    
    setRoutine(updatedRoutine);
    if (prevCurrentIndex === fromIndex) workoutState.setCurrentExerciseIndex(toIndex);
    else if (fromIndex < prevCurrentIndex && toIndex >= prevCurrentIndex) workoutState.setCurrentExerciseIndex(prevCurrentIndex - 1);
    else if (fromIndex > prevCurrentIndex && toIndex <= prevCurrentIndex) workoutState.setCurrentExerciseIndex(prevCurrentIndex + 1);

    try {
      const routineToSave = prepareRoutineForSave(updatedRoutine);
      await updateModifiedRoutine(routineToSave);
      await updateRoutine(id, routineToSave);
      success("Orden de ejercicios actualizado", 2000);
    } catch (err) {
      error("Error al reordenar ejercicios");
      setRoutine(prevRoutine);
      workoutState.setCurrentExerciseIndex(prevCurrentIndex);
    }
  }, [routine, workoutState, updateModifiedRoutine, updateRoutine, id, success, error, prepareRoutineForSave]);

  const handleEditReps = useCallback((setIndex: number, reps: number) => {
    if (!currentExercise) return;
    const exerciseId = currentExercise.id;
    const newReps = [...(workoutState.workoutData.actualReps[exerciseId] || [])];
    newReps[setIndex] = reps;
    workoutState.updateActualReps(exerciseId, newReps);
  }, [currentExercise, workoutState]);

  const handleEditWeight = useCallback((setIndex: number, weight: number) => {
    if (!currentExercise) return;
    const exerciseId = currentExercise.id;
    const newWeights = [...(workoutState.workoutData.actualWeights[exerciseId] || [])];
    newWeights[setIndex] = weight;
    workoutState.updateActualWeights(exerciseId, newWeights);
  }, [currentExercise, workoutState]);

  const handleEditSetType = useCallback((setIndex: number, type: SetType) => {
    if (!currentExercise) return;
    workoutState.updateSetType(currentExercise.id, setIndex, type);
  }, [currentExercise, workoutState]);

  const handleEditRestTime = useCallback((setIndex: number, restTime: number) => {
    if (!currentExercise) return;
    workoutState.updatePerSetRestOverride(currentExercise.id, setIndex, restTime);
  }, [currentExercise, workoutState]);

  const handleApplySmartRest = useCallback(() => {
    if (!currentExercise || !smartRestTime) return;
    applySmartRestToAllSets(currentExercise, workoutState.updatePerSetRestOverride);
    success("Descanso inteligente aplicado a todas las series", 2000);
  }, [currentExercise, smartRestTime, workoutState, success]);

  const handleDeleteSet = useCallback(async (setIndex: number) => {
    if (!currentExercise || !routine) return;
    if (currentExercise.sets.length <= 1) {
      error("No puedes eliminar la última serie");
      return;
    }
    const exerciseId = currentExercise.id;
    const updatedSets = currentExercise.sets.filter((_: Set, idx: number) => idx !== setIndex);
    const updatedExercise = { ...currentExercise, sets: updatedSets };
    const updatedRoutine = { ...routine, exercises: routine.exercises.map((ex: Exercise) => ex.id === exerciseId ? updatedExercise : ex) };
    
    setRoutine(updatedRoutine);
    const currentReps = workoutState.workoutData.actualReps[exerciseId] || [];
    const currentWeights = workoutState.workoutData.actualWeights[exerciseId] || [];
    workoutState.updateActualReps(exerciseId, currentReps.filter((_, idx) => idx !== setIndex));
    workoutState.updateActualWeights(exerciseId, currentWeights.filter((_, idx) => idx !== setIndex));
    const completionFlags = getCompletionFlagsForExercise({
      completedSetFlags: workoutState.workoutData.completedSetFlags,
      completedSets: workoutState.workoutData.completedSets,
      exerciseId,
      totalSets: currentExercise.sets.length,
    }).filter((_, idx) => idx !== setIndex);
    workoutState.updateCompletedSetFlags(exerciseId, completionFlags);
    if (workoutState.currentSet > updatedSets.length) workoutState.setCurrentSet(updatedSets.length);

    try {
      const routineToSave = prepareRoutineForSave(updatedRoutine);
      await updateModifiedRoutine(routineToSave);
      await updateRoutine(id, routineToSave);
      success("Serie eliminada", 2000);
    } catch (err) {
      error("Error al eliminar serie");
    }
  }, [currentExercise, routine, workoutState, id, updateRoutine, updateModifiedRoutine, success, error, prepareRoutineForSave]);

  const handleDeleteExercise = useCallback(async (exerciseIndex: number) => {
    if (!routine) return;
    if (routine.exercises.length <= 1) {
      error("No puedes eliminar el último ejercicio");
      return;
    }
    const exerciseToDelete = routine.exercises[exerciseIndex];
    const confirmed = await confirm({
      title: "Eliminar ejercicio",
      message: `¿Estás seguro de que quieres eliminar "${exerciseToDelete.name}"? Esta acción no se puede deshacer.`,
      confirmText: "Sí, eliminar",
      cancelText: "Cancelar",
      variant: "danger",
    });
    if (!confirmed) return;

    const updatedExercises = routine.exercises.filter((_: Exercise, idx: number) => idx !== exerciseIndex);
    const updatedRoutine = { ...routine, exercises: updatedExercises };
    setRoutine(updatedRoutine);

    const exerciseId = exerciseToDelete.id;
    workoutState.updateActualReps(exerciseId, []);
    workoutState.updateActualWeights(exerciseId, []);
    workoutState.updateCompletedSets(exerciseId, 0);

    if (workoutState.currentExerciseIndex >= updatedExercises.length) {
      workoutState.setCurrentExerciseIndex(Math.max(0, updatedExercises.length - 1));
      workoutState.setCurrentSet(1);
      const newCurrentExercise = updatedExercises[Math.max(0, updatedExercises.length - 1)];
      if (newCurrentExercise && newCurrentExercise.sets[0]) {
        workoutState.setCurrentReps(newCurrentExercise.sets[0].reps);
        workoutState.setCurrentWeight(newCurrentExercise.sets[0].weight || 0);
      }
    } else if (exerciseIndex < workoutState.currentExerciseIndex) {
      workoutState.setCurrentExerciseIndex(workoutState.currentExerciseIndex - 1);
    } else if (exerciseIndex === workoutState.currentExerciseIndex) {
      const newCurrentExercise = updatedExercises[exerciseIndex];
      if (newCurrentExercise && newCurrentExercise.sets[0]) {
        workoutState.setCurrentSet(1);
        workoutState.setCurrentReps(newCurrentExercise.sets[0].reps);
        workoutState.setCurrentWeight(newCurrentExercise.sets[0].weight || 0);
      }
    }

    try {
      const routineToSave = prepareRoutineForSave(updatedRoutine);
      await updateModifiedRoutine(routineToSave);
      await updateRoutine(id, routineToSave);
      success("Serie eliminada", 2000);
    } catch (err) {
      error("Error al eliminar serie");
    }
    haptic.error();
  }, [routine, workoutState, updateModifiedRoutine, confirm, success, error, haptic, id, prepareRoutineForSave, updateRoutine]);

  const handleQuickDeleteSet = useCallback(async (exerciseId: string, setIndex: number) => {
    const exercise = routine?.exercises.find((ex: Exercise) => ex.id === exerciseId);
    if (!exercise || !routine) return;
    if (exercise.sets.length <= 1) {
      error("No puedes eliminar la última serie");
      return;
    }
    const updatedSets = exercise.sets.filter((_: Set, idx: number) => idx !== setIndex);
    const updatedExercise = { ...exercise, sets: updatedSets };
    const updatedRoutine = { ...routine, exercises: routine.exercises.map((ex: Exercise) => ex.id === exerciseId ? updatedExercise : ex) };
    setRoutine(updatedRoutine);
    const currentReps = workoutState.workoutData.actualReps[exerciseId] || [];
    const currentWeights = workoutState.workoutData.actualWeights[exerciseId] || [];
    workoutState.updateActualReps(exerciseId, currentReps.filter((_, idx) => idx !== setIndex));
    workoutState.updateActualWeights(exerciseId, currentWeights.filter((_, idx) => idx !== setIndex));
    const completionFlags = getCompletionFlagsForExercise({
      completedSetFlags: workoutState.workoutData.completedSetFlags,
      completedSets: workoutState.workoutData.completedSets,
      exerciseId,
      totalSets: exercise.sets.length,
    }).filter((_, idx) => idx !== setIndex);
    workoutState.updateCompletedSetFlags(exerciseId, completionFlags);

    try {
      const routineToSave = prepareRoutineForSave(updatedRoutine);
      await updateModifiedRoutine(routineToSave);
      await updateRoutine(id, routineToSave);
      success("Serie eliminada", 2000);
    } catch (err) {
      error("Error al eliminar serie");
    }
  }, [routine, workoutState, id, updateRoutine, updateModifiedRoutine, success, error, prepareRoutineForSave]);

  const handleToggleSetComplete = useCallback((setIndex: number, isComplete: boolean) => {
    if (!currentExercise || !routine) return;
    const exerciseId = currentExercise.id;

    if (isComplete) {
      const existingReps = workoutState.workoutData.actualReps[exerciseId]?.[setIndex];
      const existingWeight = workoutState.workoutData.actualWeights[exerciseId]?.[setIndex];
      const repsToUse = existingReps !== undefined && existingReps !== 0 ? existingReps : currentExercise.sets[setIndex].reps;
      const weightToUse = existingWeight !== undefined && existingWeight !== null ? existingWeight : currentExercise.sets[setIndex].weight || 0;
      
      const newActualReps = [...(workoutState.workoutData.actualReps[exerciseId] || [])];
      newActualReps[setIndex] = repsToUse;
      const newActualWeights = [...(workoutState.workoutData.actualWeights[exerciseId] || [])];
      newActualWeights[setIndex] = weightToUse;
      
      workoutState.updateActualReps(exerciseId, newActualReps);
      workoutState.updateActualWeights(exerciseId, newActualWeights);
      
      const completionFlags = getCompletionFlagsForExercise({
        completedSetFlags: workoutState.workoutData.completedSetFlags,
        completedSets: workoutState.workoutData.completedSets,
        exerciseId,
        totalSets: currentExercise.sets.length,
      });
      completionFlags[setIndex] = true;
      const newCompletedCount = countCompletedFlags(completionFlags, currentExercise.sets.length);
      workoutState.updateCompletedSetFlag(exerciseId, setIndex, true);

      const nextIncompleteSet = currentExercise.sets.findIndex((_: Set, idx: number) => idx > setIndex && !completionFlags[idx]);

      if (nextIncompleteSet !== -1) {
        workoutState.setCurrentSet(nextIncompleteSet + 1);
      } else if (newCompletedCount >= currentExercise.sets.length) {
        const isLastExercise = workoutState.currentExerciseIndex >= routine.exercises.length - 1;
        if (!isLastExercise) {
          const nextExercise = routine.exercises[workoutState.currentExerciseIndex + 1];
          const restTime = calculateExerciseRestTime({
            currentExercise,
            nextExercise,
            routine,
            restOverrides: workoutState.workoutData.restOverrides,
            perSetOverrides: workoutState.workoutData.perSetRestOverrides,
            useSmartRest,
          });
          if (!skipRestTimers) {
            timerHandlers.startTimer(restTime, "Descanso entre ejercicios", nextExercise.name);
          }
        }
      }
    } else {
      const newActualReps = [...(workoutState.workoutData.actualReps[exerciseId] || [])];
      newActualReps[setIndex] = 0;
      workoutState.updateActualReps(exerciseId, newActualReps);
      workoutState.updateCompletedSetFlag(exerciseId, setIndex, false);
      if (setIndex + 1 < workoutState.currentSet) workoutState.setCurrentSet(setIndex + 1);
    }
  }, [currentExercise, routine, workoutState, useSmartRest, timerHandlers, skipRestTimers]);

  const handleAddSet = useCallback(async () => {
    if (!currentExercise || !routine) {
      error("No se puede agregar serie");
      return;
    }
    if (currentExercise.sets.length >= 20) {
      error("Máximo 20 series por ejercicio");
      return;
    }
    const exerciseId = currentExercise.id;
    const lastIdx = currentExercise.sets.length - 1;
    const lastSet = currentExercise.sets[lastIdx];
    const lastRepsFromState = workoutState.workoutData.actualReps[exerciseId]?.[lastIdx];
    const lastWeightFromState = workoutState.workoutData.actualWeights[exerciseId]?.[lastIdx];

    const newSet = {
      reps: typeof lastRepsFromState === 'number' && lastRepsFromState > 0 ? lastRepsFromState : lastSet.reps,
      weight: typeof lastWeightFromState === 'number' && lastWeightFromState >= 0 ? lastWeightFromState : lastSet.weight || 0,
    };

    const updatedSets = [...currentExercise.sets, newSet];
    const updatedExercise = { ...currentExercise, sets: updatedSets };
    const updatedRoutine = { ...routine, exercises: routine.exercises.map((ex: Exercise) => ex.id === exerciseId ? updatedExercise : ex) };
    setRoutine(updatedRoutine);

    try {
      const routineToSave = prepareRoutineForSave(updatedRoutine);
      await updateModifiedRoutine(routineToSave);
      await updateRoutine(id, routineToSave);
      success("Serie agregada", 2000);
    } catch (err) {
      error("Error al agregar serie");
      setRoutine(routine);
    }
  }, [currentExercise, routine, workoutState, id, updateRoutine, updateModifiedRoutine, success, error, prepareRoutineForSave]);

  const handleSelectExercise = useCallback((index: number) => {
    workoutState.setCurrentExerciseIndex(index);
    workoutState.setCurrentSet(1);
    timerHandlers.stopTimer();
    setExecution.cancelSetExecution();
  }, [workoutState, timerHandlers, setExecution]);

  const handleRepeatPrevious = useCallback(() => {
    if (!lastSetData) return;
    workoutState.setCurrentReps(lastSetData.reps);
    workoutState.setCurrentWeight(lastSetData.weight);
    success(`Copiado: ${lastSetData.reps} reps × ${lastSetData.weight}kg`, 2000);
  }, [lastSetData, workoutState, success]);

  const handleAddExercises = useCallback(async (exercisesToAdd: ExerciseTemplate[], insertIndex?: number) => {
    if (!routine || exercisesToAdd.length === 0) return;
    try {
      const profile = userProfile ?? getProfileLocally();
      const newExercises = exercisesToAdd.map((ex) => {
        const rec = getExerciseRecommendations(ex, profile ?? null);
        let suggestedWeight = rec.weight;
        try {
          const eqStr = (ex.equipment || "").toLowerCase();
          const hasBar = equipment.selectedEquipment.has('barra');
          const hasDumb = equipment.selectedEquipment.has('mancuernas');
          if ((eqStr.includes('barra') || eqStr.includes('barbell')) && !hasBar && hasDumb) {
            suggestedWeight = Math.round((suggestedWeight / 2) / 2.5) * 2.5;
          }
        } catch (e) {}

        const sets = Array.from({ length: rec.sets || (ex.defaultSets || 3) }).map(() => ({
          reps: rec.reps || ex.defaultReps || 10,
          weight: suggestedWeight || 0,
          type: "normal" as const,
        }));

        let restBetween = routine.restBetweenSets || 60;
        try {
          const restMatch = (rec.restTime || '').match(/(\d+)/);
          if (restMatch) {
            restBetween = parseInt(restMatch[1]);
            if ((rec.restTime || '').toLowerCase().includes('min')) restBetween = restBetween * 60;
          }
        } catch {}

        return {
          id: ex.id,
          name: ex.name,
          sets,
          equipment: ex.equipment,
          notes: ex.description,
          restBetweenSets: restBetween,
          useSmartRest: true,
        };
      });

      let newRoutineExercises = [...routine.exercises];
      if (typeof insertIndex === 'number' && insertIndex >= 0 && insertIndex <= newRoutineExercises.length) {
        newRoutineExercises.splice(insertIndex, 0, ...newExercises);
      } else {
        newRoutineExercises = [...newRoutineExercises, ...newExercises];
      }

      const updatedRoutine = { ...routine, exercises: newRoutineExercises };
      const prevRoutine = routine;
      setRoutine(updatedRoutine);

      try {
        const routineToSave = prepareRoutineForSave(updatedRoutine);
        await updateModifiedRoutine(routineToSave);
        await updateRoutine(id, routineToSave);
        updateWorkoutProgress(
          workoutState.currentExerciseIndex,
          workoutState.currentSet,
          workoutState.workoutData.completedSets,
          workoutState.workoutData.actualReps,
          workoutState.workoutData.actualWeights,
          undefined,
          totalPausedTime,
        );
        success(`${exercisesToAdd.length} ejercicio${exercisesToAdd.length > 1 ? "s" : ""} agregado${exercisesToAdd.length > 1 ? "s" : ""} a la rutina`, 3000);
        setOriginalRoutine(JSON.parse(JSON.stringify(updatedRoutine)));
      } catch (err) {
        error("Error al agregar ejercicios");
        setRoutine(prevRoutine);
      }
    } catch (err) {
      error("Error al agregar ejercicios");
    }
  }, [routine, id, updateRoutine, success, error, workoutState, updateWorkoutProgress, totalPausedTime, setOriginalRoutine, prepareRoutineForSave, userProfile, equipment]);

  const [togglingKeys, setTogglingKeys] = useState<Record<string, boolean>>({});
  const toggleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (toggleTimeoutRef.current) {
        clearTimeout(toggleTimeoutRef.current);
        toggleTimeoutRef.current = null;
      }
    };
  }, []);

  const handleQuickEditReps = useCallback((exerciseId: string, setIndex: number, reps: number) => {
    const currentReps = workoutState.workoutData.actualReps[exerciseId] || [];
    const newReps = [...currentReps];
    newReps[setIndex] = reps;
    workoutState.updateActualReps(exerciseId, newReps);
  }, [workoutState]);

  const handleQuickEditWeight = useCallback((exerciseId: string, setIndex: number, weight: number) => {
    const currentWeights = workoutState.workoutData.actualWeights[exerciseId] || [];
    const newWeights = [...currentWeights];
    newWeights[setIndex] = weight;
    workoutState.updateActualWeights(exerciseId, newWeights);
  }, [workoutState]);

  const handleQuickEditSetType = useCallback((exerciseId: string, setIndex: number, type: SetType) => {
    workoutState.updateSetType(exerciseId, setIndex, type);
  }, [workoutState]);

  const handleQuickToggleSetComplete = useCallback((exerciseId: string, setIndex: number, isComplete: boolean) => {
    const key = `${exerciseId}:${setIndex}`;
    if (togglingKeys[key]) return;
    setTogglingKeys((prev) => ({ ...prev, [key]: true }));

    const clearToggle = (delay = 300) => {
      if (delay <= 0) {
        setTogglingKeys((prev) => { const copy = { ...prev }; delete copy[key]; return copy; });
        return;
      }
      if (toggleTimeoutRef.current) clearTimeout(toggleTimeoutRef.current);
      toggleTimeoutRef.current = setTimeout(() => {
        toggleTimeoutRef.current = null;
        setTogglingKeys((prev) => { const copy = { ...prev }; delete copy[key]; return copy; });
      }, delay);
    };

    try {
      const exercise = routine?.exercises.find((ex: Exercise) => ex.id === exerciseId);
      if (!exercise || !routine) { clearToggle(0); return; }

      const { actualReps: currentReps, actualWeights: currentWeights } = workoutState.getExerciseData(exerciseId);
      const newReps = [...currentReps];
      const newWeights = [...currentWeights];

      if (isComplete) {
        const displayReps = currentReps[setIndex] !== undefined && currentReps[setIndex] > 0 ? currentReps[setIndex] : (exercise.sets[setIndex]?.reps ?? 0);
        const displayWeight = currentWeights[setIndex] !== undefined && currentWeights[setIndex] > 0 ? currentWeights[setIndex] : (exercise.sets[setIndex]?.weight ?? 0);

        const result = completeSetLogic({ exerciseId, setIndex, reps: displayReps, weight: displayWeight, isFromQuickMode: true });

        if (!result.success) { clearToggle(0); return; }

        if (!newReps[setIndex] || newReps[setIndex] === 0) newReps[setIndex] = exercise.sets[setIndex]?.reps || 10;
        if (!newWeights[setIndex]) newWeights[setIndex] = exercise.sets[setIndex]?.weight || 0;
        
        const completionFlags = getCompletionFlagsForExercise({
          completedSetFlags: workoutState.workoutData.completedSetFlags,
          completedSets: workoutState.workoutData.completedSets,
          exerciseId,
          totalSets: exercise.sets.length,
        });
        completionFlags[setIndex] = true;

        if (currentExercise && currentExercise.id === exerciseId) {
          const nextIncompleteSet = exercise.sets.findIndex((_set: Set, idx: number) => !completionFlags[idx]);
          if (nextIncompleteSet !== -1) workoutState.setCurrentSet(nextIncompleteSet + 1);
          else workoutState.setCurrentSet(exercise.sets.length);
        }

        if (result.nextAction && result.nextAction !== "none" && result.nextAction !== "finish-workout" && !skipRestTimers) {
          timerHandlers.startTimer(result.restTime || 0, result.restTitle, result.nextExerciseName);
        }
      } else {
        newReps[setIndex] = 0;
        workoutState.updateActualReps(exerciseId, newReps);
        workoutState.updateCompletedSetFlag(exerciseId, setIndex, false);

        if (currentExercise && currentExercise.id === exerciseId) {
          const completionFlags = getCompletionFlagsForExercise({
            completedSetFlags: workoutState.workoutData.completedSetFlags,
            completedSets: workoutState.workoutData.completedSets,
            exerciseId,
            totalSets: exercise.sets.length,
          });
          completionFlags[setIndex] = false;
          const nextIncompleteSet = exercise.sets.findIndex((_set: Set, idx: number) => !completionFlags[idx]);
          if (nextIncompleteSet !== -1) workoutState.setCurrentSet(nextIncompleteSet + 1);
          else workoutState.setCurrentSet(exercise.sets.length);
        }

        try {
          timerHandlers.stopTimer();
          clearRestState();
        } catch (err) {}
      }
      clearToggle(350);
    } catch (err) {
      clearToggle(0);
    }
  }, [routine, workoutState, currentExercise, completeSetLogic, skipRestTimers, timerHandlers, clearRestState, togglingKeys]);

  const handleSkipExercise = useCallback((exerciseId: string) => {
    workoutState.skipExercise(exerciseId);
    success("Ejercicio omitido en esta sesión", 2000);
  }, [workoutState, success]);

  const handleUnskipExercise = useCallback((exerciseId: string) => {
    workoutState.unskipExercise(exerciseId);
    success("Ejercicio restaurado", 2000);
  }, [workoutState, success]);

  const handleQuickAddSet = useCallback(async (exerciseId: string) => {
    const exercise = routine?.exercises.find((ex: Exercise) => ex.id === exerciseId);
    if (!exercise || !routine) {
      error("No se puede agregar serie");
      return;
    }
    if (exercise.sets.length >= 20) {
      error("Máximo 20 series por ejercicio");
      return;
    }
    const lastIdx = exercise.sets.length - 1;
    const lastRepsFromState = workoutState.workoutData.actualReps[exerciseId]?.[lastIdx];
    const lastWeightFromState = workoutState.workoutData.actualWeights[exerciseId]?.[lastIdx];
    const lastSet = exercise.sets[lastIdx];

    const newSet = {
      reps: typeof lastRepsFromState === 'number' && lastRepsFromState > 0 ? lastRepsFromState : lastSet.reps,
      weight: typeof lastWeightFromState === 'number' && lastWeightFromState >= 0 ? lastWeightFromState : lastSet.weight || 0,
    };

    const updatedSets = [...exercise.sets, newSet];
    const updatedExercise = { ...exercise, sets: updatedSets };
    const updatedRoutine = { ...routine, exercises: routine.exercises.map((ex: Exercise) => ex.id === exerciseId ? updatedExercise : ex) };
    setRoutine(updatedRoutine);

    try {
      const routineToSave = prepareRoutineForSave(updatedRoutine);
      await updateModifiedRoutine(routineToSave);
      await updateRoutine(id, routineToSave);
      success("Serie agregada", 2000);
    } catch (err) {
      error("Error al agregar serie");
      setRoutine(routine);
    }
  }, [routine, workoutState, id, updateRoutine, updateModifiedRoutine, success, error, prepareRoutineForSave]);

  const [isCompletingSet, setIsCompletingSet] = useState(false);
  const handleCompleteSet = useCallback(async (targetSetNumber?: number) => {
    if (!currentExercise || !routine || isCompletingSet) return;
    setIsCompletingSet(true);

    try {
      const exerciseId = currentExercise.id;
      const setNumber = typeof targetSetNumber === "number" ? targetSetNumber : workoutState.currentSet;
      const setIndex = setNumber - 1;

      const isSetAlreadyCompleted = Boolean(workoutState.workoutData.completedSetFlags?.[exerciseId]?.[setIndex]);
      if (isSetAlreadyCompleted) return;

      if (setExecution.setStartTime) {
        const tut = Math.floor((Date.now() - setExecution.setStartTime) / 1000);
        if (tut > 0) workoutState.updateSetDuration(exerciseId, setIndex, tut);
      }

      setExecution.completeSet();

      const repsValue = typeof workoutState.currentReps === "number" ? workoutState.currentReps : currentExercise.sets[setIndex]?.reps || 0;
      const weightValue = typeof workoutState.currentWeight === "number" ? workoutState.currentWeight : currentExercise.sets[setIndex]?.weight || 0;

      const result = completeSetLogic({
        exerciseId,
        setIndex,
        reps: repsValue,
        weight: weightValue,
        isFromQuickMode: false,
      });

      if (!result.success) return;

      if (weightPrediction.weightSuggestion && weightPrediction.weightSuggestion.suggested > weightValue) {
        setPendingToast({ message: `💪 Próxima vez intenta con ${weightPrediction.weightSuggestion.suggested}kg (+${weightPrediction.weightSuggestion.increase}kg)`, duration: 4000 });
      } else if (repsValue >= (currentExercise.sets[setIndex]?.reps || 10)) {
        setPendingToast({ message: `✅ ¡Excelente serie! Completaste todas las repeticiones`, duration: 3000 });
      }

      if (result.nextAction === "finish-workout") {
        const duration = Math.floor((Date.now() - workoutStartTime - totalPausedTime) / 1000);
        completion.openCompletionModal(duration);
      } else if (result.nextAction === "next-exercise") {
        if (!skipRestTimers) {
          timerHandlers.startTimer(result.restTime, result.restTitle, result.nextExerciseName);
        } else {
          const nextIdx = result.nextExerciseIndex;
          if (nextIdx !== null && nextIdx !== undefined) {
            haptic.exerciseChange();
            workoutState.setCurrentExerciseIndex(nextIdx);
            workoutState.setCurrentSet(1);
            const nextExercise = routine.exercises[nextIdx];
            if (nextExercise?.sets[0]) {
              workoutState.setCurrentReps(nextExercise.sets[0].reps);
              workoutState.setCurrentWeight(nextExercise.sets[0].weight || 0);
            }
          }
        }
      } else if (result.nextAction === "next-set") {
        if (!skipRestTimers) {
          timerHandlers.startTimer(result.restTime, result.restTitle);
        } else {
          const newSet = setNumber + 1;
          workoutState.setCurrentSet(newSet);
          const nextSetData = currentExercise.sets[newSet - 1];
          if (nextSetData) {
            const savedWeight = workoutState.workoutData.actualWeights[exerciseId]?.[newSet - 1];
            const prevWeight = workoutState.workoutData.actualWeights[exerciseId]?.[newSet - 2];
            workoutState.setCurrentReps(nextSetData.reps);
            workoutState.setCurrentWeight(savedWeight !== undefined && savedWeight > 0 ? savedWeight : (prevWeight !== undefined && prevWeight > 0 ? prevWeight : nextSetData.weight || 0));
          }
        }
      }
    } finally {
      setIsCompletingSet(false);
    }
  }, [currentExercise, routine, isCompletingSet, workoutState, setExecution, completeSetLogic, weightPrediction.weightSuggestion, setPendingToast, workoutStartTime, totalPausedTime, completion, skipRestTimers, timerHandlers, haptic]);

  return {
    router,
    routine,
    setRoutine,
    originalRoutine,
    setOriginalRoutine,
    isInitialized,
    showStartSplash,
    setShowStartSplash,
    isQuickEditMode,
    setIsQuickEditMode,
    skipRestTimers,
    setSkipRestTimers,
    autoAdvance,
    setAutoAdvance,
    workoutState,
    prepareRoutineForSave,
    showExerciseInfo,
    setShowExerciseInfo,
    selectedExerciseName,
    setSelectedExerciseName,
    exerciseInfo,
    setExerciseInfo,
    loadingExerciseInfo,
    setLoadingExerciseInfo,
    isSeriesTableExpanded,
    setIsSeriesTableExpanded,
    useSmartRest,
    pendingToast,
    setPendingToast,
    userProfile,
    equipment,
    suggestedRoutines,
    selectedSuggestionIndex,
    setSelectedSuggestionIndex,
    preMinutesPerSession,
    setPreMinutesPerSession,
    preRestBetweenSets,
    setPreRestBetweenSets,
    preRestBetweenExercises,
    setPreRestBetweenExercises,
    workoutStartTime,
    setWorkoutStartTime,
    totalPausedTime,
    setTotalPausedTime,
    isPaused,
    setIsPaused,
    pauseStartTime,
    setPauseStartTime,
    elapsedTime,
    setElapsedTime,
    showEditTimeModal,
    setShowEditTimeModal,
    editingTime,
    setEditingTime,
    prInfo,
    setPrInfo,
    exercises,
    currentExercise,
    lastSessionForExercise,
    lastSessionForRoutine,
    smartRestTime,
    lastSetData,
    workoutProgress,
    timerHandlers,
    weightPrediction,
    setExecution,
    tutElapsedQEM,
    completion,
    soundSettingsModal,
    haptic,
    qemTotalSets,
    qemCompletedSets,
    qemProgressPercent,
    qemCurrentExerciseId,
    completeSetLogic,
    handleTimerComplete,
    updateModifiedRoutine,
    updateRoutine,
    id,
    sessions,
    gymLoading,
    success,
    error,
    confirm,
    cancelWorkout,
    hasRoutineChanges,
    handleFinish,
    handleCancelWorkout,
    handlePauseWorkout,
    handleOpenEditTime,
    handleSaveEditedTime,
    handleMoveExercise,
    handleEditReps,
    handleEditWeight,
    handleEditSetType,
    handleEditRestTime,
    handleApplySmartRest,
    handleDeleteSet,
    handleDeleteExercise,
    handleQuickDeleteSet,
    handleToggleSetComplete,
    handleAddSet,
    handleSelectExercise,
    handleRepeatPrevious,
    handleAddExercises,
    handleQuickEditReps,
    handleQuickEditWeight,
    handleQuickEditSetType,
    handleQuickToggleSetComplete,
    handleSkipExercise,
    handleUnskipExercise,
    handleQuickAddSet,
    handleCompleteSet,
  };
}
