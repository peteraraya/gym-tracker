'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { WeightSelector } from '@/components/WeightSelector';
import SetTypeSelector, { SetTypeBadge } from '@/components/SetTypeSelector';
import { Plus } from '@/components/icons/lucide';
import type { Exercise, SetType } from '@/types';

interface SeriesTableProps {
  exercise: Exercise;
  exerciseId: string;
  completedSets: number;
  actualReps: number[];
  actualWeights: number[];
  setTypes: string[];
  currentSet: number;
  onEditReps: (setIndex: number, reps: number) => void;
  onEditWeight: (setIndex: number, weight: number) => void;
  onEditSetType: (setIndex: number, type: SetType) => void;
  onToggleSetComplete: (setIndex: number, isComplete: boolean) => void;
  onAddSet: () => void;
  perSetRestOverrides?: {[key: string]: number[]};
  onEditRestTime?: (setIndex: number, restTime: number) => void;
  onApplySmartRest?: () => void;
  smartRestTime?: number;
}

/**
 * Tabla de series con edición inline
 * 
 * Responsabilidades:
 * - Mostrar todas las series del ejercicio
 * - Permitir edición inline de reps y peso
 * - Mostrar estado de completado
 * - Permitir agregar series
 */
export function SeriesTable({
  exercise,
  exerciseId,
  completedSets,
  actualReps,
  actualWeights,
  setTypes,
  currentSet,
  onEditReps,
  onEditWeight,
  onEditSetType,
  onToggleSetComplete,
  onAddSet,
  perSetRestOverrides,
  onEditRestTime,
  onApplySmartRest,
  smartRestTime,
}: SeriesTableProps) {
  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Series del ejercicio</CardTitle>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {completedSets} de {exercise.sets.length} series completadas
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Mobile set type selectors - shown above table */}
          <div className="sm:hidden space-y-2">
            {exercise.sets.map((set, idx) => {
              const setType = setTypes[idx] || 'normal';
              const doneReps = actualReps[idx] ?? null;
              const isCompleted = typeof doneReps === 'number' && doneReps > 0;
              
              if (isCompleted) return null;
              
              return (
                <div key={`type-selector-${idx}`} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Serie {idx + 1}</span>
                  <button
                    onClick={() => {
                      const types: SetType[] = ['normal', 'warmup', 'dropset', 'failure', 'amrap', 'rest-pause', 'cluster'];
                      const currentIdx = types.indexOf(setType as SetType);
                      const nextIdx = (currentIdx + 1) % types.length;
                      onEditSetType(idx, types[nextIdx]);
                    }}
                    className="text-xs px-3 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors font-semibold"
                  >
                    {setType === 'normal' && '🟦 Normal'}
                    {setType === 'warmup' && '🔥 Warmup'}
                    {setType === 'dropset' && '📉 Drop'}
                    {setType === 'failure' && '💪 Fallo'}
                    {setType === 'amrap' && '⚡ AMRAP'}
                    {setType === 'rest-pause' && '⏸️ Rest-Pause'}
                    {setType === 'cluster' && '🔗 Cluster'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">Serie</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">Reps</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">Peso (kg)</th>
                <th className="hidden sm:table-cell text-left py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">Descanso (s)</th>
                <th className="hidden sm:table-cell text-left py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">Tipo</th>
                <th className="text-center py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">Estado</th>
              </tr>
            </thead>
            <tbody>
              {exercise.sets.map((set, idx) => {
                const doneReps = actualReps[idx] ?? null;
                const doneWeight = actualWeights[idx] ?? set.weight ?? '';
                const setType = setTypes[idx] || 'normal';
                const isCompleted = typeof doneReps === 'number' && doneReps > 0;
                const isCurrent = idx === currentSet - 1;

                return (
                  <tr
                    key={`${exerciseId}-set-${idx}`}
                    className={`border-b border-gray-100 dark:border-gray-800 transition-colors ${
                      isCompleted
                        ? 'bg-green-50 dark:bg-green-900/20'
                        : isCurrent
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-900/50'
                    }`}
                  >
                    {/* Serie */}
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCurrent
                            ? 'bg-blue-600 text-white'
                            : isCompleted
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                        }`}>
                          {idx + 1}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100 hidden sm:inline">
                          Serie {idx + 1}
                        </span>
                      </div>
                    </td>

                    {/* Reps */}
                    <td className="py-3 px-2">
                      {editingSetIndex === idx ? (
                        <Input
                          type="number"
                          value={doneReps ?? set.reps}
                          onChange={(e) => onEditReps(idx, parseInt(e.target.value) || 0)}
                          onBlur={() => setEditingSetIndex(null)}
                          autoFocus
                          min="0"
                          max="100"
                          className="w-16 text-center"
                        />
                      ) : (
                        <button
                          onClick={() => setEditingSetIndex(idx)}
                          className="px-2 py-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        >
                          {isCompleted ? (
                            <span className="font-semibold text-green-700 dark:text-green-400">{doneReps}</span>
                          ) : (
                            <span className="text-gray-600 dark:text-gray-400">{set.reps}</span>
                          )}
                        </button>
                      )}
                    </td>

                    {/* Peso */}
                    <td className="py-3 px-2">
                      <WeightSelector
                        value={doneWeight}
                        onChange={(weight) => onEditWeight(idx, weight)}
                        exerciseId={exerciseId}
                      />
                    </td>

                    {/* Descanso personalizado - Hidden on mobile */}
                    <td className="hidden sm:table-cell py-3 px-2">
                      {onEditRestTime && (
                        <select
                          value={perSetRestOverrides?.[exerciseId]?.[idx] || exercise.restBetweenSets || 90}
                          onChange={(e) => onEditRestTime(idx, parseInt(e.target.value))}
                          className="w-full px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs border border-gray-300 dark:border-gray-600"
                        >
                          {Array.from({ length: 61 }, (_, i) => (i + 1) * 5).map(s => {
                            const mins = Math.floor(s / 60);
                            const secs = s % 60;
                            const label = mins > 0 ? `${mins}m ${secs}s` : `${s}s`;
                            return (
                              <option key={s} value={s}>{label}</option>
                            );
                          })}
                        </select>
                      )}
                    </td>

                    {/* Tipo de serie - Hidden on mobile */}
                    <td className="hidden sm:table-cell py-3 px-2">
                      {isCompleted ? (
                        <SetTypeBadge type={setType as SetType} />
                      ) : (
                        <SetTypeSelector
                          value={setType as SetType}
                          onChange={(type) => onEditSetType(idx, type)}
                          mini
                        />
                      )}
                    </td>

                    {/* Checkbox */}
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => onToggleSetComplete(idx, !isCompleted)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-400 dark:text-gray-500'
                        }`}
                      >
                        {isCompleted ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Smart rest button */}
        {onApplySmartRest && smartRestTime && (
          <button
            onClick={onApplySmartRest}
            className="w-full mb-3 py-2 px-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all font-medium text-sm flex items-center justify-center gap-2"
          >
            🧠 Aplicar Descanso Inteligente a Todas
            <span className="text-xs opacity-75">
              ({(() => {
                const mins = Math.floor(smartRestTime / 60);
                const secs = smartRestTime % 60;
                return mins > 0 ? `${mins}m ${secs}s` : `${smartRestTime}s`;
              })()})
            </span>
          </button>
        )}

        {/* Botón para agregar serie */}
        <button
          onClick={onAddSet}
          className="w-full mt-4 py-3 px-4 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all font-medium flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Agregar Serie
        </button>
        </div>
      </CardContent>
    </Card>
  );
}
