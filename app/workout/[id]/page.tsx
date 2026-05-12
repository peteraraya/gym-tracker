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
import { Modal } from "@/components/ui/Modal";
import { Timer } from "@/components/Timer";
import { motion, AnimatePresence } from "framer-motion";
import { MinimizedTimer } from "@/components/MinimizedTimer";
import ProtectedRoute from "@/components/ProtectedRoute";
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
import { FinishWorkoutModal } from "./components/FinishWorkoutModal";
import { EditValueModal } from "@/components/EditValueModal";
import SetsReference from "@/components/SetsReference";
import {
  SoundSettings,
  useSoundSettingsModal,
} from "@/components/SoundSettings";
import type { ExerciseTemplate } from "@/data/exercises";
import type { Exercise } from "@/types";
import type { UserProfile } from "@/types";
import { getExerciseRecommendations } from '@/lib/exerciseRecommendations';
import { getProfileLocally } from '@/lib/localProfile';
import { useEquipment } from '@/context/EquipmentContext';
import { generateRoutine } from '@/lib/routineGenerator';
import { getRoutineStats } from '@/lib/routineEstimation';
import {
  calculateNextRestTime,
  calculateExerciseRestTime,
  calculateSmartRestTime,
  applySmartRestToAllSets,
} from "./services/restCalculationService";
import { LoadingState } from "@/components/LoadingState";
import {
  getPersonalRecord,
  compareWithRecord,
  type PersonalRecord,
  type RecordComparison,
} from "@/lib/personalRecords";

