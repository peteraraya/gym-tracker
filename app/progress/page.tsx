'use client';

import React, { useMemo } from 'react';
import { useGym } from '@/context/GymContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import ProtectedRoute from '@/components/ProtectedRoute';
import { EXERCISE_DATABASE, type MuscleGroup } from '@/data/exercises';

const MUSCLE_GROUPS: MuscleGroup[] = [
  'pecho',
  'espalda',
  'piernas',
  'hombros',
  'brazos',
  'core',
  'gluteos',
  'pantorrillas'
];

const MUSCLE_COLORS: Record<MuscleGroup, string> = {
  pecho: '#ef4444',      // red
  espalda: '#3b82f6',    // blue
  piernas: '#10b981',    // green
  gluteos: '#ec4899',    // pink
  hombros: '#8b5cf6',    // purple
  brazos: '#f97316',     // orange
  core: '#eab308',       // yellow
  pantorrillas: '#14b8a6' // teal
};

const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  pecho: 'Pecho',
  espalda: 'Espalda',
  piernas: 'Piernas',
  gluteos: 'Glúteos',
  hombros: 'Hombros',
  brazos: 'Brazos',
  core: 'Core',
  pantorrillas: 'Pantorrillas'
};

export default function ProgressPage() {
  const { sessions } = useGym();

  // Calcular volumen total por grupo muscular (series × reps × peso)
  const muscleGroupVolume = useMemo(() => {
    const volume: Record<MuscleGroup, number> = {
      pecho: 0,
      espalda: 0,
      piernas: 0,
      gluteos: 0,
      hombros: 0,
      brazos: 0,
      core: 0,
      pantorrillas: 0
    };

    const count: Record<MuscleGroup, number> = {
      pecho: 0,
      espalda: 0,
      piernas: 0,
      gluteos: 0,
      hombros: 0,
      brazos: 0,
      core: 0,
      pantorrillas: 0
    };

    sessions.forEach(session => {
      session.exercises.forEach(sessionExercise => {
        // Encontrar el ejercicio en la base de datos
        const exercise = EXERCISE_DATABASE.find(ex => ex.id === sessionExercise.exerciseId);
        if (!exercise) return;

        const muscleGroup = exercise.muscleGroup;
        
        // Calcular volumen: suma de (reps × peso) para cada serie
        sessionExercise.actualReps.forEach((reps, index) => {
          const weight = sessionExercise.actualWeight[index] || 0;
          volume[muscleGroup] += reps * weight;
        });

        count[muscleGroup] += sessionExercise.completedSets;
      });
    });

    return { volume, count };
  }, [sessions]);

  // Calcular el total para obtener porcentajes
  const totalVolume = useMemo(() => {
    return Object.values(muscleGroupVolume.volume).reduce((acc, val) => acc + val, 0);
  }, [muscleGroupVolume.volume]);

  const totalSets = useMemo(() => {
    return Object.values(muscleGroupVolume.count).reduce((acc, val) => acc + val, 0);
  }, [muscleGroupVolume.count]);

  // Calcular porcentajes
  const muscleGroupPercentages = useMemo(() => {
    const percentages: Record<MuscleGroup, number> = {} as Record<MuscleGroup, number>;
    MUSCLE_GROUPS.forEach(group => {
      percentages[group] = totalVolume > 0 
        ? (muscleGroupVolume.volume[group] / totalVolume) * 100 
        : 0;
    });
    return percentages;
  }, [muscleGroupVolume.volume, totalVolume]);

  // Ordenar grupos musculares por volumen
  const sortedMuscleGroups = useMemo(() => {
    return [...MUSCLE_GROUPS].sort((a, b) => 
      muscleGroupVolume.volume[b] - muscleGroupVolume.volume[a]
    );
  }, [muscleGroupVolume.volume]);

  const maxVolume = useMemo(() => {
    return Math.max(...Object.values(muscleGroupVolume.volume));
  }, [muscleGroupVolume.volume]);

  if (sessions.length === 0) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Progreso por Grupo Muscular
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Analiza tu volumen de entrenamiento por grupo muscular
              </p>
            </div>

            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No hay datos de progreso
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Completa algunas sesiones de entrenamiento para ver tu progreso aquí
              </p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Progreso por Grupo Muscular
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Analiza tu volumen de entrenamiento por grupo muscular
            </p>
          </div>

          {/* Estadísticas generales */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Sesiones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {sessions.length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Series</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                  {totalSets}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Volumen Total (kg)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                  {totalVolume.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfica de barras por grupo muscular */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Volumen por Grupo Muscular</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedMuscleGroups.map(group => {
                  const volume = muscleGroupVolume.volume[group];
                  const sets = muscleGroupVolume.count[group];
                  const percentage = muscleGroupPercentages[group];
                  const barWidth = maxVolume > 0 ? (volume / maxVolume) * 100 : 0;

                  if (volume === 0) return null;

                  return (
                    <div key={group}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: MUSCLE_COLORS[group] }}
                          />
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {MUSCLE_LABELS[group]}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {sets} series
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {volume.toLocaleString()} kg
                          </span>
                          <span className="text-gray-500 dark:text-gray-500">
                            ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 flex items-center justify-end px-3"
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor: MUSCLE_COLORS[group]
                          }}
                        >
                          {barWidth > 20 && (
                            <span className="text-white font-semibold text-sm">
                              {volume.toLocaleString()} kg
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Distribución porcentual */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución del Entrenamiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {sortedMuscleGroups.map(group => {
                  const volume = muscleGroupVolume.volume[group];
                  const sets = muscleGroupVolume.count[group];
                  const percentage = muscleGroupPercentages[group];

                  if (volume === 0) return null;

                  return (
                    <div
                      key={group}
                      className="p-4 rounded-lg border-2 transition-all hover:shadow-lg"
                      style={{ 
                        borderColor: MUSCLE_COLORS[group],
                        backgroundColor: `${MUSCLE_COLORS[group]}10`
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: MUSCLE_COLORS[group] }}
                        />
                        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                          {MUSCLE_LABELS[group]}
                        </span>
                      </div>
                      <div className="text-2xl font-bold mb-1" style={{ color: MUSCLE_COLORS[group] }}>
                        {percentage.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {sets} series • {volume.toLocaleString()} kg
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
