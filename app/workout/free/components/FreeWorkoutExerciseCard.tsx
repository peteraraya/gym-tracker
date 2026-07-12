'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { NumericInput } from '@/components/ui/NumericInput';
import { WeightSelector } from '@/components/features/workout/WeightSelector';
import { EditValueModal } from '@/components/shared/EditValueModal';
import { SetTimer } from '@/components/features/workout/SetTimer';
import { PreparationCountdown } from '@/components/features/workout/PreparationCountdown';
import SetTypeSelector, { SetTypeBadge } from '@/components/features/workout/SetTypeSelector';
import { Dumbbell, Trash2 } from '@/components/icons/lucide';
import { EXERCISE_DATABASE } from '@/data/exercises';
import { calculateRestBetweenSets, formatRestTime } from '@/lib/workout/restCalculator';
import type { SetType } from '@/types';
import type { FreeExercise } from '../hooks/useFreeWorkoutState';

interface FreeWorkoutExerciseCardProps {
  exercise: FreeExercise;
  exerciseIndex: number;
  currentReps: number | '';
  currentWeight: number | '';
  currentSetType: SetType;
  onRepsChange: (v: number | '') => void;
  onWeightChange: (v: number) => void;
  onSetTypeChange: (t: SetType) => void;
  onCompleteSet: () => void;
  onStartSet: () => void;
  onSetTimerComplete: (duration: number, pausedTime: number) => void;
  showPreparation: boolean;
  isExecutingSet: boolean;
  useSmartRest: boolean;
  onUpdateSet: (exerciseIndex: number, setIndex: number, updates: Partial<any>) => void;
  onDeleteSet: (exerciseIndex: number, setIndex: number) => void;
  onToggleSetChecked: (exerciseIndex: number, setIndex: number, checked: boolean) => void;
}

