'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { WeightSelector } from '@/components/WeightSelector';
import SetTypeCycleButton from '@/components/SetTypeCycleButton';
import type { Exercise, SetType, Routine } from '@/types';

interface QuickEditModeProps {
  routine: Routine;
  workoutData: {
    completedSets: { [key: string]: number };
    actualReps: { [key: string]: number[] };
    actualWeights: { [key: string]: number[] };
    setTypes: { [key: string]: string[] };
  };
  onEditReps: (exerciseId: string, setIndex: number, reps: number) => void;
  onEditWeight: (exerciseId: string, setIndex: number, weight: number) => void;
  onEditSetType: (exerciseId: string, setIndex: number, type: SetType) => void;
  onToggleSetComplete: (exerciseId: string, setIndex: number, isComplete: boolean) => void;
  onDeleteSet?: (exerciseId: string, setIndex: number) => void;
  onFinishWorkout?: () => void;
}

/**
 * Modo de edición rápida tipo Excel/Hevy
 * Permite ver y editar todos los ejercicios y series en una sola vista
 */
export function QuickEditMode({
  routine,
  workoutData,
  onEditReps,
  onEditWeight,
  onEditSetType,
  onToggleSetComplete,
  onDeleteSet,
  onFinishWorkout,
}: QuickEditModeProps) {
  const [editingCell, setEditingCell] = useState<{exerciseId: string, setIndex: number, field: 'reps' | 'weight'} | null>(null);

  // Calcular progreso total
  const totalSets = routine.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSets = Object.values(workoutData.actualReps).reduce((sum, reps) => 
    sum + reps.filter(r => r > 0).length, 0
  );
  const progressPercent = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  // Debug logging
  React.useEffect(() => {
    console.log('[QuickEditMode] Workout data:', {
      actualReps: workoutData.actualReps,
      actualWeights: workoutData.actualWeights,
      completedSets: workoutData.completedSets,
      totalSets,
      completedSetsCalculated: completedSets
    });
  }, [workoutData, totalSets, completedSets]);

  return (
    <div className="space-y-4 pb-32">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-bold mb-1">📝 Modo Edición Rápida</h2>
            <p className="text-sm opacity-90">
              Completa o edita cualquier serie directamente
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{progressPercent}%</div>
            <div className="text-xs opacity-90">{completedSets}/{totalSets} series</div>
          </div>
        </div>
        {/* Barra de progreso */}
        <div className="w-full bg-white/20 rounded-full h-2 mt-3">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {routine.exercises.map((exercise, exIdx) => {
        const exerciseId = exercise.id;
        const actualReps = workoutData.actualReps[exerciseId] || [];
        const actualWeights = workoutData.actualWeights[exerciseId] || [];
        const setTypes = workoutData.setTypes[exerciseId] || [];
        
        // Calcular completadas correctamente - solo contar las que tienen reps > 0
        const completedCount = actualReps.filter(r => typeof r === 'number' && r > 0).length;

        return (
          <Card key={exerciseId} className="overflow-hidden">
            {/* Header del ejercicio */}
            <div className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">
                    {exIdx + 1}. {exercise.name}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    {completedCount} de {exercise.sets.length} series completadas
                  </p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    completedCount === exercise.sets.length
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : completedCount > 0
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {completedCount === exercise.sets.length ? '✓' : completedCount > 0 ? '⏳' : '○'} 
                    {completedCount}/{exercise.sets.length}
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="p-0">
              {/* Tabla de series */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 dark:text-gray-300 w-12">#</th>
                      <th className="text-center py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Reps</th>
                      <th className="text-center py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Peso (kg)</th>
                      <th className="hidden sm:table-cell text-center py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Tipo</th>
                      <th className="text-center py-2 px-3 font-semibold text-gray-700 dark:text-gray-300 w-16">✓</th>
                      {onDeleteSet && exercise.sets.length > 1 && (
                        <th className="text-center py-2 px-3 font-semibold text-gray-700 dark:text-gray-300 w-12"></th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {exercise.sets.map((set, setIdx) => {
                      const doneReps = actualReps[setIdx];
                      const doneWeight = actualWeights[setIdx];
                      const setType = setTypes[setIdx] || 'normal';
                      const isCompleted = typeof doneReps === 'number' && doneReps > 0;
                      const isEditingReps = editingCell?.exerciseId === exerciseId && editingCell?.setIndex === setIdx && editingCell?.field === 'reps';
                      const isEditingWeight = editingCell?.exerciseId === exerciseId && editingCell?.setIndex === setIdx && editingCell?.field === 'weight';

                      // Valores a mostrar: si está completada usar doneReps/doneWeight, sino usar defaults
                      const displayReps = isCompleted ? doneReps : (doneReps || set.reps);
                      const displayWeight = doneWeight !== undefined ? doneWeight : (set.weight || 0);

                      return (
                        <tr
                          key={`${exerciseId}-${setIdx}`}
                          className={`border-b border-gray-100 dark:border-gray-800 transition-colors ${
                            isCompleted
                              ? 'bg-green-50/50 dark:bg-green-900/10'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-900/30'
                          }`}
                        >
                          {/* Número de serie */}
                          <td className="py-3 px-3">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                              isCompleted
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                            }`}>
                              {setIdx + 1}
                            </div>
                          </td>

                          {/* Reps - editable */}
                          <td className="py-3 px-3">
                            {isEditingReps ? (
                              <input
                                type="number"
                                value={displayReps}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  onEditReps(exerciseId, setIdx, value);
                                }}
                                onBlur={() => setEditingCell(null)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    setEditingCell(null);
                                  }
                                }}
                                autoFocus
                                min="0"
                                max="100"
                                className="w-16 px-2 py-1 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center border-2 border-blue-500 focus:outline-none"
                              />
                            ) : (
                              <button
                                onClick={() => setEditingCell({exerciseId, setIndex: setIdx, field: 'reps'})}
                                className={`w-full px-3 py-1.5 rounded transition-colors font-semibold ${
                                  isCompleted
                                    ? 'text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                              >
                                {displayReps}
                              </button>
                            )}
                          </td>

                          {/* Peso - editable */}
                          <td className="py-3 px-3">
                            {isEditingWeight ? (
                              <div className="flex justify-center">
                                <input
                                  type="number"
                                  step="0.5"
                                  value={displayWeight}
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value) || 0;
                                    onEditWeight(exerciseId, setIdx, value);
                                  }}
                                  onBlur={() => setEditingCell(null)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      setEditingCell(null);
                                    }
                                  }}
                                  autoFocus
                                  min="0"
                                  className="w-20 px-2 py-1 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center border-2 border-blue-500 focus:outline-none"
                                />
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditingCell({exerciseId, setIndex: setIdx, field: 'weight'})}
                                className={`w-full px-3 py-1.5 rounded transition-colors font-semibold ${
                                  isCompleted
                                    ? 'text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                              >
                                {displayWeight}
                              </button>
                            )}
                          </td>

                          {/* Tipo de serie */}
                          <td className="hidden sm:table-cell py-3 px-3">
                            <div className="flex justify-center">
                              <SetTypeCycleButton
                                value={setType as SetType}
                                onChange={(type) => onEditSetType(exerciseId, setIdx, type)}
                                size="sm"
                                showLabel={false}
                              />
                            </div>
                          </td>

                          {/* Checkbox de completado */}
                          <td className="py-3 px-3">
                            <div className="flex justify-center">
                              <button
                                onClick={() => {
                                  // Si no está completada, usar valores actuales o defaults
                                  if (!isCompleted) {
                                    // Asegurar que tenga valores antes de marcar como completada
                                    if (!doneReps) {
                                      onEditReps(exerciseId, setIdx, set.reps);
                                    }
                                    if (!doneWeight && set.weight) {
                                      onEditWeight(exerciseId, setIdx, set.weight);
                                    }
                                  }
                                  onToggleSetComplete(exerciseId, setIdx, !isCompleted);
                                }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
                                  isCompleted
                                    ? 'bg-green-500 hover:bg-green-600 text-white scale-110'
                                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-400 dark:text-gray-500'
                                }`}
                              >
                                {isCompleted ? (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Delete button */}
                          {onDeleteSet && exercise.sets.length > 1 && (
                            <td className="py-3 px-3">
                              <div className="flex justify-center">
                                <button
                                  onClick={() => onDeleteSet(exerciseId, setIdx)}
                                  className="w-7 h-7 rounded-full flex items-center justify-center transition-all bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400"
                                  title="Eliminar serie"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Botón flotante para finalizar */}
      {onFinishWorkout && (
        <>
          <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-gray-900 dark:via-gray-900/95 dark:to-transparent pointer-events-none z-20" />
          
          <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-4">
            <button
              onClick={onFinishWorkout}
              disabled={completedSets === 0}
              className={`w-full py-6 text-lg font-bold rounded-2xl shadow-2xl transition-all duration-200 flex items-center justify-center gap-3 border-2 border-white/20 ${
                completedSets === 0
                  ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white transform hover:scale-[1.02]'
              }`}
            >
              <span className="text-2xl">✅</span>
              <div className="flex flex-col items-start">
                <span>Finalizar Entrenamiento</span>
                <span className="text-xs font-normal opacity-90">
                  {completedSets} series completadas
                </span>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
