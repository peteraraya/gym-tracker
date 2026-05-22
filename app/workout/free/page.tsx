"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGym } from "@/context/GymContext";
import { useToast, useConfirm } from "@/context/NotificationContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Timer } from "@/components/features/workout/Timer";
import { NumericInput } from "@/components/ui/NumericInput";
import { Toggle } from "@/components/ui/Toggle";
import { RestTimeSelector } from "@/components/features/workout/RestTimeSelector";
import { ExerciseSelector } from "@/components/features/exercises/ExerciseSelector";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { generateRoutine } from "@/lib/routines/routineGenerator";
import { getRoutineStats } from "@/lib/routines/routineEstimation";
import { Zap } from "lucide-react";
import { useFreeWorkoutState, clearFreeWorkoutStorage } from "./hooks/useFreeWorkoutState";
import { FreeWorkoutExerciseCard } from "./components/FreeWorkoutExerciseCard";
import { FreeWorkoutExerciseList } from "./components/FreeWorkoutExerciseList";
import type { UserProfile } from "@/types";

export default function FreeWorkoutPage() {
  const router = useRouter();
  const { addSession } = useGym();
  const { success, error } = useToast();
  const { confirm } = useConfirm();

  const {
    exercises,
    activeExerciseIndex,
    activeExercise,
    globalRestTime,
    collapsedExercises,
    setGlobalRestTime,
    addExercises,
    addExerciseFromSuggestion,
    removeExercise,
    completeSet,
    getSmartRest,
    updateSet,
    deleteSet,
    toggleSetChecked,
    toggleCollapse,
    setExerciseActive,
    clearStorage,
  } = useFreeWorkoutState();

  const [currentReps, setCurrentReps] = useState<number | "">(10);
  const [currentWeight, setCurrentWeight] = useState<number | "">(0);
  const [currentSetType, setCurrentSetType] = useState<import("@/types").SetType>("normal");
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [proposedDuration, setProposedDuration] = useState<number>(0);
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null);
  const [totalPausedTime, setTotalPausedTime] = useState(0);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { isLocalStorageMode } = await import("@/lib/storageConfig");
        if (isLocalStorageMode()) {
          const { getProfileLocally } = await import("@/lib/user/localProfile");
          const localProfile = getProfileLocally();
          if (localProfile) setUserProfile(localProfile);
        } else {
          const response = await fetch("/api/profile");
          if (response.ok) {
            const profile = await response.json();
            setUserProfile(profile);
          }
        }
      } catch (error) {
        console.error("[FreeWorkout] Error loading profile:", error);
      }
    })();
  }, []);

  const [showTimer, setShowTimer] = useState(false);
  const [timerDuration, setTimerDuration] = useState(60);
  const [timerTitle, setTimerTitle] = useState("");
  const [useSmartRest, setUseSmartRest] = useState(true);

  const [showPreparation, setShowPreparation] = useState(false);
  const [isExecutingSet, setIsExecutingSet] = useState(false);

  const [suggestedRoutines, setSuggestedRoutines] = useState<any[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [preRestBetweenSets, setPreRestBetweenSets] = useState<number>(60);
  const [preRestBetweenExercises, setPreRestBetweenExercises] = useState<number>(120);
  const addExerciseAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const generated = await generateRoutine({
          name: "Sugerida", daysPerWeek: 1, minutesPerSession: 30,
          level: "intermedio", equipment: [], goal: ["general"], focusAreas: [],
        } as any);
        if (!mounted) return;
        setSuggestedRoutines(generated || []);
        setSelectedSuggestionIndex(0);
      } catch (err) {
        if (!mounted) return;
        setSuggestedRoutines([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleStartSet = () => setShowPreparation(true);

  const handlePreparationComplete = () => {
    setShowPreparation(false);
    setIsExecutingSet(true);
  };

  const handleCompleteSet = () => {
    setIsExecutingSet(false);
    if (activeExerciseIndex === null) return;

    const repsValue = typeof currentReps === "number" ? currentReps : 0;
    const weightValue = typeof currentWeight === "number" ? currentWeight : 0;

    completeSet(repsValue, weightValue, currentSetType);
    setCurrentSetType("normal");

    const exercise = exercises[activeExerciseIndex];
    let restTime = globalRestTime;
    if (exercise?.restBetweenSets && exercise.restBetweenSets > 0) {
      restTime = exercise.restBetweenSets;
    } else if (useSmartRest) {
      const smart = getSmartRest(exercise!.id, exercise!.completedSets.length, repsValue);
      if (smart) restTime = smart;
    }

    const setNumber = (exercise?.completedSets.length || 0) + 1;
    setTimerTitle(`Descanso - Serie ${setNumber} completada`);
    setTimerDuration(restTime);
    setShowTimer(true);
  };

  const handleSetTimerComplete = (duration: number, pausedTime: number) => {
    setTotalPausedTime((prev) => prev + pausedTime);
    handleCompleteSet();
  };

  const handleTimerComplete = () => setShowTimer(false);

  const handleFinishWorkout = () => {
    if (exercises.length === 0 || exercises.every((e) => e.completedSets.length === 0)) {
      error("No hay series completadas para guardar");
      return;
    }
    const duration = workoutStartTime ? Math.floor((Date.now() - workoutStartTime) / 1000) : 0;
    setProposedDuration(Math.max(duration, 60));
    setShowNotesModal(true);
  };

  const finishCompleteWorkout = async () => {
    if (showNotesModal === false) return;

    const totalDuration =
      proposedDuration > 0 ? proposedDuration
      : workoutStartTime ? Math.floor((Date.now() - workoutStartTime) / 1000) : 0;

    const sessionExercises = exercises
      .filter((ex) => ex.completedSets.length > 0)
      .map((ex) => {
        const checkedSets = ex.completedSets.filter((s) => s.checked !== false);
        return {
          exerciseId: ex.id,
          exerciseName: ex.name,
          completedSets: checkedSets.length,
          actualReps: checkedSets.map((s) => s.reps),
          actualWeight: checkedSets.map((s) => s.weight),
          setDurations: checkedSets.map((s) => s.duration || 0),
          pauseDurations: [],
          actualRestTimes: [],
        };
      })
      .filter((ex) => ex.completedSets > 0);

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
      clearFreeWorkoutStorage();
      success("¡Sesión de entrenamiento libre guardada!");
      await new Promise((resolve) => setTimeout(resolve, 100));
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
      message: "¿Estás seguro? Se perderá todo el progreso del entrenamiento libre.",
      confirmText: "Sí, cancelar",
      cancelText: "Continuar",
      variant: "danger",
    });

    if (confirmed) {
      clearFreeWorkoutStorage();
      router.replace("/routines");
    }
  };

  useEffect(() => {
    if (showTimer) {
      document.body.classList.add("hide-navbar");
    } else {
      document.body.classList.remove("hide-navbar");
    }
    return () => document.body.classList.remove("hide-navbar");
  }, [showTimer]);

  // Full-screen timer
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
            />
            <div className="mt-6 text-center space-y-3">
              <Button variant="ghost" onClick={handleTimerComplete} className="w-full">⏭️ Saltar descanso</Button>
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
              Entrena sin rutina predefinida. Agrega ejercicios y registra series sobre la marcha.
            </p>
          </div>

          {/* Pre-config panel (only when no exercises) */}
          {exercises.length === 0 && (
            <div className="mb-6">
              <Card>
                <CardHeader className="pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">Preconfiguración rápida</CardTitle>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Genera una rutina sugerida y agrégala a tu lista
                      </p>
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
                          suggestedRoutines.map((r, idx) => (
                            <option key={r.id || idx} value={idx}>{r.name}</option>
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
                          } catch { return <div className="text-xs text-gray-500">-</div>; }
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
                          if (!sel) { error("No hay rutina seleccionada"); return; }
                          addExerciseFromSuggestion(sel.exercises || [], preRestBetweenSets);
                          success('Preconfiguración agregada a la lista');
                          setTimeout(() => {
                            if (addExerciseAnchorRef.current) {
                              addExerciseAnchorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }, 80);
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

          {/* Rest config */}
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
                  <span className="text-sm text-gray-700 dark:text-gray-300">🧠 Inteligente</span>
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

          {/* Active exercise card */}
          {activeExercise && (
            <FreeWorkoutExerciseCard
              exercise={activeExercise}
              exerciseIndex={activeExerciseIndex!}
              currentReps={currentReps}
              currentWeight={currentWeight}
              currentSetType={currentSetType}
              onRepsChange={setCurrentReps}
              onWeightChange={setCurrentWeight}
              onSetTypeChange={setCurrentSetType}
              onCompleteSet={handleCompleteSet}
              onStartSet={handleStartSet}
              onSetTimerComplete={handleSetTimerComplete}
              showPreparation={showPreparation}
              isExecutingSet={isExecutingSet}
              useSmartRest={useSmartRest}
              onUpdateSet={updateSet}
              onDeleteSet={deleteSet}
              onToggleSetChecked={toggleSetChecked}
            />
          )}

          {/* Exercise list */}
          <div className="mb-6">
            <div ref={addExerciseAnchorRef} />
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Ejercicios ({exercises.length})
              </h2>
              <Button variant="primary" size="sm" onClick={() => setShowExerciseSelector(true)}>
                Agregar
              </Button>
            </div>

            <FreeWorkoutExerciseList
              exercises={exercises}
              activeExerciseIndex={activeExerciseIndex}
              collapsedExercises={collapsedExercises}
              onSetActive={setExerciseActive}
              onRemove={removeExercise}
              onToggleCollapse={toggleCollapse}
              onAddClick={() => setShowExerciseSelector(true)}
              onUpdateSet={updateSet}
              onDeleteSet={deleteSet}
              onToggleSetChecked={toggleSetChecked}
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 sticky bottom-4">
            <Button variant="ghost" onClick={handleCancelWorkout} className="flex-1">Cancelar</Button>
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
      <Modal isOpen={showNotesModal} onClose={() => setShowNotesModal(false)} title="¡Entrenamiento completado! 🎉">
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">¿Quieres agregar alguna nota sobre este entrenamiento libre?</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notas (opcional)</label>
            <textarea
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Ej: Probé un nuevo ejercicio, me gustó la variación..."
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => { setSessionNotes(""); setShowNotesModal(false); finishCompleteWorkout(); }} className="flex-1">
              Omitir
            </Button>
            <Button variant="primary" onClick={() => { setShowNotesModal(false); finishCompleteWorkout(); }} className="flex-1">
              Guardar y finalizar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Exercise selector modal */}
      <Modal isOpen={showExerciseSelector} onClose={() => setShowExerciseSelector(false)} title="Seleccionar ejercicios" contentClassName="max-w-5xl w-full">
        <ExerciseSelector
          onSelectExercises={(templates) => {
            addExercises(templates, userProfile);
            setShowExerciseSelector(false);
          }}
          onClose={() => setShowExerciseSelector(false)}
        />
      </Modal>
    </ProtectedRoute>
  );
}