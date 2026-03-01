'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { Routine } from '@/types';

interface QuickExerciseSwitcherProps {
  routine: Routine;
  currentExerciseIndex: number;
  completedSets: { [key: string]: number };
  onSelectExercise: (index: number) => void;
}

/**
 * Selector rápido de ejercicios para cambiar cuando un equipo está ocupado
 * 
 * Caso de uso: En el gym, si la máquina/polea/mancuerna está ocupada,
 * puedes cambiar rápidamente a otro ejercicio y volver después.
 */
export function QuickExerciseSwitcher({
  routine,
  currentExerciseIndex,
  completedSets,
  onSelectExercise,
}: QuickExerciseSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectExercise = (index: number) => {
    onSelectExercise(index);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setIsOpen(true)}
        className="w-full py-2 sm:py-3 text-sm sm:text-base font-semibold"
      >
        <span className="hidden sm:inline">🔄 Cambiar Ejercicio</span>
        <span className="sm:hidden">🔄 Cambiar</span>
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Cambiar a otro ejercicio"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            💡 Selecciona otro ejercicio si el equipo está ocupado. Tu progreso se guarda automáticamente.
          </p>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {routine.exercises.map((exercise, idx) => {
              const isCurrentExercise = idx === currentExerciseIndex;
              const exerciseCompletedSets = completedSets[exercise.id] || 0;
              const totalSets = exercise.sets.length;
              const allSetsCompleted = exerciseCompletedSets === totalSets;
              const hasProgress = exerciseCompletedSets > 0;

              if (isCurrentExercise) return null; // No mostrar el ejercicio actual

              return (
                <button
                  key={exercise.id}
                  onClick={() => handleSelectExercise(idx)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:scale-[1.02] ${
                    allSetsCompleted
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 hover:border-green-600'
                      : hasProgress
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 hover:border-orange-600'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-500'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Status indicator */}
                      <div className="flex-shrink-0">
                        {allSetsCompleted ? (
                          <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">
                            ✓
                          </div>
                        ) : hasProgress ? (
                          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                            {idx + 1}
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold">
                            {idx + 1}
                          </div>
                        )}
                      </div>

                      {/* Exercise info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {exercise.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {exerciseCompletedSets}/{totalSets} series
                          </p>
                          {exercise.equipment && (
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              • {exercise.equipment}
                            </span>
                          )}
                        </div>
                        {allSetsCompleted && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-green-600 text-white rounded-full">
                            Completado
                          </span>
                        )}
                        {hasProgress && !allSetsCompleted && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-orange-500 text-white rounded-full">
                            En progreso
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow indicator */}
                    <div className="flex-shrink-0 text-gray-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="w-full"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
