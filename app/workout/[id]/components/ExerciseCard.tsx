'use client';

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { WeightSelector } from '@/components/WeightSelector';
import { Input } from '@/components/ui/Input';
import type { Exercise } from '@/types';

interface ExerciseCardProps {
  exercise: Exercise;
  exerciseIndex: number;
  currentSet: number;
  completedSets: number;
  currentReps: number | '';
  currentWeight: number | '';
  onRepsChange: (reps: number | '') => void;
  onWeightChange: (weight: number) => void;
  onCompleteSet: () => void;
  onSkipExercise: () => void;
  onShowInfo?: () => void;
}

/**
 * Componente que muestra un ejercicio individual
 * 
 * Responsabilidades:
 * - Mostrar información del ejercicio
 * - Inputs para reps y peso
 * - Botones de acción
 * - Progreso de series
 */
export function ExerciseCard({
  exercise,
  exerciseIndex,
  currentSet,
  completedSets,
  currentReps,
  currentWeight,
  onRepsChange,
  onWeightChange,
  onCompleteSet,
  onSkipExercise,
  onShowInfo,
}: ExerciseCardProps) {
  const totalSets = exercise.sets.length;
  const isLastSet = currentSet === totalSets;
  const isSetComplete = currentReps !== '' && currentWeight !== '';

  // Calcular progreso visual
  const progress = useMemo(() => {
    return (completedSets / totalSets) * 100;
  }, [completedSets, totalSets]);

  return (
    <Card className="mb-4 border-2 border-blue-200 dark:border-blue-900">
      {/* Header con información del ejercicio */}
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle className="text-2xl mb-2">{exercise.name}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold">
                Serie {currentSet} de {totalSets}
              </span>
              {exercise.recommendedReps && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                  {exercise.recommendedReps}
                </span>
              )}
            </div>
          </div>
          
          {/* Botón de información */}
          {onShowInfo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowInfo}
              className="text-blue-600 dark:text-blue-400"
            >
              ℹ️ Info
            </Button>
          )}
        </div>

        {/* Barra de progreso */}
        <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>

      {/* Contenido principal */}
      <CardContent className="space-y-4">
        {/* Información adicional */}
        {exercise.equipment && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">Equipamiento:</span> {exercise.equipment}
          </div>
        )}

        {exercise.restBetweenSets && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">Descanso:</span> {exercise.restBetweenSets}s
          </div>
        )}

        {/* Inputs de reps y peso */}
        <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Repeticiones
            </label>
            <Input
              type="number"
              value={currentReps}
              onChange={(e) => onRepsChange(e.target.value === '' ? '' : parseInt(e.target.value))}
              placeholder="0"
              min="0"
              max="100"
              className="text-center text-lg font-bold"
              aria-label="Repeticiones"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Peso (kg)
            </label>
            <WeightSelector
              value={currentWeight}
              onChange={onWeightChange}
              exerciseId={exercise.id}
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="primary"
            onClick={onCompleteSet}
            disabled={!isSetComplete}
            className="flex-1 py-2 sm:py-3 text-sm sm:text-base font-semibold"
          >
            <span className="hidden sm:inline">✅ Completar Serie {isLastSet ? '(Última)' : ''}</span>
            <span className="sm:hidden">✅ Completar</span>
          </Button>
          <Button
            variant="ghost"
            onClick={onSkipExercise}
            className="flex-1 py-2 sm:py-3 text-sm sm:text-base"
          >
            <span className="hidden sm:inline">⏭️ Saltar</span>
            <span className="sm:hidden">⏭️</span>
          </Button>
        </div>

        {/* Resumen de progreso */}
        <div className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2">
          {completedSets} de {totalSets} series completadas
          {completedSets > 0 && (
            <div className="mt-1 text-green-600 dark:text-green-400">
              ✓ {completedSets} serie{completedSets !== 1 ? 's' : ''} completada{completedSets !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
