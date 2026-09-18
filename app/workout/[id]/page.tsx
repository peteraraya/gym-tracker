"use client";

import { lazy, Suspense, memo } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { NumericInput } from "@/components/ui/NumericInput";
import { Timer } from "@/components/features/workout/Timer";
import { motion, AnimatePresence } from "framer-motion";
import { MinimizedTimer } from "@/components/features/workout/MinimizedTimer";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

import { CompactWorkoutHeader } from "./components/CompactWorkoutHeader";
import { WorkoutModals } from "./components/WorkoutModals";
import { WorkoutGuidedView } from "./components/WorkoutGuidedView";
import { WorkoutStartSplash } from "@/components/features/workout/WorkoutStartSplash";
import { WorkoutCompleteSplash } from "@/components/features/workout/WorkoutCompleteSplash";
import { PRCelebration } from "@/components/features/workout/PRCelebration";
import { useWorkoutPageState } from "./hooks/useWorkoutPageState";

import { getRoutineStats } from '@/lib/routines/routineEstimation';
import { applySmartRestToAllSets } from "./services/restCalculationService";
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

const QuickEditMode = lazy(() =>
  import("./components/QuickEditMode").then((m) => ({
    default: memo(m.QuickEditMode),
  }))
);

export default function WorkoutPage() {
  const params = useParams();
  const id = params.id as string;

  const state = useWorkoutPageState(id);

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

  if (!state.currentExercise) {
    return null;
  }

  if (state.timerHandlers.showTimer && !state.timerHandlers.timerMinimized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-linear-to-br from-blue-600/40 via-purple-600/30 to-indigo-700/25 backdrop-blur-md" />
        <div className="relative z-10 px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key="timer"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col gap-4 max-w-sm mx-auto"
            >
              <Timer
                duration={state.timerHandlers.timerDuration}
                initialTimeLeft={state.timerHandlers.currentTimeLeft}
                title={state.timerHandlers.timerTitle}
                nextExerciseName={state.timerHandlers.nextExerciseName}
                onComplete={state.handleTimerComplete}
                onSkip={state.timerHandlers.skipAndAdvance}
                autoStart={true}
                showMotivation={true}
                onMinimize={state.timerHandlers.minimizeTimer}
              />
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-2xl border border-gray-200 dark:border-gray-700 text-center animate-fade-in-up">
                <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-3">¿Cómo sentiste la serie anterior?</p>
                <div className="flex gap-2 justify-center">
                  <button 
                    onClick={() => {
                      const currentW = Number(state.workoutState.currentWeight) || 0;
                      const newWeight = Math.max(0, currentW + 2.5);
                      state.workoutState.setCurrentWeight(newWeight);
                      state.success(`💪 Fácil: Peso ajustado a ${newWeight}kg para la siguiente serie`, 3000);
                      state.haptic.success();
                    }}
                    className="flex-1 py-2 px-1 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-xs font-bold border border-green-200 dark:border-green-800 active:scale-95 transition-transform"
                  >
                    🥱 Fácil<br/>(+2.5kg)
                  </button>
                  <button 
                    onClick={() => {
                      state.success(`👍 Normal: Mantenemos el peso`, 2000);
                      state.haptic.success();
                    }}
                    className="flex-1 py-2 px-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-bold border border-blue-200 dark:border-blue-800 active:scale-95 transition-transform"
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
                    className="flex-1 py-2 px-1 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-xs font-bold border border-red-200 dark:border-red-800 active:scale-95 transition-transform"
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
      <div className="container mx-auto px-4 py-8 pb-32">
        {state.timerHandlers.showTimer && state.timerHandlers.timerMinimized && (
          <MinimizedTimer
            timeLeft={state.timerHandlers.currentTimeLeft}
            title={state.timerHandlers.timerTitle}
            duration={state.timerHandlers.timerDuration}
            onExpand={state.timerHandlers.expandTimer}
            onSkip={state.timerHandlers.skipAndAdvance}
          />
        )}

        <div className={`mb-4 ${!state.isQuickEditMode ? 'sticky top-16 z-20' : ''}`}>
          <div className="rounded-lg bg-white dark:bg-gray-800 shadow-lg">
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
          
          <div className="mt-1 flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => state.setIsQuickEditMode(false)}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
                !state.isQuickEditMode
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              🎯 Modo Guiado
            </button>
            <button
              onClick={() => state.setIsQuickEditMode(true)}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
                state.isQuickEditMode
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
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
          showStartSplash={state.showStartSplash}
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
