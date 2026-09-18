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
  onPreparationComplete: () => void;
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
  onPreparationComplete,
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
    <Card className="mb-5 border border-orange-200 dark:border-orange-900/50 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden relative">
      {/* Indicador superior de estado activo */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-orange-400 to-amber-500"></div>
      
      <CardHeader className="pb-3 bg-orange-50/30 dark:bg-orange-900/10 border-b border-orange-100 dark:border-orange-900/30">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <div className="p-1.5 bg-orange-100 dark:bg-orange-900/50 rounded-md">
                <Dumbbell className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              {exercise.name || 'Ejercicio sin nombre'}
            </CardTitle>
            {exercise.equipment && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
                <span className="text-[10px] bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded-sm">🏋️</span> 
                {exercise.equipment}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="mb-2">
          <SetTimer onComplete={onSetTimerComplete} autoStart={true} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center justify-center p-2.5 bg-orange-50/80 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800/30">
            <span className="text-2xl font-black text-orange-600 dark:text-orange-400 leading-none mb-1">
              {exercise.completedSets.length}
            </span>
            <span className="text-[11px] font-semibold tracking-wider text-orange-800/60 dark:text-orange-200/50 uppercase">Series</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2.5 bg-green-50/80 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800/30">
            <span className="text-2xl font-black text-green-600 dark:text-green-400 leading-none mb-1">
              {exercise.completedSets.reduce((sum, s) => sum + s.reps, 0)}
            </span>
            <span className="text-[11px] font-semibold tracking-wider text-green-800/60 dark:text-green-200/50 uppercase">Reps Total</span>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3.5 border border-gray-200/60 dark:border-gray-700/60">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
              Serie Actual <span className="text-blue-500">#{exercise.completedSets.length + 1}</span>
            </span>
            <div className="w-1/2">
              <SetTypeSelector value={currentSetType} onChange={onSetTypeChange} compact />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Reps</label>
              <button
                onClick={() => setModalEditState({setIndex: -1, field: 'reps', currentValue: currentReps})}
                className="w-full px-3 py-3 border-2 rounded-xl text-xl font-bold text-center focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-sm"
              >
                {currentReps === '' ? '0' : currentReps}
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Peso (kg)</label>
              <button
                onClick={() => setModalEditState({setIndex: -1, field: 'weight', currentValue: currentWeight})}
                className="w-full px-3 py-3 border-2 rounded-xl text-xl font-bold text-center focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-sm"
              >
                {currentWeight === '' ? '0' : currentWeight}
              </button>
            </div>
          </div>
        </div>

        {showPreparation && (
          <PreparationCountdown
            duration={3}
            onComplete={onPreparationComplete}
            exerciseName={exercise.name}
            setNumber={exercise.completedSets.length + 1}
          />
        )}

        {!isExecutingSet && !showPreparation && (
          <Button
            variant="primary"
            onClick={onStartSet}
            disabled={currentReps === 0 || currentReps === '' || currentWeight === 0 || currentWeight === ''}
            className="w-full py-3.5 text-base font-bold bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg rounded-xl"
          >
            <span className="mr-2">▶️</span> Iniciar Serie {exercise.completedSets.length + 1}
          </Button>
        )}

        {isExecutingSet && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="text-center py-4 px-2 bg-blue-50/80 dark:bg-blue-900/30 rounded-xl border-2 border-blue-200 dark:border-blue-800/50 shadow-inner">
              <p className="text-lg font-bold text-blue-900 dark:text-blue-100 flex items-center justify-center gap-2">
                <span className="animate-bounce">🏋️</span> ¡A darle con todo!
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Presiona completar cuando termines</p>
            </div>
            <Button
              variant="primary"
              onClick={onCompleteSet}
              className="w-full py-5 text-xl font-black bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 text-white shadow-xl rounded-xl border border-green-400 dark:border-green-500"
            >
              <span className="text-2xl mr-2">✓</span>
              Completar Serie
            </Button>
          </div>
        )}

        {exercise.completedSets.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-green-500 rounded-full"></span>
              Historial de Series
            </h4>
            <div className="space-y-2">
              {exercise.completedSets.map((set, i) => (
                <div key={i} className="group flex flex-col p-2.5 bg-gray-50/80 hover:bg-gray-100 dark:bg-gray-800/40 dark:hover:bg-gray-800 transition-colors rounded-xl border border-gray-200/80 dark:border-gray-700/80">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={set.checked !== false}
                          onChange={(e) => onToggleSetChecked(exerciseIndex, i, e.target.checked)}
                          className="peer w-5 h-5 rounded-md border-2 border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-500 cursor-pointer appearance-none checked:bg-green-500 checked:border-green-500 transition-all"
                        />
                        {/* Check icon inside custom checkbox */}
                        <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">#{i + 1}</span>
                      {set.type && set.type !== 'normal' && <SetTypeBadge type={set.type} />}
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteSet(exerciseIndex, i)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pl-7">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setModalEditState({setIndex: i, field: 'reps', currentValue: set.reps})}
                        className="flex-1 py-1 px-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-semibold text-center hover:border-blue-400 transition-colors"
                      >
                        {set.reps} <span className="text-[10px] font-normal text-gray-500">reps</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setModalEditState({setIndex: i, field: 'weight', currentValue: set.weight})}
                        className="flex-1 py-1 px-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-semibold text-center hover:border-blue-400 transition-colors"
                      >
                        {set.weight} <span className="text-[10px] font-normal text-gray-500">kg</span>
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
