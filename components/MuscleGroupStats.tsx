'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import type { WorkoutSession } from '@/types';
import { EXERCISE_DATABASE, MuscleGroup } from '@/data/exercises';
import { MuscleGroupIcon } from '@/components/icons/MuscleGroupIcons';
import { useTranslations } from '@/context/LocaleContext';
import { APP_CONFIG } from '@/config/app.config';

interface MuscleGroupStatsProps {
  sessions: WorkoutSession[];
}

interface MuscleGroupData {
  muscleGroup: MuscleGroup;
  volume: number;
  sets: number;
  exercises: Set<string>;
}



export const MuscleGroupStats: React.FC<MuscleGroupStatsProps> = ({ sessions }) => {
  const t = useTranslations('dashboard.muscleGroupStats');
  const tMuscles = useTranslations('muscleGroups');
  const tDashboard = useTranslations('dashboard');
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
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
                      {APP_CONFIG.muscleGroupLabels[stat.muscleGroup] || stat.muscleGroup}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                    <span>{stat.exercises.size} {t('exercises')}</span>
                    <span>{stat.sets} {t('sets')}</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">
                      {stat.volume.toLocaleString()} {tDashboard('units.kg')}
                    </span>
                  </div>
                </div>
                <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: APP_CONFIG.muscleGroupColors[stat.muscleGroup]
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
              <div className="text-xs text-gray-600 dark:text-gray-400">{t('kgTotal')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {muscleStats.reduce((sum, s) => sum + s.sets, 0)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{t('totalSets')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {muscleStats.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{t('groupsWorked')}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
