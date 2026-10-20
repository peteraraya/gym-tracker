"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "@/context/LocaleContext";
import { useGym } from "@/context/GymContext";
import { useWorkout } from "@/context/WorkoutContext";
import { useToast } from "@/context/NotificationContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import {
  calculateStreak,
  calculateTotalVolume,
  filterSessionsByMonth,
  getWeekStart,
  getDayKey,
} from "@/lib/shared/utils/dateUtils";
import { getWeeklyPlan } from "@/lib/infrastructure/storage/storage";
import type { WeeklyPlan } from "@/lib/infrastructure/storage/localStorage";
import type { Routine, WorkoutSession } from "@/types";
import type { WorkoutState } from "@/lib/application/workout/normalizeWorkoutState";
import {
  Dumbbell,
  Play,
  ArrowRight,
  Calendar,
  TrendingUp,
  ChevronRight,
  Flame,
  Trophy,
  Zap,
  Moon,
  ClipboardList,
  Activity,
} from "@/components/icons/lucide";
import Link from "next/link";

// ——— Helpers ———
type DayKey =
  | "sunday" | "monday" | "tuesday" | "wednesday"
  | "thursday" | "friday" | "saturday";

function getTodayKey(): DayKey {
  return getDayKey(new Date());
}

function countLabel(
  t: (key: string) => string,
  locale: string,
  key: string,
  count: number,
) {
  const plural = new Intl.PluralRules(locale).select(count);
  return `${count} ${t(`${key}.${plural}`)}`;
}

function getThisWeekVolume(sessions: WorkoutSession[]): number {
  const now = new Date();
  const monday = getWeekStart(now, "monday");
  const weekEnd = new Date(monday);
  weekEnd.setDate(monday.getDate() + 7);
  return calculateTotalVolume(
    sessions.filter((s) => {
      const d = new Date(s.date);
      return d >= monday && d < weekEnd;
    }),
  );
}

function getLastWeekVolume(sessions: WorkoutSession[]): number {
  const now = new Date();
  const thisMonday = getWeekStart(now, "monday");
  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(thisMonday.getDate() - 7);
  return calculateTotalVolume(
    sessions.filter((s) => {
      const d = new Date(s.date);
      return d >= lastMonday && d < thisMonday;
    }),
  );
}

// ——— Flame animada ———
const AnimatedFlame: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <motion.span
    animate={{ scale: [1, 1.2, 0.95, 1.1, 1], rotate: [-5, 5, -3, 3, 0] }}
    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
    style={{ display: "inline-block", lineHeight: 1 }}
  >
    <Flame style={{ width: size, height: size }} className="text-orange-500" />
  </motion.span>
);

