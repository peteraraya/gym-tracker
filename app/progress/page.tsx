"use client";

import { useMemo } from "react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import ProtectedRoute from "@/components/ProtectedRoute";
import { EXERCISE_DATABASE, type MuscleGroup } from "@/data/exercises";
import { useValidSessions } from "@/hooks/useValidSessions";
import { APP_CONFIG } from "@/config/app.config";
import { StatsGrid, StatCard } from "@/components/StatsGrid";
import { TrendingUp } from "@/components/icons/lucide";
import { useLocale, useTranslations } from "@/context/LocaleContext";
import { PageHeader, PageLayout, PageContent } from "@/layouts";
import { LoadingSpinner, EmptyStateCard } from "@/components/shared";

const MUSCLE_GROUPS = Object.keys(
  APP_CONFIG.muscleGroupColors,
) as MuscleGroup[];
const MUSCLE_COLORS = APP_CONFIG.muscleGroupColors;

export default function ProgressPage() {
  const validSessions = useValidSessions();
  const loading = false;
  const { t } = useLocale();
  const tMuscles = useTranslations("muscles");

  // Calcular volumen total por grupo muscular (series × reps × peso)
  const muscleGroupVolume = useMemo(() => {
    const volume: Record<MuscleGroup, number> = {
      pecho: 0,
      espalda: 0,
      piernas: 0,
      gluteos: 0,
      hombros: 0,
      biceps: 0,
      triceps: 0,
      antebrazos: 0,
      trapecio: 0,
      cuello: 0,
      core: 0,
      gemelos: 0,
      cardio: 0,
    };

    const count: Record<MuscleGroup, number> = {
      pecho: 0,
      espalda: 0,
      piernas: 0,
      gluteos: 0,
      hombros: 0,
      biceps: 0,
      triceps: 0,
      antebrazos: 0,
      trapecio: 0,
      cuello: 0,
      core: 0,
      gemelos: 0,
      cardio: 0,
    };

    validSessions.forEach((session) => {
      if (!session.exercises || !Array.isArray(session.exercises)) return;
      session.exercises.forEach((sessionExercise) => {
        // Buscar el ejercicio en la base de datos usando exerciseId o exerciseName
        let exercise = EXERCISE_DATABASE.find(
          (ex) => ex.id === sessionExercise.exerciseId,
        );

        // Si no se encuentra por ID, intentar buscar por nombre
        if (!exercise && sessionExercise.exerciseName) {
          exercise = EXERCISE_DATABASE.find(
            (ex) =>
              ex.name.toLowerCase() ===
              sessionExercise.exerciseName?.toLowerCase(),
          );
        }

        if (!exercise) {
          console.log(
            "Ejercicio no encontrado:",
            sessionExercise.exerciseId,
            sessionExercise.exerciseName,
          );
          return;
        }

        const muscleGroup = exercise.muscleGroup;

        // Validar que los arrays existan antes de iterar
        if (
          !sessionExercise.actualReps ||
          !Array.isArray(sessionExercise.actualReps)
        )
          return;
        if (
          !sessionExercise.actualWeight ||
          !Array.isArray(sessionExercise.actualWeight)
        )
          return;

        // Calcular volumen: suma de (reps × peso) para cada serie
        sessionExercise.actualReps.forEach((reps, index) => {
          const weight = sessionExercise.actualWeight[index] || 0;
          volume[muscleGroup] += reps * weight;
        });

        count[muscleGroup] += sessionExercise.actualReps.length;
      });
    });

    // console.log('Volumen por grupo muscular:', volume);
    // console.log('Series por grupo muscular:', count);

    return { volume, count };
  }, [validSessions]);

  // Calcular el total para obtener porcentajes
  const totalVolume = useMemo(() => {
    return Object.values(muscleGroupVolume.volume).reduce(
      (acc, val) => acc + val,
      0,
    );
  }, [muscleGroupVolume.volume]);

  const totalSets = useMemo(() => {
    return Object.values(muscleGroupVolume.count).reduce(
      (acc, val) => acc + val,
      0,
    );
  }, [muscleGroupVolume.count]);

  // Calcular porcentajes
  const muscleGroupPercentages = useMemo(() => {
    const percentages: Record<MuscleGroup, number> = {} as Record<
      MuscleGroup,
      number
    >;
    MUSCLE_GROUPS.forEach((group) => {
      percentages[group] =
        totalVolume > 0
          ? (muscleGroupVolume.volume[group] / totalVolume) * 100
          : 0;
    });
    return percentages;
  }, [muscleGroupVolume.volume, totalVolume]);

  // Ordenar grupos musculares por volumen
  const sortedMuscleGroups = useMemo(() => {
    return [...MUSCLE_GROUPS].sort(
      (a, b) => muscleGroupVolume.volume[b] - muscleGroupVolume.volume[a],
    );
  }, [muscleGroupVolume.volume]);

  const maxVolume = useMemo(() => {
    return Math.max(...Object.values(muscleGroupVolume.volume));
  }, [muscleGroupVolume.volume]);

  if (loading) {
    return (
      <ProtectedRoute>
        <PageLayout>
          <PageHeader
            title={t("progress.title")}
            subtitle={t("progress.subtitle")}
            icon={<TrendingUp className="w-7 h-7 text-white" />}
            gradient="from-orange-700 via-red-700 to-red-800"
          />
          <PageContent>
            <LoadingSpinner
              size="lg"
              message="Cargando tus sesiones y rutinas"
            />
          </PageContent>
        </PageLayout>
      </ProtectedRoute>
    );
  }

  if (validSessions.length === 0) {
    return (
      <ProtectedRoute>
        <PageLayout>
          <PageHeader
            title={t("progress.title")}
            subtitle={t("progress.subtitle")}
            icon={<TrendingUp className="w-7 h-7 text-white" />}
            gradient="from-orange-700 via-red-700 to-red-800"
          />
          <PageContent>
            <EmptyStateCard
              icon="📊"
              title={t("progress.noData")}
              description={t("progress.noDataDesc")}
            />
          </PageContent>
        </PageLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PageLayout>
        <PageHeader
          title={t("progress.title")}
          subtitle={t("progress.subtitle")}
          icon={<TrendingUp className="w-7 h-7 text-white" />}
          gradient="from-orange-700 via-red-700 to-red-800"
        />

        <PageContent>
          {/* Estadísticas generales */}
          <StatsGrid columns={3}>
            <StatCard
              title={t("progress.totalSessions")}
              value={validSessions.length}
              icon={<TrendingUp className="w-6 h-6" />}
              color="blue"
            />
            <StatCard
              title={t("progress.totalSets")}
              value={totalSets}
              icon={<TrendingUp className="w-6 h-6" />}
              color="green"
            />
            <StatCard
              title={t("progress.totalVolume")}
              value={totalVolume.toLocaleString()}
              icon={<TrendingUp className="w-6 h-6" />}
              color="purple"
            />
          </StatsGrid>

          {/* Gráfica de barras por grupo muscular */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Volumen por Grupo Muscular</CardTitle>
            </CardHeader>
            <CardContent>
              {totalVolume === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    No hay datos de volumen
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Completa sesiones con ejercicios que tengan peso registrado
                    para ver el análisis por grupo muscular
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedMuscleGroups.map((group) => {
                    const volume = muscleGroupVolume.volume[group];
                    const sets = muscleGroupVolume.count[group];
                    const percentage = muscleGroupPercentages[group];
                    const barWidth =
                      maxVolume > 0 ? (volume / maxVolume) * 100 : 0;

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
                              {tMuscles(group)}
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
                              backgroundColor: MUSCLE_COLORS[group],
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
              )}
            </CardContent>
          </Card>

          {/* Distribución porcentual */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución del Entrenamiento</CardTitle>
            </CardHeader>
            <CardContent>
              {totalVolume === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📈</div>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    No hay datos de distribución
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Completa sesiones con ejercicios que tengan peso registrado
                    para ver la distribución
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {sortedMuscleGroups.map((group) => {
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
                          backgroundColor: `${MUSCLE_COLORS[group]}10`,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: MUSCLE_COLORS[group] }}
                          />
                          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                            {tMuscles(group)}
                          </span>
                        </div>
                        <div
                          className="text-2xl font-bold mb-1"
                          style={{ color: MUSCLE_COLORS[group] }}
                        >
                          {percentage.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {sets} series • {volume.toLocaleString()} kg
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </PageContent>
      </PageLayout>
    </ProtectedRoute>
  );
}
