'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function DashboardPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month'>('week');

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
        setSessions(data);
      }

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }

      // Cargar rutinas desde localStorage
      const savedRoutines = localStorage.getItem('gym-routines');
      if (savedRoutines) {
        setRoutines(JSON.parse(savedRoutines));
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cálculos de estadísticas
  const stats = {
    totalSessions: sessions.length,
    
    totalVolume: sessions.reduce((total, session) => {
      return total + session.exercises.reduce((exTotal, ex) => {
        return exTotal + ex.actualReps.reduce((repTotal, reps, idx) => {
          return repTotal + (reps * (ex.actualWeight[idx] || 0));
        }, 0);
      }, 0);
    }, 0),

    totalSets: sessions.reduce((total, session) => {
      return total + session.exercises.reduce((exTotal, ex) => {
        return exTotal + ex.actualReps.length;
      }, 0);
    }, 0),

    currentStreak: (() => {
      if (sessions.length === 0) return 0;
      
      const sortedDates = sessions
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
      const thisMonth = sessions.filter(s => {
        const date = new Date(s.date);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      });

      return thisMonth.reduce((total, session) => {
        return total + session.exercises.reduce((exTotal, ex) => {
          return exTotal + ex.actualReps.reduce((repTotal, reps, idx) => {
            return repTotal + (reps * (ex.actualWeight[idx] || 0));
          }, 0);
        }, 0);
      }, 0);
    })(),

    lastMonthVolume: (() => {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthSessions = sessions.filter(s => {
        const date = new Date(s.date);
        return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
      });

      return lastMonthSessions.reduce((total, session) => {
        return total + session.exercises.reduce((exTotal, ex) => {
          return exTotal + ex.actualReps.reduce((repTotal, reps, idx) => {
            return repTotal + (reps * (ex.actualWeight[idx] || 0));
          }, 0);
        }, 0);
      }, 0);
    })(),

    favoriteExercise: (() => {
      const exerciseCounts: Record<string, number> = {};
      
      sessions.forEach(session => {
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
            exerciseName = 'Ejercicio sin nombre';
          }
          
          exerciseCounts[exerciseName] = (exerciseCounts[exerciseName] || 0) + 1;
        });
      });

      const entries = Object.entries(exerciseCounts);
      if (entries.length === 0) return 'N/A';
      
      return entries.sort((a, b) => b[1] - a[1])[0][0];
    })()
  };

  const volumeTrend = stats.lastMonthVolume > 0 
    ? ((stats.thisMonthVolume - stats.lastMonthVolume) / stats.lastMonthVolume) * 100
    : 0;

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-zinc-500 dark:text-zinc-400">Cargando estadísticas...</div>
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
            Panel de Control
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Resumen de tu progreso y estadísticas
          </p>
        </div>
        {profile && (
          <div className="hidden md:flex items-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-zinc-800 dark:to-zinc-800 px-4 py-2 rounded-xl border border-blue-100 dark:border-zinc-700">
            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div className="text-sm">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                {profile.fitnessGoal === 'muscle_gain' && 'Ganancia Muscular'}
                {profile.fitnessGoal === 'strength' && 'Fuerza'}
                {profile.fitnessGoal === 'weight_loss' && 'Pérdida de Peso'}
                {profile.fitnessGoal === 'endurance' && 'Resistencia'}
                {profile.fitnessGoal === 'general_fitness' && 'Fitness General'}
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
          title="Total de Sesiones"
          value={stats.totalSessions.toString()}
          icon={<Calendar className="w-6 h-6" />}
          gradient="from-blue-500 to-blue-600"
        />
        
        <StatsCard
          title="Volumen Total"
          value={`${stats.totalVolume.toLocaleString()} kg`}
          icon={<Dumbbell className="w-6 h-6" />}
          gradient="from-purple-500 to-purple-600"
          trend={volumeTrend !== 0 ? {
            value: Math.abs(volumeTrend),
            isPositive: volumeTrend > 0
          } : undefined}
          subtitle={volumeTrend !== 0 ? "vs mes anterior" : undefined}
        />
        
        <StatsCard
          title="Racha Actual"
          value={`${stats.currentStreak} días`}
          icon={<Flame className="w-6 h-6" />}
          gradient="from-orange-500 to-red-600"
        />
        
        <StatsCard
          title="Sets Completados"
          value={stats.totalSets.toString()}
          icon={<Activity className="w-6 h-6" />}
          gradient="from-emerald-500 to-emerald-600"
        />
      </div>

      {/* Volume Chart */}
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Gráfica de Volumen</h2>
        <div className="ml-auto flex gap-2">
          <Button
            variant={period === 'week' ? 'primary' : 'secondary'}
            onClick={() => setPeriod('week')}
            className="text-sm"
          >
            Semana
          </Button>
          <Button
            variant={period === 'month' ? 'primary' : 'secondary'}
            onClick={() => setPeriod('month')}
            className="text-sm"
          >
            Mes
          </Button>
        </div>
      </div>
      <VolumeChart sessions={sessions} period={period} />

      {/* Activity Heatmap */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Actividad de Entrenamiento</h2>
        </div>
        <ActivityHeatmap sessions={sessions} />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Ejercicio Favorito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {stats.favoriteExercise}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              El ejercicio que más has realizado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Volumen Este Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {stats.thisMonthVolume.toLocaleString()} kg
            </p>
            {stats.lastMonthVolume > 0 && (
              <div className={`flex items-center gap-1 mt-1 text-sm ${
                volumeTrend > 0 ? 'text-emerald-600' : volumeTrend < 0 ? 'text-red-600' : 'text-zinc-600'
              }`}>
                {volumeTrend > 0 ? '↗' : volumeTrend < 0 ? '↘' : '→'}
                <span>{Math.abs(volumeTrend).toFixed(1)}% vs mes anterior</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Advanced Statistics */}
      {sessions.length > 0 && (
        <>
          {/* Logros Destacados */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-zinc-800 dark:to-zinc-800 rounded-xl p-6 border border-amber-200 dark:border-zinc-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    Logros Recientes
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Tus últimos desbloqueos
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => router.push('/achievements')}
                className="text-sm"
              >
                Ver Todos
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
                      <p className="text-sm">¡Sigue entrenando para desbloquear logros!</p>
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
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Racha Actual</p>
                      <div className="flex items-center justify-center gap-2">
                        <Flame className="w-5 h-5 text-orange-500" />
                        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                          {streak.current} días
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Racha Máxima</p>
                      <div className="flex items-center justify-center gap-2">
                        <Award className="w-5 h-5 text-amber-600" />
                        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                          {streak.longest} días
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
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-zinc-800 dark:to-zinc-800 border-blue-200 dark:border-zinc-700">
          <CardContent className="py-8 text-center">
            <Dumbbell className="w-16 h-16 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              ¡Comienza tu viaje fitness!
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Aún no has registrado ninguna sesión de entrenamiento. Comienza hoy mismo.
            </p>
            <Button
              variant="gradient"
              onClick={() => router.push('/routines')}
              className="gap-2"
            >
              <Award className="w-4 h-4" />
              Ver Rutinas
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