// ——— Card descanso ———
const RestDayCard: React.FC<{ dayKey: DayKey; showSetup?: boolean }> = ({ dayKey, showSetup = false }) => {
  const t = useTranslations("home");
  const dayLabel = t(`days.${dayKey}`);

  return <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-3xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50 p-5"
  >
    <p className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">{dayLabel}</p>
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
        <Moon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
      </div>
      <div>
        <h2 className="text-zinc-800 dark:text-zinc-100 font-bold text-lg leading-tight">{t("restDay.title")}</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">{t("restDay.description")}</p>
      </div>
    </div>
    
    <div className="flex flex-col gap-2">
      <Link href="/exercises" className="flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700 text-zinc-700 dark:text-zinc-300 text-sm font-bold px-5 py-3 rounded-xl shadow-sm transition-colors w-full">
        <Flame className="w-4 h-4 text-orange-500" />
        {t("restDay.mobility")}
      </Link>
      
      {showSetup ? (
        <Link href="/planning" className="inline-flex items-center justify-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs font-medium hover:text-indigo-600 dark:hover:text-indigo-400 mt-1 transition-colors">
          {t("restDay.configureSchedule")} <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      ) : (
        <Link href="/routines" className="inline-flex items-center justify-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs font-medium hover:text-indigo-600 dark:hover:text-indigo-400 mt-1 transition-colors">
          {t("restDay.trainToday")} <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  </motion.div>;
};

const NoScheduleCard: React.FC = () => {
  const t = useTranslations("home");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{t("noPlan.eyebrow")}</p>
      <h2 className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">{t("noPlan.title")}</h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("noPlan.description")}</p>
      <Link
        href="/planning"
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:bg-emerald-300 dark:text-zinc-950 dark:hover:bg-emerald-200"
      >
        {t("noPlan.cta")} <ChevronRight className="h-4 w-4" />
      </Link>
    </motion.div>
  );
};

// ——— Card entrenamiento de hoy ———
const TodayWorkoutCard: React.FC<{
  todayKey: DayKey;
  todayRoutineIds: string[];
  routines: Routine[];
  activeWorkout: WorkoutState | null;
  onStart: (id: string) => void;
  loading: boolean;
  planLoading: boolean;
  planError: boolean;
  routinesError: boolean;
  hasWeeklySchedule: boolean;
  startingRoutineId: string | null;
  onRetryPlan: () => void;
}> = ({
  todayKey,
  todayRoutineIds,
  routines,
  activeWorkout,
  onStart,
  loading,
  planLoading,
  planError,
  routinesError,
  hasWeeklySchedule,
  startingRoutineId,
  onRetryPlan,
}) => {
  const router = useRouter();
  const t = useTranslations("home");
  const { locale } = useLocale();

  if (loading) return <div className="rounded-3xl bg-zinc-100 dark:bg-zinc-800/60 h-40 animate-pulse" />;

  if (activeWorkout?.routineId) {
    const active = routines.find((r) => r.id === activeWorkout.routineId);
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-500 to-green-600 p-5 shadow-xl shadow-emerald-500/20"
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/40" />
        </div>
        <div className="relative">
          <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider mb-1">🔥 {t("activeWorkout")}</p>
          <h2 className="text-white font-bold text-xl mb-3">{active?.name || activeWorkout.routineName || t("workoutFallback")}</h2>
          <button onClick={() => router.push(`/workout/${activeWorkout.routineId}`)}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Activity className="w-4 h-4" /> {t("continueWorkout")} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  if (routinesError) {
    return (
      <div role="alert" className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
        <h2 className="font-semibold">{t("dataLoadError")}</h2>
        <button type="button" onClick={onRetryPlan} className="mt-3 min-h-11 font-semibold underline underline-offset-2">
          {t("retry")}
        </button>
      </div>
    );
  }

  if (planLoading) return <div className="h-40 animate-pulse rounded-3xl bg-zinc-100 dark:bg-zinc-800/60" />;

  if (planError) {
    return (
      <div role="alert" className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
        <h2 className="font-semibold">{t("planLoadError")}</h2>
        <button type="button" onClick={onRetryPlan} className="mt-3 min-h-11 font-semibold underline underline-offset-2">
          {t("retry")}
        </button>
      </div>
    );
  }

  if (todayRoutineIds.length > 0) {
    const planned = todayRoutineIds
      .map((id) => routines.find((routine) => routine.id === id))
      .filter((routine): routine is Routine => Boolean(routine));
    if (planned.length === 0) {
      return (
        <div role="status" className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">{t("noPlan.routineUnavailable")}</h2>
          <Link href="/planning" className="mt-3 inline-flex min-h-11 items-center font-semibold text-emerald-700 dark:text-emerald-300">
            {t("noPlan.cta")} <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      );
    }
    const first = planned[0];
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-800 p-5 shadow-xl shadow-black/25"
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/40" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/30" />
        </div>
        <div className="relative">
          <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">
            📅 {t("plannedWorkout")} · {t(`days.${todayKey}`)}
          </p>
          <h2 className="text-white font-bold text-2xl truncate mb-1">{first.name}</h2>
          <p className="text-indigo-100 text-sm mb-6">
            {countLabel(t, locale, "exercisesCount", first.exercises?.length || 0)} ·{" "}
            {countLabel(t, locale, "setsCount", first.exercises.reduce((total, exercise) => total + (exercise.sets?.length ?? 0), 0))}
          </p>
          <button
            onClick={() => onStart(first.id)}
            disabled={startingRoutineId !== null}
            aria-busy={startingRoutineId === first.id}
            className="w-full flex items-center justify-center gap-3 bg-white text-indigo-700 text-base font-bold py-4 rounded-2xl shadow-xl hover:bg-indigo-50 transform hover:scale-[1.02] active:scale-95 transition-all disabled:cursor-wait disabled:opacity-70"
          >
            <Play className="w-5 h-5 fill-indigo-600" /> {startingRoutineId === first.id ? t("startPending") : t("startWorkout")}
          </button>
          {planned.length > 1 && (
            <p className="text-indigo-300 text-xs mt-2">+{countLabel(t, locale, "moreRoutines", planned.length - 1)}</p>
          )}
        </div>
      </motion.div>
    );
  }

  if (!hasWeeklySchedule) {
    return routines.length > 0 ? <NoScheduleCard /> : null;
  }

  return <RestDayCard dayKey={todayKey} />;
};

// ——— Página ———
export default function Home() {
  const {
    routines,
    sessions,
    loading,
    routinesError,
    sessionsError,
    refreshAll,
  } = useGym();
  const { activeWorkout, startWorkout } = useWorkout();
  const { error: showError } = useToast();
  const router = useRouter();
  const t = useTranslations("home");
  const { locale } = useLocale();

  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [weeklyPlanError, setWeeklyPlanError] = useState(false);
  const [isWeeklyPlanLoading, setIsWeeklyPlanLoading] = useState(true);
  const [startingRoutineId, setStartingRoutineId] = useState<string | null>(null);
  const todayKey = getTodayKey();

  const loadWeeklyPlan = useCallback(async () => {
    setIsWeeklyPlanLoading(true);
    try {
      setWeeklyPlan(await getWeeklyPlan());
      setWeeklyPlanError(false);
    } catch (error) {
      console.error("Error loading weekly plan:", error);
      setWeeklyPlan(null);
      setWeeklyPlanError(true);
    } finally {
      setIsWeeklyPlanLoading(false);
    }
  }, []);

  useEffect(() => { void loadWeeklyPlan(); }, [loadWeeklyPlan]);

  const todayRoutineIds = useMemo<string[]>(() => weeklyPlan?.[todayKey]?.routines ?? [], [weeklyPlan, todayKey]);
  const hasWeeklySchedule = useMemo(
    () => Object.values(weeklyPlan ?? {}).some(
      (day) => Array.isArray(day?.routines) && day.routines.length > 0,
    ),
    [weeklyPlan],
  );
  const streakCount = useMemo(() => calculateStreak(sessions), [sessions]);
  const thisWeekVol = useMemo(() => getThisWeekVolume(sessions), [sessions]);
  const lastWeekVol = useMemo(() => getLastWeekVolume(sessions), [sessions]);
  const volTrend = useMemo(() => lastWeekVol === 0 ? null : Math.round(((thisWeekVol - lastWeekVol) / lastWeekVol) * 100), [thisWeekVol, lastWeekVol]);
  const monthSessions = useMemo(() => { const n = new Date(); return filterSessionsByMonth(sessions, n.getMonth(), n.getFullYear()).length; }, [sessions]);
  const recentSessions = useMemo(() => sessions.slice(0, 3), [sessions]);

  const handleStart = useCallback(async (routineId: string) => {
    if (startingRoutineId) return;
    try {
      if (activeWorkout?.routineId === routineId) {
        router.push(`/workout/${routineId}`);
        return;
      }
      const routine = routines.find((r) => r.id === routineId);
      if (!routine) {
        showError(t("startError"));
        return;
      }
      setStartingRoutineId(routineId);
      await startWorkout(routine);
      router.push(`/workout/${routineId}`);
    } catch (error) {
      console.error("Error starting workout from home:", error);
      showError(t("startError"));
    } finally {
      setStartingRoutineId(null);
    }
  }, [activeWorkout, routines, startWorkout, router, showError, t, startingRoutineId]);

  const retryDataLoad = useCallback(async () => {
    await Promise.all([refreshAll(), loadWeeklyPlan()]);
  }, [refreshAll, loadWeeklyPlan]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? t("greeting.morning") : h < 19 ? t("greeting.afternoon") : t("greeting.evening");
  }, [t]);

  return (
    <ProtectedRoute>
      {loading ? (
        <PageSkeleton variant="dashboard" className="h-screen" />
      ) : (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-lg space-y-4 px-4 pt-4 pb-8 sm:px-6 sm:pt-6 lg:grid lg:max-w-7xl lg:grid-cols-12 lg:items-start lg:gap-6 lg:space-y-0">

          {/* Cabecera */}
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between lg:col-span-12"
          >
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">{greeting} 👋</p>
              <h1 className="text-zinc-900 dark:text-zinc-50 font-bold text-2xl leading-tight">{t("today")}</h1>
              <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-0.5">
                {new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(new Date())}
              </p>
            </div>
            {streakCount > 0 && (
              <Link href="/achievements">
                <motion.div whileTap={{ scale: 0.93 }}
                  className="flex flex-col items-center bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/40 rounded-2xl px-3 py-2"
                >
                  <AnimatedFlame size={22} />
                  <span className="text-orange-600 dark:text-orange-400 font-black text-xl leading-none">{streakCount}</span>
                  <span className="text-orange-400/70 dark:text-orange-400/60 text-[10px] font-medium">{t(`streakDays.${new Intl.PluralRules(locale).select(streakCount)}`)}</span>
                </motion.div>
              </Link>
            )}
          </motion.div>

          {sessionsError && (
            <div role="alert" className="lg:col-span-12 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              <span>{t("dataLoadError")}</span>
              <button type="button" onClick={() => void retryDataLoad()} className="shrink-0 font-semibold underline underline-offset-2">
                {t("retry")}
              </button>
            </div>
          )}

          {/* Card principal */}
          <section className="lg:col-span-7">
            <TodayWorkoutCard
              todayKey={todayKey}
              todayRoutineIds={todayRoutineIds}
              routines={routines}
              activeWorkout={activeWorkout}
              onStart={handleStart}
              loading={loading}
              planLoading={isWeeklyPlanLoading}
              planError={weeklyPlanError}
              routinesError={routinesError}
              hasWeeklySchedule={hasWeeklySchedule}
              startingRoutineId={startingRoutineId}
              onRetryPlan={() => void retryDataLoad()}
            />
          </section>

          {/* Stats rápidos */}
          <div className="space-y-4 lg:col-span-5">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="grid grid-cols-3 gap-3"
          >
            {loading || sessionsError ? (
              <>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="bg-zinc-100 dark:bg-zinc-800/60 rounded-2xl p-3 h-[72px] animate-pulse" />
                ))}
              </>
            ) : (
              <>
                <Link href="/progress">
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <TrendingUp className="w-4 h-4 text-indigo-500" />
                      {volTrend !== null && (
                        <span className={`text-[10px] font-bold ${volTrend >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                          {volTrend >= 0 ? "↗" : "↘"} {Math.abs(volTrend)}%
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-900 dark:text-zinc-100 font-bold text-base leading-none">
                      {thisWeekVol >= 1000 ? `${(thisWeekVol / 1000).toFixed(1)}t` : `${thisWeekVol}kg`}
                    </p>
                    <p className="text-zinc-400 dark:text-zinc-500 text-[10px] mt-0.5">{t("volumeThisWeek")}</p>
                  </div>
                </Link>
                <Link href="/sessions">
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                    <Calendar className="w-4 h-4 text-blue-500 mb-1" />
                    <p className="text-zinc-900 dark:text-zinc-100 font-bold text-base leading-none">{monthSessions}</p>
                    <p className="text-zinc-400 dark:text-zinc-500 text-[10px] mt-0.5">{t("currentMonth")}</p>
                  </div>
                </Link>
                <Link href="/achievements">
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                    <Trophy className="w-4 h-4 text-amber-500 mb-1" />
                    <p className="text-zinc-900 dark:text-zinc-100 font-bold text-base leading-none">{streakCount > 0 ? streakCount : sessions.length}</p>
                    <p className="text-zinc-400 dark:text-zinc-500 text-[10px] mt-0.5">{streakCount > 0 ? t("currentStreak") : t("sessions")}</p>
                  </div>
                </Link>
              </>
            )}
          </motion.div>

          {/* Acceso rápido */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            className="grid grid-cols-2 gap-3"
          >
            {loading || routinesError || sessionsError ? (
              <>
                <div className="bg-zinc-100 dark:bg-zinc-800/60 rounded-2xl h-[60px] animate-pulse" />
                <div className="bg-zinc-100 dark:bg-zinc-800/60 rounded-2xl h-[60px] animate-pulse" />
              </>
            ) : (
              <>
                <Link href="/routines">
                  <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-3.5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                      <ClipboardList className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-zinc-800 dark:text-zinc-200 font-semibold text-sm">{t("routines")}</p>
                      <p className="text-zinc-400 text-xs">{t("routinesCount").replace("{count}", String(routines.length))}</p>
                    </div>
                  </div>
                </Link>
                <Link href="/dashboard">
                  <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-3.5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-zinc-800 dark:text-zinc-200 font-semibold text-sm">{t("dashboard")}</p>
                      <p className="text-zinc-400 text-xs">{t("sessionsCount").replace("{count}", String(sessions.length))}</p>
                    </div>
                  </div>
                </Link>
              </>
            )}
          </motion.div>

          {/* Inicio rápido: cuando no hay plan semanal pero sí rutinas */}
          {!loading && !weeklyPlanError && !routinesError && !hasWeeklySchedule && routines.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-zinc-700 dark:text-zinc-300 font-semibold text-sm">{t("quickStart")}</h2>
                <Link href="/planning" className="text-indigo-600 dark:text-indigo-400 text-xs font-medium flex items-center gap-0.5 hover:underline">
                  {t("plan")} <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="space-y-2">
                {routines.slice(0, 3).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => void handleStart(r.id)}
                    disabled={startingRoutineId !== null}
                    aria-busy={startingRoutineId === r.id}
                    className="w-full flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-4 py-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors text-left disabled:cursor-wait disabled:opacity-70"
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                      <Play className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-800 dark:text-zinc-200 font-medium text-sm truncate">{r.name}</p>
                      <p className="text-zinc-400 text-xs">{countLabel(t, locale, "exercisesCount", r.exercises?.length ?? 0)}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-400 shrink-0" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Sesiones recientes */}
          <AnimatePresence>
            {!sessionsError && recentSessions.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-zinc-700 dark:text-zinc-300 font-semibold text-sm">{t("recent")}</h2>
                  <Link href="/sessions" className="text-indigo-600 dark:text-indigo-400 text-xs font-medium flex items-center gap-0.5 hover:underline">
                    {t("viewAll")} <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="space-y-2">
                  {recentSessions.map((session) => {
                    const exCount = session.exercises?.length ?? 0;
                    const vol = session.totalVolume ?? 0;
                    const dur = session.totalDuration;
                    const durLabel = dur
                      ? dur >= 3600
                        ? `${Math.floor(dur / 3600)}h ${Math.floor((dur % 3600) / 60)}m`
                        : `${Math.floor(dur / 60)}m`
                      : null;
                    return (
                      <div key={session.id} className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-4 py-3">
                        <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                          <Dumbbell className="w-4 h-4 text-zinc-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-zinc-800 dark:text-zinc-200 font-medium text-sm truncate">{session.routineName || t("workoutFallback")}</p>
                          <p className="text-zinc-400 text-xs">
                            {session.date ? new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short" }).format(new Date(session.date)) : ""}
                            {exCount > 0 && <span className="ml-1.5">· {exCount} {t("exerciseAbbreviation")}</span>}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-0.5 shrink-0">
                          {vol > 0 && (
                            <span className="text-zinc-600 dark:text-zinc-400 text-xs font-semibold">
                              {vol >= 1000 ? `${(vol / 1000).toFixed(1)}t` : `${vol}kg`}
                            </span>
                          )}
                          {durLabel && (
                            <span className="text-zinc-400 dark:text-zinc-500 text-[10px]">{durLabel}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Estado vacío */}
          {!loading && !routinesError && routines.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center"
            >
              <Dumbbell className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-700 dark:text-zinc-300 font-semibold mb-1">{t("createFirstRoutine")}</p>
              <p className="text-zinc-400 text-sm mb-4">{t("getStartedDesc")}</p>
              <Link
                href="/routines"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                {t("cta.create")}
              </Link>
            </motion.div>
          )}
          </div>
        </div>
      </div>
      )}
    </ProtectedRoute>
  );
}
