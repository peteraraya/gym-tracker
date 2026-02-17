"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { Exercise } from '@/types';
import { getExerciseByName } from '@/data/exercises';
import { ExerciseDetails } from '@/components/ExerciseDetails';

interface ExerciseListWithDetailsProps {
  exercises: Exercise[];
  showDetailsButton?: boolean;
}

export const ExerciseListWithDetails: React.FC<ExerciseListWithDetailsProps> = React.memo(
  ({ exercises, showDetailsButton = true }) => {
    const [detailsExercise, setDetailsExercise] = useState<string | null>(null);

    // Precompute which exercises have details to avoid repeated lookups on render
    const detailsSet = useMemo(() => {
      const s = new Set<string>();
      for (const ex of exercises) {
        if (getExerciseByName(ex.name)) s.add(ex.name);
      }
      return s;
    }, [exercises]);

    const handleShowDetails = useCallback((exerciseName: string) => {
      if (detailsSet.has(exerciseName)) {
        setDetailsExercise(exerciseName);
      }
    }, [detailsSet]);

    const handleCloseDetails = useCallback(() => setDetailsExercise(null), []);

    const currentExerciseTemplate = useMemo(() => {
      return detailsExercise ? getExerciseByName(detailsExercise) : null;
    }, [detailsExercise]);

    return (
      <>
        <div className="space-y-2">
          {useMemo(() => exercises.map((exercise, index) => {
            const hasDetails = detailsSet.has(exercise.name);

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
                    {exercise.sets.length} series
                    {exercise.sets.length > 0 && ` (${exercise.sets.map(s => `${s.reps} reps`).join(', ')})`}
                  </div>
                  {exercise.notes && (
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {exercise.notes}
                    </div>
                  )}
                </div>
              </div>
            );
          }), [exercises, detailsSet, showDetailsButton, handleShowDetails])}
        </div>

        {detailsExercise && currentExerciseTemplate && (
          <ExerciseDetails
            exercise={currentExerciseTemplate}
            onClose={handleCloseDetails}
          />
        )}
      </>
    );
  }
);

ExerciseListWithDetails.displayName = 'ExerciseListWithDetails';
