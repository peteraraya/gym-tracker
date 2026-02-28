'use client';

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TrendingUp, Zap, Clock } from '@/components/icons/lucide';
import type { Routine } from '@/types';

interface WorkoutSummaryProps {
  routine: Routine;
  completedSets: { [key: string]: number };
  actualReps: { [key: string]: number[] };
  actualWeights: { [key: string]: number[] };
  totalDuration?: number; // en segundos
  onFinish?: () => void;
  onContinue?: () => void;
}

/**
 * Componente que muestra el resumen del workout
 * 
 * Responsabilidades:
 * - Mostrar estadísticas del workout
 * - Mostrar volumen total levantado
 * - Mostrar duración
 * - Botones de finalizar/continuar
 */
export function WorkoutSummary({
  routine,
  completedSets,
  actualReps,
  actualWeights,
  totalDuration = 0,
  onFinish,
  onContinue,
}: WorkoutSummaryProps) {
  // Calcular estadísticas
  const stats = useMemo(() => {
    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;

    routine.exercises.forEach(exercise => {
      const reps = actualReps[exercise.id] || [];
      const weights = actualWeights[exercise.id] || [];

      reps.forEach((rep, index) => {
        const weight = weights[index] || 0;
        totalVolume += rep * weight;
        totalSets += 1;
        totalReps += rep;
      });
    });

    return {
      totalVolume: Math.round(totalVolume),
      totalSets,
      totalReps,
      averageReps: totalSets > 0 ? Math.round(totalReps / totalSets) : 0,
    };
  }, [routine, actualReps, actualWeights]);

  // Formatear tiempo
  const formattedTime = useMemo(() => {
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);
    const seconds = totalDuration % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }, [totalDuration]);

  // Calcular progreso
  const completedExercises = Object.values(completedSets).filter(count => count > 0).length;
  const totalExercises = routine.exercises.length;
  const progress = (completedExercises / totalExercises) * 100;

  return (
    <Card className="mb-6 border-2 border-green-200 dark:border-green-900">
      <CardHeader className="bg-green-50 dark:bg-green-900/20">
        <CardTitle className="text-2xl text-green-700 dark:text-green-400">
          ✓ Resumen del Entrenamiento
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Estadísticas principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Volumen total */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Volumen Total</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.totalVolume.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">kg</div>
          </div>

          {/* Series completadas */}
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Series</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.totalSets}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">completadas</div>
          </div>

          {/* Repeticiones totales */}
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Repeticiones</div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats.totalReps}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">total</div>
          </div>

          {/* Promedio de reps */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Promedio</div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {stats.averageReps}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">reps/serie</div>
          </div>
        </div>

        {/* Duración */}
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">Duración total</div>
            <div className="text-xl font-bold text-green-600 dark:text-green-400">
              {formattedTime}
            </div>
          </div>
        </div>

        {/* Progreso de ejercicios */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Ejercicios completados
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {completedExercises} de {totalExercises}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Detalles por ejercicio */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Detalle por ejercicio
          </div>
          {routine.exercises.map(exercise => {
            const sets = completedSets[exercise.id] || 0;
            const reps = actualReps[exercise.id] || [];
            const weights = actualWeights[exercise.id] || [];
            const volume = reps.reduce((sum, rep, idx) => sum + rep * (weights[idx] || 0), 0);

            return (
              <div
                key={exercise.id}
                className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900 rounded text-sm"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {exercise.name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {sets} series × {reps.length > 0 ? reps.join(', ') : '0'} reps
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {Math.round(volume)} kg
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          {onContinue && (
            <Button
              variant="ghost"
              onClick={onContinue}
              className="flex-1"
            >
              ← Volver
            </Button>
          )}
          {onFinish && (
            <Button
              variant="primary"
              onClick={onFinish}
              className="flex-1 py-3 text-base font-semibold"
            >
              ✅ Finalizar Entrenamiento
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
