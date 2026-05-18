"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGym } from "@/context/GymContext";
import { useToast, useConfirm } from "@/context/NotificationContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Timer } from "@/components/features/workout/Timer";
import { SetTimer } from "@/components/features/workout/SetTimer";
import { PreparationCountdown } from "@/components/features/workout/PreparationCountdown";
import SetTypeSelector, { SetTypeBadge } from "@/components/features/workout/SetTypeSelector";
import { WeightSelector } from "@/components/features/workout/WeightSelector";
import { Input } from "@/components/ui/Input";
import { NumericInput } from "@/components/ui/NumericInput";
import { Toggle } from "@/components/ui/Toggle";
import { RestTimeSelector } from "@/components/features/workout/RestTimeSelector";
import { ExerciseSelector } from "@/components/features/exercises/ExerciseSelector";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { calculateRestBetweenSets, formatRestTime } from "@/lib/workout/restCalculator";
import { generateRoutine } from "@/lib/routines/routineGenerator";
import { getRoutineStats } from "@/lib/routines/routineEstimation";
import { EXERCISE_DATABASE, ExerciseTemplate } from "@/data/exercises";
import { getExerciseRecommendations } from "@/lib/exercises/exerciseRecommendations";
import type { UserProfile } from "@/types";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Zap,
} from "lucide-react";

interface FreeExercise {
  id: string;
  name: string;
  equipment?: string;
  completedSets: {
    reps: number;
    weight: number;
    duration?: number;
    type?: import("@/types").SetType;
    checked?: boolean; // Para trackear si está marcado o no
  }[];
  restBetweenSets?: number;
  // Recomendaciones inteligentes
  recommendedSets?: number;
  recommendedReps?: number;
  recommendedWeight?: number;
}

