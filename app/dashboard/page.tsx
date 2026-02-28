'use client';

import { useEffect, useMemo, useState } from 'react';
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
  BarChart3
} from '@/components/icons/lucide';
import { useGym } from '@/context/GymContext';
import { useValidSessions } from '@/hooks/useValidSessions';
import { PageLayout } from '@/components/PageLayout';
import { StatsGrid, StatCard } from '@/components/StatsGrid';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';

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

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const t = useTranslations('dashboard');

  const { routines } = useGym();
  const validSessions = useValidSessions();
  
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

  if (loading) {
    return <LoadingState message={t('loadingStats')} />;
  }

  if (validSessions.length === 0) {
    return (
      <PageLayout
        title={t('pageTitle')}
        description={t('pageDescription')}
        icon={<BarChart3 className="w-8 h-8 text-blue-500" />}
      >
        <EmptyState
          icon="📊"
          title="Sin datos de entrenamiento"
          description="Completa tu primer entrenamiento para ver estadísticas"
          action={
            <Button onClick={() => router.push('/routines')}>
              Ir a Rutinas
            </Button>
          }
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={t('pageTitle')}
      description={t('pageDescription')}
      icon={<BarChart3 className="w-8 h-8 text-blue-500" />}
      actions={
        profile && (
          <div className="hidden md:flex items-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-zinc-800 dark:to-zinc-800 px-4 py-2 rounded-xl border border-blue-100 dark:border-zinc-700">
            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div className="text-sm">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                {profile.fitnessGoal === 'muscle_gain' && t('fitnessGoals.muscle_gain')}
                {profile.fitnessGoal === 'strength' && t('fitnessGoals.strength')}
                {profile.fitnessGoal === 'weight_loss' && t('fitnessGoals.weight_loss')}
                {profile.fitnessGoal === 'endurance' && t('fitnessGoals.endurance')}
                {profile.fitnessGoal === 'general_fitness' && t('fitnessGoals.general_fitness')}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 capitalize">
                {profile.fitnessLevel}
              </p>
            </div>
          </div>
        )
      }
    >
      {/* Stats Cards Grid */}
      <StatsGrid columns={4}>
        <StatCard
          title={t('statsCards.totalSessions')}
          value={stats.totalSessions}
          icon={<Calendar className="w-6 h-6" />}
          color="blue"
        />
        
        <StatCard
          title={t('statsCards.totalVolume')}
          value={`${stats.totalVolume.toLocaleString()} kg`}
          icon={<Dumbbell className="w-6 h-6" />}
          color="purple"
          trend={volumeTrend !== 0 ? Math.round(volumeTrend) : undefined}
        />
        
        <StatCard
          title={t('statsCards.currentStreak')}
          value={`${stats.currentStreak} días`}
          icon={<Flame className="w-6 h-6" />}
          color="orange"
        />
        
        <StatCard
          title={t('statsCards.totalSets')}
          value={stats.totalSets}
          icon={<Activity className="w-6 h-6" />}
          color="green"
        />
      </StatsGrid>

      {/* Volume Chart */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{t('charts.volumeChartTitle')}</h2>
          <div className="ml-auto flex gap-2">
            <Button
              variant={period === 'week' ? 'primary' : 'secondary'}
              onClick={() => setPeriod('week')}
              className="text-sm"
            >
              {t('charts.week')}
            </Button>
            <Button
              variant={period === 'month' ? 'primary' : 'secondary'}
              onClick={() => setPeriod('month')}
              className="text-sm"
            >
              {t('charts.month')}
            </Button>
          </div>
        </div>
        <VolumeChart sessions={validSessions} period={period} />
      </div>

      {/* Activity Heatmap */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{t('charts.activityHeatmapTitle')}</h2>
        </div>
        <ActivityHeatmap sessions={validSessions} />
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
              <div className={`flex items-center gap-1 mt-1 text-sm ${
                volumeTrend > 0 ? 'text-emerald-600' : volumeTrend < 0 ? 'text-red-600' : 'text-zinc-600'
              }`}>
                {volumeTrend > 0 ? '📈' : volumeTrend < 0 ? '📉' : '➡️'} {Math.abs(volumeTrend).toFixed(1)}% vs mes anterior
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Achievements Section */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-zinc-800 dark:to-zinc-800 border-amber-200 dark:border-zinc-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            {t('achievements.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Recent Achievements */}
            <div>
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                {t('achievements.recentAchievements')}
              </h4>
              <div className="flex flex-wrap gap-3">
                {(() => {
                  const recentAchievements = getRecentAchievements(validSessions, 3);
                  if (recentAchievements.length === 0) {
                    return (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {t('achievements.noAchievementsYet')}
                      </p>
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
                  <div className="mt-6 pt-6 border-t border-amber-200 dark:border-zinc-700">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">{t('achievements.currentStreak')}</p>
                        <div className="flex items-center justify-center gap-2">
                          <Flame className="w-5 h-5 text-orange-500" />
                          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                            {streak.current} {t('statsCards.days')}
                          </p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">{t('achievements.longestStreak')}</p>
                        <div className="flex items-center justify-center gap-2">
                          <Award className="w-5 h-5 text-amber-600" />
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
          </div>
        </CardContent>
      </Card>

      {/* Row 1: Muscle Group Stats & Training Frequency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MuscleGroupStats sessions={validSessions} />
        <TrainingFrequency sessions={validSessions} />
      </div>

      {/* Row 2: Personal Records & Strength Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PersonalRecords sessions={validSessions} />
        <StrengthProgression sessions={validSessions} />
      </div>

      {/* Row 3: Progress Dashboard */}
      <ProgressDashboard sessions={validSessions} />
    </PageLayout>
  );
}
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
          <div className="bg-linear-to-r from-amber-50 to-orange-50 dark:from-zinc-800 dark:to-zinc-800 rounded-xl p-6 border border-amber-200 dark:border-zinc-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
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
            <div className="flex gap-6 overflow-x-auto pb-2">
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
                <div className="mt-6 pt-6 border-t border-amber-200 dark:border-zinc-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">{t('achievements.currentStreak')}</p>
                      <div className="flex items-center justify-center gap-2">
                        <Flame className="w-5 h-5 text-orange-500" />
                        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                          {streak.current} {t('statsCards.days')}
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">{t('achievements.longestStreak')}</p>
                      <div className="flex items-center justify-center gap-2">
                        <Award className="w-5 h-5 text-amber-600" />
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
            <MuscleGroupStats sessions={validSessions} />
            <TrainingFrequency sessions={validSessions} />
          </div>

          {/* Row 2: Personal Records & Strength Progression */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PersonalRecords sessions={validSessions} />
            <StrengthProgression sessions={validSessions} />
          </div>

          {/* Row 3: Progress Dashboard */}
          <ProgressDashboard sessions={validSessions} />
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
    </div>
  );
}
