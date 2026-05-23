'use client';

import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';

interface LiveStatsPanelProps {
  completedSets: Record<string, number>;
  actualReps: Record<string, number[]>;
  actualWeights: Record<string, number[]>;
  exercises: any[];
  className?: string;
}

/**
 * Panel de estadísticas en tiempo real durante el entrenamiento
 * 
 * Muestra:
 * - Volumen total levantado (kg)
 * - Series completadas
 * - Repeticiones totales
 */
export function LiveStatsPanel({
  completedSets,
  actualReps,
  actualWeights,
  exercises,
  className = ''
}: LiveStatsPanelProps) {
  
  // Calcular estadísticas en tiempo real
  const stats = useMemo(() => {
    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;
    
    // Iterar sobre todos los ejercicios
    exercises.forEach(exercise => {
      const exerciseId = exercise.id;
      const reps = actualReps[exerciseId] || [];
      const weights = actualWeights[exerciseId] || [];
      const completed = completedSets[exerciseId] || 0;
      
      // Sumar series completadas
      totalSets += completed;
      
      // Calcular volumen y reps por cada serie completada
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
  
  return (
    <Card className={`bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 ${className}`}>
      <CardContent className="py-3 px-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Volumen Total */}
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
              {stats.volume.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">
              kg levantados
            </div>
          </div>
          
          {/* Series Completadas */}
          <div className="text-center border-x border-blue-200 dark:border-blue-800">
            <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 tabular-nums">
              {stats.sets}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">
              series
            </div>
          </div>
          
          {/* Repeticiones Totales */}
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 tabular-nums">
              {stats.reps}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">
              repeticiones
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
