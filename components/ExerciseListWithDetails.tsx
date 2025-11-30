'use client';

import React, { useState } from 'react';
import { Exercise } from '@/types';
import { getExerciseByName } from '@/data/exercises';
import { ExerciseDetails } from '@/components/ExerciseDetails';

interface ExerciseListWithDetailsProps {
  exercises: Exercise[];
  showDetailsButton?: boolean;
}

export function ExerciseListWithDetails({ exercises, showDetailsButton = true }: ExerciseListWithDetailsProps) {
  const [detailsExercise, setDetailsExercise] = useState<string | null>(null);

  const handleShowDetails = (exerciseName: string) => {
    const template = getExerciseByName(exerciseName);
    if (template) {
      setDetailsExercise(exerciseName);
    }
  };

  const currentExerciseTemplate = detailsExercise 
    ? getExerciseByName(detailsExercise)
    : null;

  return (
    <>
      <div className="space-y-2">
        {exercises.map((exercise, index) => {
          const hasDetails = !!getExerciseByName(exercise.name);

          return (
            <div
              key={exercise.id || index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {exercise.name}
                  </span>
                  {hasDetails && showDetailsButton && (
                    <button
                      onClick={() => handleShowDetails(exercise.name)}
                      className="p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                      title="Ver técnica y recomendaciones"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {exercise.sets} series × {exercise.reps} reps
                  {exercise.weight ? ` • ${exercise.weight}kg` : ''}
                </div>
                {exercise.notes && (
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {exercise.notes}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {detailsExercise && currentExerciseTemplate && (
        <ExerciseDetails
          exercise={currentExerciseTemplate}
          onClose={() => setDetailsExercise(null)}
        />
      )}
    </>
  );
}