export default function FreeWorkoutPage() {
  const router = useRouter();
  const { addSession } = useGym();
  const { success, error } = useToast();
  const { confirm } = useConfirm();

  const [exercises, setExercises] = useState<FreeExercise[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("gym-tracker-free-workout");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.exercises || [];
      }
    } catch (e) {
      console.error("Error restoring free workout:", e);
    }
    return [];
  });
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number | null>(
    () => {
      if (typeof window === "undefined") return null;
      try {
        const stored = localStorage.getItem("gym-tracker-free-workout");
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.activeExerciseIndex ?? null;
        }
      } catch {
        /* ignore */
      }
      return null;
    },
  );
  const [collapsedExercises, setCollapsedExercises] = useState<Set<number>>(
    () => new Set(),
  );
  const [currentReps, setCurrentReps] = useState<number | "">(10);
  const [currentWeight, setCurrentWeight] = useState<number | "">(0);
  const [currentSetType, setCurrentSetType] = useState<import("@/types").SetType>("normal");
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [proposedDuration, setProposedDuration] = useState<number>(0); // seconds
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null);
  const [totalPausedTime, setTotalPausedTime] = useState(0);

  // Estado para el perfil del usuario
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Cargar perfil del usuario
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Verificar modo de almacenamiento
        const { isLocalStorageMode } = await import("@/lib/storageConfig");

        if (isLocalStorageMode()) {
          // Modo LOCAL: Cargar desde localStorage
          if (typeof window !== "undefined") {
            const { getProfileLocally } = await import("@/lib/user/localProfile");
            const localProfile = getProfileLocally();

            if (localProfile) {
              setUserProfile(localProfile);
              return;
            }
          }
        } else {
          // Modo DATABASE: Cargar desde Supabase
          // console.log("[FreeWorkout] ☁️ Loading profile from Supabase...");
          const response = await fetch("/api/profile");
          if (response.ok) {
            const profile = await response.json();
            // console.log(
            //   "[FreeWorkout] ✅ Loaded profile from Supabase:",
            //   profile,
            // );
            setUserProfile(profile);
          }
        }
      } catch (error) {
        console.error("[FreeWorkout] ❌ Error loading profile:", error);
      }
    };
    loadProfile();
  }, []);

  // Timer state
  const [showTimer, setShowTimer] = useState(false);
  const [timerDuration, setTimerDuration] = useState(60);
  const [timerTitle, setTimerTitle] = useState("");
  const [actualRestTimes, setActualRestTimes] = useState<{
    [key: string]: number[];
  }>({});

  // Smart rest
  const [useSmartRest, setUseSmartRest] = useState(true);
  const [globalRestTime, setGlobalRestTime] = useState(() => {
    if (typeof window === "undefined") return 60;
    try {
      const stored = localStorage.getItem("gym-tracker-free-workout");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.globalRestTime ?? 60;
      }
    } catch (e) {
      // ignore
    }
    return 60;
  });

  // Estados para UX mejorada (preparación y ejecución)
  const [showPreparation, setShowPreparation] = useState(false);
  const [isExecutingSet, setIsExecutingSet] = useState(false);

  // --- Preconfiguración rápida (sugerencias + guardar/aplicar) ---
  const [suggestedRoutines, setSuggestedRoutines] = useState<any[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  
  const [preRestBetweenSets, setPreRestBetweenSets] = useState<number>(60);
  const [preRestBetweenExercises, setPreRestBetweenExercises] = useState<number>(120);
  const addExerciseAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cfg = {
          name: "Sugerida",
          daysPerWeek: 1,
          minutesPerSession: 30,
          level: "intermedio",
          equipment: [],
          goal: ["general"],
          focusAreas: [],
        } as any;

        const generated = await generateRoutine(cfg);
        if (!mounted) return;
        setSuggestedRoutines(generated || []);
        setSelectedSuggestionIndex(0);
      } catch (err) {
        console.error("[FreeWorkout] generateRoutine error", err);
        if (!mounted) return;
        setSuggestedRoutines([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userProfile]);

  const handleRemoveExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
    if (activeExerciseIndex === index) {
      setActiveExerciseIndex(null);
    } else if (activeExerciseIndex !== null && activeExerciseIndex > index) {
      setActiveExerciseIndex(activeExerciseIndex - 1);
    }
  };

  // Añadir ejercicios seleccionados desde el selector
  const handleAddExercises = (templates: ExerciseTemplate[]) => {
    const newItems: FreeExercise[] = templates.map((t) => {
      // Obtener recomendaciones inteligentes
      const recommendations = getExerciseRecommendations(t, userProfile);

      // Convertir tiempo de descanso a segundos
      let restSecs: number | undefined;
      const restTimeMatch = recommendations.restTime.match(/(\d+)/);
      if (restTimeMatch) {
        restSecs = parseInt(restTimeMatch[1], 10);
        if (recommendations.restTime.toLowerCase().includes("min")) {
          restSecs = restSecs * 60;
        }
      }

      return {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        name: t.name,
        equipment: t.equipment,
        completedSets: [],
        restBetweenSets: restSecs,
        // Guardar recomendaciones para mostrar al usuario
        recommendedSets: recommendations.sets,
        recommendedReps: recommendations.reps,
        recommendedWeight: recommendations.weight,
      };
    });

    setExercises((prev) => {
      const next = [...prev, ...newItems];
      // Abrir el primer ejercicio agregado
      setActiveExerciseIndex(next.length - newItems.length);
      return next;
    });

    // Mostrar mensaje informativo
    if (userProfile) {
      success(
        `✨ ${templates.length} ejercicio${templates.length > 1 ? "s" : ""} configurado${templates.length > 1 ? "s" : ""} según tu perfil`,
      );
    }

    setShowExerciseSelector(false);
  };

  // Persistir estado del entrenamiento libre en localStorage
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      localStorage.setItem(
        "gym-tracker-free-workout",
        JSON.stringify({
          exercises,
          activeExerciseIndex,
          globalRestTime,
        }),
      );
    } catch (e) {
      // ignore
    }
  }, [exercises, activeExerciseIndex, globalRestTime]);

  const clearStorage = () => {
    try {
      if (typeof window === "undefined") return;
      localStorage.removeItem("gym-tracker-free-workout");
    } catch (e) {}
  };

  const handleStartSet = () => {
    setShowPreparation(true);
  };

  const handlePreparationComplete = () => {
    setShowPreparation(false);
    setIsExecutingSet(true);
  };

  const handleCompleteSet = () => {
    setIsExecutingSet(false);

    if (activeExerciseIndex === null) return;

    const exercise = exercises[activeExerciseIndex];
    if (!exercise) return;

    // Add set (normalizar valores vacíos a 0)
    const repsValue = typeof currentReps === "number" ? currentReps : 0;
    const weightValue = typeof currentWeight === "number" ? currentWeight : 0;

    // Add set with type
    const newExercises = [...exercises];
    newExercises[activeExerciseIndex] = {
      ...exercise,
      completedSets: [
        ...exercise.completedSets,
        {
          reps: repsValue,
          weight: weightValue,
          type: currentSetType,
          checked: true, // Marcar como completada por defecto
        },
      ],
    };
    setExercises(newExercises);

    // Reset set type to normal for next set
    setCurrentSetType("normal");

    // Calculate rest time
    let restTime: number;

    if (exercise.restBetweenSets && exercise.restBetweenSets > 0) {
      restTime = exercise.restBetweenSets;
    } else if (useSmartRest) {
      const template = EXERCISE_DATABASE.find((e) => e.name === exercise.name);
      if (template) {
        const rec = calculateRestBetweenSets(
          template,
          exercise.completedSets.length + 1,
          typeof currentReps === "number" ? currentReps : undefined,
          "intermediate",
        );
        restTime = rec.recommended;
      } else {
        restTime = globalRestTime;
      }
    } else {
      restTime = globalRestTime;
    }

    const setNumber = exercise.completedSets.length + 1;
    setTimerTitle(`Descanso - Serie ${setNumber} completada`);
    setTimerDuration(restTime);
    setShowTimer(true);
  };

  const handleSetTimerComplete = (duration: number, pausedTime: number) => {
    setTotalPausedTime((prev) => prev + pausedTime);
    handleCompleteSet();
  };

  const handleActualRestDuration = (actualDuration: number) => {
    if (activeExerciseIndex === null) return;
    const exercise = exercises[activeExerciseIndex];
    if (!exercise) return;

    // Guardar el tiempo real de descanso para este ejercicio
    const newActualRestTimes = {
      ...actualRestTimes,
      [exercise.id]: [...(actualRestTimes[exercise.id] || []), actualDuration],
    };

    setActualRestTimes(newActualRestTimes);
  };

  const handleTimerComplete = () => {
    setShowTimer(false);
  };

  const handleFinishWorkout = () => {
    if (
      exercises.length === 0 ||
      exercises.every((e) => e.completedSets.length === 0)
    ) {
      error("No hay series completadas para guardar");
      return;
    }
    const duration = workoutStartTime ? Math.floor((Date.now() - workoutStartTime) / 1000) : 0;
    setProposedDuration(Math.max(duration, 60));
    setShowNotesModal(true);
  };

  const finishCompleteWorkout = async () => {
    // Prevenir guardados duplicados
    if (showNotesModal === false) {
      console.warn(
        "[finishCompleteWorkout] Already processing, ignoring duplicate call",
      );
      return;
    }

    const totalDuration =
      proposedDuration && proposedDuration > 0
        ? proposedDuration
        : workoutStartTime
        ? Math.floor((Date.now() - workoutStartTime) / 1000)
        : 0;

    const sessionExercises = exercises
      .filter((ex) => ex.completedSets.length > 0)
      .map((ex) => {
        // Filtrar solo las series marcadas como checked
        const checkedSets = ex.completedSets.filter((s) => s.checked !== false);
        return {
          exerciseId: ex.id,
          exerciseName: ex.name,
          completedSets: checkedSets.length,
          actualReps: checkedSets.map((s) => s.reps),
          actualWeight: checkedSets.map((s) => s.weight),
          setDurations: checkedSets.map((s) => s.duration || 0),
          pauseDurations: [],
          actualRestTimes: actualRestTimes[ex.id] || [],
        };
      })
      .filter((ex) => ex.completedSets > 0); // Eliminar ejercicios sin series marcadas

    try {
      await addSession({
        routineId: "free-training",
        routineName: "🏋️ Entrenamiento Libre",
        date: new Date(),
        exercises: sessionExercises,
        notes: sessionNotes.trim() || "",
        totalDuration,
        totalPausedTime,
      });

      clearStorage();
      success("¡Sesión de entrenamiento libre guardada!");

      // Pequeña espera para asegurar que el estado se propague
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Usar replace en lugar de push para prevenir volver atrás
      router.replace("/sessions");
      router.refresh();
    } catch (err) {
      console.error("Error saving free training session:", err);
      error("Error al guardar la sesión");
    }
  };

  const handleCancelWorkout = async () => {
    const confirmed = await confirm({
      title: "Cancelar entrenamiento",
      message:
        "¿Estás seguro? Se perderá todo el progreso del entrenamiento libre.",
      confirmText: "Sí, cancelar",
      cancelText: "Continuar",
      variant: "danger",
    });

    if (confirmed) {
      clearStorage();
      router.replace("/routines");
    }
  };

  const toggleCollapse = (index: number) => {
    setCollapsedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const activeExercise =
    activeExerciseIndex !== null ? exercises[activeExerciseIndex] : null;

  // Ocultar navbar cuando se muestra el timer
  useEffect(() => {
    if (showTimer) {
      document.body.classList.add("hide-navbar");
    } else {
      document.body.classList.remove("hide-navbar");
    }

    return () => {
      document.body.classList.remove("hide-navbar");
    };
  }, [showTimer]);

  // Timer screen
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
              showMotivation={true}
              onActualDurationChange={handleActualRestDuration}
            />
            <div className="mt-6 text-center space-y-3">
              <Button
                variant="ghost"
                onClick={handleTimerComplete}
                className="w-full"
              >
                ⏭️ Saltar descanso
              </Button>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p>💡 Tip: Aprovecha para hidratarte y respirar profundo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-linear-to-br from-orange-500 to-red-600 rounded-xl">
                <Zap className="w-5 h-5 text-white" />
              </div>
              Entrenamiento Libre
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Entrena sin rutina predefinida. Agrega ejercicios y registra
              series sobre la marcha.
            </p>
          </div>

          {/* Panel de preconfiguración (solo cuando no hay ejercicios) */} 
          {exercises.length === 0 && (
            <div className="mb-6">
              <Card>
                <CardHeader className="pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">Preconfiguración rápida</CardTitle>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Genera una rutina sugerida y agrégala a tu lista</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-gray-600 mb-1">Rutina sugerida</label>
                      <select
                        value={selectedSuggestionIndex}
                        onChange={(e) => setSelectedSuggestionIndex(Number(e.target.value))}
                        className="w-full p-2 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                      >
                        {suggestedRoutines.length === 0 ? (
                          <option>Generando sugerencias...</option>
                        ) : (
                          suggestedRoutines.map((r: any, idx: number) => (
                            <option key={r.id || idx} value={idx}>
                              {r.name}
                            </option>
                          ))
                        )}
                      </select>

                      <div className="mt-3 flex items-center gap-3 flex-wrap">
                        {(() => {
                          const sel = suggestedRoutines[selectedSuggestionIndex];
                          if (!sel) return <div className="text-xs text-gray-500">-</div>;
                          try {
                            const stats = getRoutineStats(sel.exercises || [], preRestBetweenSets, preRestBetweenExercises);
                            return (
                              <>
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded">{stats.totalExercises} ejercicios</span>
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded">{stats.totalSets} series</span>
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded">{stats.estimatedDurationFormatted}</span>
                              </>
                            );
                          } catch (err) {
                            return <div className="text-xs text-gray-500">-</div>;
                          }
                        })()}
                      </div>

                      <div className="mt-3">
                        <label className="block text-xs text-gray-600 mb-1">Descanso entre ejercicios (seg)</label>
                        <NumericInput
                          value={preRestBetweenExercises}
                          onChange={(v) => setPreRestBetweenExercises(v)}
                          className="p-2 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Button
                        variant="secondary"
                        className="w-full sm:w-auto"
                        onClick={() => {
                          const sel = suggestedRoutines[selectedSuggestionIndex];
                          if (!sel) {
                            error("No hay rutina seleccionada");
                            return;
                          }

                          const rawExercises = sel.exercises || [];
                          const flattened: any[] = Array.isArray(rawExercises)
                            ? rawExercises.flatMap((e: any) => (Array.isArray(e) ? e : [e]))
                            : [];

                          const toApply = flattened.map((ex: any) => ({
                            id: typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2,9)}`,
                            name: ex.name,
                            equipment: ex.equipment,
                            completedSets: [],
                            restBetweenSets: ex.restBetweenSets ?? preRestBetweenSets,
                            recommendedSets: Array.isArray(ex.sets) ? ex.sets.length : undefined,
                            recommendedReps: Array.isArray(ex.sets) && ex.sets[0] ? ex.sets[0].reps : undefined,
                            recommendedWeight: Array.isArray(ex.sets) && ex.sets[0] ? ex.sets[0].weight : undefined,
                          }));

                          setExercises((prev) => {
                            const firstNewIndex = prev.length;
                            const next = [...prev, ...toApply];
                            setActiveExerciseIndex(firstNewIndex >= 0 ? firstNewIndex : 0);
                            setTimeout(() => {
                              if (addExerciseAnchorRef.current) {
                                addExerciseAnchorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              } else if (typeof window !== 'undefined') {
                                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                              }
                            }, 80);
                            return next;
                          });
                          success('Preconfiguración agregada a la lista');
                        }}
                      >
                        Guardar preconfiguración
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Configuración de descanso */}
          <Card className="mb-6">
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1 w-full">
                  <RestTimeSelector
                    label="⏱️ Descanso por defecto"
                    value={globalRestTime}
                    onChange={setGlobalRestTime}
                    includeZero={false}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    🧠 Inteligente
                  </span>
                  <Toggle
                    checked={useSmartRest}
                    onChange={setUseSmartRest}
                    activeColor="bg-purple-600"
                    label="Descanso inteligente"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ejercicio activo */}
          {activeExercise && (
            <Card className="mb-4 border-2 border-orange-400 dark:border-orange-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-orange-500" />
                  {activeExercise.name || "Ejercicio sin nombre"}
                </CardTitle>
                {activeExercise.equipment && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    🏋️ {activeExercise.equipment}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Set timer - compacto */}
                <div className="mb-2">
                  <SetTimer
                    onComplete={handleSetTimerComplete}
                    autoStart={true}
                  />
                </div>

                {/* Stats - compacto */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                      {activeExercise.completedSets.length}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Series
                    </div>
                  </div>
                  <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-xl font-bold text-green-600 dark:text-green-400">
                      {activeExercise.completedSets.reduce(
                        (sum, s) => sum + s.reps,
                        0,
                      )}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Reps
                    </div>
                  </div>
                </div>

                {/* Input reps/weight - compacto */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Repeticiones
                    </label>
                    <NumericInput
                      className="px-2 py-2 border rounded-md text-sm font-medium text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={currentReps}
                      onChange={(v) => setCurrentReps(Math.max(0, v))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Peso (kg)
                    </label>
                    <WeightSelector
                      value={currentWeight === 0 ? "" : currentWeight}
                      onChange={(weight) =>
                        setCurrentWeight(Math.max(0, weight))
                      }
                      exerciseId={activeExercise.id}
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Selector de tipo de serie - compacto */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Serie
                  </label>
                  <SetTypeSelector
                    value={currentSetType}
                    onChange={setCurrentSetType}
                    compact
                  />
                </div>

                {/* Countdown de Preparación */}
                {showPreparation && (
                  <PreparationCountdown
                    duration={3}
                    onComplete={handlePreparationComplete}
                    exerciseName={activeExercise.name}
                    setNumber={activeExercise.completedSets.length + 1}
                  />
                )}

                {/* Botón para iniciar serie */}
                {!isExecutingSet && !showPreparation && (
                  <Button
                    variant="primary"
                    onClick={handleStartSet}
                    disabled={
                      currentReps === 0 ||
                      currentReps === "" ||
                      currentWeight === 0 ||
                      currentWeight === ""
                    }
                    className="w-full text-base py-2.5 bg-blue-600 hover:bg-blue-700"
                  >
                    ▶️ Iniciar Serie {activeExercise.completedSets.length + 1}
                  </Button>
                )}

                {/* Botón grande para completar serie */}
                {isExecutingSet && (
                  <div className="space-y-3">
                    <div className="text-center py-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                      <p className="text-base font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        🏋️ Ejecuta tu serie
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Presiona el botón cuando termines
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      onClick={handleCompleteSet}
                      className="w-full py-4 text-lg font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all hover:scale-105"
                    >
                      <span className="text-xl mr-2">✓</span>
                      Completar Serie
                    </Button>
                  </div>
                )}

                {/* Sets history con edición - compacto */}
                {activeExercise.completedSets.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Series completadas:
                    </p>
                    <div className="space-y-1.5">
                      {activeExercise.completedSets.map((set, i) => (
                        <div
                          key={i}
                          className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-300 dark:border-green-700"
                        >
                          {/* Header con checkbox - compacto */}
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              {/* Checkbox para desmarcar */}
                              <input
                                type="checkbox"
                                checked={set.checked !== false} // Por defecto true si no está definido
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  const newExercises = [...exercises];
                                  const updatedSets = [
                                    ...activeExercise.completedSets,
                                  ];
                                  updatedSets[i] = {
                                    ...updatedSets[i],
                                    checked,
                                  };
                                  newExercises[activeExerciseIndex!] = {
                                    ...activeExercise,
                                    completedSets: updatedSets,
                                  };
                                  setExercises(newExercises);
                                }}
                                className="w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600 text-green-600 focus:ring-2 focus:ring-green-500 cursor-pointer"
                              />
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                #{i + 1}
                              </span>
                              {set.type && set.type !== "normal" && (
                                <SetTypeBadge type={set.type} />
                              )}
                            </div>
                            {/* Botón eliminar */}
                            <button
                              type="button"
                              onClick={() => {
                                const newExercises = [...exercises];
                                newExercises[activeExerciseIndex!] = {
                                  ...activeExercise,
                                  completedSets:
                                    activeExercise.completedSets.filter(
                                      (_, idx) => idx !== i,
                                    ),
                                };
                                setExercises(newExercises);
                              }}
                              className="p-1 text-red-400 hover:text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Inputs editables - compacto */}
                          <div className="grid grid-cols-2 gap-1.5">
                            <div>
                              <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-0.5">
                                Reps
                              </label>
                              <NumericInput
                                className="p-1.5 border rounded-md text-xs text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={set.reps}
                                onChange={(v) => {
                                  const newExercises = [...exercises];
                                  const updatedSets = [
                                    ...activeExercise.completedSets,
                                  ];
                                  updatedSets[i] = {
                                    ...updatedSets[i],
                                    reps: Math.max(0, v),
                                  };
                                  newExercises[activeExerciseIndex!] = {
                                    ...activeExercise,
                                    completedSets: updatedSets,
                                  };
                                  setExercises(newExercises);
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-0.5">
                                Peso (kg)
                              </label>
                              <WeightSelector
                                value={set.weight}
                                onChange={(weight) => {
                                  const newExercises = [...exercises];
                                  const updatedSets = [
                                    ...activeExercise.completedSets,
                                  ];
                                  updatedSets[i] = {
                                    ...updatedSets[i],
                                    weight: Math.max(0, weight),
                                  };
                                  newExercises[activeExerciseIndex!] = {
                                    ...activeExercise,
                                    completedSets: updatedSets,
                                  };
                                  setExercises(newExercises);
                                }}
                                exerciseId={activeExercise.id}
                                placeholder="0"
                                className="p-1.5 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Smart rest info - compacto */}
                {useSmartRest &&
                  (() => {
                    const template = EXERCISE_DATABASE.find(
                      (e) => e.name === activeExercise.name,
                    );
                    if (template) {
                      const rec = calculateRestBetweenSets(
                        template,
                        activeExercise.completedSets.length + 1,
                        typeof currentReps === "number"
                          ? currentReps
                          : undefined,
                        "intermediate",
                      );
                      return (
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span>🧠</span>
                            <span className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                              Descanso sugerido:{" "}
                              {formatRestTime(rec.recommended)}
                            </span>
                          </div>
                          <p className="text-xs text-purple-700 dark:text-purple-300">
                            {rec.description}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })()}
              </CardContent>
            </Card>
          )}

          {/* Lista de ejercicios */}
          <div className="mb-6">
            <div ref={addExerciseAnchorRef} />
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Ejercicios ({exercises.length})
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowExerciseSelector(true)}
                >
                  <Plus className="w-4 h-4" />
                  Agregar
                </Button>
              </div>
            </div>

            {exercises.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Dumbbell className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Aún no has agregado ejercicios
                </p>
                <Button
                  variant="primary"
                  onClick={() => setShowExerciseSelector(true)}
                >
                  <Plus className="w-4 h-4" />
                  Agregar ejercicio
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {exercises.map((exercise, index) => {
                  const isActive = activeExerciseIndex === index;
                  const isCollapsed = collapsedExercises.has(index);

                  return (
                    <div
                      key={exercise.id}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        isActive
                          ? "border-orange-400 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-600"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300"
                      }`}
                      onClick={() => {
                        if (!isActive) setActiveExerciseIndex(index);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-sm font-bold ${
                              isActive
                                ? "text-orange-600 dark:text-orange-400"
                                : "text-gray-500"
                            }`}
                          >
                            {index + 1}
                          </span>
                          <div>
                            <p
                              className={`font-medium ${
                                isActive
                                  ? "text-orange-900 dark:text-orange-100"
                                  : "text-gray-900 dark:text-gray-100"
                              }`}
                            >
                              {exercise.name || "Sin nombre"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {exercise.completedSets.length} series completadas
                              {exercise.completedSets.length > 0 && (
                                <>
                                  {" "}
                                  •{" "}
                                  {exercise.completedSets.reduce(
                                    (s, set) => s + set.reps,
                                    0,
                                  )}{" "}
                                  reps totales
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {exercise.completedSets.length > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCollapse(index);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              {isCollapsed ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronUp className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveExercise(index);
                            }}
                            className="p-1 text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded sets con edición */}
                      {!isCollapsed && exercise.completedSets.length > 0 && (
                        <div className="mt-2 pl-8 space-y-1.5">
                          {exercise.completedSets.map((set, i) => (
                            <div
                              key={i}
                              className="p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-300 dark:border-green-700"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {/* Checkbox */}
                                  <input
                                    type="checkbox"
                                    checked={true}
                                    onChange={(e) => {
                                      if (!e.target.checked) {
                                        const newExercises = [...exercises];
                                        newExercises[index] = {
                                          ...exercise,
                                          completedSets:
                                            exercise.completedSets.filter(
                                              (_, idx) => idx !== i,
                                            ),
                                        };
                                        setExercises(newExercises);
                                      }
                                    }}
                                    className="w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600 text-green-600 focus:ring-2 focus:ring-green-500 cursor-pointer"
                                  />
                                  <span className="text-xs text-gray-600 dark:text-gray-400">
                                    Serie {i + 1}
                                  </span>
                                  {set.type && set.type !== "normal" && (
                                    <SetTypeBadge type={set.type} />
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newExercises = [...exercises];
                                    newExercises[index] = {
                                      ...exercise,
                                      completedSets:
                                        exercise.completedSets.filter(
                                          (_, idx) => idx !== i,
                                        ),
                                    };
                                    setExercises(newExercises);
                                  }}
                                  className="p-1 text-red-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Inputs editables */}
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Reps
                                  </label>
                                  <NumericInput
                                    className="p-1.5 border rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={set.reps}
                                    onChange={(v) => {
                                      const newExercises = [...exercises];
                                      const updatedSets = [
                                        ...exercise.completedSets,
                                      ];
                                      updatedSets[i] = {
                                        ...updatedSets[i],
                                        reps: Math.max(0, v),
                                      };
                                      newExercises[index] = {
                                        ...exercise,
                                        completedSets: updatedSets,
                                      };
                                      setExercises(newExercises);
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Peso (kg)
                                  </label>
                                  <WeightSelector
                                    value={set.weight}
                                    onChange={(weight) => {
                                      const newExercises = [...exercises];
                                      const updatedSets = [
                                        ...exercise.completedSets,
                                      ];
                                      updatedSets[i] = {
                                        ...updatedSets[i],
                                        weight,
                                      };
                                      newExercises[index] = {
                                        ...exercise,
                                        completedSets: updatedSets,
                                      };
                                      setExercises(newExercises);
                                    }}
                                    exerciseId={exercise.id}
                                    placeholder="0"
                                    className="p-1.5 text-xs"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 sticky bottom-4">
            <Button
              variant="ghost"
              onClick={handleCancelWorkout}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleFinishWorkout}
              className="flex-1"
              disabled={exercises.every((e) => e.completedSets.length === 0)}
            >
              ✅ Finalizar entrenamiento
            </Button>
          </div>
        </div>
      </div>

      {/* Notes modal */}
      <Modal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        title="¡Entrenamiento completado! 🎉"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            ¿Quieres agregar alguna nota sobre este entrenamiento libre?
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notas (opcional)
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Ej: Probé un nuevo ejercicio, me gustó la variación..."
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setSessionNotes("");
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

      {/* Exercise selector modal */}
      <Modal
        isOpen={showExerciseSelector}
        onClose={() => setShowExerciseSelector(false)}
        title="Seleccionar ejercicios"
        contentClassName="max-w-5xl w-full"
      >
        <ExerciseSelector
          onSelectExercises={handleAddExercises}
          onClose={() => setShowExerciseSelector(false)}
        />
      </Modal>
    </ProtectedRoute>
  );
}
