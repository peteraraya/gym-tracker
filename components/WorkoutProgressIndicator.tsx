'use client';

import React from 'react';

interface WorkoutProgressIndicatorProps {
  currentExercise: number;
  totalExercises: number;
  currentSet: number;
  totalSets: number;
  completedSets: number;
  className?: string;
}

export function WorkoutProgressIndicator({
  currentExercise,
  totalExercises,
  currentSet,
  totalSets,
  completedSets,
  className = ''
}: WorkoutProgressIndicatorProps) {
  // Calcular progreso total del entrenamiento
  const totalSetsInWorkout = totalExercises * totalSets; // Aproximado
  const progressPercentage = Math.round((completedSets / totalSetsInWorkout) * 100);
  
  // Calcular progreso del ejercicio actual
  const exerciseProgress = Math.round((currentSet / totalSets) * 100);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Progreso total del entrenamiento */}
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
        <span className="font-medium">Progreso Total</span>
        <span className="font-bold text-blue-600 dark:text-blue-400">{progressPercentage}%</span>
      </div>
      
      <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-linear-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </div>
      </div>

      {/* Progreso del ejercicio actual */}
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
        <span>Ejercicio {currentExercise}/{totalExercises}</span>
        <span>Serie {currentSet}/{totalSets}</span>
      </div>
      
      <div className="relative w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-linear-to-r from-green-500 to-green-600 transition-all duration-300"
          style={{ width: `${exerciseProgress}%` }}
        />
      </div>
    </div>
  );
}

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
}

export function CircularProgress({
  percentage,
  size = 120,
  strokeWidth = 8,
  className = '',
  showLabel = true
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-blue-600 dark:text-blue-400 transition-all duration-500 ease-out"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {Math.round(percentage)}%
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Completado
          </span>
        </div>
      )}
    </div>
  );
}
