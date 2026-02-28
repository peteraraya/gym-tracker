'use client';

import React, { useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Clock, Weight, ListChecks, Repeat } from '@/components/icons/lucide';
import type { Routine } from '@/types';

interface CompactWorkoutHeaderProps {
  routine: Routine;
  currentExerciseIndex: number;
  totalExercises: number;
  elapsedTime?: number;
  completedSets: Record<string, number>;
  actualReps: Record<string, number[]>;
  actualWeights: Record<string, number[]>;
  exercises: any[];
  onCancel?: () => void;
}

/**
 * Header compacto que combina información del workout y estadísticas en tiempo real
 * Diseñado para ocupar mínimo espacio en modo sticky
 */
export function CompactWorkoutHeader({
  routine,
  currentExerciseIndex,
  totalExercises,
  elapsedTime = 0,
  completedSets,
  actualReps,
  actualWeights,
  exercises,
  onCancel,
}: CompactWorkoutHeaderProps) {
  
  // Calcular progreso
  const progress = useMemo(() => {
    return ((currentExerciseIndex + 1) / totalExercises) * 100;
  }, [currentExerciseIndex, totalExercises]);

  // Formatear tiempo
  const formattedTime = useMemo(() => {
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = elapsedTime % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [elapsedTime]);

  // Calcular estadísticas en tiempo real
  const stats = useMemo(() => {
    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;
    
    exercises.forEach(exercise => {
      const exerciseId = exercise.id;
      const reps = actualReps[exerciseId] || [];
      const weights = actualWeights[exerciseId] || [];
      const completed = completedSets[exerciseId] || 0;
      
      totalSets += completed;
      
      for (let i = 0; i < completed; i++) {
        const setReps = reps[i] || 0;
        const setWeight = weights[i] || 0;
        
        totalReps += setReps;
        totalVolume += setReps * setWeight;
      }
    });
    
    return {
      volume: totalVolume,
      sets: totalSets,
      reps: totalReps
    };
  }, [completedSets, actualReps, actualWeights, exercises]);

  const currentExercise = routine.exercises[currentExerciseIndex];

  return (
    <div className="bg-white dark:bg-gray-900 border-b-2 border-blue-200 dark:border-blue-800 shadow-md">
      {/* Fila 1: Título y botón cancelar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
            {routine.name}
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {currentExercise?.name} • {currentExerciseIndex + 1}/{totalExercises}
          </p>
        </div>
        
        {onCancel && (
          <Button
            variant="ghost"
            onClick={onCancel}
            size="sm"
            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 ml-2 px-3 py-1.5 text-xs font-medium"
          >
            Descartar entrenamiento
          </Button>
        )}
      </div>

      {/* Fila 2: Estadísticas compactas */}
      <div className="grid grid-cols-4 gap-2 px-4 pb-2">
        {/* Tiempo */}
        <div className="flex flex-col items-center">
          <Clock className="w-3.5 h-3.5 text-green-600 dark:text-green-400 mb-0.5" />
          <div className="text-sm font-bold text-green-600 dark:text-green-400 font-mono tabular-nums">
            {formattedTime}
          </div>
          <div className="text-[10px] text-gray-600 dark:text-gray-400">
            Tiempo
          </div>
        </div>

        {/* Volumen */}
        <div className="flex flex-col items-center">
          <Weight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mb-0.5" />
          <div className="text-sm font-bold text-blue-600 dark:text-blue-400 tabular-nums">
            {stats.volume >= 1000 
              ? `${(stats.volume / 1000).toFixed(1)}k` 
              : stats.volume}
          </div>
          <div className="text-[10px] text-gray-600 dark:text-gray-400">
            kg
          </div>
        </div>

        {/* Series */}
        <div className="flex flex-col items-center">
          <ListChecks className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 mb-0.5" />
          <div className="text-sm font-bold text-purple-600 dark:text-purple-400 tabular-nums">
            {stats.sets}
          </div>
          <div className="text-[10px] text-gray-600 dark:text-gray-400">
            series
          </div>
        </div>

        {/* Reps */}
        <div className="flex flex-col items-center">
          <Repeat className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 mb-0.5" />
          <div className="text-sm font-bold text-orange-600 dark:text-orange-400 tabular-nums">
            {stats.reps}
          </div>
          <div className="text-[10px] text-gray-600 dark:text-gray-400">
            reps
          </div>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="h-1.5 bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 shadow-sm"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
