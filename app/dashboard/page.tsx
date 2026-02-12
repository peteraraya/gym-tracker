'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/context/LocaleContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatsCard } from '@/components/StatsCard';
import { ActivityHeatmap } from '@/components/ActivityHeatmap';
import { VolumeChart } from '@/components/VolumeChart';
import { MuscleGroupStats } from '@/components/MuscleGroupStats';
import { PersonalRecords } from '@/components/PersonalRecords';
import { TrainingFrequency } from '@/components/TrainingFrequency';
import { StrengthProgression } from '@/components/StrengthProgression';
import { ProgressDashboard } from '@/components/ProgressDashboard';
import AchievementBadge from '@/components/AchievementBadge';
import type { WorkoutSession, UserProfile, Routine } from '@/types';
import { EXERCISE_DATABASE } from '@/data/exercises';
import { calculateAchievements, getRecentAchievements, calculateStreak } from '@/lib/achievements';
import { 
  Dumbbell, 
  TrendingUp, 
  Calendar, 
  Award,
  Target,
  Flame,
  Activity,
  BarChart3
} from 'lucide-react';
import { useGym } from '@/context/GymContext';

export default function DashboardPage() {
  const router = useRouter();
  // const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  // const [routines, setRoutines] = useState<Routine[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const t = useTranslations('dashboard');

  const { sessions, routines } = useGym();
  
    // Excluir sesiones cuya `routineId` ya no exista en las rutinas guardadas
    const validSessions = useMemo(() => {
      const routineIds = new Set((routines || []).map(r => r.id));
      return (sessions || []).filter(s => {
        // Mantener sesiones sin `routineId` (ejercicios libres), pero excluir
        // aquellas que referencian una rutina eliminada
        if (!s.routineId) return true;
        return routineIds.has(s.routineId);
      });
    }, [sessions, routines]);
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sessionsRes, profileRes] = await Promise.all([
        fetch('/api/sessions'),
        fetch('/api/profile')
      ]);

      if (sessionsRes.ok) {
        const data = await sessionsRes.json();
        // setSessions(data);
      }

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }

      // Cargar rutinas desde localStorage
      const savedRoutines = localStorage.getItem('gym-routines');
      if (savedRoutines) {
        // setRoutines(JSON.parse(savedRoutines));
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cálculos de estadísticas
  const stats = {
    totalSessions: validSessions.length,
    
    totalVolume: validSessions.reduce((total, session) => {
      if (!session.exercises || !Array.isArray(session.exercises)) return total;
      return total + session.exercises.reduce((exTotal, ex) => {
        if (!ex.actualReps || !Array.isArray(ex.actualReps)) return exTotal;
        return exTotal + ex.actualReps.reduce((repTotal, reps, idx) => {
          return repTotal + (reps * (ex.actualWeight?.[idx] || 0));
        }, 0);
      }, 0);
    }, 0),

    totalSets: validSessions.reduce((total, session) => {
      if (!session.exercises || !Array.isArray(session.exercises)) return total;
      return total + session.exercises.reduce((exTotal, ex) => {
        return exTotal + (ex.actualReps?.length || 0);
      }, 0);
    }, 0),

    currentStreak: (() => {
      if (validSessions.length === 0) return 0;
      
      const sortedDates = validSessions
        .map(s => new Date(s.date).setHours(0, 0, 0, 0))
        .sort((a, b) => b - a);

      const uniqueDates = [...new Set(sortedDates)];
      const today = new Date().setHours(0, 0, 0, 0);
      
      if (uniqueDates[0] !== today && uniqueDates[0] !== today - 86400000) {
        return 0;
      }

      let streak = 0;
      let currentDate = today;

      for (const date of uniqueDates) {
        if (date === currentDate || date === currentDate - 86400000) {
          streak++;
          currentDate = date - 86400000;
        } else {
          break;
        }
      }

      return streak;
    })(),

    thisMonthVolume: (() => {
      const now = new Date();
      const thisMonth = validSessions.filter(s => {
        const date = new Date(s.date);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      });

      return thisMonth.reduce((total, session) => {
        if (!session.exercises || !Array.isArray(session.exercises)) return total;
        return total + session.exercises.reduce((exTotal, ex) => {
          if (!ex.actualReps || !Array.isArray(ex.actualReps)) return exTotal;
          return exTotal + ex.actualReps.reduce((repTotal, reps, idx) => {
            return repTotal + (reps * (ex.actualWeight?.[idx] || 0));
          }, 0);
        }, 0);
      }, 0);
    })(),

    lastMonthVolume: (() => {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthSessions = validSessions.filter(s => {
        const date = new Date(s.date);
        return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
      });

      return lastMonthSessions.reduce((total, session) => {
        if (!session.exercises || !Array.isArray(session.exercises)) return total;
        return total + session.exercises.reduce((exTotal, ex) => {
          if (!ex.actualReps || !Array.isArray(ex.actualReps)) return exTotal;
          return exTotal + ex.actualReps.reduce((repTotal, reps, idx) => {
            return repTotal + (reps * (ex.actualWeight?.[idx] || 0));
          }, 0);
        }, 0);
      }, 0);
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

  const volumeTrend = stats.lastMonthVolume > 0 
    ? ((stats.thisMonthVolume - stats.lastMonthVolume) / stats.lastMonthVolume) * 100
    : 0;

    console.log('Dashboard stats:', stats, 'Volume trend:', volumeTrend);

  // Cargar sesiones desde localStorage para combinarlas con las del servidor
  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-zinc-500 dark:text-zinc-400">{t('loadingStats')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {t('pageTitle')}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            {t('pageDescription')}
          </p>
        </div>
        {profile && (
          <div className="hidden md:flex items-center gap-3 bg-linear-to-r from-blue-50 to-purple-50 dark:from-zinc-800 dark:to-zinc-800 px-4 py-2 rounded-xl border border-blue-100 dark:border-zinc-700">
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
        )}
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('statsCards.totalSessions')}
          value={stats.totalSessions.toString()}
          icon={<Calendar className="w-6 h-6" />}
          gradient="from-blue-500 to-blue-600"
        />
        
        <StatsCard
          title={t('statsCards.totalVolume')}
          value={`${stats.totalVolume.toLocaleString()} ${t('units.kg')}`}
          icon={<Dumbbell className="w-6 h-6" />}
          gradient="from-purple-500 to-purple-600"
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
          gradient="from-orange-500 to-red-600"
        />
        
        <StatsCard
          title={t('statsCards.totalSets')}
          value={stats.totalSets.toString()}
          icon={<Activity className="w-6 h-6" />}
          gradient="from-emerald-500 to-emerald-600"
        />
      </div>

      {/* Volume Chart */}
      <div className="flex items-center gap-2 mb-4">
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
      <VolumeChart sessions={sessions} period={period} />

      {/* Activity Heatmap */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{t('charts.activityHeatmapTitle')}</h2>
        </div>
        <ActivityHeatmap sessions={sessions} />
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
                {volumeTrend > 0 ? '↗' : volumeTrend < 0 ? '↘' : '→'}
                <span>{Math.abs(volumeTrend).toFixed(1)}% {t('additionalStats.vsLastMonthShort')}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Advanced Statistics */}
      {sessions.length > 0 && (
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
                const allAchievements = calculateAchievements(sessions);
                const recentAchievements = getRecentAchievements(allAchievements);
                const streak = calculateStreak(sessions);

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
              const streak = calculateStreak(sessions);
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
            <MuscleGroupStats sessions={sessions} />
            <TrainingFrequency sessions={sessions} />
          </div>

          {/* Row 2: Personal Records & Strength Progression */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PersonalRecords sessions={sessions} />
            <StrengthProgression sessions={sessions} />
          </div>

          {/* Row 3: Progress Dashboard */}
          <ProgressDashboard sessions={sessions} />
        </>
      )}

      {/* Quick Actions */}
      {sessions.length === 0 && (
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