// ✅ CRÍTICO #1 FIX: Utility para debounce
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Lazy load componentes pesados que no se usan inmediatamente
const SeriesTable = lazy(() =>
  import("./components/SeriesTable").then((m) => ({ default: m.SeriesTable })),
);
const ExerciseInfoPanel = lazy(() =>
  import("@/components/ExerciseInfoPanel").then((m) => ({
    default: m.ExerciseInfoPanel,
  })),
);
const SetExecutionModal = lazy(() =>
  import("@/components/SetExecutionModal").then((m) => ({
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
    skipExercise,
    unskipExercise,
  } = useWorkout();
  const { success, error } = useToast();
  const { confirm } = useConfirm();

  // ==================== STATE ====================
  const [routine, setRoutine] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Modo de edición: true = Edición Rápida (defecto), false = Modo Guiado
  const [isQuickEditMode, setIsQuickEditMode] = useState(true);
  // Omitir descansos (estado global para que ambos modos lo respeten)
  const [skipRestTimers, setSkipRestTimers] = useState(false);

  // ✅ CRÍTICO #1 FIX: Placeholder para el callback (se define después)
  const handleWorkoutDataChangeRef = useRef<(data: any) => void>(() => {});

  // Inicializar workoutState con callback desde ref
  const workoutState = useWorkoutState(routine || null, {
    onDataChange: (data) => handleWorkoutDataChangeRef.current(data),
  });
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
          console.log(
            "[Workout Init] Loaded start time from storage:",
            new Date(startTime).toISOString(),
          );
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
  const exercises = useMemo(() => routine?.exercises || [], [routine?.id]);

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

  // ✅ CRÍTICO #1 FIX: Debounced save para evitar guardados excesivos
  const debouncedSave = useMemo(
    () =>
      debounce((data: any) => {
        if (!routine || !isInitialized) {
          console.log(
            "[Workout] ⏸️ Skipping save - not initialized or no routine",
          );
          return;
        }

        console.log("[Workout] 💾 Saving workout data (debounced):", data);

        updateWorkoutProgress(
          workoutState.currentExerciseIndex,
          workoutState.currentSet,
          data.completedSets,
          data.actualReps,
          data.actualWeights,
          timerHandlers.showTimer
            ? {
                isResting: true,
                restTimerDuration: timerHandlers.timerDuration,
                restTimerTitle: timerHandlers.timerTitle,
                restTimerNextExercise: timerHandlers.nextExerciseName,
                restTimerStartedAt: Date.now(),
              }
            : undefined,
          totalPausedTime,
          {
            setTypes: data.setTypes,
            restOverrides: data.restOverrides,
            perSetRestOverrides: data.perSetRestOverrides,
          },
        );
      }, 500), // Guardar máximo cada 500ms
    [
      routine,
      isInitialized,
      updateWorkoutProgress,
      totalPausedTime,
      timerHandlers,
      workoutState.currentExerciseIndex,
      workoutState.currentSet,
    ],
  );

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

  // Haptic Feedback mejorado
  const haptic = useHapticFeedback();

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

        console.log("[Init] 📦 Restoring workout from storage:", s);

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
        };

        console.log("[Init] ✅ Restored data prepared:", restoredData);
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
        console.log("[Init] Initialization complete");
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
  useEffect(() => {
    if (!isQuickEditMode && currentExercise && isInitialized) {
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
    workoutState.currentSet,
    workoutState.workoutData.actualReps,
    workoutState.workoutData.actualWeights,
  ]);

  // Efecto 2: Manejar completación de ejercicio en modo guiado
  useEffect(() => {
    if (!isQuickEditMode && currentExercise && isInitialized && routine) {
      const exerciseId = currentExercise.id;
      const actualReps = workoutState.workoutData.actualReps[exerciseId] || [];
      const completedCount = actualReps.filter(
        (r: number) => typeof r === "number" && r > 0,
      ).length;
      const hasCompletedAllSets = completedCount >= currentExercise.sets.length;

      if (hasCompletedAllSets) {
        const isLastExercise =
          workoutState.currentExerciseIndex >= routine.exercises.length - 1;

        if (isLastExercise) {
          // Último ejercicio completado - abrir modal de finalización
          if (!completion.showNotesModal) {
            const duration = Math.floor(
              (Date.now() - workoutStartTime - totalPausedTime) / 1000,
            );
            completion.openCompletionModal(duration);
          }
        } else {
          // Avanzar al siguiente ejercicio
          setTimeout(() => {
            const nextIndex = workoutState.currentExerciseIndex + 1;
            const nextExercise = routine.exercises[nextIndex];

            if (nextExercise) {
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
        console.log(
          `[Cleanup] Trimming actualReps for ${exerciseId} from ${currentReps.length} to ${maxSets}`,
        );
        workoutState.updateActualReps(
          exerciseId,
          currentReps.slice(0, maxSets),
        );
        hasChanges = true;
      }

      // Limpiar actualWeights si excede el número de series
      const currentWeights = workoutState.workoutData.actualWeights[exerciseId];
      if (currentWeights && currentWeights.length > maxSets) {
        console.log(
          `[Cleanup] Trimming actualWeights for ${exerciseId} from ${currentWeights.length} to ${maxSets}`,
        );
        workoutState.updateActualWeights(
          exerciseId,
          currentWeights.slice(0, maxSets),
        );
        hasChanges = true;
      }
    });

    if (hasChanges) {
      console.log("[Cleanup] Data inconsistencies were corrected");
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
      console.log(
        `[Cleanup] Correcting currentSet from ${workoutState.currentSet} to ${maxSets}`,
      );
      workoutState.setCurrentSet(maxSets);
    } else if (workoutState.currentSet < 1) {
      console.log(
        `[Cleanup] Correcting currentSet from ${workoutState.currentSet} to 1`,
      );
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
    if (isInitialized && wakeLock.isSupported) {
      wakeLock.requestWakeLock().then((activated) => {
        if (activated) {
          success("🔋 Pantalla activa durante el entrenamiento", 2000);
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
  
  // Detectar si la rutina actual difiere de la original (cambios en sets/pesos/orden)
  const hasRoutineChanges = useCallback((orig: any | null, curr: any | null) => {
    if (!orig || !curr) return false;
    const origEx = orig.exercises || [];
    const currEx = curr.exercises || [];
    if (origEx.length !== currEx.length) return true;

    for (const ce of currEx) {
      const oe = origEx.find((e: any) => e.id === ce.id);
      if (!oe) return true; // ejercicio nuevo
      if ((oe.sets || []).length !== (ce.sets || []).length) return true;
      for (let i = 0; i < (ce.sets || []).length; i++) {
        const os = oe.sets[i] || {};
        const cs = ce.sets[i] || {};
        if (Number(os.reps || 0) !== Number(cs.reps || 0)) return true;
        if (Number(os.weight || 0) !== Number(cs.weight || 0)) return true;
      }
    }

    return false;
  }, []);

  const handleFinish = useCallback(async () => {
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
            await updateRoutine(id, {
              name: routine.name,
              description: routine.description,
              image: routine.image,
              exercises: routine.exercises.map((ex: any) => ({
                id: ex.id,
                name: ex.name,
                sets: ex.sets.map((s: any) => ({
                  reps: s.reps,
                  weight: s.weight || 0,
                  type: s.type,
                  notes: s.notes,
                })),
                notes: ex.notes,
                equipment: ex.equipment,
                technique: ex.technique,
                recommendedSets: ex.recommendedSets,
                recommendedReps: ex.recommendedReps,
                restTime: ex.restTime,
                restBetweenSets: ex.restBetweenSets,
                useSmartRest: ex.useSmartRest,
              })),
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

      await completion.finishWorkout(workoutState.workoutData);
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

  useEffect(() => {
    if (!currentExercise || !isInitialized) return;

    const currentWeightValue =
      typeof workoutState.currentWeight === "number"
        ? workoutState.currentWeight
        : 0;
    const prediction = weightPrediction.predictWeightForSet(currentWeightValue);

    if (prediction.weight !== workoutState.currentWeight) {
      workoutState.setCurrentWeight(prediction.weight);

      if (prediction.reasoning) {
        success(`💡 ${prediction.reasoning}`, 3000);
      }
    }
  }, [
    currentExercise,
    workoutState.currentSet,
    isInitialized,
    workoutState.currentWeight,
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

      console.log("[completeSetLogic] Completing set:", params);

      // Validar datos: exigir al menos repeticiones (peso puede ser 0 para ejercicios corporales)
      if (!(reps > 0)) {
        error("No puedes completar la serie sin repeticiones");
        return {
          success: false,
          reason: "invalid-data",
          nextAction: "none" as const,
        };
      }

      // Completar la serie en la posición correcta (state update asincrónica)
      workoutState.completeSetAt(exerciseId, setIndex, reps, weight);

      // Feedback háptico
      if (isFromQuickMode) {
        haptic.success();
      } else {
        haptic.setComplete();
      }

      // Encontrar el ejercicio
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

      // Calcular si es la última serie del ejercicio usando una copia local
      // del array de reps actualizado (setState es asincrónico, no podemos
      // depender de workoutState.workoutData inmediatamente después de escribir).
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
      const isLastSetOfExercise = completedCount >= exercise.sets.length;
      const exerciseIndex = routine.exercises.findIndex(
        (ex: Exercise) => ex.id === exerciseId,
      );
      const isLastExercise = exerciseIndex >= routine.exercises.length - 1;

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
          const nextExercise = routine.exercises[exerciseIndex + 1];
          nextExerciseName = nextExercise.name;
          restTime = calculateExerciseRestTime({
            currentExercise: exercise,
            nextExercise,
            routine,
            restOverrides: workoutState.workoutData.restOverrides,
            perSetOverrides: workoutState.workoutData.perSetRestOverrides,
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
        console.log("[Workout] Serie ya completada, ignorando");
        return;
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
          // Sin timer: avanzar directamente al siguiente ejercicio
          haptic.exerciseChange();
          workoutState.setCurrentExerciseIndex(result.exerciseIndex + 1);
          workoutState.setCurrentSet(1);
          const nextExercise = routine.exercises[result.exerciseIndex + 1];
          if (nextExercise?.sets[0]) {
            workoutState.setCurrentReps(nextExercise.sets[0].reps);
            workoutState.setCurrentWeight(nextExercise.sets[0].weight || 0);
          }
        }
      } else if (result.nextAction === "next-set") {
        // Respetar la opción global de omitir descansos
        if (!skipRestTimers) {
          timerHandlers.startTimer(result.restTime, result.restTitle);
        } else {
          // Sin timer: avanzar directamente a la siguiente serie
          const newSet = workoutState.currentSet + 1;
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
    const isLastExercise =
      workoutState.currentExerciseIndex >= routine.exercises.length - 1;

    if (isLastSet && isLastExercise) {
      const duration = Math.floor(
        (Date.now() - workoutStartTime - totalPausedTime) / 1000,
      );
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
        console.log(
          "[Workout] Resuming - pause duration:",
          Math.floor(pauseDuration / 1000),
          "seconds",
        );
      }
      setIsPaused(false);
      setPauseStartTime(null);
      success("⏯️ Entrenamiento reanudado", 2000);
    } else {
      // Pausar
      setPauseStartTime(Date.now());
      setIsPaused(true);
      console.log("[Workout] Paused at:", new Date().toISOString());
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
        await updateModifiedRoutine(updatedRoutine);
        // Redundancia: asegurar que la rutina esté en el backend
        await updateRoutine(id, updatedRoutine);

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

      // ✅ Guardar la rutina modificada en el activeWorkout para que persista al refrescar
      updateModifiedRoutine(updatedRoutine);

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
        await updateRoutine(id, updatedRoutine);
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
        await updateRoutine(id, updatedRoutine);
        success(`Ejercicio "${exerciseToDelete.name}" eliminado`, 2000);
      } catch (err) {
        error("Error al eliminar ejercicio");
        console.error("Error deleting exercise:", err);
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

      // ✅ Guardar la rutina modificada en el activeWorkout para que persista al refrescar
      updateModifiedRoutine(updatedRoutine);

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
        await updateRoutine(id, updatedRoutine);
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
          existingWeight !== undefined && existingWeight !== 0
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

        // ✅ FASE 2 - Problema #6: Usar función centralizada para calcular completedSets
        const newCompletedCount = calculateCompletedSets(newActualReps);
        workoutState.updateCompletedSets(exerciseId, newCompletedCount);

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
            const duration = Math.floor((Date.now() - workoutStartTime) / 1000);
            completion.openCompletionModal(duration);
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

        // ✅ FASE 2 - Problema #6: Usar función centralizada para calcular completedSets
        const newCompletedCount = calculateCompletedSets(newActualReps);
        workoutState.updateCompletedSets(exerciseId, newCompletedCount);

        if (setIndex + 1 < workoutState.currentSet) {
          workoutState.setCurrentSet(setIndex + 1);
        }
      }
    },
    [
      currentExercise,
      routine,
      workoutState,
      workoutStartTime,
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
    const lastSet = currentExercise.sets[currentExercise.sets.length - 1];

    // Crear nueva serie con los mismos valores que la última
    const newSet = {
      reps: lastSet.reps,
      weight: lastSet.weight || 0,
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

    console.log("[handleAddSet] Adding set:", {
      exerciseId,
      oldSetsCount: currentExercise.sets.length,
      newSetsCount: updatedSets.length,
      updatedRoutine,
    });

    setRoutine(updatedRoutine);

    // ✅ Guardar la rutina modificada en el activeWorkout para que persista al refrescar
    try {
      await updateModifiedRoutine(updatedRoutine);

      // Persistir la rutina actualizada
      await updateRoutine(id, updatedRoutine);
      console.log("[handleAddSet] Successfully saved to storage");
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
          await updateModifiedRoutine(updatedRoutine);

          // Asegurar sincronización adicional con backend por redundancia
          await updateRoutine(id, updatedRoutine);

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
    ],
  );

  // ==================== QUICK EDIT MODE HANDLERS ====================
  // ✅ CRÍTICO #8 FIX: Usar solo estado en lugar de ref manual para locks
  const [togglingKeys, setTogglingKeys] = useState<Record<string, boolean>>({});

  const handleQuickEditReps = useCallback(
    (exerciseId: string, setIndex: number, reps: number) => {
      console.log("[handleQuickEditReps] Called:", {
        exerciseId,
        setIndex,
        reps,
      });
      const currentReps = workoutState.workoutData.actualReps[exerciseId] || [];
      const newReps = [...currentReps];
      newReps[setIndex] = reps;
      workoutState.updateActualReps(exerciseId, newReps);

      console.log(
        "[handleQuickEditReps] completedSets BEFORE:",
        workoutState.workoutData.completedSets[exerciseId],
      );
      // NO actualizar completed sets automáticamente - debe ser manual con el checkbox
      console.log(
        "[handleQuickEditReps] completedSets AFTER:",
        workoutState.workoutData.completedSets[exerciseId],
      );
    },
    [workoutState],
  );

  const handleQuickEditWeight = useCallback(
    (exerciseId: string, setIndex: number, weight: number) => {
      console.log("[handleQuickEditWeight] Called:", {
        exerciseId,
        setIndex,
        weight,
      });
      const currentWeights =
        workoutState.workoutData.actualWeights[exerciseId] || [];
      const newWeights = [...currentWeights];
      newWeights[setIndex] = weight;
      workoutState.updateActualWeights(exerciseId, newWeights);

      // ✅ Récord personal eliminado - no se celebra durante el entrenamiento

      console.log(
        "[handleQuickEditWeight] completedSets BEFORE:",
        workoutState.workoutData.completedSets[exerciseId],
      );
      console.log(
        "[handleQuickEditWeight] completedSets AFTER:",
        workoutState.workoutData.completedSets[exerciseId],
      );
    },
    [workoutState, routine?.exercises],
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
        console.log(
          "[handleQuickToggleSetComplete] Ignorado - operación en curso:",
          key,
        );
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
        setTimeout(() => {
          setTogglingKeys((prev) => {
            const copy = { ...prev };
            delete copy[key];
            return copy;
          });
        }, delay);
      };

      try {
        console.log("[handleQuickToggleSetComplete] Called:", {
          exerciseId,
          setIndex,
          isComplete,
        });
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
          if (result.nextAction && result.nextAction !== "none" && !skipRestTimers) {
            timerHandlers.startTimer(
              result.restTime || 0,
              result.restTitle,
              result.nextExerciseName,
            );
          }
        } else {
          // Desmarcar - limpiar solo este índice
          newReps[setIndex] = 0;
          newWeights[setIndex] = 0;

          workoutState.updateActualReps(exerciseId, newReps);
          workoutState.updateActualWeights(exerciseId, newWeights);

          const completedCount = calculateCompletedSets(newReps);
          workoutState.updateCompletedSets(exerciseId, completedCount);

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
      // Actualizar el estado local del workout
      workoutState.skipExercise(exerciseId);

      // Actualizar el activeWorkout en el contexto
      skipExercise(exerciseId);

      success("Ejercicio omitido en esta sesión", 2000);
    },
    [workoutState, skipExercise, success],
  );

  const handleUnskipExercise = useCallback(
    (exerciseId: string) => {
      // Actualizar el estado local del workout
      workoutState.unskipExercise(exerciseId);

      // Actualizar el activeWorkout en el contexto
      unskipExercise(exerciseId);

      success("Ejercicio restaurado", 2000);
    },
    [workoutState, unskipExercise, success],
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
          typeof lastWeightFromState === 'number' && lastWeightFromState > 0
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

      console.log(
        "[handleQuickAddSet] Adding set to exercise:",
        exerciseId,
        "New count:",
        updatedSets.length,
      );

      setRoutine(updatedRoutine);

      // ✅ Guardar la rutina modificada en el activeWorkout para que persista al refrescar
      try {
        await updateModifiedRoutine(updatedRoutine);

        // Persistir la rutina actualizada
        await updateRoutine(id, updatedRoutine);
        success("Serie agregada", 2000);
      } catch (err) {
        console.error("[handleQuickAddSet] Error saving:", err);
        error("Error al agregar serie");
        // Revertir cambio local si falla
        setRoutine(routine);
      }
    },
    [routine, id, updateRoutine, updateModifiedRoutine, success, error],
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
              onOpenSoundSettings={soundSettingsModal.openSettings} // ✨ NEW: Callback para abrir configuración
            />
          </div>
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
                      <input
                        type="number"
                        min={10}
                        max={180}
                        value={preMinutesPerSession}
                        onChange={(e) => setPreMinutesPerSession(Number(e.target.value || 45))}
                        className="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Descanso entre series (seg)</label>
                      <input
                        type="number"
                        min={10}
                        step={5}
                        value={preRestBetweenSets}
                        onChange={(e) => setPreRestBetweenSets(Number(e.target.value || 60))}
                        className="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Descanso entre ejercicios (seg)</label>
                      <input
                        type="number"
                        min={10}
                        step={5}
                        value={preRestBetweenExercises}
                        onChange={(e) => setPreRestBetweenExercises(Number(e.target.value || 120))}
                        className="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
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

        {/* Toggle entre Modo Guiado y Edición Rápida */}
        <div className="mb-4 flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
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
                  onChange={(e) =>
                    setEditingTime((prev) => ({
                      ...prev,
                      hours: Math.max(
                        0,
                        Math.min(23, parseInt(e.target.value) || 0),
                      ),
                    }))
                  }
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
                  onChange={(e) =>
                    setEditingTime((prev) => ({
                      ...prev,
                      minutes: Math.max(
                        0,
                        Math.min(59, parseInt(e.target.value) || 0),
                      ),
                    }))
                  }
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
                  onChange={(e) =>
                    setEditingTime((prev) => ({
                      ...prev,
                      seconds: Math.max(
                        0,
                        Math.min(59, parseInt(e.target.value) || 0),
                      ),
                    }))
                  }
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
          onFinish={handleFinish}
          isSaving={false}
        />

        {/* ✨ NEW: Modal de configuración de sonidos */}
        <soundSettingsModal.SoundSettingsModal />

        {showExerciseInfo && (
          <Suspense fallback={<LoadingState message="Cargando ejercicio..." />}>
            {loadingExerciseInfo ? (
              <div className="p-6">
                <LoadingState message="Cargando ejercicio..." />
              </div>
            ) : (
              <ExerciseInfoPanel
                exercise={
                  exerciseInfo ||
                  EXERCISE_DATABASE.find(
                    (e) => e.name === selectedExerciseName,
                  ) ||
                  ({
                    id: selectedExerciseName,
                    name: selectedExerciseName,
                    muscleGroup: "pecho",
                  } as any)
                }
                onClose={() => {
                  setShowExerciseInfo(false);
                  setSelectedExerciseName("");
                  setExerciseInfo(null);
                  setLoadingExerciseInfo(false);
                }}
              />
            )}
          </Suspense>
        )}

        {/* ✅ Celebración de récord personal eliminada - no se muestra durante el entrenamiento */}

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
              if (
                routine &&
                workoutState.currentExerciseIndex < routine.exercises.length - 1
              ) {
                workoutState.setCurrentExerciseIndex(
                  workoutState.currentExerciseIndex + 1,
                );
                workoutState.setCurrentSet(1);
              }
            }}
          />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}
