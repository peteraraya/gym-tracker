'use client';

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { WeightSelector } from '@/components/WeightSelector';
import { WeightSuggestionBanner } from '@/components/WeightSuggestionBanner';
import { Input } from '@/components/ui/Input';
import type { Exercise } from '@/types';
import type { WeightSuggestion } from '@/lib/weightSuggestions';

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
  onShowInfo?: () => void;
  isSetStarted?: boolean;
  weightSuggestion?: WeightSuggestion | null;
  onDismissWeightSuggestion?: () => void;
  // New props for "Repeat Previous" feature
  lastSetData?: { reps: number; weight: number } | null;
  onRepeatPrevious?: () => void;
  // New prop for set timer
  setStartTime?: number | null;
  // Quick exercise switcher (rendered as children)
  quickSwitcher?: React.ReactNode;
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
  onShowInfo,
  isSetStarted = false,
  weightSuggestion,
  onDismissWeightSuggestion,
  lastSetData,
  onRepeatPrevious,
  setStartTime,
  quickSwitcher,
}: ExerciseCardProps) {
  const totalSets = exercise.sets.length;
  const isLastSet = currentSet === totalSets;
  const isSetComplete = currentReps !== '' && currentWeight !== '';

  // Timer for set execution
  const [elapsedTime, setElapsedTime] = React.useState(0);

  React.useEffect(() => {
    if (!setStartTime) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - setStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [setStartTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Quick weight adjustment handler
  const handleQuickWeightAdjustment = (delta: number) => {
    const newWeight = Math.max(0, (currentWeight || 0) + delta);
    onWeightChange(newWeight);
    
    // Haptic feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

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
        {/* Serie iniciada indicator */}
        {isSetStarted && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 dark:border-blue-400 rounded-lg p-3 flex items-center gap-3">
            <span className="text-blue-600 dark:text-blue-400 text-2xl">⏱️</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                Serie en progreso
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Completa cuando termines de ejecutar
              </p>
            </div>
            {setStartTime && (
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                  {formatTime(elapsedTime)}
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  Tiempo
                </div>
              </div>
            )}
          </div>
        )}

        {/* Weight suggestion banner */}
        {weightSuggestion && (
          <WeightSuggestionBanner
            suggestion={weightSuggestion}
            onAccept={() => onWeightChange(weightSuggestion.suggested)}
            onDismiss={() => onDismissWeightSuggestion?.()}
          />
        )}
        
        {/* Debug: Show when no suggestion available */}
        {!weightSuggestion && (
          <div className="text-xs text-gray-500 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-900 rounded">
            💡 Completa más entrenamientos para ver sugerencias de peso personalizadas
          </div>
        )}

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

        {/* Quick weight adjustment buttons */}
        <div className="flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
            Ajuste rápido:
          </span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleQuickWeightAdjustment(-5)}
            className="px-3 py-1.5 min-w-[60px]"
          >
            -5kg
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleQuickWeightAdjustment(-2.5)}
            className="px-3 py-1.5 min-w-[60px]"
          >
            -2.5kg
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleQuickWeightAdjustment(+2.5)}
            className="px-3 py-1.5 min-w-[60px]"
          >
            +2.5kg
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleQuickWeightAdjustment(+5)}
            className="px-3 py-1.5 min-w-[60px]"
          >
            +5kg
          </Button>
        </div>

        {/* Quick action: Repeat Previous */}
        {lastSetData && onRepeatPrevious && !isSetStarted && (
          <Button
            variant="ghost"
            onClick={onRepeatPrevious}
            className="w-full text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            🔄 Repetir Anterior ({lastSetData.reps} reps × {lastSetData.weight}kg)
          </Button>
        )}

        {/* Botones de acción - Solo mostrar cuando NO está en ejecución */}
        {!isSetStarted && quickSwitcher && (
          <div className="pt-2">
            {quickSwitcher}
          </div>
        )}

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
