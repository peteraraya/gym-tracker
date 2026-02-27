'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Routine } from '@/types';

interface ExerciseListProps {
  routine: Routine;
  currentExerciseIndex: number;
  completedSets: { [key: string]: number };
  onSelectExercise: (index: number) => void;
  onMoveExercise: (fromIndex: number, toIndex: number) => void;
}

/**
 * Lista de ejercicios con drag-drop
 * 
 * Responsabilidades:
 * - Mostrar todos los ejercicios
 * - Indicar estado (actual, completado, siguiente)
 * - Permitir drag-drop para reordenar
 * - Permitir seleccionar ejercicio
 */
export function ExerciseList({
  routine,
  currentExerciseIndex,
  completedSets,
  onSelectExercise,
  onMoveExercise,
}: ExerciseListProps) {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ejercicios de la rutina</CardTitle>
        {routine.exercises.length > 1 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            💡 Arrastra los ejercicios para cambiar el orden
          </p>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {routine.exercises.map((exercise, idx) => {
            const isCurrentExercise = idx === currentExerciseIndex;
            const isCompleted = idx < currentExerciseIndex;
            const isNext = idx === currentExerciseIndex + 1;
            const exerciseCompletedSets = completedSets[exercise.id] || 0;
            const totalSets = exercise.sets.length;
            const allSetsCompleted = exerciseCompletedSets === totalSets;
            
            return (
              <div
                key={exercise.id}
                draggable={true}
                onDragStart={() => setDraggedIndex(idx)}
                onDragEnd={() => {
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverIndex(idx);
                }}
                onDragLeave={() => setDragOverIndex(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedIndex !== null && draggedIndex !== idx) {
                    onMoveExercise(draggedIndex, idx);
                  }
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                className={`group rounded-lg border-2 p-4 transition-all cursor-grab active:cursor-grabbing ${
                  dragOverIndex === idx && draggedIndex !== idx
                    ? 'border-blue-500 scale-105 shadow-lg bg-blue-50 dark:bg-blue-900/20'
                    : isCurrentExercise
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : isCompleted && allSetsCompleted
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : isNext
                    ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Drag handle + Status indicator */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Drag handle */}
                    <div className="flex-shrink-0 text-gray-400 dark:text-gray-500">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <circle cx="4" cy="4" r="1.5" />
                        <circle cx="4" cy="8" r="1.5" />
                        <circle cx="4" cy="12" r="1.5" />
                        <circle cx="12" cy="4" r="1.5" />
                        <circle cx="12" cy="8" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                      </svg>
                    </div>

                    {/* Status indicator */}
                    <div className="flex-shrink-0">
                      {isCurrentExercise ? (
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                          {idx + 1}
                        </div>
                      ) : isCompleted && allSetsCompleted ? (
                        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white">
                          ✓
                        </div>
                      ) : isNext ? (
                        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                          {idx + 1}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-sm">
                          {idx + 1}
                        </div>
                      )}
                    </div>

                    {/* Exercise info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-semibold truncate ${
                          isCurrentExercise
                            ? 'text-blue-900 dark:text-blue-100'
                            : isCompleted && allSetsCompleted
                            ? 'text-green-900 dark:text-green-100'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {exercise.name}
                        </p>
                        {isCurrentExercise && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded-full">
                            Actual
                          </span>
                        )}
                        {isCompleted && allSetsCompleted && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-green-600 text-white rounded-full">
                            Completado
                          </span>
                        )}
                        {isNext && !isCompleted && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-orange-500 text-white rounded-full">
                            Siguiente
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {exerciseCompletedSets}/{totalSets} series
                      </p>
                    </div>
                  </div>

                  {/* Action button */}
                  {!isCurrentExercise && isCompleted && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectExercise(idx)}
                      className="flex-shrink-0"
                    >
                      Editar
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
