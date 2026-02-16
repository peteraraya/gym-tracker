'use client';

import React from 'react';
import type { WorkoutSession } from '@/types';
import { TrendingUp, TrendingDown, Minus } from '@/components/icons/lucide';

interface WorkoutComparisonProps {
  exerciseName: string;
  currentSet: number;
  currentWeight: number;
  currentReps: number;
  lastSession: WorkoutSession | null;
  compact?: boolean;
}

interface ComparisonData {
  lastWeight: number;
  lastReps: number;
  weightDiff: number;
  repsDiff: number;
  hasImproved: boolean;
  hasDeclined: boolean;
}

function calculateComparison(
  currentWeight: number,
  currentReps: number,
  lastSession: WorkoutSession | null,
  exerciseName: string,
  currentSet: number
): ComparisonData | null {
  if (!lastSession) return null;

  const lastExercise = lastSession.exercises.find(e => e.exerciseName === exerciseName);
  if (!lastExercise) return null;

  // Obtener datos de la serie correspondiente (o la última si no hay suficientes)
  const setIndex = Math.min(currentSet - 1, (lastExercise.actualWeight?.length || 1) - 1);
  const lastWeight = lastExercise.actualWeight?.[setIndex] ?? 0;
  const lastReps = lastExercise.actualReps?.[setIndex] ?? 0;

  if (lastWeight === 0 && lastReps === 0) return null;

  const weightDiff = currentWeight - lastWeight;
  const repsDiff = currentReps - lastReps;

  // Calcular si hubo mejora (más peso o más reps con mismo peso)
  const hasImproved = weightDiff > 0 || (weightDiff === 0 && repsDiff > 0);
  const hasDeclined = weightDiff < 0 || (weightDiff === 0 && repsDiff < 0);

  return {
    lastWeight,
    lastReps,
    weightDiff,
    repsDiff,
    hasImproved,
    hasDeclined
  };
}

export default function WorkoutComparison({
  exerciseName,
  currentSet,
  currentWeight,
  currentReps,
  lastSession,
  compact = false
}: WorkoutComparisonProps) {
  const comparison = calculateComparison(currentWeight, currentReps, lastSession, exerciseName, currentSet);

  if (!comparison) return null;

  const { lastWeight, lastReps, weightDiff, repsDiff, hasImproved, hasDeclined } = comparison;

  if (compact) {
    return (
      <div className={`p-3 rounded-lg border ${
        hasImproved 
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : hasDeclined
          ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasImproved ? (
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : hasDeclined ? (
              <TrendingDown className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            ) : (
              <Minus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            )}
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Última vez: {lastWeight}kg × {lastReps} reps
            </span>
          </div>
          
          {(weightDiff !== 0 || repsDiff !== 0) && (
            <div className="flex items-center gap-2 text-xs">
              {weightDiff !== 0 && (
                <span className={`font-semibold ${
                  weightDiff > 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                }`}>
                  {weightDiff > 0 ? '+' : ''}{weightDiff}kg
                </span>
              )}
              {repsDiff !== 0 && (
                <span className={`font-semibold ${
                  repsDiff > 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                }`}>
                  {repsDiff > 0 ? '+' : ''}{repsDiff} reps
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg border ${
      hasImproved 
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
        : hasDeclined
        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    }`}>
      <div className="flex items-center gap-2 mb-3">
        {hasImproved ? (
          <>
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-semibold text-green-700 dark:text-green-300">
              ¡Mejora detectada!
            </span>
          </>
        ) : hasDeclined ? (
          <>
            <TrendingDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
              Rendimiento menor
            </span>
          </>
        ) : (
          <>
            <Minus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              Mismo rendimiento
            </span>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Última vez */}
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Última vez</div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">{lastWeight}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">kg</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">{lastReps}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">reps</span>
            </div>
          </div>
        </div>

        {/* Esta vez */}
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Esta vez</div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold ${
                weightDiff > 0 ? 'text-green-600 dark:text-green-400' :
                weightDiff < 0 ? 'text-orange-600 dark:text-orange-400' :
                'text-gray-700 dark:text-gray-300'
              }`}>
                {currentWeight}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">kg</span>
              {weightDiff !== 0 && (
                <span className={`text-xs font-semibold ml-1 ${
                  weightDiff > 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                }`}>
                  ({weightDiff > 0 ? '+' : ''}{weightDiff})
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-lg font-semibold ${
                repsDiff > 0 ? 'text-green-600 dark:text-green-400' :
                repsDiff < 0 ? 'text-orange-600 dark:text-orange-400' :
                'text-gray-700 dark:text-gray-300'
              }`}>
                {currentReps}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">reps</span>
              {repsDiff !== 0 && (
                <span className={`text-xs font-semibold ml-1 ${
                  repsDiff > 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                }`}>
                  ({repsDiff > 0 ? '+' : ''}{repsDiff})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje motivacional */}
      {hasImproved && (
        <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
          <p className="text-xs text-green-700 dark:text-green-300">
            💪 ¡Excelente! Estás progresando en este ejercicio.
          </p>
        </div>
      )}
      {hasDeclined && (
        <div className="mt-3 pt-3 border-t border-orange-200 dark:border-orange-800">
          <p className="text-xs text-orange-700 dark:text-orange-300">
            💡 No te preocupes, la variación es normal. Mantén la consistencia.
          </p>
        </div>
      )}
    </div>
  );
}
