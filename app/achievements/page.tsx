'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import AchievementsGrid from '@/components/AchievementsGrid';
import { Button } from '@/components/ui/Button';
import type { WorkoutSession } from '@/types';
import { calculateAchievements, calculateStreak, calculateTotalVolume } from '@/lib/achievements';
import { 
  Award, 
  ArrowLeft, 
  Trophy, 
  Flame, 
  Calendar, 
  Target,
  TrendingUp,
  Zap
} from 'lucide-react';

export default function AchievementsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const achievements = calculateAchievements(sessions);
  const streak = calculateStreak(sessions);
  const totalVolume = calculateTotalVolume(sessions);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = totalCount > 0 
    ? Math.round((unlockedCount / totalCount) * 100)
    : 0;

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Award className="w-16 h-16 mx-auto mb-4 text-blue-600 dark:text-blue-400 animate-pulse" />
            <p className="text-zinc-600 dark:text-zinc-400">Cargando logros...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
              <Trophy className="w-8 h-8 text-amber-600" />
              Logros y Medallas
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              Desbloquea logros por tu dedicación y progreso
            </p>
          </div>

          {/* Overall Stats */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-zinc-800 dark:to-zinc-800 rounded-xl p-4 border border-amber-200 dark:border-zinc-700">
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">
                {completionPercentage}%
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                {unlockedCount} de {totalCount} logros
              </p>
            </div>
          </div>
        </div>

        {/* Key Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Entrenamientos
                </p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {sessions.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Volumen Total
                </p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {(totalVolume / 1000).toFixed(0)}t
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-600 rounded-lg">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Racha Actual
                </p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {streak.current} días
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Mejor Racha
                </p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {streak.longest} días
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <AchievementsGrid achievements={achievements} />

        {/* Motivational Footer */}
        {sessions.length > 0 && completionPercentage < 100 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-zinc-800 dark:to-zinc-800 rounded-xl p-8 text-center border border-blue-200 dark:border-zinc-700">
            <Target className="w-12 h-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              ¡Sigue Así! 💪
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Tienes {totalCount - unlockedCount} logros más por desbloquear. 
              La consistencia es la clave del éxito.
            </p>
          </div>
        )}

        {/* Perfect Score */}
        {completionPercentage === 100 && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-zinc-800 dark:to-zinc-800 rounded-xl p-8 text-center border border-amber-200 dark:border-zinc-700">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-amber-600 animate-bounce" />
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              🎉 ¡LEYENDA DEL FITNESS! 🎉
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">
              Has desbloqueado todos los logros disponibles. ¡Eres imparable!
            </p>
          </div>
        )}

        {/* Empty State */}
        {sessions.length === 0 && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-12 text-center border border-zinc-200 dark:border-zinc-800">
            <Award className="w-16 h-16 mx-auto mb-4 text-zinc-400 dark:text-zinc-600" />
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Aún no hay logros
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Comienza a entrenar para desbloquear medallas y logros increíbles
            </p>
            <Button
              variant="gradient"
              onClick={() => router.push('/routines')}
              className="gap-2"
            >
              <Trophy className="w-4 h-4" />
              Comenzar Ahora
            </Button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
