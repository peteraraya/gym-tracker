'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/context/LocaleContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatsCard } from '@/components/StatsCard';
import AchievementBadge from '@/components/AchievementBadge';
import type { UserProfile } from '@/types';
import { EXERCISE_DATABASE } from '@/data/exercises';
import { calculateAchievements, getRecentAchievements, calculateStreak } from '@/lib/achievements';
import {
  calculateTotalVolume,
  calculateTotalSets,
  filterSessionsByMonth
} from '@/lib/utils/dateUtils';
import {
  Dumbbell,
  TrendingUp,
  Calendar,
  Award,
  Target,
  Flame,
  Activity,
  BarChart3,
  Play,
  Pencil,
  Copy,
  Trash2
} from '@/components/icons/lucide';
import { useGym } from '@/context/GymContext';
import { useValidSessions } from '@/hooks/useValidSessions';
import { LoadingState } from '@/components/LoadingState';
import { PageHeader, PageLayout, PageContent } from '@/layouts';

// Lazy loaded components
import {
  VolumeChart,
  ActivityHeatmap,
  MuscleGroupStats,
  PersonalRecords,
  TrainingFrequency,
  StrengthProgression,
  ProgressDashboard
} from './components.lazy';
import { LazyErrorBoundary } from '@/components/LazyErrorBoundary';

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const t = useTranslations('dashboard');

  const { routines } = useGym();
  const validSessions = useValidSessions();

  const handlePeriodChange = useCallback((newPeriod: 'week' | 'month') => {
    setPeriod(newPeriod);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const profileRes = await fetch('/api/profile');

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cálculos de estadísticas usando helpers para consistencia
  const stats = useMemo(() => {
    return {
      totalSessions: validSessions.length,

      totalVolume: calculateTotalVolume(validSessions),

      totalSets: validSessions.reduce((total, session) => {
        return total + calculateTotalSets(session.exercises);
      }, 0),

      currentStreak: calculateStreak(validSessions).current,

      thisMonthVolume: (() => {
        const now = new Date();
        const thisMonth = filterSessionsByMonth(validSessions, now.getMonth(), now.getFullYear());
        return calculateTotalVolume(thisMonth);
      })(),

      lastMonthVolume: (() => {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthSessions = filterSessionsByMonth(
          validSessions,
          lastMonth.getMonth(),
          lastMonth.getFullYear()
        );
        return calculateTotalVolume(lastMonthSessions);
      })(),

      favoriteExercise: (() => {
        const exerciseCounts: Record<string, number> = {};

        validSessions.forEach(session => {
          if (!session.exercises || !Array.isArray(session.exercises)) return;
          session.exercises.forEach(ex => {
            // Intentar usar el nombre guardado primero
            let exerciseName = ex.exerciseName;

            // Si no hay nombre guardado, buscar usando el exerciseId
            if (!exerciseName) {
              // Buscar en las rutinas
              for (const routine of routines) {
                const exercise = routine.exercises.find(e => e.id === ex.exerciseId);
                if (exercise) {
                  exerciseName = exercise.name;
                  break;
                }
              }

              // Si no se encontró en rutinas, buscar en EXERCISE_DATABASE
              if (!exerciseName) {
                const exerciseTemplate = EXERCISE_DATABASE.find(e => e.id === ex.exerciseId);
                if (exerciseTemplate) {
                  exerciseName = exerciseTemplate.name;
                }
              }
            }

            // Si aún no tenemos nombre, usar un fallback descriptivo
            if (!exerciseName) {
              exerciseName = t('unnamedExercise');
            }

            exerciseCounts[exerciseName] = (exerciseCounts[exerciseName] || 0) + 1;
          });
        });

        const entries = Object.entries(exerciseCounts);
        if (entries.length === 0) return t('notApplicable');

        return entries.sort((a, b) => b[1] - a[1])[0][0];
      })()
    };
  }, [validSessions, routines, t]);

  const volumeTrend = stats.lastMonthVolume > 0
    ? ((stats.thisMonthVolume - stats.lastMonthVolume) / stats.lastMonthVolume) * 100
    : 0;

  // console.log('Dashboard stats:', stats, 'Volume trend:', volumeTrend);

  // Cargar sesiones desde localStorage para combinarlas con las del servidor
  if (loading) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <LoadingState message={t('loadingStats')} />
      </div>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title={t('pageTitle')}
        subtitle={t('pageDescription')}
        icon={<BarChart3 className="w-7 h-7 text-white" />}
        gradient="from-slate-700 via-slate-800 to-slate-900"
        stats={profile && (
          <>
            <Target className="w-5 h-5 text-white" />
            <div className="text-sm">
              <p className="font-semibold text-white">
                {profile.fitnessGoal === 'muscle_gain' && t('fitnessGoals.muscle_gain')}
                {profile.fitnessGoal === 'strength' && t('fitnessGoals.strength')}
                {profile.fitnessGoal === 'weight_loss' && t('fitnessGoals.weight_loss')}
                {profile.fitnessGoal === 'endurance' && t('fitnessGoals.endurance')}
                {profile.fitnessGoal === 'general_fitness' && t('fitnessGoals.general_fitness')}
              </p>
              <p className="text-xs text-white/70 capitalize">
                {profile.fitnessLevel}
              </p>
            </div>
          </>
        )}
      />

      <PageContent>

      {/* Rutinas Disponibles - Sección destacada */}
      {routines.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Mis Rutinas
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/routines')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              Ver Todas →
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routines.slice(0, 2).map((routine) => {
              const totalExercises = routine.exercises.length;
              const totalSeries = routine.exercises.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0);
              
              return (
                <Card 
                  key={routine.id} 
                  className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-400 dark:hover:border-blue-500 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10"
                >
                  <CardContent className="p-5">
                    {/* Header con título */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {routine.name}
                        </h3>
                      </div>
                    </div>

                    {/* Descripción */}
                    {routine.description && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
                        {routine.description}
                      </p>
                    )}

                    {/* Stats rápidas */}
                    <div className="flex items-center gap-3 mb-4 text-sm flex-wrap">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <Dumbbell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-semibold text-blue-700 dark:text-blue-300">
                          {totalExercises}
                        </span>
                        <span className="text-blue-600 dark:text-blue-400 text-xs">
                          ejercicio{totalExercises !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800">
                        <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                          {totalSeries}
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 text-xs">
                          series
                        </span>
                      </div>
                    </div>

                    {/* Lista de ejercicios (primeros 3) */}
                    <div className="space-y-2 mb-4">
                      {routine.exercises.slice(0, 3).map((exercise, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center gap-2 text-sm bg-white/50 dark:bg-gray-700/30 rounded-lg p-2"
                        >
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 w-5">
                            {idx + 1}.
                          </span>
                          <span className="flex-1 text-zinc-700 dark:text-zinc-300 font-medium truncate">
                            {exercise.name}
                          </span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                            {exercise.sets?.length || 0} series
                          </span>
                        </div>
                      ))}
                      {routine.exercises.length > 3 && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                          +{routine.exercises.length - 3} más
                        </p>
                      )}
                    </div>

                    {/* Botón de acción */}
                    <Button
                      variant="gradient"
                      onClick={() => router.push(`/workout?routineId=${routine.id}`)}
                      className="w-full gap-2 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 mb-2"
                    >
                      <Play className="w-4 h-4" />
                      Iniciar Entrenamiento
                    </Button>

                    {/* Botones secundarios */}
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/routines`)}
                        className="flex-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/routines`)}
                        className="flex-1 text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-800"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Duplicar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {/* TODO: Implementar eliminar */}}
                        className="flex-1 text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
  

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('statsCards.totalSessions')}
          value={stats.totalSessions.toString()}
          icon={<Calendar className="w-6 h-6" />}
          gradient="from-slate-600 to-slate-700"
        />

        <StatsCard
          title={t('statsCards.totalVolume')}
          value={`${stats.totalVolume.toLocaleString()} ${t('units.kg')}`}
          icon={<Dumbbell className="w-6 h-6" />}
          gradient="from-blue-600 to-blue-700"
          trend={volumeTrend !== 0 ? {
            value: Math.abs(volumeTrend),
            isPositive: volumeTrend > 0
          } : undefined}
          subtitle={volumeTrend !== 0 ? t('statsCards.vsLastMonth') : undefined}
        />

        <StatsCard
          title={t('statsCards.currentStreak')}
          value={`${stats.currentStreak} ${t('statsCards.days')}`}
          icon={<Flame className="w-6 h-6" />}
          gradient="from-orange-600 to-orange-700"
        />

        <StatsCard
          title={t('statsCards.totalSets')}
          value={stats.totalSets.toString()}
          icon={<Activity className="w-6 h-6" />}
          gradient="from-emerald-600 to-emerald-700"
        />
      </div>

      {/* Volume Chart */}
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{t('charts.volumeChartTitle')}</h2>
        <div className="ml-auto flex gap-2">
          <Button
            variant={period === 'week' ? 'primary' : 'secondary'}
            onClick={() => handlePeriodChange('week')}
            className="text-sm"
          >
            {t('charts.week')}
          </Button>
          <Button
            variant={period === 'month' ? 'primary' : 'secondary'}
            onClick={() => handlePeriodChange('month')}
            className="text-sm"
          >
            {t('charts.month')}
          </Button>
        </div>
      </div>
      <LazyErrorBoundary>
        <VolumeChart sessions={validSessions} period={period} />
      </LazyErrorBoundary>

      {/* Activity Heatmap */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{t('charts.activityHeatmapTitle')}</h2>
        </div>
        <LazyErrorBoundary>
          <ActivityHeatmap sessions={validSessions} />
        </LazyErrorBoundary>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              {t('additionalStats.favoriteExercise')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {stats.favoriteExercise}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              {t('additionalStats.mostPerformedExercise')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              {t('additionalStats.thisMonthVolume')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {stats.thisMonthVolume.toLocaleString()} {t('units.kg')}
            </p>
            {stats.lastMonthVolume > 0 && (
              <div className={`flex items-center gap-1 mt-1 text-sm ${volumeTrend > 0 ? 'text-emerald-600' : volumeTrend < 0 ? 'text-red-600' : 'text-zinc-600'
                }`}>
                {volumeTrend > 0 ? '↗' : volumeTrend < 0 ? '↘' : '→'}
                <span>{Math.abs(volumeTrend).toFixed(1)}% {t('additionalStats.vsLastMonthShort')}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Advanced Statistics */}
      {validSessions.length > 0 && (
        <>
          {/* Logros Destacados */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {t('achievements.recentAchievementsTitle')}
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {t('achievements.recentAchievementsDescription')}
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => router.push('/achievements')}
                className="text-sm"
              >
                {t('achievements.viewAll')}
              </Button>
            </div>

            {/* Recent Achievements */}
            <div className="flex gap-4 overflow-x-auto pb-2">
              {(() => {
                const allAchievements = calculateAchievements(validSessions);
                const recentAchievements = getRecentAchievements(allAchievements);

                if (recentAchievements.length === 0) {
                  return (
                    <div className="text-center w-full py-8 text-zinc-600 dark:text-zinc-400">
                      <p className="text-sm">{t('achievements.noAchievements')}</p>
                    </div>
                  );
                }

                return (
                  <>
                    {recentAchievements.map(achievement => (
                      <AchievementBadge
                        key={achievement.id}
                        achievement={achievement}
                        size="lg"
                        showProgress={true}
                      />
                    ))}
                  </>
                );
              })()}
            </div>

            {/* Streak Info */}
            {(() => {
              const streak = calculateStreak(validSessions);
              return (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">{t('achievements.currentStreak')}</p>
                      <div className="flex items-center justify-center gap-2">
                        <Flame className="w-5 h-5 text-orange-600" />
                        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                          {streak.current} {t('statsCards.days')}
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">{t('achievements.longestStreak')}</p>
                      <div className="flex items-center justify-center gap-2">
                        <Award className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                          {streak.longest} {t('statsCards.days')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Row 1: Muscle Group Stats & Training Frequency */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LazyErrorBoundary>
              <MuscleGroupStats sessions={validSessions} />
            </LazyErrorBoundary>
            <LazyErrorBoundary>
              <TrainingFrequency sessions={validSessions} />
            </LazyErrorBoundary>
          </div>

          {/* Row 2: Personal Records & Strength Progression */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LazyErrorBoundary>
              <PersonalRecords sessions={validSessions} />
            </LazyErrorBoundary>
            <LazyErrorBoundary>
              <StrengthProgression sessions={validSessions} />
            </LazyErrorBoundary>
          </div>

          {/* Row 3: Progress Dashboard */}
          <LazyErrorBoundary>
            <ProgressDashboard sessions={validSessions} />
          </LazyErrorBoundary>
        </>
      )}

      {/* Quick Actions */}
      {validSessions.length === 0 && (
        <Card className="bg-linear-to-br from-blue-50 to-purple-50 dark:from-zinc-800 dark:to-zinc-800 border-blue-200 dark:border-zinc-700">
          <CardContent className="py-8 text-center">
            <Dumbbell className="w-16 h-16 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              {t('quickActions.startFitnessJourneyTitle')}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              {t('quickActions.startFitnessJourneyDescription')}
            </p>
            <Button
              variant="gradient"
              onClick={() => router.push('/routines')}
              className="gap-2"
            >
              <Award className="w-4 h-4" />
              {t('quickActions.viewRoutines')}
            </Button>
          </CardContent>
        </Card>
      )}
      </PageContent>
    </PageLayout>
  );
}
