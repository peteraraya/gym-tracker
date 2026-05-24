"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "@/context/LocaleContext";
import { useGym } from "@/context/GymContext";
import { useWorkout } from "@/context/WorkoutContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import {
  calculateStreak,
  calculateTotalVolume,
  filterSessionsByMonth,
} from "@/lib/utils/dateUtils";
import { getWeeklyPlan } from "@/lib/storage/storage";
import type { WeeklyPlan } from "@/lib/storage/localStorage";
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

const DAY_MAP: DayKey[] = [
  "sunday", "monday", "tuesday", "wednesday",
  "thursday", "friday", "saturday",
];

const DAY_LABELS: Record<DayKey, string> = {
  sunday: "Domingo", monday: "Lunes", tuesday: "Martes",
  wednesday: "Miércoles", thursday: "Jueves",
  friday: "Viernes", saturday: "Sábado",
};

function getTodayKey(): DayKey {
  return DAY_MAP[new Date().getDay()];
}

function getThisWeekVolume(sessions: any[]): number {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);
  monday.setHours(0, 0, 0, 0);
  return calculateTotalVolume(sessions.filter((s) => new Date(s.date) >= monday));
}

function getLastWeekVolume(sessions: any[]): number {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() - mondayOffset);
  thisMonday.setHours(0, 0, 0, 0);
  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(thisMonday.getDate() - 7);
  const lastSunday = new Date(thisMonday);
  lastSunday.setMilliseconds(-1);
  return calculateTotalVolume(
    sessions.filter((s) => { const d = new Date(s.date); return d >= lastMonday && d <= lastSunday; })
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
const RestDayCard: React.FC<{ dayLabel: string; showSetup?: boolean }> = ({ dayLabel, showSetup = false }) => (
  <motion.div
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
        <h2 className="text-zinc-800 dark:text-zinc-100 font-bold text-lg leading-tight">Día de descanso</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">Aprovecha para recuperarte</p>
      </div>
    </div>
    
    <div className="flex flex-col gap-2">
      <Link href="/exercises" className="flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700 text-zinc-700 dark:text-zinc-300 text-sm font-bold px-5 py-3 rounded-xl shadow-sm transition-colors w-full">
        <Flame className="w-4 h-4 text-orange-500" />
        Sugerencia: Sesión de Movilidad
      </Link>
      
      {showSetup ? (
        <Link href="/planning" className="inline-flex items-center justify-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs font-medium hover:text-indigo-600 dark:hover:text-indigo-400 mt-1 transition-colors">
          Configurar agenda semanal <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      ) : (
        <Link href="/routines" className="inline-flex items-center justify-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs font-medium hover:text-indigo-600 dark:hover:text-indigo-400 mt-1 transition-colors">
          Forzar entrenamiento hoy <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  </motion.div>
);

// ——— Card entrenamiento de hoy ———
const TodayWorkoutCard: React.FC<{
  todayKey: DayKey;
  todayRoutineIds: string[];
  routines: any[];
  activeWorkout: any;
  onStart: (id: string) => void;
  loading: boolean;
}> = ({ todayKey, todayRoutineIds, routines, activeWorkout, onStart, loading }) => {
  const router = useRouter();

  if (loading) return <div className="rounded-3xl bg-zinc-100 dark:bg-zinc-800/60 h-40 animate-pulse" />;

  if (activeWorkout?.routineId) {
    const active = routines.find((r: any) => r.id === activeWorkout.routineId);
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-500 to-green-600 p-5 shadow-xl shadow-emerald-500/20"
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/40" />
        </div>
        <div className="relative">
          <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider mb-1">🔥 Entrenamiento activo</p>
          <h2 className="text-white font-bold text-xl mb-3">{active?.name || "Entrenamiento"}</h2>
          <button onClick={() => router.push(`/workout/${activeWorkout.routineId}`)}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Activity className="w-4 h-4" /> Continuar entrenamiento <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  if (todayRoutineIds.length > 0) {
    const planned = todayRoutineIds.map((id) => routines.find((r: any) => r.id === id)).filter(Boolean);
    if (planned.length === 0) return <RestDayCard dayLabel={DAY_LABELS[todayKey]} />;
    const first = planned[0] as any;
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-600 via-violet-600 to-purple-700 p-5 shadow-xl shadow-indigo-500/25"
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/40" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/30" />
        </div>
        <div className="relative">
          <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">
            📅 Tu entrenamiento de hoy · {DAY_LABELS[todayKey]}
          </p>
          <h2 className="text-white font-bold text-2xl truncate mb-1">{first.name}</h2>
          <p className="text-indigo-100 text-sm mb-6">
            {first.exercises?.length || 0} ejercicios ·{" "}
            {(first.exercises || []).reduce((s: number, ex: any) => s + (ex.sets?.length || 0), 0)} series
          </p>
          <button onClick={() => onStart(first.id)}
            className="w-full flex items-center justify-center gap-3 bg-white text-indigo-700 text-base font-bold py-4 rounded-2xl shadow-xl hover:bg-indigo-50 transform hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Play className="w-5 h-5 fill-indigo-600" /> Iniciar Entrenamiento
          </button>
          {planned.length > 1 && (
            <p className="text-indigo-300 text-xs mt-2">+{planned.length - 1} rutina{planned.length > 2 ? "s" : ""} más</p>
          )}
        </div>
      </motion.div>
    );
  }

  return <RestDayCard dayLabel={DAY_LABELS[todayKey]} showSetup={routines.length > 0} />;
};

// ——— Página ———
export default function Home() {
  const { routines, sessions, loading } = useGym();
  const { activeWorkout, startWorkout } = useWorkout();
  const router = useRouter();
  const t = useTranslations("home");

  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const todayKey = getTodayKey();

  useEffect(() => { getWeeklyPlan().then(setWeeklyPlan).catch(() => {}); }, []);

  const todayRoutineIds = useMemo<string[]>(() => weeklyPlan?.[todayKey]?.routines ?? [], [weeklyPlan, todayKey]);
  const streakCount = useMemo(() => calculateStreak(sessions), [sessions]);
  const thisWeekVol = useMemo(() => getThisWeekVolume(sessions), [sessions]);
  const lastWeekVol = useMemo(() => getLastWeekVolume(sessions), [sessions]);
  const volTrend = useMemo(() => lastWeekVol === 0 ? null : Math.round(((thisWeekVol - lastWeekVol) / lastWeekVol) * 100), [thisWeekVol, lastWeekVol]);
  const monthSessions = useMemo(() => { const n = new Date(); return filterSessionsByMonth(sessions, n.getMonth(), n.getFullYear()).length; }, [sessions]);
  const recentSessions = useMemo(() => sessions.slice(0, 3), [sessions]);

  const handleStart = useCallback((routineId: string) => {
    if (activeWorkout?.routineId === routineId) { router.push(`/workout/${routineId}`); return; }
    const routine = routines.find((r) => r.id === routineId);
    if (routine) { startWorkout(routine); router.push(`/workout/${routineId}`); }
  }, [activeWorkout, routines, startWorkout, router]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-lg mx-auto px-4 pt-6 pb-4 space-y-4">

          {/* Cabecera */}
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">{greeting} 👋</p>
              <h1 className="text-zinc-900 dark:text-zinc-50 font-bold text-2xl leading-tight">Hoy</h1>
              <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-0.5">
                {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
            {streakCount > 0 && (
              <Link href="/achievements">
                <motion.div whileTap={{ scale: 0.93 }}
                  className="flex flex-col items-center bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/40 rounded-2xl px-3 py-2"
                >
                  <AnimatedFlame size={22} />
                  <span className="text-orange-600 dark:text-orange-400 font-black text-xl leading-none">{streakCount}</span>
                  <span className="text-orange-400/70 dark:text-orange-400/60 text-[10px] font-medium">días</span>
                </motion.div>
              </Link>
            )}
          </motion.div>

          {/* Card principal */}
          <TodayWorkoutCard
            todayKey={todayKey}
            todayRoutineIds={todayRoutineIds}
            routines={routines}
            activeWorkout={activeWorkout}
            onStart={handleStart}
            loading={loading}
          />

          {/* Stats rápidos */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="grid grid-cols-3 gap-3"
          >
            {loading ? (
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
                    <p className="text-zinc-400 dark:text-zinc-500 text-[10px] mt-0.5">Vol. semana</p>
                  </div>
                </Link>
                <Link href="/sessions">
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                    <Calendar className="w-4 h-4 text-blue-500 mb-1" />
                    <p className="text-zinc-900 dark:text-zinc-100 font-bold text-base leading-none">{monthSessions}</p>
                    <p className="text-zinc-400 dark:text-zinc-500 text-[10px] mt-0.5">Mes actual</p>
                  </div>
                </Link>
                <Link href="/achievements">
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                    <Trophy className="w-4 h-4 text-amber-500 mb-1" />
                    <p className="text-zinc-900 dark:text-zinc-100 font-bold text-base leading-none">{streakCount > 0 ? streakCount : sessions.length}</p>
                    <p className="text-zinc-400 dark:text-zinc-500 text-[10px] mt-0.5">{streakCount > 0 ? "Racha actual" : "Sesiones"}</p>
                  </div>
                </Link>
              </>
            )}
          </motion.div>

          {/* Acceso rápido */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            className="grid grid-cols-2 gap-3"
          >
            {loading ? (
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
                      <p className="text-zinc-800 dark:text-zinc-200 font-semibold text-sm">Rutinas</p>
                      <p className="text-zinc-400 text-xs">{routines.length} creadas</p>
                    </div>
                  </div>
                </Link>
                <Link href="/dashboard">
                  <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-3.5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-zinc-800 dark:text-zinc-200 font-semibold text-sm">Dashboard</p>
                      <p className="text-zinc-400 text-xs">{sessions.length} sesiones</p>
                    </div>
                  </div>
                </Link>
              </>
            )}
          </motion.div>

          {/* Inicio rápido: cuando no hay plan semanal pero sí rutinas */}
          {!loading && weeklyPlan === null && routines.length > 0 && todayRoutineIds.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-zinc-700 dark:text-zinc-300 font-semibold text-sm">Inicio rápido</h2>
                <Link href="/planning" className="text-indigo-600 dark:text-indigo-400 text-xs font-medium flex items-center gap-0.5 hover:underline">
                  Planificar <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="space-y-2">
                {routines.slice(0, 3).map((r) => (
                  <button key={r.id} onClick={() => handleStart(r.id)}
                    className="w-full flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-4 py-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                      <Play className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-800 dark:text-zinc-200 font-medium text-sm truncate">{r.name}</p>
                      <p className="text-zinc-400 text-xs">{r.exercises?.length ?? 0} ejercicios</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-400 shrink-0" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Sesiones recientes */}
          <AnimatePresence>
            {recentSessions.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-zinc-700 dark:text-zinc-300 font-semibold text-sm">Recientes</h2>
                  <Link href="/sessions" className="text-indigo-600 dark:text-indigo-400 text-xs font-medium flex items-center gap-0.5 hover:underline">
                    Ver todo <ChevronRight className="w-3.5 h-3.5" />
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
                          <p className="text-zinc-800 dark:text-zinc-200 font-medium text-sm truncate">{session.routineName || "Entrenamiento"}</p>
                          <p className="text-zinc-400 text-xs">
                            {session.date ? new Date(session.date).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" }) : ""}
                            {exCount > 0 && <span className="ml-1.5">· {exCount} ejerc.</span>}
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
          {!loading && routines.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center"
            >
              <Dumbbell className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-700 dark:text-zinc-300 font-semibold mb-1">{t("createFirstRoutine") || "Crea tu primera rutina"}</p>
              <p className="text-zinc-400 text-sm mb-4">{t("getStartedDesc") || "Empieza a registrar tus entrenamientos"}</p>
              <Link href="/routines">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
                  Crear rutina
                </button>
              </Link>
            </motion.div>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}
