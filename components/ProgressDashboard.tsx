'use client';

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { WorkoutSession } from '@/types';
import { calculateExerciseProgress } from '@/lib/personalRecords';

interface ExerciseProgressProps {
  sessions: WorkoutSession[];
  exerciseName: string;
}

export function ExerciseProgress({ sessions, exerciseName }: ExerciseProgressProps) {
  const progress = useMemo(
    () => calculateExerciseProgress(sessions, exerciseName),
    [sessions, exerciseName]
  );

  if (!progress) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No hay datos suficientes para {exerciseName}
        </p>
      </div>
    );
  }

  const getTrendIcon = () => {
    if (progress.trend === 'up') {
      return <TrendingUp className="w-5 h-5 text-green-500" />;
    } else if (progress.trend === 'down') {
      return <TrendingDown className="w-5 h-5 text-red-500" />;
    }
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  const getTrendColor = () => {
    if (progress.trend === 'up') return 'text-green-600 dark:text-green-400';
    if (progress.trend === 'down') return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{exerciseName}</h4>
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <span className={`text-sm font-medium capitalize ${getTrendColor()}`}>
            {progress.trend === 'up' ? 'Mejorando' : progress.trend === 'down' ? 'Bajando' : 'Estable'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Mejor Volumen</p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {(progress.personalRecord.maxWeight * progress.personalRecord.reps).toLocaleString()} kg
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Volumen Total</p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {progress.totalVolume.toLocaleString()} kg
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Sesiones</p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {progress.sessions}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Mejora</p>
          <p className={`text-lg font-bold ${getTrendColor()}`}>
            {progress.improvement > 0 ? '+' : ''}
            {progress.improvement.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Récord personal: <span className="font-semibold text-gray-900 dark:text-gray-100">
            {progress.personalRecord.maxWeight} kg × {progress.personalRecord.reps} reps
          </span>
        </p>
      </div>
    </div>
  );
}

interface ProgressDashboardProps {
  sessions: WorkoutSession[];
}

export function ProgressDashboard({ sessions }: ProgressDashboardProps) {
  // Obtener ejercicios únicos de las sesiones
  const uniqueExercises = useMemo(() => {
    const exerciseSet = new Set<string>();
    sessions.forEach(session => {
      if (!session.exercises || !Array.isArray(session.exercises)) return;
      session.exercises.forEach(ex => {
        if (ex.exerciseName) {
          exerciseSet.add(ex.exerciseName);
        }
      });
    });
    return Array.from(exerciseSet).slice(0, 6); // Mostrar top 6
  }, [sessions]);

  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progreso por Ejercicio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              Completa algunas sesiones para ver tu progreso
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Progreso por Ejercicio
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {uniqueExercises.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400 py-4">
              No hay ejercicios registrados
            </p>
          ) : (
            uniqueExercises.map(exerciseName => (
              <ExerciseProgress
                key={exerciseName}
                sessions={sessions}
                exerciseName={exerciseName}
              />
            ))
          )}
        </div>

        {uniqueExercises.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              💡 <strong>Tip:</strong> El progreso se calcula comparando el volumen total 
              (peso × repeticiones) de tus primeras 3 sesiones con las últimas 3 sesiones de cada ejercicio.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
