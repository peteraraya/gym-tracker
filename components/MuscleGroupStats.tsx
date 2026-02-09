'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import type { WorkoutSession } from '@/types';
import { EXERCISE_DATABASE, MuscleGroup } from '@/data/exercises';
import { MuscleGroupIcon } from '@/components/icons/MuscleGroupIcons';

interface MuscleGroupStatsProps {
  sessions: WorkoutSession[];
}

interface MuscleGroupData {
  muscleGroup: MuscleGroup;
  volume: number;
  sets: number;
  exercises: Set<string>;
}

const MUSCLE_GROUP_COLORS: Record<MuscleGroup, string> = {
  pecho: '#3b82f6',
  espalda: '#10b981',
  piernas: '#f59e0b',
  hombros: '#8b5cf6',
  brazos: '#ec4899',
  core: '#06b6d4',
  gluteos: '#f43f5e',
  pantorrillas: '#84cc16'
};

export const MuscleGroupStats: React.FC<MuscleGroupStatsProps> = ({ sessions }) => {
  // Calcular estadísticas por grupo muscular
  const muscleStats = React.useMemo(() => {
    const stats = new Map<MuscleGroup, MuscleGroupData>();

    sessions.forEach(session => {
      if (!session.exercises || !Array.isArray(session.exercises)) return;
      session.exercises.forEach(ex => {
        // Buscar el ejercicio en la base de datos
        const exerciseTemplate = EXERCISE_DATABASE.find(
          e => e.id === ex.exerciseId || e.name === ex.exerciseName
        );

        if (exerciseTemplate) {
          const muscleGroup = exerciseTemplate.muscleGroup;

          if (!stats.has(muscleGroup)) {
            stats.set(muscleGroup, {
              muscleGroup,
              volume: 0,
              sets: 0,
              exercises: new Set()
            });
          }

          const data = stats.get(muscleGroup)!;

          // Calcular volumen (peso × reps)
          const volume = ex.actualReps.reduce((total, reps, idx) => {
            return total + (reps * (ex.actualWeight[idx] || 0));
          }, 0);

          data.volume += volume;
          data.sets += ex.actualReps.length;
          data.exercises.add(ex.exerciseName || exerciseTemplate.name);
        }
      });
    });

    // Convertir a array y ordenar por volumen
    return Array.from(stats.values()).sort((a, b) => b.volume - a.volume);
  }, [sessions]);

  const maxVolume = Math.max(...muscleStats.map(s => s.volume), 1);

  if (muscleStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📊 Volumen por Grupo Muscular</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No hay datos disponibles. Completa algunos entrenamientos para ver tus estadísticas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 Volumen por Grupo Muscular</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {muscleStats.map((stat) => {
            const percentage = (stat.volume / maxVolume) * 100;

            return (
              <div key={stat.muscleGroup} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <MuscleGroupIcon
                      muscleGroup={stat.muscleGroup}
                      size={24}
                    />
                    <span className="font-semibold capitalize text-gray-900 dark:text-gray-100">
                      {stat.muscleGroup}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                    <span>{stat.exercises.size} ejercicios</span>
                    <span>{stat.sets} series</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      {stat.volume.toLocaleString()} kg
                    </span>
                  </div>
                </div>
                <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: MUSCLE_GROUP_COLORS[stat.muscleGroup]
                    }}
                  >
                    {percentage > 20 && (
                      <span className="text-xs font-bold text-white">
                        {percentage.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumen */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {muscleStats.reduce((sum, s) => sum + s.volume, 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">kg Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {muscleStats.reduce((sum, s) => sum + s.sets, 0)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Series Totales</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {muscleStats.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Grupos Trabajados</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
