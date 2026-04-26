'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { WeightSuggestionBanner } from '@/components/WeightSuggestionBanner';
import { EditValueModal } from '@/components/EditValueModal';
import { useToast } from '@/context/ToastContext';
import { formatRestTime } from '@/lib/formatTime';
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
  // ✅ Personal record for this exercise
  personalRecord?: { maxWeight: number; reps: number; date: Date } | null;
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
  personalRecord,
}: ExerciseCardProps) {
  const { success } = useToast();
  const totalSets = exercise.sets.length;
  const isLastSet = currentSet === totalSets;
  const isSetComplete = currentReps !== '' && currentWeight !== '';

  // Estado para modales de edición
  const [editingField, setEditingField] = useState<'reps' | 'weight' | null>(null);
  
  // Estado local para controlar la visibilidad de la sugerencia
  const [showSuggestion, setShowSuggestion] = useState(true);
  
  // Resetear showSuggestion cuando cambia weightSuggestion
  React.useEffect(() => {
    if (weightSuggestion) {
      setShowSuggestion(true);
    }
  }, [weightSuggestion]);

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
      {/* Header con información del ejercicio - Mejorado */}
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 mb-3">
          {/* Número de ejercicio grande y colorido */}
          <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold shadow-lg flex-shrink-0">
            {exerciseIndex + 1}
          </div>
          
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl mb-1 truncate">{exercise.name}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Serie {currentSet} de {totalSets}
              </span>
              {/* Badge de estado */}
              {isSetStarted && (
                <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                  EN PROGRESO
                </span>
              )}
              {/* ✅ Badge de récord personal */}
              {personalRecord && personalRecord.maxWeight > 0 && (
                <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-bold rounded-full shadow-sm flex items-center gap-1">
                  🏆 {personalRecord.maxWeight}kg
                </span>
              )}
              {exercise.recommendedReps && (
                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {exercise.recommendedReps}
                </span>
              )}
            </div>
          </div>
          
          {/* Progreso circular */}
          <div className="relative w-14 h-14 flex-shrink-0">
            <svg className="w-14 h-14 transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 24}`}
                strokeDashoffset={`${2 * Math.PI * 24 * (1 - progress / 100)}`}
                className="text-blue-500 transition-all duration-500"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {completedSets}/{totalSets}
              </span>
            </div>
          </div>
          
          {/* Botón de información */}
          {onShowInfo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowInfo}
              className="text-blue-600 dark:text-blue-400 flex-shrink-0"
            >
              ℹ️
            </Button>
          )}
        </div>

        {/* Barra de progreso lineal */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>

      {/* Contenido principal */}
      <CardContent className="space-y-3">
        {/* Serie iniciada indicator - Mejorado y más prominente */}
        {isSetStarted && setStartTime && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⏱️</span>
                <span className="text-sm font-semibold text-white/90">Serie en progreso</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold tabular-nums text-white">
                {formatTime(elapsedTime)}
              </div>
            </div>
          </div>
        )}

        {/* Weight suggestion banner - Solo si hay sugerencia Y showSuggestion es true */}
        {weightSuggestion && showSuggestion && (
          <WeightSuggestionBanner
            suggestion={weightSuggestion}
            onAccept={() => {
              setShowSuggestion(false);
              onWeightChange(weightSuggestion.suggested);
              success(`✅ Peso actualizado a ${weightSuggestion.suggested}kg`, 2000);
              // Llamar onDismiss después de la animación
              setTimeout(() => {
                onDismissWeightSuggestion?.();
              }, 350);
            }}
            onDismiss={() => {
              setShowSuggestion(false);
              // Llamar onDismiss después de la animación
              setTimeout(() => {
                onDismissWeightSuggestion?.();
              }, 350);
            }}
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
              <span>{formatRestTime(exercise.restBetweenSets)}</span>
            </span>
          )}
        </div>

        {/* Inputs de reps y peso */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Repeticiones
            </label>
            <button
              onClick={() => setEditingField('reps')}
              className={`w-full min-h-[72px] px-4 py-3 rounded-2xl transition-all font-bold border-2 active:scale-95 touch-manipulation ${
                currentReps === '' || currentReps === 0
                  ? 'text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-900 border-dashed border-gray-300 dark:border-gray-700'
                  : 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 shadow-md'
              }`}
            >
              <span className="text-4xl font-black tabular-nums">
                {currentReps === '' || currentReps === 0 ? '—' : currentReps}
              </span>
              {(currentReps === '' || currentReps === 0) && (
                <p className="text-[10px] text-gray-400 mt-1 font-normal">toca para ingresar</p>
              )}
            </button>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Peso (kg)
            </label>
            <button
              onClick={() => setEditingField('weight')}
              className={`w-full min-h-[72px] px-4 py-3 rounded-2xl transition-all font-bold border-2 active:scale-95 touch-manipulation ${
                currentWeight === '' || currentWeight === 0
                  ? 'text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-900 border-dashed border-gray-300 dark:border-gray-700'
                  : 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 border-purple-400 dark:border-purple-600 shadow-md'
              }`}
            >
              <span className="text-4xl font-black tabular-nums">
                {currentWeight === '' || currentWeight === 0 ? '—' : currentWeight}
              </span>
              {currentWeight !== '' && currentWeight !== 0 && (
                <p className="text-[10px] text-gray-400 mt-1 font-normal">kg</p>
              )}
              {(currentWeight === '' || currentWeight === 0) && (
                <p className="text-[10px] text-gray-400 mt-1 font-normal">toca para ingresar</p>
              )}
            </button>
          </div>
        </div>

        {/* Indicador de serie lista */}
        {isSetComplete && !isSetStarted && (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-semibold text-green-700 dark:text-green-400">
              Listo — pulsa ▶️ Iniciar Serie para comenzar
            </span>
          </div>
        )}
        {isSetStarted && isSetComplete && (
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-300 dark:border-emerald-700">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Serie en curso — pulsa ✅ para completar
            </span>
          </div>
        )}

        {/* Quick weight adjustment - Botones más grandes y táctiles */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
            Ajuste rápido de peso
          </p>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleQuickWeightAdjustment(-5)}
              className="min-h-[48px] px-3 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg font-bold text-base transition-all active:scale-95 border-2 border-red-200 dark:border-red-800"
            >
              -5
            </button>
            <button
              onClick={() => handleQuickWeightAdjustment(-2.5)}
              className="min-h-[48px] px-3 py-2 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-lg font-bold text-base transition-all active:scale-95 border-2 border-orange-200 dark:border-orange-800"
            >
              -2.5
            </button>
            <button
              onClick={() => handleQuickWeightAdjustment(+2.5)}
              className="min-h-[48px] px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg font-bold text-base transition-all active:scale-95 border-2 border-emerald-200 dark:border-emerald-800"
            >
              +2.5
            </button>
            <button
              onClick={() => handleQuickWeightAdjustment(+5)}
              className="min-h-[48px] px-3 py-2 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 rounded-lg font-bold text-base transition-all active:scale-95 border-2 border-green-200 dark:border-green-800"
            >
              +5
            </button>
          </div>
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
        historicalWeights={exercise.sets
          .map(s => s.weight)
          .filter((w, i, arr): w is number => typeof w === 'number' && w > 0 && arr.indexOf(w) === i)
          .sort((a, b) => b - a)
        }
      />
    </Card>
  );
}
