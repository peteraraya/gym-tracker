'use client';

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Clock, Dumbbell, TrendingUp } from '@/components/icons/lucide';
import type { Routine } from '@/types';

interface WorkoutHeaderProps {
  routine: Routine;
  currentExerciseIndex: number;
  totalExercises: number;
  elapsedTime?: number; // en segundos
  onCancel?: () => void;
  onPause?: () => void;
}

/**
 * Componente que muestra el header del workout
 * 
 * Responsabilidades:
 * - Mostrar nombre de la rutina
 * - Mostrar progreso general
 * - Mostrar tiempo transcurrido
 * - Botones de control (pausar, cancelar)
 */
export function WorkoutHeader({
  routine,
  currentExerciseIndex,
  totalExercises,
  elapsedTime = 0,
  onCancel,
  onPause,
}: WorkoutHeaderProps) {
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

  const currentExercise = routine.exercises[currentExerciseIndex];

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle className="text-3xl mb-2">{routine.name}</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ejercicio {currentExerciseIndex + 1} de {totalExercises}
            </p>
          </div>

          {/* Botones de control */}
          <div className="flex gap-2">
            {onPause && (
              <Button
                variant="ghost"
                onClick={onPause}
                size="sm"
                className="text-orange-600 dark:text-orange-400"
              >
                ⏸️ Pausar
              </Button>
            )}
            {onCancel && (
              <Button
                variant="ghost"
                onClick={onCancel}
                size="sm"
                className="text-red-600 dark:text-red-400"
              >
                ✕ Cancelar
              </Button>
            )}
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mt-4 w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {/* Ejercicio actual */}
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Ejercicio actual</div>
              <div className="font-semibold text-sm truncate">{currentExercise?.name}</div>
            </div>
          </div>

          {/* Tiempo transcurrido */}
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Tiempo</div>
              <div className="font-semibold text-sm font-mono">{formattedTime}</div>
            </div>
          </div>

          {/* Progreso */}
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Progreso</div>
              <div className="font-semibold text-sm">{Math.round(progress)}%</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
