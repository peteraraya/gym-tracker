"use client";

import { lazy, Suspense, memo } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { NumericInput } from "@/components/ui/NumericInput";
import { useTranslations } from "@/context/LocaleContext";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { motion, AnimatePresence } from "framer-motion";
import { MinimizedTimer } from "@/components/features/workout/MinimizedTimer";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

import { CompactWorkoutHeader } from "./components/CompactWorkoutHeader";
import { WorkoutModals } from "./components/WorkoutModals";
import { WorkoutGuidedView } from "./components/WorkoutGuidedView";
import { WorkoutStartSplash } from "@/components/features/workout/WorkoutStartSplash";
import { WorkoutCompleteSplash } from "@/components/features/workout/WorkoutCompleteSplash";
import { Skeleton } from "@/components/ui/Skeleton";
import { PRCelebration } from "@/components/features/workout/PRCelebration";
import { useWorkoutPageState } from "./hooks/useWorkoutPageState";
import { RestTimer } from "@/components/workout/RestTimer";

import { getRoutineStats } from '@/lib/application/routines/routineEstimation';
import { applySmartRestToAllSets, calculateSmartRestTime } from "./services/restCalculationService";
import type { Exercise } from "@/types";

const ExerciseInfoPanel = lazy(() =>
  import("@/components/features/exercises/ExerciseInfoPanel").then((m) => ({
    default: m.ExerciseInfoPanel,
  }))
);
const SetExecutionModal = lazy(() =>
  import("@/components/features/workout/SetExecutionModal").then((m) => ({
    default: m.SetExecutionModal,
  }))
);

const QuickEditMode = lazy(async () => {
  const mod = await import("./components/QuickEditMode");
  const Component = mod.QuickEditMode ?? mod.default;

  return {
    default: memo(Component),
  };
});

