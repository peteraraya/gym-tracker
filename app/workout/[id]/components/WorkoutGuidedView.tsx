import { Suspense, memo } from "react";
import { Button } from "@/components/ui/Button";
import { SwipeButton } from "@/components/ui/SwipeButton";
import { ExerciseCard as ExerciseCardBase } from "./ExerciseCard";
import { QuickExerciseSwitcher } from "./QuickExerciseSwitcher";
import { AddExerciseButton } from "./AddExerciseButton";
import { ExerciseList } from "./ExerciseList";
import { lazy } from "react";

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
  handleToggleSetComplete,
  handleAddSet,
  handleDeleteSet,
  handleEditRestTime,
  handleApplySmartRest,
  smartRestTime,
  useSmartRest,
  handleSelectExercise,
  handleMoveExercise,
  handleAddExercises,
  updateModifiedRoutine,
  prepareRoutineForSave,
  setRoutine,
  addExerciseAnchorRef,
}: any) {
  if (!currentExercise) return null;

  return (
    <>
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
          <div className="px-4 pb-4">
            <SwipeButton
              key={`complete-set-${workoutState.currentSet}-${currentExercise.id}`}
              onComplete={() => handleCompleteSet(workoutState.currentSet)}
              disabled={
                workoutState.currentReps === "" ||
                workoutState.currentWeight === ""
              }
              text={
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[17px]">
                    Desliza para completar serie {Math.min(workoutState.currentSet, currentExercise.sets.length)}
                  </span>
                  <span className="text-xs font-normal text-white/90">
                    {workoutState.currentReps} reps × {workoutState.currentWeight}kg
                  </span>
                </div>
              }
              completedText={
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[17px]">¡Completada!</span>
                  <span className="text-xs font-normal text-white/90">Iniciando descanso...</span>
                </div>
              }
            />
          </div>
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
        onCompleteSet={() => handleCompleteSet(workoutState.currentSet)}
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
        setStartTime={setExecution.setStartTime}
        actualWeights={
          workoutState.workoutData.actualWeights[currentExercise.id] || []
        }
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
          const newExercises = routine.exercises.map((ex: any, i: number) =>
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
  );
}
