'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { WeightSuggestionBanner } from '@/components/WeightSuggestionBanner';
import { EditValueModal } from './EditValueModal';
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

  // Estado para modales de edición
  const [editingField, setEditingField] = useState<'reps' | 'weight' | null>(null);

  // Timer for set execution
  const [elapsedTime, setElapsedTime] = React.useState(0);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    // Limpiar intervalo anterior
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!setStartTime) {
      setElapsedTime(0);
      return;
    }

    // Actualizar inmediatamente
    setElapsedTime(Math.floor((Date.now() - setStartTime) / 1000));

    // Crear nuevo intervalo
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - setStartTime) / 1000);
      setElapsedTime(elapsed);
    }, 100); // Actualizar cada 100ms para mayor precisión visual

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
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
      <CardContent className="space-y-3">
        {/* Serie iniciada indicator - Compacto */}
        {isSetStarted && setStartTime && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-3 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <span className="text-xl">⏱️</span>
              <span className="text-sm font-semibold">En progreso</span>
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {formatTime(elapsedTime)}
            </div>
          </div>
        )}

        {/* Weight suggestion banner - Solo si hay sugerencia */}
        {weightSuggestion && (
          <WeightSuggestionBanner
            suggestion={weightSuggestion}
            onAccept={() => onWeightChange(weightSuggestion.suggested)}
            onDismiss={() => onDismissWeightSuggestion?.()}
          />
        )}

        {/* Información compacta del ejercicio */}
        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-lg">
          {exercise.equipment && (
            <span className="flex items-center gap-1">
              <span>📦</span>
              <span>{exercise.equipment}</span>
            </span>
          )}
          {exercise.restBetweenSets && (
            <span className="flex items-center gap-1">
              <span>⏸️</span>
              <span>{exercise.restBetweenSets}s</span>
            </span>
          )}
        </div>

        {/* Inputs de reps y peso - Botones que abren modal */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
              Repeticiones
            </label>
            <button
              onClick={() => setEditingField('reps')}
              className={`w-full min-h-[56px] px-3 py-2 rounded-lg transition-colors font-bold text-xl border-2 ${
                currentReps === '' || currentReps === 0
                  ? 'text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
              }`}
            >
              {currentReps === '' || currentReps === 0 ? '-' : currentReps}
            </button>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
              Peso (kg)
            </label>
            <button
              onClick={() => setEditingField('weight')}
              className={`w-full min-h-[56px] px-3 py-2 rounded-lg transition-colors font-bold text-xl border-2 ${
                currentWeight === '' || currentWeight === 0
                  ? 'text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
              }`}
            >
              {currentWeight === '' || currentWeight === 0 ? '-' : `${currentWeight} kg`}
            </button>
          </div>
        </div>

        {/* Quick weight adjustment - Más compacto */}
        <div className="grid grid-cols-4 gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleQuickWeightAdjustment(-5)}
            className="text-xs py-2"
          >
            -5kg
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleQuickWeightAdjustment(-2.5)}
            className="text-xs py-2"
          >
            -2.5kg
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleQuickWeightAdjustment(+2.5)}
            className="text-xs py-2"
          >
            +2.5kg
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleQuickWeightAdjustment(+5)}
            className="text-xs py-2"
          >
            +5kg
          </Button>
        </div>

        {/* Quick action: Repeat Previous - Más compacto */}
        {lastSetData && onRepeatPrevious && !isSetStarted && (
          <Button
            variant="ghost"
            onClick={onRepeatPrevious}
            className="w-full text-xs py-2 text-blue-600 dark:text-blue-400"
          >
            🔄 Repetir: {lastSetData.reps} reps × {lastSetData.weight}kg
          </Button>
        )}

        {/* Quick switcher - Solo cuando NO está en ejecución */}
        {!isSetStarted && quickSwitcher && (
          <div className="pt-1">
            {quickSwitcher}
          </div>
        )}
      </CardContent>

      {/* Modal de edición de repeticiones */}
      <EditValueModal
        isOpen={editingField === 'reps'}
        onClose={() => setEditingField(null)}
        title={`${exercise.name} - Serie ${currentSet}`}
        field="reps"
        currentValue={currentReps}
        onSave={(value) => onRepsChange(value)}
      />

      {/* Modal de edición de peso */}
      <EditValueModal
        isOpen={editingField === 'weight'}
        onClose={() => setEditingField(null)}
        title={`${exercise.name} - Serie ${currentSet}`}
        field="weight"
        currentValue={currentWeight}
        onSave={(value) => onWeightChange(value)}
        historicalWeights={exercise.sets.map(s => s.weight).filter((w, i, arr) => w && w > 0 && arr.indexOf(w) === i).sort((a, b) => (b || 0) - (a || 0))}
      />
    </Card>
  );
}
