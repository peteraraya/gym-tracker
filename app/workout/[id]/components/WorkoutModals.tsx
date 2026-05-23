'use client';

import React, { Suspense } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { NumericInput } from '@/components/ui/NumericInput';
import { LoadingState } from '@/components/shared/LoadingState';
import { FinishWorkoutModal } from './FinishWorkoutModal';
import { AnimatePresence } from 'framer-motion';
import { EXERCISE_DATABASE } from '@/data/exercises';

interface WorkoutModalsProps {
  showEditTimeModal: boolean;
  onCloseEditTimeModal: () => void;
  editingTime: { hours: number; minutes: number; seconds: number };
  onEditingTimeChange: (time: { hours: number; minutes: number; seconds: number }) => void;
  onSaveEditedTime: () => void;

  completion: {
    showNotesModal: boolean;
    setShowNotesModal: (v: boolean) => void;
    proposedDuration: number;
    setProposedDuration: (v: number) => void;
    sessionNotes: string;
    setSessionNotes: (v: string) => void;
    completeSplash?: any;
    onCompleteSplashDone?: () => void;
  };
  onFinish: (duration: number) => void;

  SoundSettingsModal: React.ComponentType;

  showExerciseInfo: boolean;
  loadingExerciseInfo: boolean;
  exerciseInfo: any;
  selectedExerciseName: string;
  onCloseExerciseInfo: () => void;

  setExecution: {
    showSetExecution: boolean;
    exerciseName: string;
    equipment: string;
    currentSet: number;
    totalSets: number;
    currentReps: number | "";
    currentWeight: number | "";
    exerciseId: string;
    onRepsChange: (v: number | "") => void;
    onWeightChange: (v: number | "") => void;
    onComplete: (set: number) => void;
    onCancel: () => void;
  };

  showStartSplash: boolean;
  routineName: string;
  exerciseCount: number;
  totalSets: number;
  onStartSplashComplete: () => void;

  WorkoutCompleteSplash: React.ComponentType<any>;
  completeSplashProps: any;
  onCompleteSplashDone: () => void;

  SetExecutionModal: React.ComponentType<any>;
  ExerciseInfoPanel: React.ComponentType<{ exercise: any; onClose: () => void }>;
  WorkoutStartSplash: React.ComponentType<any>;
}

export function WorkoutModals({
  showEditTimeModal,
  onCloseEditTimeModal,
  editingTime,
  onEditingTimeChange,
  onSaveEditedTime,
  completion,
  onFinish,
  SoundSettingsModal,
  showExerciseInfo,
  loadingExerciseInfo,
  exerciseInfo,
  selectedExerciseName,
  onCloseExerciseInfo,
  setExecution,
  showStartSplash,
  routineName,
  exerciseCount,
  totalSets: totalSetsCount,
  onStartSplashComplete,
  WorkoutCompleteSplash,
  completeSplashProps,
  onCompleteSplashDone,
  SetExecutionModal,
  ExerciseInfoPanel,
  WorkoutStartSplash,
}: WorkoutModalsProps) {
  return (
    <>
      {/* Edit Time Modal */}
      <Modal
        isOpen={showEditTimeModal}
        onClose={onCloseEditTimeModal}
        title="⏱️ Editar tiempo de entrenamiento"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ajusta el tiempo transcurrido del entrenamiento
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Horas</label>
              <NumericInput
                value={editingTime.hours}
                onChange={(v) => onEditingTimeChange({ ...editingTime, hours: Math.max(0, Math.min(23, v)) })}
                className="p-3 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Minutos</label>
              <NumericInput
                value={editingTime.minutes}
                onChange={(v) => onEditingTimeChange({ ...editingTime, minutes: Math.max(0, Math.min(59, v)) })}
                className="p-3 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Segundos</label>
              <NumericInput
                value={editingTime.seconds}
                onChange={(v) => onEditingTimeChange({ ...editingTime, seconds: Math.max(0, Math.min(59, v)) })}
                className="p-3 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={onCloseEditTimeModal} className="flex-1">Cancelar</Button>
            <Button variant="primary" onClick={onSaveEditedTime} className="flex-1">Guardar</Button>
          </div>
        </div>
      </Modal>

      {/* Finish Workout Modal */}
      <FinishWorkoutModal
        isOpen={completion.showNotesModal}
        onClose={() => completion.setShowNotesModal(false)}
        proposedDuration={completion.proposedDuration}
        onDurationChange={completion.setProposedDuration}
        sessionNotes={completion.sessionNotes}
        onNotesChange={completion.setSessionNotes}
        onFinish={onFinish}
        isSaving={false}
      />

      {/* Sound Settings */}
      <SoundSettingsModal />

      {/* Exercise Info Panel */}
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
                EXERCISE_DATABASE.find((e) => e.name === selectedExerciseName) ||
                { id: selectedExerciseName, name: selectedExerciseName, muscleGroup: "pecho" } as any
              }
              onClose={onCloseExerciseInfo}
            />
          )}
        </Suspense>
      )}

      {/* Set Execution Modal */}
      <Suspense fallback={<div />}>
        <SetExecutionModal
          isOpen={setExecution.showSetExecution}
          exerciseName={setExecution.exerciseName}
          equipment={setExecution.equipment}
          currentSet={setExecution.currentSet}
          totalSets={setExecution.totalSets}
          currentReps={setExecution.currentReps}
          currentWeight={setExecution.currentWeight}
          exerciseId={setExecution.exerciseId}
          onRepsChange={setExecution.onRepsChange}
          onWeightChange={setExecution.onWeightChange}
          onComplete={setExecution.onComplete}
          onCancel={setExecution.onCancel}
        />
      </Suspense>

      {/* Start Splash */}
      <AnimatePresence>
        {showStartSplash && (
          <WorkoutStartSplash
            routineName={routineName}
            exerciseCount={exerciseCount}
            totalSets={totalSetsCount}
            onComplete={onStartSplashComplete}
          />
        )}
      </AnimatePresence>

      {/* Complete Splash */}
      <AnimatePresence>
        {completion.completeSplash && (
          <WorkoutCompleteSplash
            {...completeSplashProps}
            onComplete={onCompleteSplashDone}
          />
        )}
      </AnimatePresence>
    </>
  );
}