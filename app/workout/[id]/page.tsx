"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  lazy,
  Suspense,
  memo,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { useGym } from "@/context/GymContext";
import { useWorkout } from "@/context/WorkoutContext";
import { useToast, useConfirm } from "@/context/NotificationContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { NumericInput } from "@/components/ui/NumericInput";
import { Timer } from "@/components/features/workout/Timer";
import { Timer as TimerIcon, ArrowRight, Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MinimizedTimer } from "@/components/features/workout/MinimizedTimer";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import * as storageService from "@/lib/storage/storage";
import { useWorkoutState } from "./hooks/useWorkoutState";
import { useWorkoutTimer } from "./hooks/useWorkoutTimer";
import { useWeightPrediction } from "./hooks/useWeightPrediction";
import { useSetExecution } from "./hooks/useSetExecution";
import { useWorkoutCompletion } from "./hooks/useWorkoutCompletion";
import { useWorkoutSuggestions } from "./hooks/useWorkoutSuggestions";
import { useWakeLock } from "./hooks/useWakeLock";
import { useHapticFeedback } from "./hooks/useHapticFeedback";
import { CompactWorkoutHeader } from "./components/CompactWorkoutHeader";
import { ExerciseCard as ExerciseCardBase } from "./components/ExerciseCard";
import { ExerciseList } from "./components/ExerciseList";
import { QuickExerciseSwitcher } from "./components/QuickExerciseSwitcher";
import { AddExerciseButton } from "./components/AddExerciseButton";
import { QuickEditMode as QuickEditModeBase } from "./components/QuickEditMode";
import { WorkoutModals } from "./components/WorkoutModals";
import { EditValueModal } from "@/components/shared/EditValueModal";
import SetsReference from "@/components/features/workout/SetsReference";
import {
  SoundSettings,
  useSoundSettingsModal,
} from "@/components/features/settings/SoundSettings";
import type { ExerciseTemplate } from "@/data/exercises";
import type { Exercise } from "@/types";
import type { UserProfile } from "@/types";
import { getExerciseRecommendations } from '@/lib/exercises/exerciseRecommendations';
import { getProfileLocally } from '@/lib/user/localProfile';
import { useEquipment } from '@/context/EquipmentContext';
import { generateRoutine } from '@/lib/routines/routineGenerator';
import { getRoutineStats } from '@/lib/routines/routineEstimation';
import {
  calculateNextRestTime,
  calculateExerciseRestTime,
  calculateSmartRestTime,
  applySmartRestToAllSets,
} from "./services/restCalculationService";
import { saveQueue } from '@/lib/utils/saveQueue';
import {
  getPersonalRecord,
  compareWithRecord,
  type PersonalRecord,
  type RecordComparison,
} from "@/lib/exercises/personalRecords";
import { WorkoutStartSplash } from "@/components/features/workout/WorkoutStartSplash";
import { WorkoutCompleteSplash } from "@/components/features/workout/WorkoutCompleteSplash";
import { PRCelebration } from "@/components/features/workout/PRCelebration";
import { updateRestNotification } from '@/lib/notifications/restNotification';

// ✅ CRÍTICO #1 FIX: Utility para debounce con soporte de cancelación
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;

  const executedFunction = function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };

  executedFunction.cancel = function() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return executedFunction;
}

// Named export for tests that render the page without the default wrapper
export const WorkoutPageImpl = WorkoutPage;

// Lazy load componentes pesados que no se usan inmediatamente
const SeriesTable = lazy(() =>
  import("./components/SeriesTable").then((m) => ({ default: m.SeriesTable })),
);
const ExerciseInfoPanel = lazy(() =>
  import("@/components/features/exercises/ExerciseInfoPanel").then((m) => ({
    default: m.ExerciseInfoPanel,
  })),
);
const SetExecutionModal = lazy(() =>
  import("@/components/features/workout/SetExecutionModal").then((m) => ({
    default: m.SetExecutionModal,
  })),
);

// ✅ CRÍTICO #6 FIX: Import estático en lugar de lazy loading
import { EXERCISE_DATABASE } from "@/data/exercises";

// ✅ Memoización de componentes pesados para evitar re-renders innecesarios
const ExerciseCard = memo(ExerciseCardBase);
const QuickEditMode = memo(QuickEditModeBase);

/**
 * ✅ FASE 2 - Problema #6: Función centralizada para calcular completedSets
 *
 * Calcula el número de series completadas basándose ÚNICAMENTE en actualReps.
 * Una serie está completada si tiene reps > 0.
 *
 * Esto elimina la inconsistencia entre Quick Edit Mode y Guided Mode.
 */
function calculateCompletedSets(actualReps: number[]): number {
  if (!Array.isArray(actualReps)) return 0;
  return actualReps.filter((r: number) => typeof r === "number" && r > 0)
    .length;
}