export default function WorkoutPage() {
  const t = useTranslations("workout");
  const params = useParams();
  const id = params.id as string;

  const state = useWorkoutPageState(id);

  if (!state.isInitialized) {
    return (
      <div
        className="mx-auto w-full max-w-3xl space-y-6 px-3 pt-8 sm:px-4"
        role="status"
        aria-busy="true"
        aria-label={t("preparingWorkout")}
      >
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-full max-w-md">
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex flex-col items-center justify-center">
                <Skeleton className="mb-3 h-5 w-2/5" />
                <Skeleton className="h-4 w-1/3" />
              </div>
              <div className="space-y-2 pt-4">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{t("preparingWorkout")}</p>
        </div>
        <span className="sr-only">{t("preparingWorkout")}</span>
      </div>
    );
  }

  if (!state.routine || !state.routine.exercises || state.routine.exercises.length === 0) {
    if (state.gymLoading) {
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
            <Button onClick={() => state.router.push("/routines")}>
              Volver a rutinas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  {/* Breadcrumb de navegación */}

  <div className="container mx-auto px-4 py-2">
    <Breadcrumb
      items={[
        { label: "Inicio", href: "/" },
        { label: "Rutinas", href: "/routines" },
        {
          label: state.routine?.name || "Entrenamiento",
          href: undefined,
        },
      ]}
    />
  </div>

  if (!state.currentExercise) {
    return null;
  }

  if (state.timerHandlers.showTimer && !state.timerHandlers.timerMinimized) {
    const currentEx = state.currentExercise;
    const nextEx = state.routine?.exercises.find((ex: Exercise, idx: number) =>
      idx === state.workoutState.currentExerciseIndex + 1 && !state.workoutState.workoutData.skippedExercises?.includes(ex.id)
    );
    const isLastSet = currentEx && (state.workoutState.workoutData.completedSets[currentEx.id] || 0) >= currentEx.sets.length - 1;
    const smartSuggestion = (currentEx && state.useSmartRest && calculateSmartRestTime(currentEx))
      ? { seconds: calculateSmartRestTime(currentEx) || 30, reason: `Descanso inteligente sugerido para ${currentEx.name}` }
      : null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-zinc-950/80 px-3 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:px-5">
        <div
          className="relative z-10 my-auto w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-4 shadow-2xl shadow-black/40 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Temporizador de descanso"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key="timer"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="w-full"
            >
              <RestTimer
                duration={state.timerHandlers.timerDuration}
                label={state.timerHandlers.timerTitle}
                nextExercise={isLastSet && nextEx ? nextEx.name : state.timerHandlers.nextExerciseName}
                smartSuggestion={smartSuggestion}
                onComplete={state.handleTimerComplete}
                onSkip={state.timerHandlers.skipAndAdvance}
                onExtend={(s) => state.timerHandlers.setCurrentTimeLeft(state.timerHandlers.currentTimeLeft + s)}
                onPause={() => state.timerHandlers.minimizeTimer(state.timerHandlers.currentTimeLeft)}
                autoStart={true}
                size="xl"
              />
              
              <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3 text-center shadow-lg animate-fade-in-up sm:mt-5 sm:p-4">
                <p className="mb-3 text-xs font-semibold tracking-wide text-zinc-400 sm:text-sm">¿Cómo sentiste la serie anterior?</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const currentW = Number(state.workoutState.currentWeight) || 0;
                      const newWeight = Math.max(0, currentW + 2.5);
                      state.workoutState.setCurrentWeight(newWeight);
                      state.success(`💪 Fácil: Peso ajustado a ${newWeight}kg para la siguiente serie`, 3000);
                      state.haptic.success();
                    }}
                    className="min-h-14 flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-1 py-2 text-xs font-semibold text-emerald-400 transition-all hover:-translate-y-0.5 hover:border-emerald-400/60 hover:bg-emerald-500/15 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    🥱 Fácil<br/>(+2.5kg)
                  </button>
                  <button 
                    onClick={() => {
                      state.success(`👍 Normal: Mantenemos el peso`, 2000);
                      state.haptic.success();
                    }}
                    className="min-h-14 flex-1 rounded-xl border border-zinc-700 bg-zinc-800/80 px-1 py-2 text-xs font-semibold text-zinc-200 transition-all hover:-translate-y-0.5 hover:border-zinc-500 hover:bg-zinc-800 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    😐 Normal<br/>(Igual)
                  </button>
                  <button 
                    onClick={() => {
                      const currentW = Number(state.workoutState.currentWeight) || 0;
                      const newWeight = Math.max(0, currentW - 2.5);
                      state.workoutState.setCurrentWeight(newWeight);
                      state.success(`🔥 Difícil: Peso ajustado a ${newWeight}kg para evitar fallos`, 3000);
                      state.haptic.success();
                    }}
                    className="min-h-14 flex-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-1 py-2 text-xs font-semibold text-rose-400 transition-all hover:-translate-y-0.5 hover:border-rose-400/60 hover:bg-rose-500/15 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                  >
                    🥵 Difícil<br/>(-2.5kg)
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto w-full max-w-3xl px-3 pt-2 pb-[calc(9rem+env(safe-area-inset-bottom))] sm:px-4 sm:pt-4">
        {state.timerHandlers.showTimer && state.timerHandlers.timerMinimized && (
          <MinimizedTimer
            timeLeft={state.timerHandlers.currentTimeLeft}
            title={state.timerHandlers.timerTitle}
            duration={state.timerHandlers.timerDuration}
            onExpand={state.timerHandlers.expandTimer}
            onSkip={state.timerHandlers.skipAndAdvance}
          />
        )}

        <div className={`mb-3 ${!state.isQuickEditMode ? 'sticky top-0 z-20 -mx-3 px-3 pt-[env(safe-area-inset-top)] sm:mx-0 sm:px-0 sm:pt-0' : ''}`}>
          <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white/95 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/95">
            <CompactWorkoutHeader
              routine={state.routine}
              currentExerciseIndex={state.workoutState.currentExerciseIndex}
              totalExercises={state.routine.exercises.length}
              elapsedTime={state.elapsedTime}
              completedSets={state.workoutState.workoutData.completedSets}
              actualReps={state.workoutState.workoutData.actualReps}
              actualWeights={state.workoutState.workoutData.actualWeights}
              exercises={state.routine.exercises}
              onCancel={state.handleCancelWorkout}
              isPaused={state.isPaused}
              onPauseToggle={state.handlePauseWorkout}
              onEditTime={state.handleOpenEditTime}
              onOpenSoundSettings={state.soundSettingsModal.openSettings}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              lastSession={state.lastSessionForRoutine as any}
            />
          </div>
          
          <div className="mt-2 flex gap-1 rounded-xl border border-gray-200 bg-gray-100 p-1 dark:border-gray-800 dark:bg-gray-900">
            <button
              onClick={() => state.setIsQuickEditMode(false)}
              className={`min-h-10 flex-1 rounded-lg px-3 py-2 text-sm font-semibold touch-manipulation ${
                !state.isQuickEditMode
                  ? "bg-white text-blue-600 shadow-sm dark:bg-gray-800 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              🎯 Modo Guiado
            </button>
            <button
              onClick={() => state.setIsQuickEditMode(true)}
              className={`min-h-10 flex-1 rounded-lg px-3 py-2 text-sm font-semibold touch-manipulation ${
                state.isQuickEditMode
                  ? "bg-white text-blue-600 shadow-sm dark:bg-gray-800 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              📝 Edición Rápida
            </button>
          </div>
        </div>

        {state.isQuickEditMode && (
          <div className="relative z-20">
            <Suspense
              fallback={
                <div className="space-y-3 animate-pulse">
                  <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                  <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                  <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                </div>
              }
            >
              <QuickEditMode
              routine={state.routine}
              workoutData={state.workoutState.workoutData}
              sessions={state.sessions}
              onEditReps={state.handleQuickEditReps}
              onEditWeight={state.handleQuickEditWeight}
              onEditSetType={state.handleQuickEditSetType}
              onToggleSetComplete={state.handleQuickToggleSetComplete}
              onAddSet={state.handleQuickAddSet}
              onDeleteSet={state.handleQuickDeleteSet}
              onFinishWorkout={() => state.completion.openCompletionModal()}
              onMoveExercise={state.handleMoveExercise}
              onSkipExercise={state.handleSkipExercise}
              onUnskipExercise={state.handleUnskipExercise}
              onShowExerciseInfo={(exerciseName) => {
                state.setSelectedExerciseName(exerciseName);
                state.setShowExerciseInfo(true);
              }}
              onEditRestTime={(exerciseId, restTime) => {
                state.workoutState.updateRestOverride(exerciseId, restTime);
                if (state.timerHandlers.showTimer) {
                  state.timerHandlers.startTimer(restTime, state.timerHandlers.timerTitle, state.timerHandlers.nextExerciseName);
                }
                let timeDisplay;
                if (restTime >= 60) {
                  const minutes = Math.floor(restTime / 60);
                  const seconds = restTime % 60;
                  timeDisplay = seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
                } else {
                  timeDisplay = `${restTime}s`;
                }
                state.success(`⏱️ Descanso actualizado a ${timeDisplay}`, 2000);
              }}
              onApplySmartRest={(exerciseId) => {
                const exercise = state.routine?.exercises.find((ex) => ex.id === exerciseId);
                if (!exercise) return;
                const appliedRestTime = applySmartRestToAllSets(exercise, state.workoutState.updatePerSetRestOverride);
                if (appliedRestTime) {
                  let timeDisplay;
                  if (appliedRestTime >= 60) {
                    const minutes = Math.floor(appliedRestTime / 60);
                    const seconds = appliedRestTime % 60;
                    timeDisplay = seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
                  } else {
                    timeDisplay = `${appliedRestTime}s`;
                  }
                  state.success(`⚡ Descanso inteligente aplicado a todas las series: ${timeDisplay}`, 2000);
                } else {
                  state.error("No se pudo calcular el descanso inteligente para este ejercicio");
                }
              }}
              onAddExercises={state.handleAddExercises}
              onSkipRestTimersChange={state.setSkipRestTimers}
              skipRestTimers={state.skipRestTimers}
              autoAdvance={state.autoAdvance}
              onAutoAdvanceChange={state.setAutoAdvance}
              hideHeader={false}
              activeSet={
                state.setExecution.isExecutingSet && state.setExecution.setStartTime
                  ? {
                      exerciseId: state.currentExercise?.id ?? '',
                      setIndex: state.workoutState.currentSet - 1,
                      startTime: state.setExecution.setStartTime,
                    }
                  : null
              }
            />
            </Suspense>
          </div>
        )}

        {/* Panel de preconfiguración */}
        {state.routine && Array.isArray(state.routine.exercises) && state.routine.exercises.length === 0 && (
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
                        value={state.selectedSuggestionIndex}
                        onChange={(e) => state.setSelectedSuggestionIndex(Number(e.target.value))}
                        className="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
                      >
                        {state.suggestedRoutines.length > 0 ? (
                          state.suggestedRoutines.map((r, idx) => (
                            <option key={r.id || idx} value={idx}>{r.name}</option>
                          ))
                        ) : (
                          <option>No hay sugerencias disponibles</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Duración objetivo (min)</label>
                      <NumericInput
                        value={state.preMinutesPerSession}
                        onChange={(v) => state.setPreMinutesPerSession(v)}
                        className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Descanso entre series (seg)</label>
                      <NumericInput
                        value={state.preRestBetweenSets}
                        onChange={(v) => state.setPreRestBetweenSets(v)}
                        className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Descanso entre ejercicios (seg)</label>
                      <NumericInput
                        value={state.preRestBetweenExercises}
                        onChange={(v) => state.setPreRestBetweenExercises(v)}
                        className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      {state.suggestedRoutines && state.suggestedRoutines[state.selectedSuggestionIndex] ? (
                        (() => {
                          const sel = state.suggestedRoutines[state.selectedSuggestionIndex];
                          const stats = getRoutineStats(sel.exercises || [], state.preRestBetweenSets, state.preRestBetweenExercises);
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
                        variant="primary"
                        onClick={async () => {
                          const sel = state.suggestedRoutines[state.selectedSuggestionIndex];
                          if (!sel) return;

                          const adjusted = {
                            ...sel,
                            restBetweenSets: state.preRestBetweenSets,
                            restBetweenExercises: state.preRestBetweenExercises,
                            exercises: (sel.exercises || []).map((ex: Exercise) => ({
                              ...ex,
                              restBetweenSets: ex.restBetweenSets ?? state.preRestBetweenSets,
                            })),
                          };

                          try {
                            state.setRoutine(adjusted);
                            // startWorkout is not exposed easily but it's part of useWorkout
                            // The user might just add exercises via add exercises button instead.
                          } catch (err) {}
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

        {!state.isQuickEditMode && (
          <WorkoutGuidedView {...state} />
        )}

        <WorkoutModals
          showEditTimeModal={state.showEditTimeModal}
          onCloseEditTimeModal={() => state.setShowEditTimeModal(false)}
          editingTime={state.editingTime}
          onEditingTimeChange={state.setEditingTime}
          onSaveEditedTime={state.handleSaveEditedTime}
          completion={state.completion}
          onFinish={state.handleFinish}
          SoundSettingsModal={state.soundSettingsModal.SoundSettingsModal}
          showExerciseInfo={state.showExerciseInfo}
          loadingExerciseInfo={state.loadingExerciseInfo}
          exerciseInfo={state.exerciseInfo}
          selectedExerciseName={state.selectedExerciseName}
          onCloseExerciseInfo={() => {
            state.setShowExerciseInfo(false);
            state.setSelectedExerciseName("");
            state.setExerciseInfo(null);
            state.setLoadingExerciseInfo(false);
          }}
          setExecution={{
            showSetExecution: state.setExecution.showSetExecution,
            exerciseName: state.currentExercise.name,
            equipment: state.currentExercise.equipment || "Ninguno",
            currentSet: state.workoutState.currentSet,
            totalSets: state.currentExercise.sets.length,
            currentReps: state.workoutState.currentReps,
            currentWeight: state.workoutState.currentWeight,
            exerciseId: state.currentExercise.id,
            onRepsChange: state.workoutState.setCurrentReps,
            onWeightChange: state.workoutState.setCurrentWeight,
            onComplete: state.handleCompleteSet,
            onCancel: () => state.setExecution.cancelSetExecution(),
          }}
          showStartSplash={
            state.showStartSplash && state.isWorkoutActive && state.activeWorkout?.routineId === id
          }
          routineName={state.routine?.name || "Entrenamiento"}
          exerciseCount={state.routine?.exercises?.length || 0}
          totalSets={(state.routine?.exercises || []).reduce((sum: number, ex: Exercise) => sum + (ex.sets?.length || 0), 0)}
          onStartSplashComplete={() => state.setShowStartSplash(false)}
          WorkoutCompleteSplash={WorkoutCompleteSplash}
          completeSplashProps={state.completion.completeSplash}
          onCompleteSplashDone={state.completion.onCompleteSplashDone}
          SetExecutionModal={SetExecutionModal}
          ExerciseInfoPanel={ExerciseInfoPanel}
          WorkoutStartSplash={WorkoutStartSplash}
        />

        <PRCelebration 
          show={state.prInfo.show} 
          onComplete={() => state.setPrInfo(prev => ({ ...prev, show: false }))} 
          title={state.prInfo.title}
          subtitle={state.prInfo.subtitle}
        />
      </div>
    </ProtectedRoute>
  );
}
