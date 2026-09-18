"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/context/LocaleContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

import AchievementBadge from "@/components/features/achievements/AchievementBadge";
import type { UserProfile } from "@/types";
import { EXERCISE_DATABASE } from "@/data/exercises";
import {
  calculateAchievements,
  getRecentAchievements,
  calculateStreak,
} from "@/lib/achievements/achievements";
import {
  calculateTotalVolume,
  calculateTotalSets,
  filterSessionsByMonth,
} from "@/lib/utils/dateUtils";
import {
  Dumbbell,
  TrendingUp,
  Calendar,
  Award,
  Target,
  Flame,
  Activity,
  BarChart3,
} from "@/components/icons/lucide";
import { useGym } from "@/context/GymContext";
import { useValidSessions } from "@/hooks/useValidSessions";
import { PageHeader, PageLayout, PageContent } from "@/layouts";
import { StatsGrid, EmptyStateCard } from "@/components/shared";
import { StatCard } from "@/components/shared/StatsGrid";
import { motion } from "framer-motion";

// Lazy loaded components
import {
  VolumeChart,
  ActivityHeatmap,
  MuscleGroupStats,
  PersonalRecords,
  TrainingFrequency,
  StrengthProgression,
  ProgressDashboard,
} from "./components.lazy";
import { LazyErrorBoundary } from "@/components/shared/LazyErrorBoundary";
import logger from "@/lib/logger";

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4 mt-4">
      <span className="text-zinc-600 dark:text-zinc-400">{icon}</span>
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{title}</h2>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "month">("week");
  const t = useTranslations("dashboard");

  const { routines } = useGym();
  const validSessions = useValidSessions();
  const { loading: sessionsLoading } = useGym();
  const exerciseNameById = useMemo(
    () =>
      new Map(
        EXERCISE_DATABASE.map((exercise) => [exercise.id, exercise.name]),
      ),
    [],
  );
  const routineExerciseNameById = useMemo(() => {
    const map = new Map<string, string>();
    routines.forEach((routine) => {
      routine.exercises.forEach((exercise) => {
        if (!map.has(exercise.id)) {
          map.set(exercise.id, exercise.name);
        }
      });
    });
    return map;
  }, [routines]);

  const handlePeriodChange = useCallback((newPeriod: "week" | "month") => {
    setPeriod(newPeriod);
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchProfileData = async () => {
      try {
        // Verificar modo de almacenamiento
        const { isLocalStorageMode: shouldUseLocalStorage } = await import(
          "@/lib/storageConfig"
        );

        if (shouldUseLocalStorage()) {
          // Modo LOCAL: Cargar desde localStorage
          if (typeof window !== "undefined") {
            const { getProfileLocally } = await import("@/lib/user/localProfile");
            const localProfile = getProfileLocally();

            if (mounted && localProfile) {
              logger.log("[Dashboard] ✅ Loaded from localStorage");
              setProfile(localProfile);
            }
          }
        } else {
          // Modo DATABASE: Cargar desde Supabase
          logger.log("[Dashboard] ☁️ Loading from Supabase...");
          const profileRes = await fetch("/api/profile");

          if (profileRes.ok) {
            const profileData = await profileRes.json();
            if (mounted) {
              logger.log("[Dashboard] ✅ Loaded from Supabase");
              setProfile(profileData);
            }
          }
        }
      } catch (error) {
        logger.error("[Dashboard] ❌ Error loading dashboard:", error);
      } finally {
        if (mounted) {
          setProfileLoading(false);
        }
      }
    };

    fetchProfileData();

    return () => {
      mounted = false;
    };
  }, []);

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
        const thisMonth = filterSessionsByMonth(
          validSessions,
          now.getMonth(),
          now.getFullYear(),
        );
        return calculateTotalVolume(thisMonth);
      })(),

      lastMonthVolume: (() => {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthSessions = filterSessionsByMonth(
          validSessions,
          lastMonth.getMonth(),
          lastMonth.getFullYear(),
        );
        return calculateTotalVolume(lastMonthSessions);
      })(),

      favoriteExercise: (() => {
        const exerciseCounts: Record<string, number> = {};

        validSessions.forEach((session) => {
          if (!session.exercises || !Array.isArray(session.exercises)) return;
          session.exercises.forEach((ex) => {
            // Intentar usar el nombre guardado primero
            let exerciseName = ex.exerciseName;

            if (!exerciseName) {
              exerciseName =
                routineExerciseNameById.get(ex.exerciseId) ||
                exerciseNameById.get(ex.exerciseId);
            }

            // Si aún no tenemos nombre, usar un fallback descriptivo
            if (!exerciseName) {
              exerciseName = t("unnamedExercise");
            }

            exerciseCounts[exerciseName] =
              (exerciseCounts[exerciseName] || 0) + 1;
          });
        });

        const entries = Object.entries(exerciseCounts);
        if (entries.length === 0) return t("notApplicable");

        return entries.sort((a, b) => b[1] - a[1])[0][0];
      })(),
    };
  }, [validSessions, routineExerciseNameById, exerciseNameById, t]);

  const volumeTrend =
    stats.lastMonthVolume > 0
      ? ((stats.thisMonthVolume - stats.lastMonthVolume) /
          stats.lastMonthVolume) *
        100
      : 0;

  // Memoizar logros y racha (costosos de calcular)
  const achievementsData = useMemo(() => {
    const all = calculateAchievements(validSessions);
    return {
      all,
      recent: getRecentAchievements(all),
    };
  }, [validSessions]);

  const streakData = useMemo(
    () => calculateStreak(validSessions),
    [validSessions],
  );

  // console.log('Dashboard stats:', stats, 'Volume trend:', volumeTrend);

  const volumeMilestoneSubtitle = useMemo(() => {
    if (stats.totalVolume > 15000) return "🐘 Equivalente a 3 elefantes adultos";
    if (stats.totalVolume > 5000) return "🐘 Equivalente a un elefante adulto";
    if (stats.totalVolume > 2000) return "🚙 Equivalente a un coche SUV";
    if (stats.totalVolume > 500) return "🎹 Equivalente a un piano de cola";
    return t("statsCards.totalVolumeSubtitle");
  }, [stats.totalVolume, t]);

  return (
    <PageLayout>
      <PageHeader
        title={t("pageTitle")}
        subtitle={t("pageDescription")}
        icon={<BarChart3 className="w-7 h-7 text-white" />}
        gradient="from-indigo-600 to-violet-600"
        stats={
          profileLoading ? (
            <div className="h-8 w-32 bg-white/20 rounded-lg animate-pulse" />
          ) : profile && (
            <>
              <Target className="w-5 h-5 text-white" />
              <div className="text-sm">
                <p className="font-semibold text-white">
                  {profile.fitnessGoal === "muscle_gain" &&
                    t("fitnessGoals.muscle_gain")}
                  {profile.fitnessGoal === "strength" &&
                    t("fitnessGoals.strength")}
                  {profile.fitnessGoal === "weight_loss" &&
                    t("fitnessGoals.weight_loss")}
                  {profile.fitnessGoal === "endurance" &&
                    t("fitnessGoals.endurance")}
                  {profile.fitnessGoal === "general_fitness" &&
                    t("fitnessGoals.general_fitness")}
                </p>
                <p className="text-xs text-white/70 capitalize">
                  {profile.fitnessLevel}
                </p>
              </div>
            </>
          )
        }
      />

      <PageContent>
        {/* Stats Cards Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
        <StatsGrid className="mb-6 p-4">
          <StatCard
            title={t("statsCards.totalSessions")}
            value={stats.totalSessions}
            icon={<Calendar className="w-5 h-5" />}
            subtitle={t("statsCards.totalSessionsSubtitle")}
            gradientClass="from-blue-500 to-indigo-500 dark:from-blue-900/30 dark:to-indigo-900/30"
            className="rounded-xl shadow-md"
            iconClassName="text-white"
            loading={sessionsLoading}
          />

          <StatCard
            title={t("statsCards.totalVolume")}
            value={`${stats.totalVolume.toLocaleString()} ${t("units.kg")}`}
            icon={<Dumbbell className="w-5 h-5" />}
            subtitle={volumeMilestoneSubtitle}
            trend={Math.round(volumeTrend)}
            gradientClass="from-purple-500 to-pink-500 dark:from-purple-900/30 dark:to-pink-900/30"
            className="rounded-xl shadow-md"
            iconClassName="text-white"
            loading={sessionsLoading}
          />

          <StatCard
            title={t("statsCards.currentStreak")}
            value={`${stats.currentStreak} ${t("statsCards.days")}`}
            icon={<Flame className="w-5 h-5" />}
            subtitle={t("statsCards.currentStreakSubtitle")}
            trend={{
              isPositive: stats.currentStreak > 0,
              value: stats.currentStreak,
            }}
            gradientClass="from-orange-400 to-orange-600 dark:from-orange-900/30 dark:to-orange-800/30"
            className="rounded-xl shadow-md"
            iconClassName="text-white"
            loading={sessionsLoading}
          />

          <StatCard
            title={t("statsCards.totalSets")}
            value={stats.totalSets}
            icon={<Activity className="w-5 h-5" />}
            subtitle={t("statsCards.totalSetsSubtitle")}
            gradientClass="from-emerald-400 to-emerald-600 dark:from-emerald-900/30 dark:to-emerald-800/30"
            className="rounded-xl shadow-md"
            iconClassName="text-white"
            loading={sessionsLoading}
          />
        </StatsGrid>
        </motion.div>

        {/* Volume Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {t("charts.volumeChartTitle")}
          </h2>
          <div className="ml-auto flex gap-2">            <Button
              variant={period === "week" ? "primary" : "secondary"}
              onClick={() => handlePeriodChange("week")}
              className="text-sm"
            >
              {t("charts.week")}
            </Button>
            <Button
              variant={period === "month" ? "primary" : "secondary"}
              onClick={() => handlePeriodChange("month")}
              className="text-sm"
            >
              {t("charts.month")}
            </Button>
          </div>
        </div>
        <LazyErrorBoundary>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-2">
            <VolumeChart sessions={validSessions} period={period} />
          </div>
        </LazyErrorBoundary>
        </motion.div>

        {/* Activity Heatmap */}
        <div>
          <SectionHeader icon={<TrendingUp className="w-5 h-5" />} title={t("charts.activityHeatmapTitle")} />
          <LazyErrorBoundary>
            <ActivityHeatmap sessions={validSessions} />
          </LazyErrorBoundary>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                {t("additionalStats.favoriteExercise")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {stats.favoriteExercise}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                {t("additionalStats.mostPerformedExercise")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 mt-4">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                {t("additionalStats.thisMonthVolume")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {stats.thisMonthVolume.toLocaleString()} {t("units.kg")}
              </p>
              {stats.lastMonthVolume > 0 && (
                <div
                  className={`flex items-center gap-1 mt-1 text-sm ${
                    volumeTrend > 0
                      ? "text-emerald-600"
                      : volumeTrend < 0
                        ? "text-red-600"
                        : "text-zinc-600"
                  }`}
                >
                  {volumeTrend > 0 ? "↗" : volumeTrend < 0 ? "↘" : "→"}
                  <span>
                    {Math.abs(volumeTrend).toFixed(1)}%{" "}
                    {t("additionalStats.vsLastMonthShort")}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Advanced Statistics */}
        {validSessions.length > 0 && (
          <>
            {/* Logros Destacados */}
            <div className="bg-linear-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 mt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      {t("achievements.recentAchievementsTitle")}
                    </h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {t("achievements.recentAchievementsDescription")}
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => router.push("/achievements")}
                  className="text-sm"
                >
                  {t("achievements.viewAll")}
                </Button>
              </div>

              {/* Recent Achievements */}
              <div className="flex gap-4 overflow-x-auto pb-2">
                {achievementsData.recent.length === 0 ? (
                  <div className="text-center w-full py-8 text-zinc-600 dark:text-zinc-400">
                    <p className="text-sm">
                      {t("achievements.noAchievements")}
                    </p>
                  </div>
                ) : (
                  <>
                    {achievementsData.recent.map((achievement) => (
                      <AchievementBadge
                        key={achievement.id}
                        achievement={achievement}
                        size="lg"
                        showProgress={true}
                      />
                    ))}
                  </>
                )}
              </div>

              {/* Streak Info */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                      {t("achievements.currentStreak")}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <Flame className="w-5 h-5 text-orange-600" />
                      <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        {streakData.current} {t("statsCards.days")}
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                      {t("achievements.longestStreak")}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <Award className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                      <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        {streakData.longest} {t("statsCards.days")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
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
          <EmptyStateCard
            icon={<Dumbbell className="w-16 h-16" />}
            title={t("quickActions.startFitnessJourneyTitle")}
            description={t("quickActions.startFitnessJourneyDescription")}
            actionLabel={t("quickActions.viewRoutines")}
            onAction={() => router.push("/routines")}
          />
        )}
      </PageContent>
    </PageLayout>
  );
}
