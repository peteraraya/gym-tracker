'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { WeightSelector } from '@/components/WeightSelector';

interface SetExecutionModalProps {
  isOpen: boolean;
  exerciseName: string;
  equipment?: string;
  currentSet: number;
  totalSets: number;
  currentReps: number | '';
  currentWeight: number | '';
  exerciseId: string;
  onRepsChange: (reps: number | '') => void;
  onWeightChange: (weight: number) => void;
  onComplete: () => void;
  onCancel: () => void;
}

export function SetExecutionModal({
  isOpen,
  exerciseName,
  equipment,
  currentSet,
  totalSets,
  currentReps,
  currentWeight,
  exerciseId,
  onRepsChange,
  onWeightChange,
  onComplete,
  onCancel,
}: SetExecutionModalProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Start timer when modal opens
  useEffect(() => {
    if (isOpen) {
      setElapsedTime(0);
      setIsRunning(true);
      startTimeRef.current = Date.now();
    }
  }, [isOpen]);

  // Timer logic
  useEffect(() => {
    if (isRunning && isOpen) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = () => {
    setIsRunning(false);
    onComplete();
  };

  if (!isOpen) return null;

  const isValid = currentReps !== '' && currentWeight !== '';

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {exerciseName}
          </h2>
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">
              Serie {currentSet} de {totalSets}
            </span>
            {equipment && (
              <>
                <span>•</span>
                <span>{equipment}</span>
              </>
            )}
          </div>
        </div>

        {/* Timer */}
        <div className="py-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Tiempo de Serie
            </div>
            <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
              {formatTime(elapsedTime)}
            </div>
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="mt-4 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              {isRunning ? '⏸️ Pausar' : '▶️ Continuar'}
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Repeticiones */}
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
                className="text-center text-2xl font-bold h-16"
                autoFocus
              />
            </div>

            {/* Peso */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Peso (kg)
              </label>
              <div className="h-16 flex items-center">
                <WeightSelector
                  value={currentWeight}
                  onChange={onWeightChange}
                  exerciseId={exerciseId}
                  className="text-2xl font-bold h-16"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={onCancel}
              className="flex-1 py-4 text-base font-semibold"
            >
              ⏭️ Saltar Ejercicio
            </Button>
            <Button
              variant="primary"
              onClick={handleComplete}
              disabled={!isValid}
              className="flex-1 py-4 text-base font-semibold"
            >
              ✅ Completar Serie
            </Button>
          </div>

          {!isValid && (
            <p className="text-xs text-center text-red-600 dark:text-red-400">
              Ingresa repeticiones y peso para continuar
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
