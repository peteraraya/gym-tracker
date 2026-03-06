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
  isPaused?: boolean;
  onPauseToggle?: () => void;
  onEditTime?: () => void;
  onDeleteExercise?: () => void;
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
  isPaused = false,
  onPauseToggle,
  onEditTime,
  onDeleteExercise,
}: CompactWorkoutHeaderProps) {
  
  // Calcular progreso basado en series completadas vs total de series
  const progress = useMemo(() => {
    const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    
    // Solo contar series completadas de ejercicios que existen en la rutina actual
    const completedSetsCount = exercises.reduce((sum, ex) => {
      const exerciseReps = actualReps[ex.id] || [];
      // Solo contar hasta el número de series que tiene el ejercicio actualmente
      const completedInExercise = exerciseReps
        .slice(0, ex.sets.length)
        .filter(r => r > 0).length;
      return sum + completedInExercise;
    }, 0);
    
    const percent = totalSets > 0 ? Math.round((completedSetsCount / totalSets) * 100) : 0;
    // Limitar a máximo 100%
    return Math.min(percent, 100);
  }, [exercises, actualReps]);

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
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {currentExercise?.name} • {currentExerciseIndex + 1}/{totalExercises}
            </p>
            {onDeleteExercise && totalExercises > 1 && (
              <button
                onClick={onDeleteExercise}
                className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                title="Eliminar este ejercicio"
                aria-label={`Eliminar ${currentExercise?.name}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
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
        {/* Tiempo con botón de pausa y edición */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 mb-0.5">
            <button
              onClick={onPauseToggle}
              className={`flex items-center justify-center transition-colors ${
                isPaused 
                  ? 'text-yellow-600 dark:text-yellow-400' 
                  : 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300'
              }`}
              title={isPaused ? 'Reanudar' : 'Pausar'}
            >
              {isPaused ? (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
            </button>
            {onEditTime && (
              <button
                onClick={onEditTime}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Editar tiempo"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={onEditTime}
            className={`text-sm font-bold font-mono tabular-nums hover:underline ${
              isPaused 
                ? 'text-yellow-600 dark:text-yellow-400' 
                : 'text-green-600 dark:text-green-400'
            }`}
            title="Click para editar"
          >
            {formattedTime}
          </button>
          <div className="text-[10px] text-gray-600 dark:text-gray-400">
            {isPaused ? 'Pausado' : 'Tiempo'}
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