export default function WorkoutPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const {
    getRoutineById,
    addSession,
    sessions,
    loading: gymLoading,
    updateRoutine,
  } = useGym();
  const [originalRoutine, setOriginalRoutine] = useState<any | null>(null);
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

  // ==================== STATE ====================
  const [routine, setRoutine] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  // Splash animado al iniciar un nuevo entrenamiento (no al restaurar uno guardado)
  const [showStartSplash, setShowStartSplash] = useState(false);

  // Modo de edición: true = Edición Rápida (defecto), false = Modo Guiado
  const [isQuickEditMode, setIsQuickEditMode] = useState(true);
  // Omitir descansos (estado global para que ambos modos lo respeten)
  const [skipRestTimers, setSkipRestTimers] = useState(false);
  // Auto-avance de ejercicio/serie (estado global para Edición Rápida)
  const [autoAdvance, setAutoAdvance] = useState(true);

  // ✅ CRÍTICO #1 FIX: Placeholder para el callback (se define después)
  const handleWorkoutDataChangeRef = useRef<(data: any) => void>(() => {});

  // Inicializar workoutState con callback desde ref
  const workoutState = useWorkoutState(routine || null, {
    onDataChange: (data) => handleWorkoutDataChangeRef.current(data),
  });

  // Preparar la rutina que se va a guardar en backend: preservar los pesos
  // editados durante el entrenamiento (actualWeights) para evitar sobrescribir
  // con valores por defecto al persistir la rutina (replace semantics).
  const prepareRoutineForSave = useCallback(
    (r: any) => {
      try {
        const actualWeightsMap = workoutState?.workoutData?.actualWeights || {};
        const exercises = (r?.exercises || []).map((ex: any) => {
          const exWeights = actualWeightsMap[ex.id] || [];
          const sets = (ex?.sets || []).map((s: any, idx: number) => {
            const aw = exWeights[idx];
            const mergedWeight = aw !== undefined && aw !== null && aw !== 0 ? aw : (s.weight ?? 0);
            return { ...s, weight: mergedWeight };
          });
          return { ...ex, sets };
        });
        return { ...r, exercises };
      } catch (e) {
        return r;
      }
    },
    [workoutState?.workoutData?.actualWeights],
  );
  const [showExerciseInfo, setShowExerciseInfo] = useState(false);
  const [selectedExerciseName, setSelectedExerciseName] = useState<string>("");
  const [exerciseInfo, setExerciseInfo] = useState<any | null>(null);
  const [loadingExerciseInfo, setLoadingExerciseInfo] = useState(false);
  const [isSeriesTableExpanded, setIsSeriesTableExpanded] = useState(false);
  // ✅ CÓDIGO NO USADO: useSmartRest siempre es true, eliminado el setter
  const useSmartRest = true;
  const [pendingToast, setPendingToast] = useState<{
    message: string;
    duration: number;
  } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const equipment = useEquipment();
  const [suggestedRoutines, setSuggestedRoutines] = useState<any[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [preMinutesPerSession, setPreMinutesPerSession] = useState<number>(45);
  const [preRestBetweenSets, setPreRestBetweenSets] = useState<number>(60);
  const [preRestBetweenExercises, setPreRestBetweenExercises] = useState<number>(120);
  const addExerciseAnchorRef = useRef<HTMLDivElement | null>(null);
  // ✅ Estados de récord personal eliminados - no se muestran durante el entrenamiento
  const [workoutStartTime, setWorkoutStartTime] = useState(() => {
    // Solo acceder a localStorage en el cliente
    if (typeof window === "undefined") {
      return Date.now();
    }

    // Intentar leer el tiempo de inicio guardado para evitar el flash
    try {
      const stored = localStorage.getItem("gym-tracker-active-workout");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.startedAt) {
          const startTime = new Date(parsed.startedAt).getTime();
          // console.log(
          //   "[Workout Init] Loaded start time from storage:",
          //   new Date(startTime).toISOString(),
          // );
          return startTime;
        }
      }
    } catch (e) {
      console.warn("[Workout] Could not read stored start time:", e);
    }
    return Date.now();
  });
  const [totalPausedTime, setTotalPausedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showEditTimeModal, setShowEditTimeModal] = useState(false);
  const [editingTime, setEditingTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  
  // Estado para celebración de récord personal (PR)
  const [prInfo, setPrInfo] = useState<{ show: boolean; title: string; subtitle: string }>({ show: false, title: '', subtitle: '' });

  // ✅ CRÍTICO #2 FIX: Cargar info del ejercicio cuando se abre el panel
  useEffect(() => {
    let mounted = true;

    if (showExerciseInfo && selectedExerciseName) {
      // Si ya existe en la DB estática, usarla inmediatamente
      const local = EXERCISE_DATABASE.find(
        (e) => e.name === selectedExerciseName || e.id === selectedExerciseName,
      );
      if (local) {
        setExerciseInfo(local);
        setLoadingExerciseInfo(false);
        return;
      }

      // Si no está, cargar dinámicamente usando los helpers asíncronos
      setLoadingExerciseInfo(true);
      (async () => {
        try {
          const mod = await import("@/data/exercises");
          const byName = await mod.getExerciseByName(selectedExerciseName);
          if (mounted && byName) {
            setExerciseInfo(byName);
            return;
          }

          // Intentar por id como fallback
          const byId = await mod.getExerciseById(selectedExerciseName);
          if (mounted && byId) {
            setExerciseInfo(byId);
            return;
          }
        } catch (err) {
          console.error("[ExerciseInfo] Error loading exercise details", err);
        } finally {
          if (mounted) setLoadingExerciseInfo(false);
        }
      })();
    } else {
      // Limpiar cuando se cierra
      setExerciseInfo(null);
      setLoadingExerciseInfo(false);
    }

    return () => {
      mounted = false;
    };
  }, [showExerciseInfo, selectedExerciseName]);

  // Generar sugerencias de rutinas basadas en el perfil y equipamiento
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
      } catch (err) {
        console.error('[Workout] Error generating suggestions', err);
      } finally {
        if (mounted) setIsGeneratingSuggestions(false);
      }
    }

    loadSuggestions();

    return () => {
      mounted = false;
    };
  }, [userProfile, equipment, preMinutesPerSession]);

  // ✅ CRÍTICO #2 FIX: UN SOLO intervalo para actualizar elapsedTime
  // Consolidado - elimina el intervalo duplicado que estaba en línea ~650
  useEffect(() => {
    if (isPaused) {
      // Si está pausado, no actualizar el tiempo
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - workoutStartTime - totalPausedTime) / 1000,
      );
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [workoutStartTime, totalPausedTime, isPaused]);

  // ==================== COMPUTED VALUES ====================
  // ✅ CRÍTICO #4 FIX: Memoizar exercises con routine.id para evitar re-renders
  const exercises = useMemo(() => routine?.exercises || [], [routine?.exercises]);

  const currentExercise = useMemo(() => {
    if (!exercises.length) return null;
    return exercises[workoutState.currentExerciseIndex] || null;
  }, [exercises, workoutState.currentExerciseIndex]);

  const lastSessionForExercise = useMemo(() => {
    if (!currentExercise || sessions.length === 0) return null;

    const relevantSessions = sessions
      .filter((s) =>
        s.exercises.some((e) => e.exerciseName === currentExercise.name),
      )
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
        (e) => e.exerciseName === currentExercise.name,
      );
      if (
        lastExerciseData &&
        lastExerciseData.actualReps[0] &&
        lastExerciseData.actualWeight[0]
      ) {
        return {
          reps: lastExerciseData.actualReps[0],
          weight: lastExerciseData.actualWeight[0],
        };
      }
    }

    if (currentSetIndex > 0) {
      const prevReps =
        workoutState.workoutData.actualReps[exerciseId]?.[currentSetIndex - 1];
      const prevWeight =
        workoutState.workoutData.actualWeights[exerciseId]?.[
          currentSetIndex - 1
        ];

      if (prevReps && prevWeight) {
        return { reps: prevReps, weight: prevWeight };
      }
    }

    return null;
  }, [
    currentExercise,
    workoutState.currentSet,
    workoutState.workoutData.actualReps,
    workoutState.workoutData.actualWeights,
    lastSessionForExercise,
  ]);

  // ✅ CRÍTICO #4 FIX: Eliminar JSON.stringify y usar conteo directo
  const completedSetsCount = useMemo(
    () =>
      Object.values(workoutState.workoutData.completedSets).reduce(
        (sum: number, count: any) => sum + (count || 0),
        0,
      ),
    [workoutState.workoutData.completedSets],
  );

  // ✅ CRÍTICO #10 FIX: Memoizar cálculo de progreso total con dependencias específicas
  const workoutProgress = useMemo(() => {
    if (!exercises.length) {
      return { totalSets: 0, completedSets: 0, percentage: 0 };
    }

    const totalSets = exercises.reduce(
      (sum: number, ex: Exercise) => sum + ex.sets.length,
      0,
    );
    const completedSets = exercises.reduce((sum: number, ex: Exercise) => {
      const exerciseCompletedSets =
        workoutState.workoutData.completedSets[ex.id] || 0;
      return sum + Math.min(exerciseCompletedSets, ex.sets.length);
    }, 0);
    const percentage =
      totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

    return { totalSets, completedSets, percentage };
  }, [exercises.length, completedSetsCount]); // ✅ Dependencias optimizadas

  // ==================== CUSTOM HOOKS ====================
  const handleTimerCompleteRef = useRef(() => {});
  const timerHandlers = useWorkoutTimer(() => handleTimerCompleteRef.current());

  // ✅ Ref para timerHandlers (evita recrear debouncedSave en cada render)
  const timerHandlersRef = useRef(timerHandlers);
  useEffect(() => {
    timerHandlersRef.current = timerHandlers;
  }, [timerHandlers]);

  // Escuchar acciones desde la notificación (vía Service Worker)
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    const onMessage = (event: any) => {
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

    navigator.serviceWorker.addEventListener('message', onMessage as any);
    return () => navigator.serviceWorker.removeEventListener('message', onMessage as any);
  }, []);

  // ✅ Refs para currentExerciseIndex y currentSet (evitan que debouncedSave se
  // recree al completar series, lo que cancelaría timers de persistencia legítimos)
  const currentExerciseIndexRef = useRef(workoutState.currentExerciseIndex);
  const currentSetRef = useRef(workoutState.currentSet);
  useEffect(() => {
    currentExerciseIndexRef.current = workoutState.currentExerciseIndex;
  }, [workoutState.currentExerciseIndex]);
  useEffect(() => {
    currentSetRef.current = workoutState.currentSet;
  }, [workoutState.currentSet]);

  // ✅ CRÍTICO #1 FIX: Debounced save para evitar guardados excesivos
  const debouncedSave = useMemo(
    () =>
      debounce((data: any) => {
        if (!routine || !isInitialized) {
          // console.log(
          //   "[Workout] ⏸️ Skipping save - not initialized or no routine",
          // );
          return;
        }

        // console.log("[Workout] 💾 Saving workout data (debounced):", data);

        const th = timerHandlersRef.current;
        updateWorkoutProgress(
          currentExerciseIndexRef.current,
          currentSetRef.current,
          data.completedSets,
          data.actualReps,
          data.actualWeights,
          th.showTimer
            ? {
                isResting: true,
                restTimerDuration: th.timerDuration,
                restTimerTitle: th.timerTitle,
                restTimerNextExercise: th.nextExerciseName,
                restTimerStartedAt: Date.now(),
              }
            : undefined,
          totalPausedTime,
          {
            setTypes: data.setTypes,
            restOverrides: data.restOverrides,
            perSetRestOverrides: data.perSetRestOverrides,
            skippedExercises: data.skippedExercises,
          },
        );
      }, 500), // Guardar máximo cada 500ms
    [
      routine,
      isInitialized,
      updateWorkoutProgress,
      totalPausedTime,
      // currentExerciseIndex y currentSet eliminados de deps — se leen via refs
      // para evitar que debouncedSave se recree (y cancele timers de persistencia)
      // al completar una serie en modo rápido
      // timerHandlers eliminado de deps — se lee via timerHandlersRef para evitar recreaciones en cada render
    ],
  );

  // ✅ Cancelar timer pendiente cuando debouncedSave es recreado (evita guardar datos obsoletos)
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  // ✅ Crear el callback de guardado usando useCallback
  const handleWorkoutDataChange = useCallback(
    (data: any) => {
      debouncedSave(data);
    },
    [debouncedSave],
  );

  // ✅ CRÍTICO #1 FIX: Actualizar la ref para que workoutState use el callback actualizado
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

  const setExecution = useSetExecution({
    onSetStart: () => haptic.setStart(),
  });

  // TUT (Tiempo Bajo Tensión) para el header de Edición Rápida
  const [tutElapsedQEM, setTutElapsedQEM] = useState(0);
  useEffect(() => {
    if (!isQuickEditMode || !setExecution.isExecutingSet || !setExecution.setStartTime) {
      setTutElapsedQEM(0);
      return;
    }
    const tick = () => setTutElapsedQEM(Math.floor((Date.now() - setExecution.setStartTime!) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isQuickEditMode, setExecution.isExecutingSet, setExecution.setStartTime]);

  // Debug: Log setExecution state changes
  // useEffect(() => {
  //   console.log('[Workout] setExecution state:', {
  //     showSetExecution: setExecution.showSetExecution,
  //     isExecutingSet: setExecution.isExecutingSet
  //   });
  // }, [setExecution.showSetExecution, setExecution.isExecutingSet]);

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

  // ✨ NEW: Hook para configuración de sonidos
  const soundSettingsModal = useSoundSettingsModal();

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
    onError: error,
  });

  // Wake Lock para mantener la pantalla activa
  const wakeLock = useWakeLock();
  const { isSupported: wakeLockSupported, requestWakeLock, releaseWakeLock } = wakeLock;

  // Haptic Feedback mejorado
  const haptic = useHapticFeedback();

  // Valores computados para el header sticky de Edición Rápida
  const qemTotalSets = useMemo(() => {
    if (!routine) return 1;
    return routine.exercises.reduce((sum: number, ex: Exercise) => sum + ex.sets.length, 0) || 1;
  }, [routine]);
  const qemCompletedSets = useMemo(
    () =>
      Object.values(workoutState.workoutData.completedSets || {}).reduce(
        (sum: number, n: unknown) => sum + ((n as number) || 0),
        0,
      ),
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

  // ==================== INITIALIZATION ====================
  // ✅ CRÍTICO #9 FIX: Estado consolidado para inicialización
  const [initState, setInitState] = useState({
    lastRoutineId: null as string | null,
    hasLoadedModified: false,
    isInitialized: false,
  });

  useEffect(() => {
    if (gymLoading) return;

    // ✅ Resetear el estado cuando cambia el id del workout
    if (initState.lastRoutineId !== id) {
      setInitState({
        lastRoutineId: id,
        hasLoadedModified: false,
        isInitialized: false,
      });
    }

    let mounted = true;

    const initializeWorkout = async () => {
      // ✅ Priorizar la rutina modificada del activeWorkout si existe
      // Solo cargar una vez para evitar loops
      let foundRoutine = null;

      if (activeWorkout?.modifiedRoutine && !initState.hasLoadedModified) {
        foundRoutine = activeWorkout.modifiedRoutine;
        setInitState((prev) => ({ ...prev, hasLoadedModified: true }));
      }

      if (!foundRoutine) {
        foundRoutine = getRoutineById(id);
      }

      // Guardar una copia de la rutina original para detectar cambios
      try {
        const canonical = getRoutineById(id);
        setOriginalRoutine(canonical ? JSON.parse(JSON.stringify(canonical)) : null);
      } catch (e) {
        setOriginalRoutine(null);
      }

      if (!foundRoutine) {
        router.push("/routines");
        return;
      }

      if (!mounted) return;

      // Optimización: Preparar rutina con defaults de forma más eficiente
      const routineWithDefaults = {
        ...foundRoutine,
        exercises: foundRoutine.exercises.map((ex: any) => ({
          ...ex,
          useSmartRest: ex.useSmartRest ?? true,
        })),
      };

      setRoutine(routineWithDefaults);

      // Optimización: Leer storage de forma síncrona si es posible
      const storedWorkout = await storageService.getActiveWorkout();

      if (!mounted) return;

      if (storedWorkout && storedWorkout.routineId === id) {
        const s = storedWorkout as any;

        // console.log("[Init] 📦 Restoring workout from storage:", s);

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

        // ✅ NUEVO: Usar restoreData() para restaurar todos los datos de una vez
        // Esto agrega el timestamp _lastUpdate para que se detecte el cambio
        const restoredData = {
          completedSets: s.completedSets || {},
          actualReps: s.actualReps || {},
          actualWeights: s.actualWeights || {},
          setTypes: s.setTypes || {},
          restOverrides: s.restOverrides || {},
          perSetRestOverrides: s.perSetRestOverrides || {},
          actualSetDurations: s.actualSetDurations || {},
          actualPauseDurations: s.actualPauseDurations || {},
          actualRestTimes: s.actualRestTimes || {},
          lastWeights: s.lastWeights || {},
          skippedExercises: Array.isArray(s.skippedExercises) ? s.skippedExercises : [],
        };

        // console.log("[Init] ✅ Restored data prepared:", restoredData);
        workoutState.restoreData(restoredData);

        // Restaurar timer si estaba en descanso
        if (s.isResting && s.restTimerDuration && s.restTimerStartedAt) {
          const elapsed = Math.floor(
            (Date.now() - Number(s.restTimerStartedAt)) / 1000,
          );
          const remaining = Number(s.restTimerDuration) - elapsed;
          if (remaining > 0) {
            timerHandlers.startTimer(
              remaining,
              String(s.restTimerTitle || "Descanso"),
              s.restTimerNextExercise
                ? String(s.restTimerNextExercise)
                : undefined,
            );
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
        // console.log("[Init] Initialization complete");
        // Mostrar splash si startWorkout fue llamado hace menos de 8s
        // (cubre navegación desde rutinas, planificador, asistente IA, etc.)
        try {
          const ts = sessionStorage.getItem('workout_splash_ts');
          if (ts && Date.now() - parseInt(ts) < 8000) {
            setShowStartSplash(true);
            sessionStorage.removeItem('workout_splash_ts');
          }
        } catch {}
      }
    };

    initializeWorkout();

    return () => {
      mounted = false;
    };
  }, [id, gymLoading, initState.lastRoutineId, initState.hasLoadedModified]);

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (!currentExercise || !isInitialized) return;

    const exerciseId = currentExercise.id;
    const setIndex = workoutState.currentSet - 1;

    const actualReps =
      workoutState.workoutData.actualReps[exerciseId]?.[setIndex];
    const actualWeight =
      workoutState.workoutData.actualWeights[exerciseId]?.[setIndex];

    const repsToShow =
      actualReps !== undefined && actualReps !== 0
        ? actualReps
        : currentExercise.sets[setIndex]?.reps || 0;

    const weightToShow =
      actualWeight !== undefined && actualWeight !== 0
        ? actualWeight
        : currentExercise.sets[setIndex]?.weight || 0;

    if (workoutState.currentReps !== repsToShow) {
      workoutState.setCurrentReps(repsToShow);
    }
    if (workoutState.currentWeight !== weightToShow) {
      workoutState.setCurrentWeight(weightToShow);
    }
  }, [
    currentExercise,
    workoutState.currentSet,
    workoutState.workoutData.actualReps,
    workoutState.workoutData.actualWeights,
    isInitialized,
  ]);

  // ✅ ELIMINADO: El efecto de sincronización ya no es necesario
  // El guardado ahora se hace directamente en los callbacks del hook (completeSet, updateActualReps, etc.)
  // Esto evita guardados duplicados y asegura que los datos se persistan inmediatamente

  useEffect(() => {
    if (timerHandlers.showTimer) {
      document.body.classList.add("hide-navbar");
    } else {
      document.body.classList.remove("hide-navbar");
    }

    return () => {
      document.body.classList.remove("hide-navbar");
    };
  }, [timerHandlers.showTimer]);

  // RC-1: Si el usuario activa "omitir descansos" mientras un timer está corriendo,
  // detenerlo inmediatamente para evitar que handleTimerComplete avance el estado
  // de forma inesperada después de que el usuario ya avanzó manualmente.
  useEffect(() => {
    if (skipRestTimers && timerHandlers.showTimer) {
      timerHandlers.stopTimer();
      clearRestState();
    }
    // Intencionalmente solo reacciona al cambio de skipRestTimers, no al timer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipRestTimers]);

  // ✅ CRÍTICO #7 FIX: Dividir useEffect gigante en efectos específicos

  // Efecto 1: Sincronizar currentSet cuando se completan todas las series en modo guiado
  // ⚠️ NO modificar currentSet cuando el timer está activo: el timer complete lo hace y esto generaría un doble avance
  useEffect(() => {
    if (!isQuickEditMode && currentExercise && isInitialized && !timerHandlers.showTimer) {
      const exerciseId = currentExercise.id;
      const actualReps = workoutState.workoutData.actualReps[exerciseId] || [];
      const completedCount = actualReps.filter(
        (r: number) => typeof r === "number" && r > 0,
      ).length;

      // Sincronizar currentSet con la primera serie incompleta
      const nextIncompleteIndex = actualReps.findIndex(
        (r: number) => !r || r === 0,
      );
      const nextSet =
        nextIncompleteIndex !== -1
          ? nextIncompleteIndex + 1
          : completedCount + 1;

      if (
        nextSet !== workoutState.currentSet &&
        nextSet <= currentExercise.sets.length
      ) {
        workoutState.setCurrentSet(nextSet);

        // Cargar datos de la serie actual
        const nextSetData = currentExercise.sets[nextSet - 1];
        if (nextSetData) {
          const savedReps = actualReps[nextSet - 1];
          const savedWeight =
            workoutState.workoutData.actualWeights[exerciseId]?.[nextSet - 1];

          workoutState.setCurrentReps(
            savedReps && savedReps > 0 ? savedReps : nextSetData.reps,
          );
          workoutState.setCurrentWeight(
            savedWeight !== undefined ? savedWeight : nextSetData.weight || 0,
          );
        }
      }
    }
  }, [
    isQuickEditMode,
    currentExercise?.id,
    isInitialized,
    timerHandlers.showTimer,
    workoutState.currentSet,
    workoutState.workoutData.actualReps,
    workoutState.workoutData.actualWeights,
  ]);

  // Efecto 2: Manejar completación de ejercicio en modo guiado
  // ⚠️ NO avanzar al siguiente ejercicio cuando el timer está activo: el timer complete lo hace y esto generaría un doble avance
  useEffect(() => {
    if (!isQuickEditMode && currentExercise && isInitialized && routine && !timerHandlers.showTimer) {
      const exerciseId = currentExercise.id;
      const actualReps = workoutState.workoutData.actualReps[exerciseId] || [];
      const completedCount = actualReps.filter(
        (r: number) => typeof r === "number" && r > 0,
      ).length;
      const hasCompletedAllSets = completedCount >= currentExercise.sets.length;

      if (hasCompletedAllSets) {
        // Verificar si hay algún ejercicio activo (no omitido) después del actual
        const skippedIdsEff = workoutState.workoutData.skippedExercises || [];
        const hasNextActiveExercise = routine.exercises
          .slice(workoutState.currentExerciseIndex + 1)
          .some((ex: Exercise) => !skippedIdsEff.includes(ex.id));
        const isLastExercise = !hasNextActiveExercise;

        if (isLastExercise) {
          // Último ejercicio activo completado - no abrir modal automáticamente.
          // El modal solo se abre cuando el usuario pulsa explícitamente "Completar".
        } else {
          // Avanzar al siguiente ejercicio activo (saltando los omitidos)
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
  }, [
    isQuickEditMode,
    currentExercise?.id,
    isInitialized,
    routine?.exercises,
    workoutState.currentExerciseIndex,
    workoutState.workoutData.actualReps,
    workoutStartTime,
    totalPausedTime,
    timerHandlers.showTimer,
    completion.showNotesModal,
  ]);

  // ✅ CRÍTICO #7 FIX: Efecto 3 - Limpiar datos residuales de series eliminadas
  useEffect(() => {
    if (!routine || !isInitialized || !currentExercise) return;

    let hasChanges = false;

    routine.exercises.forEach((exercise: Exercise) => {
      const exerciseId = exercise.id;
      const maxSets = exercise.sets.length;

      // Limpiar actualReps si excede el número de series
      const currentReps = workoutState.workoutData.actualReps[exerciseId];
      if (currentReps && currentReps.length > maxSets) {
        // console.log(
        //   `[Cleanup] Trimming actualReps for ${exerciseId} from ${currentReps.length} to ${maxSets}`,
        // );
        workoutState.updateActualReps(
          exerciseId,
          currentReps.slice(0, maxSets),
        );
        hasChanges = true;
      }

      // Limpiar actualWeights si excede el número de series
      const currentWeights = workoutState.workoutData.actualWeights[exerciseId];
      if (currentWeights && currentWeights.length > maxSets) {
        // console.log(
        //   `[Cleanup] Trimming actualWeights for ${exerciseId} from ${currentWeights.length} to ${maxSets}`,
        // );
        workoutState.updateActualWeights(
          exerciseId,
          currentWeights.slice(0, maxSets),
        );
        hasChanges = true;
      }
    });

    if (hasChanges) {
      // console.log("[Cleanup] Data inconsistencies were corrected");
    }
  }, [
    routine?.exercises,
    isInitialized,
    currentExercise?.id,
    workoutState.workoutData.actualReps,
    workoutState.workoutData.actualWeights,
  ]);

  // ✅ CRÍTICO #7 FIX: Efecto 4 - Corregir currentSet si está fuera de rango
  useEffect(() => {
    if (!currentExercise || !isInitialized) return;

    const maxSets = currentExercise.sets.length;

    if (workoutState.currentSet > maxSets) {
      // console.log(
      //   `[Cleanup] Correcting currentSet from ${workoutState.currentSet} to ${maxSets}`,
      // );
      workoutState.setCurrentSet(maxSets);
    } else if (workoutState.currentSet < 1) {
      // console.log(
      //   `[Cleanup] Correcting currentSet from ${workoutState.currentSet} to 1`,
      // );
      workoutState.setCurrentSet(1);
    }
  }, [
    currentExercise?.id,
    currentExercise?.sets.length,
    workoutState.currentSet,
    isInitialized,
  ]);

  // Activar Wake Lock cuando el entrenamiento está activo
  useEffect(() => {
    if (!isInitialized || !wakeLockSupported) return;

    let mounted = true;

    (async () => {
      try {
        const activated = await requestWakeLock();
        if (activated && mounted) {
          success("🔋 Pantalla activa durante el entrenamiento", 2000);
        }
      } catch (err) {
        console.error('[Workout] WakeLock request failed:', err);
      }
    })();

    // Liberar wake lock al salir (no await en cleanup)
    return () => {
      mounted = false;
      void releaseWakeLock();
    };
  }, [isInitialized, wakeLockSupported, requestWakeLock, releaseWakeLock, success]);

  useEffect(() => {
    // Defer closing the series table to the next tick to avoid synchronous setState within an effect
    const timer = setTimeout(() => {
      setIsSeriesTableExpanded(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [workoutState.currentExerciseIndex]);
  
  // Detectar si la rutina actual difiere de la original (cambios en sets/pesos/orden)
  // Ahora también considera los valores editados durante la sesión (`workoutState.workoutData`)
  const hasRoutineChanges = useCallback((orig: any | null, curr: any | null) => {
    if (!orig || !curr) return false;
    const origEx = orig.exercises || [];
    const currEx = curr.exercises || [];
    if (origEx.length !== currEx.length) return true;

    const sessionReps = workoutState.workoutData.actualReps || {};
    const sessionWeights = workoutState.workoutData.actualWeights || {};

    for (const ce of currEx) {
      const oe = origEx.find((e: any) => e.id === ce.id);
      if (!oe) return true; // ejercicio nuevo

      const origSets = oe.sets || [];
      const currSets = ce.sets || [];
      if (origSets.length !== currSets.length) return true;

      for (let i = 0; i < currSets.length; i++) {
        const os = origSets[i] || {};
        const cs = currSets[i] || {};

        // Preferir valores editados en sesión si existen, sino usar los de la rutina `curr`
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
          message:
            "Has modificado pesos/series durante el entrenamiento. ¿Deseas actualizar la rutina original con estos cambios?",
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
              exercises: routine.exercises.map((ex: any) => {
                const exReps = sessionReps[ex.id] || [];
                const exWeights = sessionWeights[ex.id] || [];
                
                return {
                  id: ex.id,
                  name: ex.name,
                  sets: ex.sets.map((s: any, idx: number) => {
                    const finalReps = exReps[idx] !== undefined && exReps[idx] > 0 ? exReps[idx] : s.reps;
                    const finalWeight = exWeights[idx] !== undefined && exWeights[idx] > 0 ? exWeights[idx] : (s.weight || 0);
                    
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
            console.error("Error updating routine:", err);
            error("No se pudo actualizar la rutina");
          }
        }
      }

      try {
        await saveQueue.flush();
      } catch (e) {
        // No bloquear la finalización si el flush falla
        // Log en consola para diagnóstico
        // eslint-disable-next-line no-console
        console.warn('[workout] saveQueue.flush failed', e);
      }
      await completion.finishWorkout(workoutState.workoutData, confirmedDuration);
    } catch (err) {
      console.error("Error finishing workout:", err);
      error("Error al finalizar el entrenamiento");
    }
  }, [
    originalRoutine,
    routine,
    hasRoutineChanges,
    confirm,
    updateRoutine,
    id,
    success,
    error,
    completion,
    workoutState,
  ]);

  useEffect(() => {
    if (!timerHandlers.showTimer && pendingToast) {
      const timer = setTimeout(() => {
        success(pendingToast.message, pendingToast.duration);
        setPendingToast(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [timerHandlers.showTimer, pendingToast, success]);

  // Refs para leer valores sin incluirlos como dependencias del efecto de predicción.
  // Esto evita que la predicción sobreescriba el peso editado manualmente por el usuario.
  const currentWeightRef = useRef<number | ''>(workoutState.currentWeight);
  currentWeightRef.current = workoutState.currentWeight;
  const weightPredictionRef = useRef(weightPrediction);
  weightPredictionRef.current = weightPrediction;

  useEffect(() => {
    if (!currentExercise || !isInitialized) return;

    const currentWeightValue =
      typeof currentWeightRef.current === "number"
        ? currentWeightRef.current
        : 0;
    const prediction = weightPredictionRef.current.predictWeightForSet(currentWeightValue);

    if (prediction.weight !== currentWeightRef.current) {
      workoutState.setCurrentWeight(prediction.weight);

      if (prediction.reasoning) {
        success(`💡 ${prediction.reasoning}`, 3000);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentExercise?.id,
    workoutState.currentSet,
    isInitialized,
    // workoutState.currentWeight omitido intencionalmente: se lee desde ref.
    // Si estuviera en deps, re-ejecutaría al escribir el usuario y podría reemplazar su valor.
  ]);

  // ==================== HANDLERS ====================
  // ✅ CRÍTICO #5 FIX: Función consolidada para completar series
  // Elimina duplicación entre handleCompleteSet y handleQuickToggleSetComplete
  const completeSetLogic = useCallback(
    (params: {
      exerciseId: string;
      setIndex: number;
      reps: number;
      weight: number;
      isFromQuickMode?: boolean;
    }) => {
      const {
        exerciseId,
        setIndex,
        reps,
        weight,
        isFromQuickMode = false,
      } = params;

      // console.log("[completeSetLogic] Completing set:", params);

      // Validar datos: exigir al menos repeticiones (peso puede ser 0 para ejercicios corporales)
      if (!(reps > 0)) {
        error("No puedes completar la serie sin repeticiones");
        return {
          success: false,
          reason: "invalid-data",
          nextAction: "none" as const,
        };
      }

      // CRITICAL BUG FIX: Read exercise data BEFORE calling completeSetAt.
      // completeSetAt updates state asynchronously (setWorkoutData), so
      // reading from getExerciseData() after the call returns stale data
      // from workoutDataRef (only synced on next render via useEffect).
      const exercise = routine?.exercises.find(
        (ex: Exercise) => ex.id === exerciseId,
      );
      if (!exercise || !routine) {
        return {
          success: false,
          reason: "exercise-not-found",
          nextAction: "none" as const,
        };
      }

      // Capture pre-update state and simulate the local data we need
      const prevExerciseData = workoutState.getExerciseData(exerciseId);
      const actualRepsLocal = Array.isArray(prevExerciseData.actualReps)
        ? [...prevExerciseData.actualReps]
        : [];
      // Asegurar longitud suficiente
      while (actualRepsLocal.length <= setIndex) actualRepsLocal.push(0);
      actualRepsLocal[setIndex] = reps;

      const completedCount = actualRepsLocal.filter(
        (r: number) => typeof r === "number" && r > 0,
      ).length;

      // Leer datos antes de completeSetAt (el estado queda stale tras el update)
      const skippedIds = workoutState.workoutData.skippedExercises || [];
      const { restOverrides, perSetRestOverrides: perSetOverrides } = workoutState.workoutData;

      // Now update state (async — won't be reflected until next render)
      workoutState.completeSetAt(exerciseId, setIndex, reps, weight);

      // Feedback háptico
      if (isFromQuickMode) {
        haptic.success();
      } else {
        haptic.setComplete();
      }
      const isLastSetOfExercise = completedCount >= exercise.sets.length;
      const exerciseIndex = routine.exercises.findIndex(
        (ex: Exercise) => ex.id === exerciseId,
      );
      // Encontrar el siguiente ejercicio activo (ignorando los omitidos)
      let nextExerciseIdx: number | null = null;
      for (let i = exerciseIndex + 1; i < routine.exercises.length; i++) {
        if (!skippedIds.includes(routine.exercises[i].id)) {
          nextExerciseIdx = i;
          break;
        }
      }
      const isLastExercise = nextExerciseIdx === null;

      // Determinar el tipo de descanso y siguiente acción
      let nextAction: "next-set" | "next-exercise" | "finish-workout" | "none" =
        "none";
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
          restTime = calculateExerciseRestTime({
            currentExercise: exercise,
            nextExercise,
            routine,
            restOverrides,
            perSetOverrides,
            useSmartRest,
          });
          restTitle = "Descanso entre ejercicios";

          // Haptic feedback para cambio de ejercicio
          haptic.restStart();
        }
      } else {
        nextAction = "next-set";
        restTime = calculateNextRestTime({
          currentExercise: exercise,
          routine,
          restOverrides: workoutState.workoutData.restOverrides,
          perSetOverrides: workoutState.workoutData.perSetRestOverrides,
          currentSet: setIndex + 1,
          useSmartRest,
        });

        if (isFromQuickMode) {
          // Para quick mode, calcular el número de la siguiente serie usando la copia local
          const nextIncompleteIndex = actualRepsLocal.findIndex(
            (r, idx) => idx > setIndex && (!r || r === 0),
          );
          const nextSetNumber =
            nextIncompleteIndex !== -1 ? nextIncompleteIndex + 1 : setIndex + 2;
          restTitle = `Descanso - ${exercise.name}`;
          nextExerciseName = `Serie ${nextSetNumber}`;
        } else {
          // Para modo guiado
          restTitle = `Descanso - Serie ${setIndex + 2}/${exercise.sets.length}`;
        }

        // Haptic feedback para descanso entre series
        haptic.restStart();
      }

      return {
        success: true,
        nextAction,
        restTime,
        restTitle,
        nextExerciseName,
        isLastSetOfExercise,
        isLastExercise,
        exerciseIndex,
        nextExerciseIndex: nextExerciseIdx,
      };
    },
    [workoutState, routine, error, haptic, useSmartRest],
  );

  // ✅ Función de récord personal eliminada - no se muestran durante el entrenamiento
  // Los récords aún se calculan y guardan, simplemente no se celebran en tiempo real

  // ✅ CRÍTICO #8 FIX: Reemplazar lock manual con estado
  const [isCompletingSet, setIsCompletingSet] = useState(false);

  const handleCompleteSet = useCallback(async (targetSetNumber?: number) => {
    if (!currentExercise || !routine) return;

    // Prevenir doble-completación
    if (isCompletingSet) return;

    setIsCompletingSet(true);

    try {
      const exerciseId = currentExercise.id;
      const setNumber =
        typeof targetSetNumber === "number"
          ? targetSetNumber
          : workoutState.currentSet;
      const setIndex = setNumber - 1;

      // Verificar si esta serie ya está completada
      const existingReps =
        workoutState.workoutData.actualReps[exerciseId]?.[setIndex];
      if (existingReps && existingReps > 0) {
        // console.log("[Workout] Serie ya completada, ignorando");
        return;
      }

      // Guardar TUT (Tiempo Bajo Tensión) antes de resetear el timer
      if (setExecution.setStartTime) {
        const tut = Math.floor((Date.now() - setExecution.setStartTime) / 1000);
        if (tut > 0) {
          workoutState.updateSetDuration(exerciseId, setIndex, tut);
        }
      }

      // Resetear el timer de serie al completar
      setExecution.completeSet();

      const repsValue =
        typeof workoutState.currentReps === "number"
          ? workoutState.currentReps
          : currentExercise.sets[setIndex]?.reps || 0;
      const weightValue =
        typeof workoutState.currentWeight === "number"
          ? workoutState.currentWeight
          : currentExercise.sets[setIndex]?.weight || 0;

      // ✅ Usar función consolidada
      const result = completeSetLogic({
        exerciseId,
        setIndex,
        reps: repsValue,
        weight: weightValue,
        isFromQuickMode: false,
      });

      if (!result.success) {
        return;
      }

      // Mostrar sugerencias de peso
      if (
        weightPrediction.weightSuggestion &&
        weightPrediction.weightSuggestion.suggested > weightValue
      ) {
        setPendingToast({
          message: `💪 Próxima vez intenta con ${weightPrediction.weightSuggestion.suggested}kg (+${weightPrediction.weightSuggestion.increase}kg)`,
          duration: 4000,
        });
      } else if (repsValue >= (currentExercise.sets[setIndex]?.reps || 10)) {
        setPendingToast({
          message: `✅ ¡Excelente serie! Completaste todas las repeticiones`,
          duration: 3000,
        });
      }

      // Manejar siguiente acción
      if (result.nextAction === "finish-workout") {
        const duration = Math.floor(
          (Date.now() - workoutStartTime - totalPausedTime) / 1000,
        );
        completion.openCompletionModal(duration);
      } else if (result.nextAction === "next-exercise") {
        // Respetar la opción global de omitir descansos
        if (!skipRestTimers) {
          timerHandlers.startTimer(
            result.restTime,
            result.restTitle,
            result.nextExerciseName,
          );
        } else {
          // Sin timer: avanzar directamente al siguiente ejercicio activo (saltando omitidos)
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
        // Respetar la opción global de omitir descansos
        if (!skipRestTimers) {
          timerHandlers.startTimer(result.restTime, result.restTitle);
        } else {
          // Sin timer: avanzar directamente a la siguiente serie
          // Usar setNumber (el índice explícito pasado al handler) para evitar valor stale del closure
          const newSet = setNumber + 1;
          workoutState.setCurrentSet(newSet);
          const nextSetData = currentExercise.sets[newSet - 1];
          if (nextSetData) {
            workoutState.setCurrentReps(nextSetData.reps);
            workoutState.setCurrentWeight(nextSetData.weight || 0);
          }
        }
      }
    } finally {
      setIsCompletingSet(false);
    }
  }, [
    currentExercise,
    routine,
    isCompletingSet,
    workoutState,
    setExecution,
    completeSetLogic,
    weightPrediction.weightSuggestion,
    setPendingToast,
    workoutStartTime,
    totalPausedTime,
    completion.openCompletionModal,
    skipRestTimers,
    timerHandlers,
    haptic.exerciseChange,
  ]);

  const handleTimerComplete = useCallback(() => {
    timerHandlers.stopTimer();
    clearRestState();

    // Haptic feedback al terminar descanso
    haptic.restComplete();

    if (!currentExercise || !routine) return;

    const exerciseId = currentExercise.id;
    // RC-3: Leer desde ref (no desde estado React) para obtener el valor más reciente.
    // workoutData.completedSets puede estar desactualizado si el estado cambió
    // mientras el timer estaba corriendo (e.g. usuario marcó sets manualmente).
    const { completedSets: completedCount } =
      workoutState.getExerciseData(exerciseId);
    const totalSets = currentExercise.sets.length;
    const isLastSet = completedCount >= totalSets;
    // Verificar si hay algún ejercicio activo (no omitido) después del actual
    const skippedIdsTimer = workoutState.workoutData.skippedExercises || [];
    const hasNextActive = routine.exercises
      .slice(workoutState.currentExerciseIndex + 1)
      .some((ex: Exercise) => !skippedIdsTimer.includes(ex.id));
    const isLastExercise = !hasNextActive;

    if (isLastSet && isLastExercise) {
      // Último set del último ejercicio activo tras el descanso.
      // No abrir modal automáticamente; el usuario debe pulsar "Completar" explícitamente.
    } else if (isLastSet && !isLastExercise) {
      // Buscar el primer ejercicio activo (no omitido) después del actual
      let nextIndex: number | null = null;
      for (let i = workoutState.currentExerciseIndex + 1; i < routine.exercises.length; i++) {
        if (!skippedIdsTimer.includes(routine.exercises[i].id)) {
          nextIndex = i;
          break;
        }
      }
      if (nextIndex !== null) {
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
      // ✅ FIX: usar completedCount + 1 en lugar de currentSet + 1.
      // En modo Quick, handleQuickToggleSetComplete ya avanzó currentSet
      // al próximo incompleto, así que currentSet + 1 sobrepassaría por uno.
      // completedCount + 1 siempre apunta a la siguiente serie sin importar el modo.
      const newSet = completedCount + 1;
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
    clearRestState,
    timerHandlers,
    haptic,
    setExecution,
  ]);

  useEffect(() => {
    // keep the ref updated so the timer hook can call the latest handler
    handleTimerCompleteRef.current = handleTimerComplete;
  }, [handleTimerComplete]);

  const handleCancelWorkout = useCallback(async () => {
    const confirmed = await confirm({
      title: "Cancelar entrenamiento",
      message:
        "¿Estás seguro de que quieres cancelar el entrenamiento? Se perderá todo el progreso.",
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
      // Reanudar
      if (pauseStartTime) {
        const pauseDuration = Date.now() - pauseStartTime;
        setTotalPausedTime((prev) => prev + pauseDuration);
        // console.log(
        //   "[Workout] Resuming - pause duration:",
        //   Math.floor(pauseDuration / 1000),
        //   "seconds",
        // );
      }
      setIsPaused(false);
      setPauseStartTime(null);
      success("⏯️ Entrenamiento reanudado", 2000);
    } else {
      // Pausar
      setPauseStartTime(Date.now());
      setIsPaused(true);
      // console.log("[Workout] Paused at:", new Date().toISOString());
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
    const newElapsedSeconds =
      editingTime.hours * 3600 + editingTime.minutes * 60 + editingTime.seconds;

    // Ajustar workoutStartTime y totalPausedTime para que elapsedTime sea el nuevo valor
    const now = Date.now();
    const newStartTime = now - newElapsedSeconds * 1000;
    setWorkoutStartTime(newStartTime);
    setTotalPausedTime(0);
    setElapsedTime(newElapsedSeconds);

    setShowEditTimeModal(false);
    success("⏱️ Tiempo actualizado", 2000);
  }, [editingTime, success]);

  const handleMoveExercise = useCallback(
    async (fromIndex: number, toIndex: number) => {
      if (!routine || fromIndex === toIndex) return;

      const prevRoutine = routine;
      const prevCurrentIndex = workoutState.currentExerciseIndex;

      const newExercises = [...routine.exercises];
      const [movedExercise] = newExercises.splice(fromIndex, 1);
      newExercises.splice(toIndex, 0, movedExercise);

      const updatedRoutine = { ...routine, exercises: newExercises };

      // Aplicar cambio localmente primero para respuesta instantánea
      setRoutine(updatedRoutine);

      // Ajustar índice actual en memoria (se revertirá si falla la persistencia)
      if (prevCurrentIndex === fromIndex) {
        workoutState.setCurrentExerciseIndex(toIndex);
      } else if (fromIndex < prevCurrentIndex && toIndex >= prevCurrentIndex) {
        workoutState.setCurrentExerciseIndex(prevCurrentIndex - 1);
      } else if (fromIndex > prevCurrentIndex && toIndex <= prevCurrentIndex) {
        workoutState.setCurrentExerciseIndex(prevCurrentIndex + 1);
      }

      try {
        // Persistir la rutina modificada (updateModifiedRoutine también actualiza Supabase)
        const routineToSave = prepareRoutineForSave(updatedRoutine);
        await updateModifiedRoutine(routineToSave);
        // Redundancia: asegurar que la rutina esté en el backend
        await updateRoutine(id, routineToSave);

        success("Orden de ejercicios actualizado", 2000);
      } catch (err) {
        console.error("[handleMoveExercise] Error saving moved exercise:", err);
        error("Error al reordenar ejercicios");
        // Revertir cambios locales
        setRoutine(prevRoutine);
        workoutState.setCurrentExerciseIndex(prevCurrentIndex);
      }
    },
    [
      routine,
      workoutState,
      updateModifiedRoutine,
      updateRoutine,
      id,
      success,
      error,
    ],
  );

  const handleEditReps = useCallback(
    (setIndex: number, reps: number) => {
      if (!currentExercise) return;
      const exerciseId = currentExercise.id;
      workoutState.updateActualReps(exerciseId, [
        ...(workoutState.workoutData.actualReps[exerciseId] || []).slice(
          0,
          setIndex,
        ),
        reps,
        ...(workoutState.workoutData.actualReps[exerciseId] || []).slice(
          setIndex + 1,
        ),
      ]);
    },
    [
      currentExercise?.id,
      workoutState.updateActualReps,
      workoutState.workoutData.actualReps,
    ],
  );

  const handleEditWeight = useCallback(
    (setIndex: number, weight: number) => {
      if (!currentExercise) return;
      const exerciseId = currentExercise.id;
      workoutState.updateActualWeights(exerciseId, [
        ...(workoutState.workoutData.actualWeights[exerciseId] || []).slice(
          0,
          setIndex,
        ),
        weight,
        ...(workoutState.workoutData.actualWeights[exerciseId] || []).slice(
          setIndex + 1,
        ),
      ]);

      // ✅ Récord personal eliminado - no se celebra durante el entrenamiento
    },
    [
      currentExercise?.id,
      workoutState.updateActualWeights,
      workoutState.workoutData.actualWeights,
    ],
  );

  const handleEditSetType = useCallback(
    (setIndex: number, type: any) => {
      if (!currentExercise) return;
      const exerciseId = currentExercise.id;
      workoutState.updateSetType(exerciseId, setIndex, type);
    },
    [currentExercise?.id, workoutState.updateSetType],
  );

  const handleEditRestTime = useCallback(
    (setIndex: number, restTime: number) => {
      if (!currentExercise) return;
      const exerciseId = currentExercise.id;
      workoutState.updatePerSetRestOverride(exerciseId, setIndex, restTime);
    },
    [currentExercise?.id, workoutState.updatePerSetRestOverride],
  );

  const handleApplySmartRest = useCallback(() => {
    if (!currentExercise || !smartRestTime) return;
    applySmartRestToAllSets(
      currentExercise,
      workoutState.updatePerSetRestOverride,
    );
    success("Descanso inteligente aplicado a todas las series", 2000);
  }, [
    currentExercise,
    smartRestTime,
    workoutState.updatePerSetRestOverride,
    success,
  ]);

  const handleDeleteSet = useCallback(
    async (setIndex: number) => {
      if (!currentExercise || !routine) return;

      // No permitir eliminar si solo hay una serie
      if (currentExercise.sets.length <= 1) {
        error("No puedes eliminar la última serie");
        return;
      }

      const exerciseId = currentExercise.id;

      // Eliminar la serie del ejercicio
      const updatedSets = currentExercise.sets.filter(
        (_: any, idx: number) => idx !== setIndex,
      );
      const updatedExercise = { ...currentExercise, sets: updatedSets };

      // Actualizar la rutina
      const updatedRoutine = {
        ...routine,
        exercises: routine.exercises.map((ex: Exercise) =>
          ex.id === exerciseId ? updatedExercise : ex,
        ),
      };

      setRoutine(updatedRoutine);

      // Limpiar datos de la serie eliminada
      const currentReps = workoutState.workoutData.actualReps[exerciseId] || [];
      const currentWeights =
        workoutState.workoutData.actualWeights[exerciseId] || [];

      workoutState.updateActualReps(
        exerciseId,
        currentReps.filter((_, idx) => idx !== setIndex),
      );
      workoutState.updateActualWeights(
        exerciseId,
        currentWeights.filter((_, idx) => idx !== setIndex),
      );

      // Recalcular series completadas
      const newReps = currentReps.filter((_, idx) => idx !== setIndex);
      const completedCount = newReps.filter(
        (r: number) => typeof r === "number" && r > 0,
      ).length;
      workoutState.updateCompletedSets(exerciseId, completedCount);

      // Ajustar currentSet si es necesario
      if (workoutState.currentSet > updatedSets.length) {
        workoutState.setCurrentSet(updatedSets.length);
      }

      // Persistir la rutina actualizada
      try {
        // ✅ Guardar la rutina modificada en el activeWorkout para que persista al refrescar
        const routineToSave = prepareRoutineForSave(updatedRoutine);
        await updateModifiedRoutine(routineToSave);
        await updateRoutine(id, routineToSave);
        success("Serie eliminada", 2000);
      } catch (err) {
        error("Error al eliminar serie");
        console.error("Error deleting set:", err);
      }
    },
    [
      currentExercise,
      routine,
      workoutState,
      id,
      updateRoutine,
      updateModifiedRoutine,
      success,
      error,
    ],
  );

  const handleDeleteExercise = useCallback(
    async (exerciseIndex: number) => {
      if (!routine) return;

      // No permitir eliminar si solo hay un ejercicio
      if (routine.exercises.length <= 1) {
        error("No puedes eliminar el último ejercicio");
        return;
      }

      const exerciseToDelete = routine.exercises[exerciseIndex];

      // Confirmar eliminación
      const confirmed = await confirm({
        title: "Eliminar ejercicio",
        message: `¿Estás seguro de que quieres eliminar "${exerciseToDelete.name}"? Esta acción no se puede deshacer.`,
        confirmText: "Sí, eliminar",
        cancelText: "Cancelar",
        variant: "danger",
      });

      if (!confirmed) return;

      // Eliminar el ejercicio
      const updatedExercises = routine.exercises.filter(
        (_: Exercise, idx: number) => idx !== exerciseIndex,
      );
      const updatedRoutine = { ...routine, exercises: updatedExercises };

      setRoutine(updatedRoutine);

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
        workoutState.setCurrentExerciseIndex(
          Math.max(0, updatedExercises.length - 1),
        );
        workoutState.setCurrentSet(1);

        // Actualizar valores del nuevo ejercicio actual
        const newCurrentExercise =
          updatedExercises[Math.max(0, updatedExercises.length - 1)];
        if (newCurrentExercise && newCurrentExercise.sets[0]) {
          workoutState.setCurrentReps(newCurrentExercise.sets[0].reps);
          workoutState.setCurrentWeight(newCurrentExercise.sets[0].weight || 0);
        }
      } else if (exerciseIndex < workoutState.currentExerciseIndex) {
        // Si eliminamos un ejercicio anterior, ajustar el índice
        workoutState.setCurrentExerciseIndex(
          workoutState.currentExerciseIndex - 1,
        );
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
        // ✅ Guardar la rutina modificada en el activeWorkout para que persista al refrescar
        const routineToSave = prepareRoutineForSave(updatedRoutine);
        await updateModifiedRoutine(routineToSave);
        await updateRoutine(id, routineToSave);
        success("Serie eliminada", 2000);
      } catch (err) {
        error("Error al eliminar serie");
        console.error("Error deleting set:", err);
      }

      // Haptic feedback
      haptic.error();
    },
    [
      routine,
      workoutState,
      updateModifiedRoutine,
      confirm,
      success,
      error,
      haptic,
    ],
  );

  const handleQuickDeleteSet = useCallback(
    async (exerciseId: string, setIndex: number) => {
      const exercise = routine?.exercises.find(
        (ex: Exercise) => ex.id === exerciseId,
      );
      if (!exercise || !routine) return;

      // No permitir eliminar si solo hay una serie
      if (exercise.sets.length <= 1) {
        error("No puedes eliminar la última serie");
        return;
      }

      // Eliminar la serie del ejercicio
      const updatedSets = exercise.sets.filter(
        (_: any, idx: number) => idx !== setIndex,
      );
      const updatedExercise = { ...exercise, sets: updatedSets };

      // Actualizar la rutina
      const updatedRoutine = {
        ...routine,
        exercises: routine.exercises.map((ex: Exercise) =>
          ex.id === exerciseId ? updatedExercise : ex,
        ),
      };

      setRoutine(updatedRoutine);

      // Limpiar datos de la serie eliminada
      const currentReps = workoutState.workoutData.actualReps[exerciseId] || [];
      const currentWeights =
        workoutState.workoutData.actualWeights[exerciseId] || [];

      workoutState.updateActualReps(
        exerciseId,
        currentReps.filter((_, idx) => idx !== setIndex),
      );
      workoutState.updateActualWeights(
        exerciseId,
        currentWeights.filter((_, idx) => idx !== setIndex),
      );

      // Recalcular series completadas
      const newReps = currentReps.filter((_, idx) => idx !== setIndex);
      const completedCount = newReps.filter(
        (r: number) => typeof r === "number" && r > 0,
      ).length;
      workoutState.updateCompletedSets(exerciseId, completedCount);

      // Persistir la rutina actualizada
      try {
        // ✅ Guardar la rutina modificada en el activeWorkout para que persista al refrescar
        const routineToSave = prepareRoutineForSave(updatedRoutine);
        await updateModifiedRoutine(routineToSave);
        await updateRoutine(id, routineToSave);
        success("Serie eliminada", 2000);
      } catch (err) {
        error("Error al eliminar serie");
        console.error("Error deleting set:", err);
      }
    },
    [
      routine,
      workoutState,
      id,
      updateRoutine,
      updateModifiedRoutine,
      success,
      error,
    ],
  );

  const handleToggleSetComplete = useCallback(
    (setIndex: number, isComplete: boolean) => {
      if (!currentExercise || !routine) return;

      const exerciseId = currentExercise.id;

      if (isComplete) {
        const existingReps =
          workoutState.workoutData.actualReps[exerciseId]?.[setIndex];
        const existingWeight =
          workoutState.workoutData.actualWeights[exerciseId]?.[setIndex];

        const repsToUse =
          existingReps !== undefined && existingReps !== 0
            ? existingReps
            : currentExercise.sets[setIndex].reps;
        const weightToUse =
          existingWeight !== undefined && existingWeight !== null
            ? existingWeight
            : currentExercise.sets[setIndex].weight || 0;

        const newActualReps = [
          ...(workoutState.workoutData.actualReps[exerciseId] || []),
        ];
        newActualReps[setIndex] = repsToUse;

        const newActualWeights = [
          ...(workoutState.workoutData.actualWeights[exerciseId] || []),
        ];
        newActualWeights[setIndex] = weightToUse;

        workoutState.updateActualReps(exerciseId, newActualReps);
        workoutState.updateActualWeights(exerciseId, newActualWeights);

        // Incrementar explícitamente hasta setIndex+1; no contar reps pre-editadas futuras.
        const newCompletedCount = Math.max(
          workoutState.workoutData.completedSets[exerciseId] ?? 0,
          setIndex + 1,
        );
        workoutState.updateCompletedSets(exerciseId, newCompletedCount);
        // ✅ Marcar el flag explícito: solo se activa desde aquí (botón toggle)
        workoutState.updateCompletedSetFlag(exerciseId, setIndex, true);

        const nextIncompleteSet = currentExercise.sets.findIndex(
          (_: any, idx: number) => {
            return idx > setIndex && !newActualReps[idx];
          },
        );

        if (nextIncompleteSet !== -1) {
          workoutState.setCurrentSet(nextIncompleteSet + 1);
        } else if (newCompletedCount >= currentExercise.sets.length) {
          const isLastExercise =
            workoutState.currentExerciseIndex >= routine.exercises.length - 1;

          if (isLastExercise) {
            // No abrir modal automáticamente al completar sets via quick-toggle.
            // El usuario debe pulsar el botón de finalizar explícitamente.
          } else {
            const nextExercise =
              routine.exercises[workoutState.currentExerciseIndex + 1];
            const restTime = calculateExerciseRestTime({
              currentExercise,
              nextExercise,
              routine,
              restOverrides: workoutState.workoutData.restOverrides,
              perSetOverrides: workoutState.workoutData.perSetRestOverrides,
              useSmartRest,
            });

            // Respetar la opción global de omitir descansos
            if (!skipRestTimers) {
              timerHandlers.startTimer(
                restTime,
                "Descanso entre ejercicios",
                nextExercise.name,
              );
            }
          }
        }
      } else {
        const newActualReps = [
          ...(workoutState.workoutData.actualReps[exerciseId] || []),
        ];
        newActualReps[setIndex] = 0;

        // No borrar el peso al desmarcar la serie: conservar el valor previo si existe.
        // Dejar actualWeights sin cambios evita que el UI pierda el peso mostrado.
        workoutState.updateActualReps(exerciseId, newActualReps);

        // Decrementar explícitamente sin contar reps pre-editadas de otras series.
        // BUG FIX: Recount actual completed sets from the reps array instead of
        // using Math.min(prevCount, setIndex), which incorrectly assumes all sets
        // above setIndex are also unchecked. This broke completion counts when
        // unchecking a middle set while higher-indexed sets remain completed.
        const newCompletedCount = newActualReps.filter((r: number) => typeof r === 'number' && r > 0).length;
        workoutState.updateCompletedSets(exerciseId, newCompletedCount);
        // ✅ Limpiar el flag explícito de completado para esta serie
        workoutState.updateCompletedSetFlag(exerciseId, setIndex, false);

        if (setIndex + 1 < workoutState.currentSet) {
          workoutState.setCurrentSet(setIndex + 1);
        }
      }
    },
    [
      currentExercise,
      routine,
      workoutState,
      useSmartRest,
      timerHandlers,
      completion,
      skipRestTimers,
    ],
  );

  const handleAddSet = useCallback(async () => {
    // ✅ FASE 2 - Problema #8: Validar que existan currentExercise y routine
    if (!currentExercise || !routine) {
      console.warn("[Workout] Cannot add set: no current exercise or routine");
      error("No se puede agregar serie");
      return;
    }

    // ✅ FASE 2 - Problema #8: Validar límite máximo de series
    if (currentExercise.sets.length >= 20) {
      error("Máximo 20 series por ejercicio");
      return;
    }

    const exerciseId = currentExercise.id;

    // Obtener la última serie como referencia
    const lastIdx = currentExercise.sets.length - 1;
    const lastSet = currentExercise.sets[lastIdx];

    // Preferir valores ya editados en la sesión (workoutState), y usar los
    // de la rutina como fallback
    const lastRepsFromState = workoutState.workoutData.actualReps[exerciseId]?.[lastIdx];
    const lastWeightFromState = workoutState.workoutData.actualWeights[exerciseId]?.[lastIdx];

    // Crear nueva serie con los mismos valores que la última
    const newSet = {
      reps:
        typeof lastRepsFromState === 'number' && lastRepsFromState > 0
          ? lastRepsFromState
          : lastSet.reps,
      weight:
        typeof lastWeightFromState === 'number' && lastWeightFromState >= 0
          ? lastWeightFromState
          : lastSet.weight || 0,
      restAfter: lastSet.restAfter || currentExercise.restBetweenSets || 90,
    };

    // Agregar la serie al ejercicio
    const updatedSets = [...currentExercise.sets, newSet];
    const updatedExercise = { ...currentExercise, sets: updatedSets };

    // Actualizar la rutina
    const updatedRoutine = {
      ...routine,
      exercises: routine.exercises.map((ex: Exercise) =>
        ex.id === exerciseId ? updatedExercise : ex,
      ),
    };


    setRoutine(updatedRoutine);

    // ✅ Guardar la rutina modificada en el activeWorkout para que persista al refrescar
    try {
      const routineToSave = prepareRoutineForSave(updatedRoutine);
      await updateModifiedRoutine(routineToSave);

      // Persistir la rutina actualizada
      await updateRoutine(id, routineToSave);
      // console.log("[handleAddSet] Successfully saved to storage");
      success("Serie agregada", 2000);
    } catch (err) {
      console.error("[handleAddSet] Error saving:", err);
      error("Error al agregar serie");
      // Revertir cambio local si falla
      setRoutine(routine);
    }
  }, [
    currentExercise,
    routine,
    workoutState,
    id,
    updateRoutine,
    updateModifiedRoutine,
    success,
    error,
  ]);

  const handleSelectExercise = useCallback(
    (index: number) => {
      workoutState.setCurrentExerciseIndex(index);
      workoutState.setCurrentSet(1);
      timerHandlers.stopTimer();
      setExecution.cancelSetExecution();
      // window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [workoutState, timerHandlers, setExecution],
  );

  const handleRepeatPrevious = useCallback(() => {
    if (!lastSetData) return;

    workoutState.setCurrentReps(lastSetData.reps);
    workoutState.setCurrentWeight(lastSetData.weight);
    success(
      `Copiado: ${lastSetData.reps} reps × ${lastSetData.weight}kg`,
      2000,
    );
  }, [lastSetData, workoutState, success]);

  const handleAddExercises = useCallback(
    async (exercises: ExerciseTemplate[]) => {
      if (!routine || exercises.length === 0) return;

      try {
        // Convertir los ejercicios seleccionados al formato de la rutina
        const profile = userProfile ?? getProfileLocally();
        const newExercises = exercises.map((ex) => {
          const rec = getExerciseRecommendations(ex, profile ?? null);

          // Ajuste por equipamiento del usuario (barra -> mancuernas)
          let suggestedWeight = rec.weight;
          try {
            const eqStr = (ex.equipment || "").toLowerCase();
            const hasBar = equipment.selectedEquipment.has('barra');
            const hasDumb = equipment.selectedEquipment.has('mancuernas');
            if ((eqStr.includes('barra') || eqStr.includes('barbell')) && !hasBar && hasDumb) {
              suggestedWeight = Math.round((suggestedWeight / 2) / 2.5) * 2.5;
            }
          } catch (e) {
            // ignore equipment mapping errors
          }

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

        // Agregar los nuevos ejercicios a la rutina
        const updatedRoutine = {
          ...routine,
          exercises: [...routine.exercises, ...newExercises],
        };

        // Actualizar la rutina en el estado local
        const prevRoutine = routine;
        setRoutine(updatedRoutine);

        try {
          // Persistir la rutina modificada (actualiza backend y activeWorkout)
          const routineToSave = prepareRoutineForSave(updatedRoutine);
          await updateModifiedRoutine(routineToSave);

          // Asegurar sincronización adicional con backend por redundancia
          await updateRoutine(id, routineToSave);

          // IMPORTANTE: Actualizar el activeWorkout para mantener los registros existentes
          updateWorkoutProgress(
            workoutState.currentExerciseIndex,
            workoutState.currentSet,
            workoutState.workoutData.completedSets,
            workoutState.workoutData.actualReps,
            workoutState.workoutData.actualWeights,
            undefined,
            totalPausedTime,
          );

          success(
            `${exercises.length} ejercicio${exercises.length > 1 ? "s" : ""} agregado${exercises.length > 1 ? "s" : ""} a la rutina`,
            3000,
          );
          // Actualizar originalRoutine para que no aparezca el prompt de guardar cambios
          setOriginalRoutine(JSON.parse(JSON.stringify(updatedRoutine)));
        } catch (err) {
          console.error("Error adding exercises:", err);
          error("Error al agregar ejercicios");
          // Revertir cambio local si falla
          setRoutine(prevRoutine);
        }
      } catch (err) {
        console.error("Error preparing exercises to add:", err);
        error("Error al agregar ejercicios");
      }
    },
    [
      routine,
      id,
      updateRoutine,
      success,
      error,
      workoutState,
      updateWorkoutProgress,
      totalPausedTime,
      setOriginalRoutine,
    ],
  );

  // ==================== QUICK EDIT MODE HANDLERS ====================
  // ✅ CRÍTICO #8 FIX: Usar solo estado en lugar de ref manual para locks
  const [togglingKeys, setTogglingKeys] = useState<Record<string, boolean>>({});
  const toggleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Limpiar timeouts pendientes al desmontar para evitar setState en unmounted component
  useEffect(() => {
    return () => {
      if (toggleTimeoutRef.current) {
        clearTimeout(toggleTimeoutRef.current);
        toggleTimeoutRef.current = null;
      }
    };
  }, []);

  const handleQuickEditReps = useCallback(
    (exerciseId: string, setIndex: number, reps: number) => {
   
      const currentReps = workoutState.workoutData.actualReps[exerciseId] || [];
      const newReps = [...currentReps];
      newReps[setIndex] = reps;
      workoutState.updateActualReps(exerciseId, newReps);

      // console.log(
      //   "[handleQuickEditReps] completedSets BEFORE:",
      //   workoutState.workoutData.completedSets[exerciseId],
      // );
      // NO actualizar completed sets automáticamente - debe ser manual con el checkbox
      // console.log(
      //   "[handleQuickEditReps] completedSets AFTER:",
      //   workoutState.workoutData.completedSets[exerciseId],
      // );
    },
    [workoutState],
  );

  const handleQuickEditWeight = useCallback(
    (exerciseId: string, setIndex: number, weight: number) => {

      const currentWeights =
        workoutState.workoutData.actualWeights[exerciseId] || [];
      const newWeights = [...currentWeights];
      newWeights[setIndex] = weight;
      workoutState.updateActualWeights(exerciseId, newWeights);

      // ✅ Récord personal eliminado - no se celebra durante el entrenamiento
    },
    [workoutState],
  );

  const handleQuickEditSetType = useCallback(
    (exerciseId: string, setIndex: number, type: any) => {
      workoutState.updateSetType(exerciseId, setIndex, type);
    },
    [workoutState],
  );

  const handleQuickToggleSetComplete = useCallback(
    (exerciseId: string, setIndex: number, isComplete: boolean) => {
      const key = `${exerciseId}:${setIndex}`;
      // ✅ Bloquear si ya hay una operación en curso para este índice (usando solo estado)
      if (togglingKeys[key]) {

        return;
      }

      // ✅ Marcar bloqueo UI inmediatamente (solo estado)
      setTogglingKeys((prev) => ({ ...prev, [key]: true }));

      // ✅ Helper para limpiar el lock (con small delay para evitar parpadeos) - solo estado
      const clearToggle = (delay = 300) => {
        if (delay <= 0) {
          setTogglingKeys((prev) => {
            const copy = { ...prev };
            delete copy[key];
            return copy;
          });
          return;
        }
        if (toggleTimeoutRef.current) clearTimeout(toggleTimeoutRef.current);
        toggleTimeoutRef.current = setTimeout(() => {
          toggleTimeoutRef.current = null;
          setTogglingKeys((prev) => {
            const copy = { ...prev };
            delete copy[key];
            return copy;
          });
        }, delay);
      };

      try {
        const exercise = routine?.exercises.find(
          (ex: Exercise) => ex.id === exerciseId,
        );
        if (!exercise || !routine) {
          clearToggle(0);
          return;
        }

        // Leer desde ref para evitar closure stale en taps rápidos
        const { actualReps: currentReps, actualWeights: currentWeights } =
          workoutState.getExerciseData(exerciseId);

        // Solo tocar el índice específico — no rellenar con ceros los demás
        const newReps = [...currentReps];
        const newWeights = [...currentWeights];

        if (isComplete) {
          // Validar que exista reps y peso (usar actual o fallback a la rutina)
          const displayReps =
            currentReps[setIndex] !== undefined && currentReps[setIndex] > 0
              ? currentReps[setIndex]
              : (exercise.sets[setIndex]?.reps ?? 0);
          const displayWeight =
            currentWeights[setIndex] !== undefined &&
            currentWeights[setIndex] > 0
              ? currentWeights[setIndex]
              : (exercise.sets[setIndex]?.weight ?? 0);

          // ✅ Usar función consolidada para completar
          const result = completeSetLogic({
            exerciseId,
            setIndex,
            reps: displayReps,
            weight: displayWeight,
            isFromQuickMode: true,
          });

          if (!result.success) {
            clearToggle(0);
            return;
          }

          // Preparar copia local para navegación (no persistir aquí; `completeSetAt` ya lo hizo)
          if (!newReps[setIndex] || newReps[setIndex] === 0) {
            newReps[setIndex] = exercise.sets[setIndex]?.reps || 10;
          }
          if (!newWeights[setIndex]) {
            newWeights[setIndex] = exercise.sets[setIndex]?.weight || 0;
          }

          // Actualizar currentSet en UI basándonos en la copia local
          if (currentExercise && currentExercise.id === exerciseId) {
            const nextIncompleteSet = newReps.findIndex((r, idx) => !r || r === 0);
            if (nextIncompleteSet !== -1) {
              workoutState.setCurrentSet(nextIncompleteSet + 1);
            } else {
              workoutState.setCurrentSet(exercise.sets.length);
            }
          }

          // Manejar temporizador usando el resultado de la función consolidada
          if (result.nextAction && result.nextAction !== "none" && result.nextAction !== "finish-workout" && !skipRestTimers) {
            timerHandlers.startTimer(
              result.restTime || 0,
              result.restTitle,
              result.nextExerciseName,
            );
          }
        } else {
          // Desmarcar - solo quitar la completación, preservar el peso editado
          newReps[setIndex] = 0; // Zerear reps para que no cuente como completado
          // newWeights[setIndex] se conserva (el usuario puede haberlo editado a propósito)

          workoutState.updateActualReps(exerciseId, newReps);
          // newWeights no se modifica intencionalmente para preservar ediciones del usuario

          // Recalcular conteo real desde las reps (mismo fix que handleToggleSetComplete)
          const completedCount = newReps.filter(
            (r: number) => typeof r === "number" && r > 0,
          ).length;
          workoutState.updateCompletedSets(exerciseId, completedCount);
          // ✅ Limpiar el flag explícito de completado para esta serie
          workoutState.updateCompletedSetFlag(exerciseId, setIndex, false);

          // Si estamos en el ejercicio actual, actualizar también currentSet
          if (currentExercise && currentExercise.id === exerciseId) {
            const nextIncompleteSet = newReps.findIndex(
              (r, idx) => !r || r === 0,
            );
            if (nextIncompleteSet !== -1) {
              workoutState.setCurrentSet(nextIncompleteSet + 1);
            } else {
              workoutState.setCurrentSet(exercise.sets.length);
            }
          }

          // Detener cualquier temporizador de descanso
          try {
            timerHandlers.stopTimer();
            clearRestState();
          } catch (err) {
            console.warn("[handleQuickToggleSetComplete] stopTimer error", err);
          }
        }

        // Mantener el bloqueo durante una pequeña fracción para prevenir dobles clicks
        clearToggle(350);
      } catch (err) {
        console.error("[handleQuickToggleSetComplete] error", err);
        clearToggle(0);
      }
    },
    [
      routine,
      workoutState,
      currentExercise,
      completeSetLogic,
      skipRestTimers,
      timerHandlers,
      clearRestState,
    ],
  );

  // ==================== SKIP EXERCISE HANDLERS ====================
  const handleSkipExercise = useCallback(
    (exerciseId: string) => {
      workoutState.skipExercise(exerciseId);
      success("Ejercicio omitido en esta sesión", 2000);
    },
    [workoutState, success],
  );

  const handleUnskipExercise = useCallback(
    (exerciseId: string) => {
      workoutState.unskipExercise(exerciseId);
      success("Ejercicio restaurado", 2000);
    },
    [workoutState, success],
  );

  const handleQuickAddSet = useCallback(
    async (exerciseId: string) => {
      const exercise = routine?.exercises.find(
        (ex: Exercise) => ex.id === exerciseId,
      );

      // ✅ FASE 2 - Problema #8: Validar que existan exercise y routine
      if (!exercise || !routine) {
        console.warn("[Workout] Cannot add set: no exercise or routine found");
        error("No se puede agregar serie");
        return;
      }

      // ✅ FASE 2 - Problema #8: Validar límite máximo de series
      if (exercise.sets.length >= 20) {
        error("Máximo 20 series por ejercicio");
        return;
      }

      // Obtener la última serie real como referencia
      // Preferir valores ya editados en workoutState (actualReps/actualWeights)
      const lastIdx = exercise.sets.length - 1;
      const lastRepsFromState = workoutState.workoutData.actualReps[exerciseId]?.[lastIdx];
      const lastWeightFromState = workoutState.workoutData.actualWeights[exerciseId]?.[lastIdx];

      const lastSet = exercise.sets[lastIdx];

      // Crear nueva serie copiando valores previos (prefiere edits en sesión)
      const newSet = {
        reps:
          typeof lastRepsFromState === 'number' && lastRepsFromState > 0
            ? lastRepsFromState
            : lastSet.reps,
        weight:
          typeof lastWeightFromState === 'number' && lastWeightFromState >= 0
            ? lastWeightFromState
            : lastSet.weight || 0,
        restAfter: lastSet.restAfter || exercise.restBetweenSets || 90,
      };

      // Agregar la serie al ejercicio
      const updatedSets = [...exercise.sets, newSet];
      const updatedExercise = { ...exercise, sets: updatedSets };

      // Actualizar la rutina
      const updatedRoutine = {
        ...routine,
        exercises: routine.exercises.map((ex: Exercise) =>
          ex.id === exerciseId ? updatedExercise : ex,
        ),
      };


      setRoutine(updatedRoutine);

      // ✅ Guardar la rutina modificada en el activeWorkout para que persista al refrescar
      try {
        const routineToSave = prepareRoutineForSave(updatedRoutine);
        await updateModifiedRoutine(routineToSave);

        // Persistir la rutina actualizada
        await updateRoutine(id, routineToSave);
        success("Serie agregada", 2000);
      } catch (err) {
        console.error("[handleQuickAddSet] Error saving:", err);
        error("Error al agregar serie");
        // Revertir cambio local si falla
        setRoutine(routine);
      }
    },
    [routine, workoutState, id, updateRoutine, updateModifiedRoutine, success, error],
  );

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
            <Button onClick={() => router.push("/routines")}>
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
      <div className="fixed inset-0 flex items-center justify-center z-50">
        {/* Fondo degradado semitransparente + blur para difuminar la UI detrás */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-600/40 via-purple-600/30 to-indigo-700/25 backdrop-blur-md" />
        <div className="relative z-10 px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key="timer"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18 }}
            >
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
            </motion.div>
          </AnimatePresence>
        </div>
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
            duration={timerHandlers.timerDuration}
            onExpand={timerHandlers.expandTimer}
            onSkip={timerHandlers.skipAndAdvance}
          />
        )}

        <div className="sticky top-16 z-20 mb-4">
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
              onOpenSoundSettings={soundSettingsModal.openSettings} // ✨ NEW: Callback para abrir configuración
            />
          </div>
          {/* Toggle entre Modo Guiado y Edición Rápida */}
          <div className="mt-1 flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setIsQuickEditMode(false)}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
                !isQuickEditMode
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              🎯 Modo Guiado
            </button>
            <button
              onClick={() => setIsQuickEditMode(true)}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
                isQuickEditMode
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              📝 Edición Rápida
            </button>
          </div>
          {/* Header de Edición Rápida - siempre visible al hacer scroll */}
          {isQuickEditMode && (
            <div className="bg-linear-to-r from-blue-600 to-violet-600 text-white px-3 py-2.5 rounded-b-xl shadow-lg">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-sm font-bold tracking-tight">Edición Rápida</span>
                  <span className="text-xs tabular-nums bg-white/15 px-2 py-0.5 rounded-full font-mono">
                    {`${Math.floor(elapsedTime / 60)}:${String(elapsedTime % 60).padStart(2, "0")}`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-2.5 py-1 shrink-0">
                  <span className="text-sm font-bold tabular-nums leading-none">{qemProgressPercent}%</span>
                  <span className="text-[10px] opacity-70 tabular-nums leading-none">{qemCompletedSets}/{qemTotalSets}</span>
                </div>
                <div className="w-px h-5 bg-white/25 shrink-0" />
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setSkipRestTimers((v) => !v)}
                    title={skipRestTimers ? "Omitir descansos: ON" : "Omitir descansos: OFF"}
                    aria-label={skipRestTimers ? "Omitir descansos activado" : "Omitir descansos desactivado"}
                    className={`flex items-center gap-1 h-7 px-2 rounded-full text-[11px] font-semibold transition-all ${
                      skipRestTimers
                        ? "bg-green-400/90 text-white shadow-sm"
                        : "bg-white/15 text-white/70 hover:bg-white/25"
                    }`}
                  >
                    <TimerIcon className="w-3 h-3 shrink-0" />
                    <span className="hidden sm:inline">{skipRestTimers ? "ON" : "OFF"}</span>
                  </button>
                  <button
                    onClick={() => setAutoAdvance((v) => !v)}
                    title={autoAdvance ? "Auto-avance: ON" : "Auto-avance: OFF"}
                    aria-label={autoAdvance ? "Auto-avance activado" : "Auto-avance desactivado"}
                    className={`flex items-center gap-1 h-7 px-2 rounded-full text-[11px] font-semibold transition-all ${
                      autoAdvance
                        ? "bg-blue-300/90 text-white shadow-sm"
                        : "bg-white/15 text-white/70 hover:bg-white/25"
                    }`}
                  >
                    <ArrowRight className="w-3 h-3 shrink-0" />
                    <span className="hidden sm:inline">{autoAdvance ? "ON" : "OFF"}</span>
                  </button>
                  {qemCurrentExerciseId && (
                    <button
                      onClick={() => handleQuickAddSet(qemCurrentExerciseId)}
                      className="h-7 w-7 flex items-center justify-center bg-white/15 hover:bg-white/25 rounded-full transition-colors"
                      title="Agregar serie al ejercicio actual"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => completion.openCompletionModal()}
                    disabled={qemCompletedSets === 0}
                    className={`h-7 w-7 flex items-center justify-center rounded-full transition-all ${
                      qemCompletedSets > 0
                        ? "bg-green-400 hover:bg-green-300 shadow-sm"
                        : "bg-white/10 opacity-40 cursor-not-allowed"
                    }`}
                    title="Finalizar entrenamiento"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="w-full bg-white/15 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-white h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${qemProgressPercent}%` }}
                />
              </div>
              {/* Serie en curso */}
              {setExecution.isExecutingSet && (
                <div className="mt-1.5 flex items-center justify-between bg-white/10 rounded-xl px-3 py-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest shrink-0">
                      Serie en curso
                    </span>
                    {currentExercise && (
                      <span className="text-[10px] text-white/60 truncate">
                        {currentExercise.name} · #{workoutState.currentSet}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-white/50 uppercase tracking-wide">TUT</span>
                    <span className="text-base font-black tabular-nums text-white leading-none">
                      {`${Math.floor(tutElapsedQEM / 60)}:${String(tutElapsedQEM % 60).padStart(2, '0')}`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Panel de preconfiguración: sólo para rutinas vacías (antes de añadir ejercicios) */}
        {routine && Array.isArray(routine.exercises) && routine.exercises.length === 0 && (
          <div className="mb-4">
            <Card>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Preconfiguración rápida</h3>
                    <div className="text-sm text-gray-500">Sugerencias basadas en tu perfil</div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Rutina sugerida</label>
                      <select
                        value={selectedSuggestionIndex}
                        onChange={(e) => setSelectedSuggestionIndex(Number(e.target.value))}
                        className="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
                      >
                        {isGeneratingSuggestions ? (
                          <option>Cargando sugerencias...</option>
                        ) : (
                          suggestedRoutines.length > 0 ? (
                            suggestedRoutines.map((r, idx) => (
                              <option key={r.id || idx} value={idx}>{r.name}</option>
                            ))
                          ) : (
                            <option>No hay sugerencias disponibles</option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Duración objetivo (min)</label>
                      <NumericInput
                        value={preMinutesPerSession}
                        onChange={(v) => setPreMinutesPerSession(v)}
                        className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Descanso entre series (seg)</label>
                      <NumericInput
                        value={preRestBetweenSets}
                        onChange={(v) => setPreRestBetweenSets(v)}
                        className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Descanso entre ejercicios (seg)</label>
                      <NumericInput
                        value={preRestBetweenExercises}
                        onChange={(v) => setPreRestBetweenExercises(v)}
                        className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      {suggestedRoutines && suggestedRoutines[selectedSuggestionIndex] ? (
                        (() => {
                          const sel = suggestedRoutines[selectedSuggestionIndex];
                          const stats = getRoutineStats(sel.exercises || [], preRestBetweenSets, preRestBetweenExercises);
                          return (
                            <div>
                              <div className="font-medium">{sel.name}</div>
                              <div className="text-xs text-gray-500">{stats.totalExercises} ejercicios • {stats.totalSets} series • {stats.estimatedDurationFormatted}</div>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="text-xs text-gray-500">Ajusta la duración y descansos para ver la estimación</div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          // Scroll to add exercise area
                          addExerciseAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                      >
                        Agregar ejercicio
                      </Button>

                      <Button
                        variant="primary"
                        onClick={async () => {
                          const sel = suggestedRoutines[selectedSuggestionIndex];
                          if (!sel) {
                            error('No hay una rutina seleccionada');
                            return;
                          }

                          const adjusted = {
                            ...sel,
                            restBetweenSets: preRestBetweenSets,
                            restBetweenExercises: preRestBetweenExercises,
                            exercises: (sel.exercises || []).map((ex: any) => ({
                              ...ex,
                              restBetweenSets: ex.restBetweenSets ?? preRestBetweenSets,
                            })),
                          };

                          try {
                            setRoutine(adjusted);
                            startWorkout(adjusted);
                            success(`Iniciando: ${adjusted.name}`, 2000);
                          } catch (err) {
                            console.error('Error applying suggestion', err);
                            error('No se pudo iniciar el entrenamiento');
                          }
                        }}
                      >
                        Aplicar y empezar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {isQuickEditMode ? (
          <QuickEditMode
            routine={routine}
            workoutData={workoutState.workoutData}
            sessions={sessions}
            onEditReps={handleQuickEditReps}
            onEditWeight={handleQuickEditWeight}
            onEditSetType={handleQuickEditSetType}
            onToggleSetComplete={handleQuickToggleSetComplete}
            togglingKeys={togglingKeys}
            onAddSet={handleQuickAddSet}
            onDeleteSet={handleQuickDeleteSet}
            onFinishWorkout={() => completion.openCompletionModal()}
            onMoveExercise={handleMoveExercise}
            onSkipExercise={handleSkipExercise}
            onUnskipExercise={handleUnskipExercise}
            onShowExerciseInfo={(exerciseName) => {
              // Guardar el nombre del ejercicio y mostrar el modal
              setSelectedExerciseName(exerciseName);
              setShowExerciseInfo(true);
            }}
            onEditRestTime={(exerciseId, restTime) => {
              workoutState.updateRestOverride(exerciseId, restTime);

              // Si el timer de descanso ya está corriendo, reiniciarlo con el nuevo tiempo
              if (timerHandlers.showTimer) {
                timerHandlers.startTimer(restTime, timerHandlers.timerTitle, timerHandlers.nextExerciseName);
              }

              // Formatear tiempo en minutos y segundos para el toast
              let timeDisplay;
              if (restTime >= 60) {
                const minutes = Math.floor(restTime / 60);
                const seconds = restTime % 60;
                timeDisplay =
                  seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
              } else {
                timeDisplay = `${restTime}s`;
              }

              success(`⏱️ Descanso actualizado a ${timeDisplay}`, 2000);
            }}
            onApplySmartRest={(exerciseId) => {
              const exercise = routine.exercises.find(
                (ex: Exercise) => ex.id === exerciseId,
              );
              if (!exercise) return;

              // Aplicar descanso inteligente a TODAS las series individuales
              const appliedRestTime = applySmartRestToAllSets(
                exercise,
                workoutState.updatePerSetRestOverride,
              );

              if (appliedRestTime) {
                // Formatear tiempo en minutos y segundos para el toast
                let timeDisplay;
                if (appliedRestTime >= 60) {
                  const minutes = Math.floor(appliedRestTime / 60);
                  const seconds = appliedRestTime % 60;
                  timeDisplay =
                    seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
                } else {
                  timeDisplay = `${appliedRestTime}s`;
                }

                success(
                  `⚡ Descanso inteligente aplicado a todas las series: ${timeDisplay}`,
                  2000,
                );
              } else {
                error(
                  "No se pudo calcular el descanso inteligente para este ejercicio",
                );
              }
            }}
            onAddExercises={handleAddExercises}
            onSkipRestTimersChange={setSkipRestTimers}
            skipRestTimers={skipRestTimers}
            autoAdvance={autoAdvance}
            onAutoAdvanceChange={setAutoAdvance}
            hideHeader
            activeSet={
              setExecution.isExecutingSet && setExecution.setStartTime
                ? {
                    exerciseId: currentExercise?.id ?? '',
                    setIndex: workoutState.currentSet - 1,
                    startTime: setExecution.setStartTime,
                  }
                : null
            }
          />
        ) : (
          /* Modo guiado - Flujo normal */
          <>
            {/* Botón flotante grande - Iniciar o Completar Serie */}
            <div className="fixed bottom-0 left-0 right-0 h-24 bg-linear-to-t from-white via-white/95 to-transparent dark:from-gray-900 dark:via-gray-900/95 dark:to-transparent pointer-events-none z-20" />

            <div className="fixed bottom-0 left-0 right-0 z-30 px-0">
              {!setExecution.isExecutingSet ? (
                <Button
                  variant="primary"
                  onClick={() => {
                    setExecution.startSet();
                  }}
                  className="w-full py-6 text-lg font-bold bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3 rounded-2xl border-2 border-white/20"
                >
                  <span className="text-2xl">▶️</span>
                  <div className="flex flex-col items-start">
                    <span>
                      Iniciar Serie{" "}
                      {Math.min(
                        workoutState.currentSet,
                        currentExercise.sets.length,
                      )}
                    </span>
                    <span className="text-xs font-normal opacity-90">
                      {workoutState.currentReps} reps ×{" "}
                      {workoutState.currentWeight}kg
                    </span>
                  </div>
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => handleCompleteSet(workoutState.currentSet)}
                  disabled={
                    workoutState.currentReps === "" ||
                    workoutState.currentWeight === ""
                  }
                  className="w-full py-6 text-lg font-bold bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-2xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3 rounded-2xl border-2 border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-2xl">✅</span>
                  <div className="flex flex-col items-start">
                    <span>
                      Completar Serie{" "}
                      {Math.min(
                        workoutState.currentSet,
                        currentExercise.sets.length,
                      )}
                    </span>
                    <span className="text-xs font-normal opacity-90">
                      {workoutState.currentReps} reps ×{" "}
                      {workoutState.currentWeight}kg
                    </span>
                  </div>
                </Button>
              )}
            </div>

              <ExerciseCard
              exercise={currentExercise}
              exerciseIndex={workoutState.currentExerciseIndex}
              currentSet={workoutState.currentSet}
              completedSets={
                workoutState.workoutData.completedSets[currentExercise.id] || 0
              }
              currentReps={workoutState.currentReps}
              currentWeight={workoutState.currentWeight}
              onRepsChange={workoutState.setCurrentReps}
              onWeightChange={workoutState.setCurrentWeight}
              onCompleteSet={() => handleCompleteSet(workoutState.currentSet)}
              onShowInfo={() => {
                // Asegurarnos de pasar el nombre del ejercicio antes de abrir el panel
                if (currentExercise && currentExercise.name)
                  setSelectedExerciseName(currentExercise.name);
                setShowExerciseInfo(true);
              }}
              isSetStarted={setExecution.isExecutingSet}
              weightSuggestion={weightPrediction.weightSuggestion}
              onDismissWeightSuggestion={() =>
                weightPrediction.setDismissedWeightSuggestion(true)
              }
              lastSetData={lastSetData}
              onRepeatPrevious={handleRepeatPrevious}
              setStartTime={setExecution.setStartTime}
              actualWeights={
                workoutState.workoutData.actualWeights[currentExercise.id] || []
              }
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
              onTempoChange={(tempo) => {
                if (!routine) return;
                const newExercises = routine.exercises.map((ex: Exercise, i: number) =>
                  i === workoutState.currentExerciseIndex ? { ...ex, tempo: tempo || undefined } : ex
                );
                const updatedRoutine = { ...routine, exercises: newExercises };
                setRoutine(updatedRoutine);
                updateModifiedRoutine(prepareRoutineForSave(updatedRoutine)).catch(() => {});
              }}
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
              <Suspense
                fallback={
                  <div className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg h-64 mb-4" />
                }
              >
                <SeriesTable
                  exercise={currentExercise}
                  exerciseId={currentExercise.id}
                  completedSets={
                    workoutState.workoutData.completedSets[
                      currentExercise.id
                    ] || 0
                  }
                  actualReps={
                    workoutState.workoutData.actualReps[currentExercise.id] ||
                    []
                  }
                  actualWeights={
                    workoutState.workoutData.actualWeights[
                      currentExercise.id
                    ] || []
                  }
                  setTypes={
                    workoutState.workoutData.setTypes[currentExercise.id] || []
                  }
                  completedSetFlags={
                    workoutState.workoutData.completedSetFlags?.[currentExercise.id] || []
                  }
                  currentSet={workoutState.currentSet}
                  onEditReps={handleEditReps}
                  onEditWeight={handleEditWeight}
                  onEditSetType={handleEditSetType}
                  onToggleSetComplete={handleToggleSetComplete}
                  onAddSet={handleAddSet}
                  onDeleteSet={handleDeleteSet}
                  perSetRestOverrides={
                    workoutState.workoutData.perSetRestOverrides
                  }
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

            <div className="mb-6" ref={addExerciseAnchorRef}>
              <AddExerciseButton onAddExercises={handleAddExercises} />
            </div>
          
          </>
        )}

        {/* Modales compartidos entre ambos modos */}
        <WorkoutModals
          showEditTimeModal={showEditTimeModal}
          onCloseEditTimeModal={() => setShowEditTimeModal(false)}
          editingTime={editingTime}
          onEditingTimeChange={setEditingTime}
          onSaveEditedTime={handleSaveEditedTime}
          completion={completion}
          onFinish={(duration) => handleFinish(duration)}
          SoundSettingsModal={soundSettingsModal.SoundSettingsModal}
          showExerciseInfo={showExerciseInfo}
          loadingExerciseInfo={loadingExerciseInfo}
          exerciseInfo={exerciseInfo}
          selectedExerciseName={selectedExerciseName}
          onCloseExerciseInfo={() => {
            setShowExerciseInfo(false);
            setSelectedExerciseName("");
            setExerciseInfo(null);
            setLoadingExerciseInfo(false);
          }}
          setExecution={{
            showSetExecution: setExecution.showSetExecution,
            exerciseName: currentExercise.name,
            equipment: currentExercise.equipment,
            currentSet: workoutState.currentSet,
            totalSets: currentExercise.sets.length,
            currentReps: workoutState.currentReps,
            currentWeight: workoutState.currentWeight,
            exerciseId: currentExercise.id,
            onRepsChange: workoutState.setCurrentReps,
            onWeightChange: workoutState.setCurrentWeight,
            onComplete: (setNum: number) => handleCompleteSet(setNum),
            onCancel: () => setExecution.cancelSetExecution(),
          }}
          showStartSplash={showStartSplash}
          routineName={routine?.name || "Entrenamiento"}
          exerciseCount={routine?.exercises?.length || 0}
          totalSets={(routine?.exercises || []).reduce((sum: number, ex: any) => sum + (ex.sets?.length || 0), 0)}
          onStartSplashComplete={() => setShowStartSplash(false)}
          WorkoutCompleteSplash={WorkoutCompleteSplash}
          completeSplashProps={completion.completeSplash}
          onCompleteSplashDone={completion.onCompleteSplashDone}
          SetExecutionModal={SetExecutionModal}
          ExerciseInfoPanel={ExerciseInfoPanel}
          WorkoutStartSplash={WorkoutStartSplash}
        />

        {/* Celebración de récord personal (PR) */}
        <PRCelebration 
          show={prInfo.show} 
          onComplete={() => setPrInfo(prev => ({ ...prev, show: false }))} 
          title={prInfo.title}
          subtitle={prInfo.subtitle}
        />

        {/* Splash animado de finalización de entrenamiento */}
        <AnimatePresence>
          {completion.completeSplash && (
            <WorkoutCompleteSplash
              {...completion.completeSplash}
              onComplete={completion.onCompleteSplashDone}
            />
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}
