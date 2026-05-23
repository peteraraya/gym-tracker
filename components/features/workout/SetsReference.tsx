'use client';

import React from 'react';
import type { Exercise } from '@/types';

interface SetsReferenceProps {
  exercises: Exercise[];
  workoutData: {
    completedSets: { [key: string]: number };
    actualReps: { [key: string]: number[] };
    actualWeights: { [key: string]: number[] };
  };
  currentExerciseId?: string | null;
  currentSet?: number;
  workoutProgress?: { totalSets: number; completedSets: number; percentage: number };
}

export default function SetsReference({ exercises, workoutData, currentExerciseId, currentSet, workoutProgress }: SetsReferenceProps) {
  const renderSummary = (exercise: Exercise) => {
    const exerciseId = exercise.id;
    const actualReps = workoutData.actualReps?.[exerciseId] || [];
    const actualWeights = workoutData.actualWeights?.[exerciseId] || [];

    const groups: Record<string, number> = {};

    exercise.sets.forEach((s, idx) => {
      const reps = actualReps[idx] !== undefined && actualReps[idx] > 0 ? actualReps[idx] : s.reps;
      const weight = actualWeights[idx] !== undefined && actualWeights[idx] > 0 ? actualWeights[idx] : (s.weight || 0);
      const key = weight ? `${reps}@${weight}` : String(reps);
      groups[key] = (groups[key] || 0) + 1;
    });

    const parts: string[] = Object.entries(groups).map(([k, cnt]) => {
      if (k.includes('@')) {
        const [r, w] = k.split('@');
        return `${cnt}×${r} @${w}kg`;
      }
      return `${cnt}×${k}`;
    });

    return parts.join(' • ');
  };

  return (
    <aside className="p-3 rounded-lg bg-white dark:bg-gray-800 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Resumen de series</h3>
        {workoutProgress && (
          <div className="text-xs text-gray-500">
            {workoutProgress.completedSets}/{workoutProgress.totalSets}
          </div>
        )}
      </div>

      <ul className="space-y-2 max-h-[60vh] overflow-auto pr-2">
        {exercises.map((ex) => (
          <li key={ex.id} className={`${ex.id === currentExerciseId ? 'bg-blue-50 dark:bg-blue-900/20 rounded-md p-2' : ''}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{ex.name}</div>
                <div className="text-[11px] text-gray-500 truncate">{renderSummary(ex)}</div>
              </div>
              <div className="text-xs text-gray-400 ml-2">
                {workoutData.completedSets?.[ex.id] ?? 0}/{ex.sets.length}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
