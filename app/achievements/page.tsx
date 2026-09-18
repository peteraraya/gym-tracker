"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import AchievementsGrid from "@/components/features/achievements/AchievementsGrid";
import { Button } from "@/components/ui/Button";
import { useGym } from "@/context/GymContext"; // ✨ Usar el contexto existente
import type { WorkoutSession } from "@/types";
import { calculateAchievements, calculateStreak } from "@/lib/achievements/achievements";
import { calculateTotalVolume, formatVolume } from "@/lib/utils/volumeCalculations";
import {
  Trophy,
  Flame,
  Calendar,
  Target,
  TrendingUp,
  Zap,
} from "@/components/icons/lucide";
import logger from "@/lib/logger";
import { PageHeader, PageLayout, PageContent } from "@/layouts";
import { CardSkeleton } from "@/components/ui/Skeleton";
import {
  EmptyStateCard,
  StatBadge,
  StatsGrid,
} from "@/components/shared";
import { AchievementDebugPanel } from "@/components/features/achievements/AchievementDebugPanel"; // ✨ Panel de debug

export default function AchievementsPage() {
  const router = useRouter();
  const { sessions, loading } = useGym(); // ✨ Usar sesiones del contexto

  // ✨ Calcular logros basándose en las sesiones del contexto
  const achievements = calculateAchievements(sessions);
  const streak = calculateStreak(sessions);
  const totalVolume = calculateTotalVolume(sessions);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage =
    totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  // ✨ Debug: Log para verificar datos
  useEffect(() => {
    logger.log("[Achievements] Sessions loaded:", sessions.length);
    logger.log("[Achievements] Total volume:", totalVolume);
    logger.log("[Achievements] Current streak:", streak.current);
    logger.log("[Achievements] Longest streak:", streak.longest);
    logger.log("[Achievements] Unlocked achievements:", unlockedCount);
  }, [sessions, totalVolume, streak, unlockedCount]);

  if (loading) {
    return (
      <ProtectedRoute>
        <PageLayout>
          <PageHeader
            title="Logros y Medallas"
            subtitle="Desbloquea logros por tu dedicación y progreso"
            icon={<Trophy className="w-7 h-7 text-white" />}
            gradient="from-indigo-600 to-violet-600"
          />
          <PageContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </PageContent>
        </PageLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PageLayout>
        <PageHeader
          title="Logros y Medallas"
          subtitle="Desbloquea logros por tu dedicación y progreso"
          icon={<Trophy className="w-7 h-7 text-white" />}
          gradient="from-indigo-600 to-violet-600"
          stats={
            <div className="text-center">
              <div className="text-4xl font-bold text-white">
                {completionPercentage}%
              </div>
              <p className="text-sm text-white/80 mt-1">
                {unlockedCount} de {totalCount} logros
              </p>
            </div>
          }
        />

        <PageContent>
          {/* Key Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-5 border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 rounded-lg shadow-md">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Entrenamientos
                  </p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {sessions.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-5 border-2 border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-600 rounded-lg shadow-md">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Volumen Total
                  </p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {formatVolume(totalVolume)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-linear-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-5 border-2 border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-600 rounded-lg shadow-md">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Racha Actual
                  </p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {streak.current} días
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-linear-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-5 border-2 border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600 rounded-lg shadow-md">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
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
            <div className="bg-linear-to-r from-blue-50 to-purple-50 dark:from-zinc-800 dark:to-zinc-800 rounded-xl p-4 text-center border border-blue-200 dark:border-zinc-700">
              <Target className="w-10 h-10 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                ¡Sigue Así! 💪
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                Tienes {totalCount - unlockedCount} logros más por desbloquear.
                La consistencia es la clave del éxito.
              </p>
            </div>
          )}

          {/* Perfect Score */}
          {completionPercentage === 100 && (
            <div className="bg-linear-to-r from-amber-50 to-yellow-50 dark:from-zinc-800 dark:to-zinc-800 rounded-xl p-4 text-center border border-amber-200 dark:border-zinc-700">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-amber-600 animate-bounce" />
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                🎉 ¡LEYENDA DEL FITNESS! 🎉
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Has desbloqueado todos los logros disponibles. ¡Eres imparable!
              </p>
            </div>
          )}

          {/* Empty State */}
          {sessions.length === 0 && (
            <EmptyStateCard
              icon={<Trophy className="w-16 h-16" />}
              title="Aún no hay logros"
              description="Comienza a entrenar para desbloquear medallas y logros increíbles"
              actionLabel="Comenzar Ahora"
              onAction={() => router.push("/routines")}
            />
          )}
        </PageContent>
      </PageLayout>

      {/* ✨ Panel de debug solo en desarrollo */}
      <AchievementDebugPanel />
    </ProtectedRoute>
  );
}
