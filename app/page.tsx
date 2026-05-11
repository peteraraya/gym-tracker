"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/context/LocaleContext";
import { useGym } from "@/context/GymContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  ClipboardList,
  Dumbbell,
  Target,
  Rocket,
  Calendar,
  TrendingUp,
  Lightbulb,
  Sparkles,
  Plus,
  ArrowRight,
  BarChart3,
  Activity,
} from "@/components/icons/lucide";

export default function Home() {
  const { routines, sessions, loading } = useGym();
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [selectedRoutineId, setSelectedRoutineId] = useState("");

  const totalExercises = useMemo(() => {
    if (!Array.isArray(routines)) return 0;
    return routines.reduce((acc, r) => acc + (r?.exercises?.length || 0), 0);
  }, [routines]);

  const recentSessions = useMemo(() => {
    if (!Array.isArray(sessions)) return [];
    return sessions.slice(0, 3);
  }, [sessions]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <div className="bg-linear-to-br from-blue-600 via-purple-600 to-indigo-700 text-white mb-4">
          <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Dumbbell className="w-10 h-10" />
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                {t("welcome")}
              </h1>
              <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                {t("subtitle")}
              </p>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                <Link href="/routines">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
                  >
                    <ClipboardList className="w-5 h-5" />
                    {t("viewRoutines")}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                {routines.length > 0 && (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <label htmlFor="routine-select" className="sr-only">
                      {tCommon("selectRoutine") || "Selecciona una rutina"}
                    </label>
                    <select
                      id="routine-select"
                      aria-label={tCommon("selectRoutine") || "Selecciona una rutina"}
                      value={selectedRoutineId}
                      onChange={(e) => setSelectedRoutineId(e.target.value)}
                      className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 font-medium"
                    >
                      <option value="" disabled>
                        {tCommon("selectRoutine") || "Selecciona una rutina..."}
                      </option>
                      {routines.map((routine) => (
                        <option key={routine.id} value={routine.id}>
                          {routine.name}
                        </option>
                      ))}
                    </select>

                    <Button
                      variant="primary"
                      size="lg"
                      className="bg-green-500 hover:bg-green-600 border-0 font-bold"
                      onClick={() => {
                        const id = selectedRoutineId || routines[0]?.id;
                        if (id) router.push(`/workout/${id}`);
                      }}
                    >
                      <Activity className="w-5 h-5" />
                      {tCommon("startWorkout") || "Iniciar Entrenamiento"}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 -mt-8 sm:-mt-12 relative z-10">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <ClipboardList className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    {loading ? (
                      <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    ) : (
                      <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
                        {routines.length}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("routinesCard")}
                    </p>
                  </div>
                </div>
                <Link href="/routines">
                  <Button variant="ghost" size="sm" className="w-full">
                    {t("viewRoutines")}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    {loading ? (
                      <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    ) : (
                      <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
                        {sessions.length}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("sessionsCard")}
                    </p>
                  </div>
                </div>
                <Link href="/sessions">
                  <Button variant="ghost" size="sm" className="w-full">
                    {t("viewHistory") || "Ver Historial"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Dumbbell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    {loading ? (
                      <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    ) : (
                      <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
                        {totalExercises}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("exercisesCard")}
                    </p>
                  </div>
                </div>
                <Link href="/exercises">
                  <Button variant="ghost" size="sm" className="w-full">
                    {t("exploreExercises") || "Explorar Ejercicios"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <div className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  <Rocket className="w-5 h-5 inline mr-2 text-blue-600" />
                  {t("getStarted")}
                </h2>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-600" />
                      {t("recommendedRoutines")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      {t("recommendedRoutinesDesc")}
                    </p>
                    <Link href="/recommended">
                      <Button variant="primary" className="w-full">
                        <Target className="w-4 h-4" />
                        {t("viewRecommended")}
                        <ArrowRight className="w-4 h-4 ml-auto" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      Planificación
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      Planifica tus próximas sesiones y crea objetivos.
                    </p>
                    <Link href="/planning">
                      <Button variant="secondary" className="w-full">
                        <Calendar className="w-4 h-4" />
                        Ir a Planificación
                        <ArrowRight className="w-4 h-4 ml-auto" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {routines.length === 0 ? (
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Plus className="w-5 h-5 text-blue-600" />
                        {t("createFirstRoutine") || "Crear Primera Rutina"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                        {t("getStartedDesc")}
                      </p>
                      <Link href="/routines">
                        <Button variant="primary" className="w-full">
                          <Plus className="w-4 h-4" />
                          {t("createFirstRoutine") || "Crear Rutina"}
                          <ArrowRight className="w-4 h-4 ml-auto" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-blue-600" />
                        {t("haveRoutines.title") || "Tus Rutinas"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                        {t("haveRoutines.subtitle") ||
                          `${routines.length} rutinas creadas`}
                      </p>
                      <Link href="/routines">
                        <Button variant="primary" className="w-full">
                          <ClipboardList className="w-4 h-4" />
                          {t("haveRoutines.cta") || "Ver Rutinas"}
                          <ArrowRight className="w-4 h-4 ml-auto" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Progress & Info */}
              <div className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  <BarChart3 className="w-5 h-5 inline mr-2 text-green-600" />
                  {t("progress") || "Progreso"}
                </h2>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      {t("progress") || "Progreso"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      {t("progressDesc") || "Ver tus estadísticas de progreso"}
                    </p>
                    <Link href="/progress">
                      <Button variant="secondary" className="w-full">
                        <TrendingUp className="w-4 h-4" />
                        {t("viewProgress") || "Ver Progreso"}
                        <ArrowRight className="w-4 h-4 ml-auto" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      {t("history") || "Historial"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      {t("historyDesc") || "Ver historial de entrenamientos"}
                    </p>
                    <Link href="/sessions">
                      <Button variant="secondary" className="w-full">
                        <Calendar className="w-4 h-4" />
                        {t("viewHistory") || "Ver Historial"}
                        <ArrowRight className="w-4 h-4 ml-auto" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-600" />
                      {t("exerciseGuide") || "Guía de Ejercicios"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      {t("exerciseGuideDesc") ||
                        "Explora ejercicios y aprende técnica"}
                    </p>
                    <Link href="/exercises">
                      <Button variant="secondary" className="w-full">
                        <Lightbulb className="w-4 h-4" />
                        {t("exploreExercises") || "Explorar Ejercicios"}
                        <ArrowRight className="w-4 h-4 ml-auto" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Sessions */}
            {recentSessions.length > 0 && (
              <div className="mt-8 sm:mt-12">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
                  <Activity className="w-5 h-5 inline mr-2 text-green-600" />
                  {t("recentSessions") || "Entrenamientos Recientes"}
                </h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  {recentSessions.map((session) => (
                    <Card
                      key={session.id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardContent className="p-4">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          {session.routineName || "Entrenamiento"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {session.date ? new Date(session.date).toLocaleDateString(undefined) : ""}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
