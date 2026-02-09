import React from 'react';
import { MuscleGroup } from '@/data/exercises';

interface ExerciseIconProps {
  muscleGroup: MuscleGroup;
  className?: string;
}

const MUSCLE_ICONS: Record<MuscleGroup, string> = {
  pecho: '💪',
  espalda: '🔙',
  piernas: '🦵',
  gluteos: '🍑',
  hombros: '🏋️',
  brazos: '💪',
  core: '🎯',
  gemelos: '🦶'
};

const MUSCLE_COLORS: Record<MuscleGroup, { bg: string; text: string }> = {
  pecho: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400' },
  espalda: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
  piernas: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' },
  gluteos: { bg: 'bg-pink-100 dark:bg-pink-900/20', text: 'text-pink-600 dark:text-pink-400' },
  hombros: { bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' },
  brazos: { bg: 'bg-orange-100 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400' },
  core: { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400' },
  gemelos: { bg: 'bg-teal-100 dark:bg-teal-900/20', text: 'text-teal-600 dark:text-teal-400' }
};

export function ExerciseIcon({ muscleGroup, className = '' }: ExerciseIconProps) {
  const colors = MUSCLE_COLORS[muscleGroup];
  const icon = MUSCLE_ICONS[muscleGroup];

  return (
    <div className={`${colors.bg} ${colors.text} rounded-lg flex items-center justify-center ${className}`}>
      <span className="text-4xl">{icon}</span>
    </div>
  );
}