export function FreeWorkoutExerciseCard({
  exercise,
  exerciseIndex,
  currentReps,
  currentWeight,
  currentSetType,
  onRepsChange,
  onWeightChange,
  onSetTypeChange,
  onCompleteSet,
  onStartSet,
  onSetTimerComplete,
  showPreparation,
  isExecutingSet,
  useSmartRest,
  onUpdateSet,
  onDeleteSet,
  onToggleSetChecked,
}: FreeWorkoutExerciseCardProps) {
  const [modalEditState, setModalEditState] = React.useState<{
    setIndex: number; // -1 para actual, 0+ para completadas
    field: 'reps' | 'weight';
    currentValue: number | '';
  } | null>(null);

  const [weightHistory, setWeightHistory] = React.useState<number[]>([]);
  
  React.useEffect(() => {
    if (exercise.id) {
      try {
        const stored = localStorage.getItem(`weight-history-${exercise.id}`);
        if (stored) {
          setWeightHistory(JSON.parse(stored) as number[]);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [exercise.id]);

  return (
    <Card className="mb-4 border-2 border-orange-400 dark:border-orange-600">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-orange-500" />
          {exercise.name || 'Ejercicio sin nombre'}
        </CardTitle>
        {exercise.equipment && (
          <p className="text-xs text-gray-500 dark:text-gray-400">🏋️ {exercise.equipment}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="mb-2">
          <SetTimer onComplete={onSetTimerComplete} autoStart={true} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
              {exercise.completedSets.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Series</div>
          </div>
          <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-xl font-bold text-green-600 dark:text-green-400">
              {exercise.completedSets.reduce((sum, s) => sum + s.reps, 0)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Reps</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Repeticiones</label>
            <button
              onClick={() => setModalEditState({setIndex: -1, field: 'reps', currentValue: currentReps})}
              className="w-full px-2 py-2 border rounded-md text-sm font-medium text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            >
              {currentReps === '' ? '0' : currentReps}
            </button>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Peso (kg)</label>
            <button
              onClick={() => setModalEditState({setIndex: -1, field: 'weight', currentValue: currentWeight})}
              className="w-full px-2 py-2 border rounded-md text-sm font-medium text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            >
              {currentWeight === '' ? '0' : currentWeight}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Serie</label>
          <SetTypeSelector value={currentSetType} onChange={onSetTypeChange} compact />
        </div>

        {showPreparation && (
          <PreparationCountdown
            duration={3}
            onComplete={() => {}}
            exerciseName={exercise.name}
            setNumber={exercise.completedSets.length + 1}
          />
        )}

        {!isExecutingSet && !showPreparation && (
          <Button
            variant="primary"
            onClick={onStartSet}
            disabled={currentReps === 0 || currentReps === '' || currentWeight === 0 || currentWeight === ''}
            className="w-full text-base py-2.5 bg-blue-600 hover:bg-blue-700"
          >
            ▶️ Iniciar Serie {exercise.completedSets.length + 1}
          </Button>
        )}

        {isExecutingSet && (
          <div className="space-y-3">
            <div className="text-center py-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
              <p className="text-base font-semibold text-blue-900 dark:text-blue-100 mb-1">🏋️ Ejecuta tu serie</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">Presiona el botón cuando termines</p>
            </div>
            <Button
              variant="primary"
              onClick={onCompleteSet}
              className="w-full py-4 text-lg font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all hover:scale-105"
            >
              <span className="text-xl mr-2">✓</span>
              Completar Serie
            </Button>
          </div>
        )}

        {exercise.completedSets.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Series completadas:</p>
            <div className="space-y-1.5">
              {exercise.completedSets.map((set, i) => (
                <div key={i} className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-300 dark:border-green-700">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={set.checked !== false}
                        onChange={(e) => onToggleSetChecked(exerciseIndex, i, e.target.checked)}
                        className="w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600 text-green-600 focus:ring-2 focus:ring-green-500 cursor-pointer"
                      />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">#{i + 1}</span>
                      {set.type && set.type !== 'normal' && <SetTypeBadge type={set.type} />}
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteSet(exerciseIndex, i)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-0.5">Reps</label>
                      <button
                        onClick={() => setModalEditState({setIndex: i, field: 'reps', currentValue: set.reps})}
                        className="w-full p-1.5 border rounded-md text-xs text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                      >
                        {set.reps}
                      </button>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-0.5">Peso (kg)</label>
                      <button
                        onClick={() => setModalEditState({setIndex: i, field: 'weight', currentValue: set.weight})}
                        className="w-full p-1.5 border rounded-md text-xs text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                      >
                        {set.weight}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {useSmartRest && (
          (() => {
            const template = EXERCISE_DATABASE.find((e) => e.name === exercise.name);
            if (!template) return null;
            const rec = calculateRestBetweenSets(
              template,
              exercise.completedSets.length + 1,
              typeof currentReps === 'number' ? currentReps : undefined,
              'intermediate',
            );
            return (
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-0.5">
                  <span>🧠</span>
                  <span className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                    Descanso sugerido: {formatRestTime(rec.recommended)}
                  </span>
                </div>
                <p className="text-xs text-purple-700 dark:text-purple-300">{rec.description}</p>
              </div>
            );
          })()
        )}
      </CardContent>
      <EditValueModal
        isOpen={modalEditState !== null}
        onClose={() => setModalEditState(null)}
        title={`${exercise.name} · Serie ${modalEditState ? (modalEditState.setIndex === -1 ? exercise.completedSets.length + 1 : modalEditState.setIndex + 1) : ''}`}
        field={modalEditState?.field || 'reps'}
        currentValue={modalEditState?.currentValue ?? ''}
        onSave={(v) => {
          if (modalEditState) {
            if (modalEditState.setIndex === -1) {
              if (modalEditState.field === 'reps') {
                onRepsChange(v);
              } else {
                onWeightChange(v);
              }
            } else {
              if (modalEditState.field === 'reps') {
                onUpdateSet(exerciseIndex, modalEditState.setIndex, { reps: v });
              } else {
                onUpdateSet(exerciseIndex, modalEditState.setIndex, { weight: v });
              }
            }
          }
          setModalEditState(null);
        }}
        equipment={exercise.equipment}
        historicalWeights={weightHistory}
      />
    </Card>
  );
}
