'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { NumericInput } from '@/components/ui/NumericInput';
import { WeightSelector } from '@/components/features/workout/WeightSelector';
import { SetTypeBadge } from '@/components/features/workout/SetTypeSelector';
import { Dumbbell, Plus, ChevronDown, ChevronUp, Trash2 } from '@/components/icons/lucide';
import type { FreeExercise } from '../hooks/useFreeWorkoutState';

interface FreeWorkoutExerciseListProps {
  exercises: FreeExercise[];
  activeExerciseIndex: number | null;
  collapsedExercises: Set<number>;
  onSetActive: (index: number) => void;
  onRemove: (index: number) => void;
  onToggleCollapse: (index: number) => void;
  onAddClick: () => void;
  onUpdateSet: (exerciseIndex: number, setIndex: number, updates: Partial<any>) => void;
  onDeleteSet: (exerciseIndex: number, setIndex: number) => void;
  onToggleSetChecked: (exerciseIndex: number, setIndex: number, checked: boolean) => void;
}

export function FreeWorkoutExerciseList({
  exercises,
  activeExerciseIndex,
  collapsedExercises,
  onSetActive,
  onRemove,
  onToggleCollapse,
  onAddClick,
  onUpdateSet,
  onDeleteSet,
  onToggleSetChecked,
}: FreeWorkoutExerciseListProps) {
  if (exercises.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <Dumbbell className="w-10 h-10 mx-auto mb-3 text-gray-400" />
        <p className="text-gray-500 dark:text-gray-400 mb-4">Aún no has agregado ejercicios</p>
        <Button variant="primary" onClick={onAddClick}>
          <Plus className="w-4 h-4" />
          Agregar ejercicio
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {exercises.map((exercise, index) => {
        const isActive = activeExerciseIndex === index;
        const isCollapsed = collapsedExercises.has(index);

        return (
          <div
            key={exercise.id}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              isActive
                ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-600'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300'
            }`}
            onClick={() => { if (!isActive) onSetActive(index); }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold ${isActive ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500'}`}>
                  {index + 1}
                </span>
                <div>
                  <p className={`font-medium ${isActive ? 'text-orange-900 dark:text-orange-100' : 'text-gray-900 dark:text-gray-100'}`}>
                    {exercise.name || 'Sin nombre'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {exercise.completedSets.length} series completadas
                    {exercise.completedSets.length > 0 && (
                      <> • {exercise.completedSets.reduce((s, set) => s + set.reps, 0)} reps totales</>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {exercise.completedSets.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onToggleCollapse(index); }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRemove(index); }}
                  className="p-1 text-red-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isCollapsed && exercise.completedSets.length > 0 && (
              <div className="mt-2 pl-8 space-y-1.5">
                {exercise.completedSets.map((set, i) => (
                  <div key={i} className="p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-300 dark:border-green-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={true}
                          onChange={(e) => {
                            if (!e.target.checked) onDeleteSet(index, i);
                          }}
                          className="w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600 text-green-600 focus:ring-2 focus:ring-green-500 cursor-pointer"
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-400">Serie {i + 1}</span>
                        {set.type && set.type !== 'normal' && <SetTypeBadge type={set.type} />}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onDeleteSet(index, i); }}
                        className="p-1 text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Reps</label>
                        <NumericInput
                          className="p-1.5 border rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={set.reps}
                          onChange={(v) => onUpdateSet(index, i, { reps: Math.max(0, v) })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Peso (kg)</label>
                        <WeightSelector
                          value={set.weight}
                          onChange={(weight) => onUpdateSet(index, i, { weight })}
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
  );
}