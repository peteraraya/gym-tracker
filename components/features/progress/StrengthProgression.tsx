'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import type { WorkoutSession } from '@/types';
import { TrendingUp, TrendingDown } from '@/components/icons/lucide';
import { useTranslations } from '@/context/LocaleContext';

interface StrengthProgressionProps {
  sessions: WorkoutSession[];
}

interface ProgressionData {
  date: Date;
  estimated1RM: number;
  weight: number;
  reps: number;
}

const calculate1RM = (weight: number, reps: number): number => {
  if (reps === 1) return weight;
  return weight * (1 + 0.0333 * reps);
};

export const StrengthProgression: React.FC<StrengthProgressionProps> = ({ sessions }) => {
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const t = useTranslations('dashboard.strengthProgression');
  const tDashboard = useTranslations('dashboard');

  // Obtener lista de ejercicios únicos
  const exercises = React.useMemo(() => {
    const exerciseSet = new Set<string>();
    sessions.forEach(session => {
      if (!session.exercises || !Array.isArray(session.exercises)) return;
      session.exercises.forEach(ex => {
        if (ex.exerciseName) {
          exerciseSet.add(ex.exerciseName);
        }
      });
    });
    return Array.from(exerciseSet).sort();
  }, [sessions]);

  // Calcular progresión del ejercicio seleccionado
  const progression = React.useMemo(() => {
    if (!selectedExercise) return [];

    const data: ProgressionData[] = [];

    sessions
      .filter(s => s.exercises.some(e => e.exerciseName === selectedExercise))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach(session => {
        if (!session.exercises || !Array.isArray(session.exercises)) return null;
        const exercise = session.exercises.find(e => e.exerciseName === selectedExercise);
        if (!exercise) return;

        // Encontrar el mejor set de la sesión (mayor 1RM estimado)
        let bestSet = { weight: 0, reps: 0, estimated1RM: 0 };
        
        exercise.actualReps.forEach((reps, idx) => {
          const weight = exercise.actualWeight[idx] || 0;
          if (weight > 0 && reps > 0) {
            const estimated1RM = calculate1RM(weight, reps);
            if (estimated1RM > bestSet.estimated1RM) {
              bestSet = { weight, reps, estimated1RM };
            }
          }
        });

        if (bestSet.estimated1RM > 0) {
          data.push({
            date: session.date,
            ...bestSet
          });
        }
      });

    return data;
  }, [sessions, selectedExercise]);

  // Calcular estadísticas de progresión
  const stats = React.useMemo(() => {
    if (progression.length < 2) return null;

    const first1RM = progression[0].estimated1RM;
    const last1RM = progression[progression.length - 1].estimated1RM;
    const improvement = last1RM - first1RM;
    const improvementPercent = (improvement / first1RM) * 100;

    // Encontrar máximo histórico
    const max1RM = Math.max(...progression.map(p => p.estimated1RM));
    const maxEntry = progression.find(p => p.estimated1RM === max1RM);

    return {
      first1RM,
      last1RM,
      improvement,
      improvementPercent,
      max1RM,
      maxDate: maxEntry?.date,
      sessions: progression.length
    };
  }, [progression]);

  // Seleccionar automáticamente el primer ejercicio
  React.useEffect(() => {
    if (exercises.length > 0 && !selectedExercise) {
      setSelectedExercise(exercises[0]);
    }
  }, [exercises, selectedExercise]);

  if (exercises.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            {t('noData')}
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...progression.map(p => p.estimated1RM), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title1RM')}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Selector de ejercicio */}
        <div className="mb-4">
          <Select
            label={t('selectExercise')}
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
          >
            {exercises.map(exercise => (
              <option key={exercise} value={exercise}>
                {exercise}
              </option>
            ))}
          </Select>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">{t('initial')}</div>
              <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                {Math.round(stats.first1RM)} {tDashboard('units.kg')}
              </div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-xs text-green-600 dark:text-green-400 mb-1">{t('current')}</div>
              <div className="text-xl font-bold text-green-700 dark:text-green-300">
                {Math.round(stats.last1RM)} {tDashboard('units.kg')}
              </div>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-xs text-purple-600 dark:text-purple-400 mb-1">{t('max')}</div>
              <div className="text-xl font-bold text-purple-700 dark:text-purple-300">
                {Math.round(stats.max1RM)} {tDashboard('units.kg')}
              </div>
            </div>
            <div className={`p-3 rounded-lg ${
              stats.improvement >= 0 
                ? 'bg-emerald-50 dark:bg-emerald-900/20' 
                : 'bg-red-50 dark:bg-red-900/20'
            }`}>
              <div className={`text-xs mb-1 ${
                stats.improvement >= 0 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {t('progress')}
              </div>
              <div className={`text-xl font-bold flex items-center gap-1 ${
                stats.improvement >= 0 
                  ? 'text-emerald-700 dark:text-emerald-300' 
                  : 'text-red-700 dark:text-red-300'
              }`}>
                {stats.improvement >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {stats.improvement >= 0 ? '+' : ''}{stats.improvementPercent.toFixed(1)}%
              </div>
            </div>
          </div>
        )}

        {/* Gráfico de línea simple */}
        {progression.length > 0 && (
          <div className="space-y-2">
            <div className="h-64 flex items-end gap-1 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              {progression.map((point, idx) => {
                const height = (point.estimated1RM / maxValue) * 100;
                const isMax = point.estimated1RM === stats?.max1RM;
                const isLast = idx === progression.length - 1;
                
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      className={`w-full rounded-t transition-all ${
                        isMax 
                          ? 'bg-linear-to-t from-yellow-500 to-yellow-400' 
                          : isLast
                            ? 'bg-linear-to-t from-green-500 to-green-400'
                            : 'bg-linear-to-t from-blue-500 to-blue-400'
                      } hover:opacity-80`}
                      style={{ height: `${height}%` }}
                    />
                    
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap pointer-events-none z-10">
                      <div className="font-bold">{Math.round(point.estimated1RM)} kg</div>
                      <div>{point.weight}kg × {point.reps} reps</div>
                      <div className="text-gray-300">
                        {new Date(point.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Leyenda de fechas */}
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 px-4">
              <span>
                {new Date(progression[0].date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </span>
              <span>
                {new Date(progression[progression.length - 1].date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>
        )}

        {progression.length < 2 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            Necesitas al menos 2 sesiones de este ejercicio para ver la progresión.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
