'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ExerciseIcon } from '@/components/ExerciseIcon';
import { StatBadge } from '@/components/StatBadge';
import Image from 'next/image';
import { useState } from 'react';
import type { ExerciseTemplate } from '@/data/exercises';
import type { WarmupExercise } from '@/data/warmupExercises';

interface ExerciseListItemProps {
  exercise: ExerciseTemplate | WarmupExercise;
  onViewDetails?: (exercise: ExerciseTemplate | WarmupExercise) => void;
  showImage?: boolean;
  compact?: boolean;
  categoryLabel?: string;
  categoryIcon?: string;
  isWarmup?: boolean;
}

function ExerciseImage({ exercise }: { exercise: ExerciseTemplate }) {
  const [failed, setFailed] = useState(false);

  if (!exercise.image || failed) return null;

  return (
    <div className="w-full h-40 sm:h-full relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none">
      <Image
        src={exercise.image}
        alt={exercise.name}
        fill
        className="object-cover hover:scale-105 transition-transform duration-300"
        sizes="(max-width: 640px) 100vw, 160px"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export function ExerciseListItem({
  exercise,
  onViewDetails,
  showImage = true,
  compact = false,
  categoryLabel,
  categoryIcon,
  isWarmup = false
}: ExerciseListItemProps) {
  return (
    <Card className={`hover:shadow-xl transition-all duration-300 overflow-hidden ${
      isWarmup ? 'border-amber-200 dark:border-amber-800' : 'border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Image/Icon */}
        {showImage && (
          <div className="sm:w-48 shrink-0">
            {exercise.image ? (
              <ExerciseImage exercise={exercise} />
            ) : (
              <div className={`flex justify-center items-center h-40 sm:h-full rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none ${
                isWarmup 
                  ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20' 
                  : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700'
              }`}>
                {isWarmup ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-6xl">🔥</span>
                    {categoryLabel && categoryIcon && (
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                        {categoryIcon} {categoryLabel}
                      </span>
                    )}
                  </div>
                ) : (
                  <ExerciseIcon muscleGroup={exercise.muscleGroup} className="w-24 h-24" />
                )}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-5">
          <div className="flex flex-col gap-3 mb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {exercise.name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <StatBadge
                    icon={<span className="text-xs">🏋️</span>}
                    value={exercise.equipment || 'N/A'}
                    label=""
                    color="blue"
                    size="sm"
                  />
                  {categoryLabel && categoryIcon && (
                    <StatBadge
                      icon={<span className="text-xs">{categoryIcon}</span>}
                      value={categoryLabel}
                      label=""
                      color="amber"
                      size="sm"
                    />
                  )}
                </div>
              </div>
              {onViewDetails && (
                <Button 
                  onClick={() => onViewDetails(exercise)} 
                  className="shrink-0 px-5 py-2.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
                >
                  Ver técnica
                </Button>
              )}
            </div>

            {exercise.description && !compact && (
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {exercise.description}
              </p>
            )}
          </div>

          {/* Stats */}
          {!compact && (
            <div className="flex flex-wrap gap-3">
              {exercise.recommendedSets && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-green-700 dark:text-green-400 font-semibold text-sm">Series:</span>
                  <span className="text-green-900 dark:text-green-200 text-sm font-medium">{exercise.recommendedSets}</span>
                </div>
              )}
              {exercise.recommendedReps && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-blue-700 dark:text-blue-400 font-semibold text-sm">Reps:</span>
                  <span className="text-blue-900 dark:text-blue-200 text-sm font-medium">{exercise.recommendedReps}</span>
                </div>
              )}
              {exercise.restTime && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-400 text-sm">⏱️ {exercise.restTime}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
