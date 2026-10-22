import { Suspense, memo, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { SwipeButton } from "@/components/ui/SwipeButton";
import { ExerciseCard as ExerciseCardBase } from "./ExerciseCard";
import { QuickExerciseSwitcher } from "./QuickExerciseSwitcher";
import { AddExerciseButton } from "./AddExerciseButton";
import { ExerciseList } from "./ExerciseList";
import { lazy } from "react";
import { MinimizedTimer } from "@/components/features/workout/MinimizedTimer";
import { useTranslations } from "@/context/LocaleContext";
import type { useWorkoutPageState } from "../hooks/useWorkoutPageState";

const SeriesTable = lazy(() =>
  import("./SeriesTable").then((m) => ({ default: m.SeriesTable })),
);
const ExerciseCard = memo(ExerciseCardBase);

export function WorkoutGuidedView({
  routine,
  currentExercise,
  workoutState,
  setExecution,
  handleCompleteSet,
  setSelectedExerciseName,
  setShowExerciseInfo,
  weightPrediction,
  lastSetData,
  handleRepeatPrevious,
  isSeriesTableExpanded,
  setIsSeriesTableExpanded,
  handleEditReps,
  handleEditWeight,
  handleEditSetType,
  timerHandlers,
  handleTimerComplete,
  smartRestTime,
  handleToggleSetComplete,
  handleAddSet,
  handleDeleteSet,
  handleEditRestTime,
  handleApplySmartRest,
  useSmartRest,
  handleSelectExercise,
  handleMoveExercise,
  handleAddExercises,
  updateModifiedRoutine,
  prepareRoutineForSave,
  setRoutine,
}: ReturnType<typeof useWorkoutPageState>) {
  const t = useTranslations("workout");
  const addExerciseAnchorRef = useRef<HTMLDivElement>(null);
  const [tutElapsed, setTutElapsed] = useState(0);

  useEffect(() => {
    const startTime = setExecution.setStartTime;
    if (!setExecution.isExecutingSet || !startTime) {
      setTimeout(() => setTutElapsed(0), 0);
      return;
    }

    const updateElapsed = () =>
      setTutElapsed(Math.floor((Date.now() - startTime) / 1000));
    updateElapsed();
    const intervalId = setInterval(updateElapsed, 1000);
    return () => clearInterval(intervalId);
  }, [setExecution.isExecutingSet, setExecution.setStartTime]);

  if (!currentExercise || !routine) return null;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200/80 bg-white/95 px-3 pt-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-12px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/95 sm:px-4 sm:pt-3">
        {timerHandlers.showTimer && timerHandlers.timerMinimized && (
          <div className="mx-auto mb-2 w-full max-w-3xl">
            <MinimizedTimer
              embedded
              timeLeft={timerHandlers.currentTimeLeft}
              title={timerHandlers.timerTitle}
              duration={timerHandlers.timerDuration}
              onExpand={timerHandlers.expandTimer}
              onSkip={timerHandlers.skipAndAdvance}
            />
          </div>
        )}
        <div className="mx-auto w-full max-w-3xl">
        {setExecution.isExecutingSet && setExecution.setStartTime && (
          <div className="mb-2 flex items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-900 dark:bg-blue-950/50">
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600 dark:bg-blue-300" />
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-blue-800 dark:text-blue-200">
                {t("setInProgress")}
              </span>
              <span className="truncate text-[10px] text-blue-700 dark:text-blue-300">
                {currentExercise.name} · #{workoutState.currentSet}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wide text-blue-700 dark:text-blue-300">
                {t("timeUnderTension")}
              </span>
              <span className="text-base font-black leading-none tabular-nums text-blue-950 dark:text-white">
                {Math.floor(tutElapsed / 60)}:
                {String(tutElapsed % 60).padStart(2, "0")}
              </span>
            </div>
          </div>
        )}
        {!setExecution.isExecutingSet ? (
          <Button
            variant="primary"
            onClick={() => {
              setExecution.startSet();
            }}
            className="min-h-16 w-full justify-center rounded-2xl border border-blue-400/30 bg-blue-600 py-3 text-base font-bold shadow-xl shadow-blue-950/15 touch-manipulation hover:bg-blue-700"
          >
            <div className="flex flex-col items-center text-center">
              <span>
                {t("startSet")}{" "}
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
          <div>
            <SwipeButton
              key={`complete-set-${workoutState.currentSet}-${currentExercise.id}`}
              onComplete={() => handleCompleteSet(workoutState.currentSet)}
              disabled={
                workoutState.currentReps === "" ||
                workoutState.currentReps <= 0 ||
                workoutState.currentWeight === ""
              }
              text={
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[17px]">
                    {t("tapOrSwipeToComplete")} {Math.min(workoutState.currentSet, currentExercise.sets.length)}
                  </span>
                  <span className="text-xs font-normal text-white/90">
                    {workoutState.currentReps} reps × {workoutState.currentWeight}kg
                  </span>
                </div>
              }
              completedText={
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[17px]">{t("setDone")}</span>
                  <span className="text-xs font-normal text-white/90">{t("startingRest")}</span>
                </div>
              }
            />
          </div>
        )}
        </div>
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
        onRepsChange={(reps: number | '') => {
          workoutState.setCurrentReps(reps);
          if (currentExercise) {
            const newReps = [...(workoutState.workoutData.actualReps[currentExercise.id] || [])];
            newReps[workoutState.currentSet - 1] = reps === "" ? 0 : reps;
            workoutState.updateActualReps(currentExercise.id, newReps);
          }
        }}
        onWeightChange={(weight: number | '') => {
          workoutState.setCurrentWeight(weight);
          if (currentExercise) {
            const newWeights = [...(workoutState.workoutData.actualWeights[currentExercise.id] || [])];
            newWeights[workoutState.currentSet - 1] = weight || 0;
            workoutState.updateActualWeights(currentExercise.id, newWeights);
          }
        }}
        onShowInfo={() => {
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
        quickSwitcher={
          <QuickExerciseSwitcher
            routine={routine}
            currentExerciseIndex={workoutState.currentExerciseIndex}
            completedSets={workoutState.workoutData.completedSets}
            onSelectExercise={(index: number) => {
              workoutState.setCurrentExerciseIndex(index);
              workoutState.setCurrentSet(1);
            }}
          />
        }
        onTempoChange={(tempo: string | null) => {
          if (!routine) return;
          const newExercises = routine.exercises.map((ex, i) =>
            i === workoutState.currentExerciseIndex ? { ...ex, tempo: tempo || undefined } : ex
          );
          const updatedRoutine = { ...routine, exercises: newExercises };
          setRoutine(updatedRoutine);
          updateModifiedRoutine(prepareRoutineForSave(updatedRoutine)).catch(() => {});
        }}
        // Timer de descanso inline
        isResting={timerHandlers.showTimer && !timerHandlers.timerMinimized}
        restDuration={timerHandlers.timerDuration}
        restTitle={timerHandlers.timerTitle}
        nextExerciseName={timerHandlers.nextExerciseName}
        onRestComplete={handleTimerComplete}
        onRestExtend={(s) => timerHandlers.setCurrentTimeLeft(timerHandlers.currentTimeLeft + s)}
        onRestPause={() => timerHandlers.minimizeTimer(timerHandlers.currentTimeLeft)}
        onRestSkip={timerHandlers.skipAndAdvance}
        smartRestSuggestion={smartRestTime ? { seconds: smartRestTime, reason: `Descanso inteligente para ${currentExercise?.name}` } : null}
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
  );
}
