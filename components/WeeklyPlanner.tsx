"use client";

import React, { useEffect, useState, DragEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  GripVertical,
  ChevronLeft,
  ChevronRight,
} from "@/components/icons/lucide";
import { useRoutines } from "@/context/GymContext";
import { useWorkout } from "@/context/WorkoutContext";
import { Button } from "@/components/ui/Button";
import { useToast, useConfirm } from "@/context/NotificationContext";
import {
  getWeeklyPlan,
  saveWeeklyPlan,
  getMonthlyPlan,
  saveMonthlyPlan,
} from "@/lib/storage/storage";
import MonthlyCalendar from "@/components/MonthlyCalendar";
import DayPlanModal from "@/components/DayPlanModal";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Plus, Play } from "lucide-react";

type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";
type ViewMode = "weekly" | "monthly";
type WeeklyViewMode = "view" | "edit";

const DAYS: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const LABELS: Record<DayKey, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const DAY_NAMES_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

type DayPlan = { routines: string[]; blocked?: boolean; note?: string };
type Plan = Record<DayKey, DayPlan>;
type MonthlyPlan = Record<string, DayPlan>; // key: 'YYYY-MM-DD'

export default function WeeklyPlanner({
  searchQuery = "",
}: {
  searchQuery?: string;
}) {
  const router = useRouter();
  const { routines, loading: routinesLoading } = useRoutines();
  const { startWorkout, activeWorkout } = useWorkout();
  const { confirm } = useConfirm();
  const { info } = useToast();

  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const [weeklyViewMode, setWeeklyViewMode] = useState<WeeklyViewMode>("view");
  const [showFullWeek, setShowFullWeek] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const defaultPlan: Plan = DAYS.reduce(
    (acc, d) => ({ ...acc, [d]: { routines: [], blocked: false, note: "" } }),
    {} as Plan,
  );
  const [plan, setPlan] = useState<Plan>(defaultPlan);
  const [monthlyPlan, setMonthlyPlan] = useState<MonthlyPlan>({});
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [selectedDayByRoutine, setSelectedDayByRoutine] = useState<
    Record<string, DayKey | "">
  >({});
  const [selectedWeekDay, setSelectedWeekDay] = useState<DayKey | null>(null);
  const [selectedMonthDay, setSelectedMonthDay] = useState<string | null>(null);
  const [isRoutineSheetOpen, setIsRoutineSheetOpen] = useState(false);
  const [selectedDayForQuickAdd, setSelectedDayForQuickAdd] =
    useState<DayKey | null>(null);
  const daysRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadPlans = async () => {
      try {
        // Cargar ambos planes en paralelo
        const [storedWeekly, storedMonthly] = await Promise.all([
          getWeeklyPlan(),
          getMonthlyPlan(),
        ]);

        if (!mounted) return;

        // Procesar plan semanal
        if (storedWeekly) {
          const parsed = storedWeekly as any;
          if (
            Array.isArray(parsed) === false &&
            Object.values(parsed).every((v: any) => Array.isArray(v))
          ) {
            const converted = DAYS.reduce(
              (acc, d) => ({ ...acc, [d]: { routines: parsed[d] || [] } }),
              {} as any,
            ) as Plan;
            setPlan(converted);
          } else {
            const normalized = DAYS.reduce(
              (acc, d) => ({
                ...acc,
                [d]: {
                  routines:
                    (parsed[d]?.routines as string[]) ||
                    (parsed[d] as string[]) ||
                    [],
                  blocked: parsed[d]?.blocked || false,
                  note: parsed[d]?.note || "",
                },
              }),
              {} as any,
            ) as Plan;
            setPlan(normalized);
          }
        }

        // Procesar plan mensual
        if (storedMonthly) {
          try {
            const raw = storedMonthly as Record<string, any>;
            const normalized = Object.keys(raw).reduce((acc, k) => {
              const v = raw[k];
              if (v && typeof v === "object") {
                acc[k] = {
                  routines: Array.isArray(v.routines)
                    ? v.routines
                    : Array.isArray(v)
                      ? v
                      : [],
                  blocked: !!v.blocked,
                  note: typeof v.note === "string" ? v.note : "",
                };
              } else {
                acc[k] = { routines: [], blocked: false, note: "" };
              }
              return acc;
            }, {} as MonthlyPlan);
            setMonthlyPlan(normalized);
          } catch (e) {
            setMonthlyPlan(storedMonthly as unknown as MonthlyPlan);
          }
        }
      } catch (e) {
        console.warn("Error loading plans, using local default", e);
      } finally {
        if (mounted) setIsLoadingPlan(false);
      }
    };

    loadPlans();
    return () => {
      mounted = false;
    };
  }, []);

  // Escuchar sincronización desde el módulo de planificación
  useEffect(() => {
    const handler = (e: Event) => {
      const data = (e as CustomEvent).detail as Record<
        string,
        { routines: string[]; blocked: boolean; note: string }
      >;
      if (!data) return;
      const normalized = DAYS.reduce(
        (acc, d) => ({
          ...acc,
          [d]: {
            routines: data[d]?.routines ?? [],
            blocked: data[d]?.blocked ?? false,
            note: data[d]?.note ?? "",
          },
        }),
        {} as Plan,
      );
      setPlan(normalized);
    };
    window.addEventListener("planning:sync", handler);
    return () => window.removeEventListener("planning:sync", handler);
  }, []);

  // ✅ FASE 3 - Problema #15: Debounce compartido para guardar ambos planes
  // Usar refs para acceder a los valores más recientes sin causar re-renders
  const planRef = useRef(plan);
  const monthlyPlanRef = useRef(monthlyPlan);

  useEffect(() => {
    planRef.current = plan;
  }, [plan]);

  useEffect(() => {
    monthlyPlanRef.current = monthlyPlan;
  }, [monthlyPlan]);

  // Debounce compartido para guardar ambos planes en paralelo
  useEffect(() => {
    if (isLoadingPlan) return;

    const timeoutId = setTimeout(async () => {
      try {
        await Promise.all([
          saveWeeklyPlan(planRef.current),
          saveMonthlyPlan(monthlyPlanRef.current),
        ]);
      } catch (e) {
        console.warn("[WeeklyPlanner] Error saving plans:", e);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [plan, monthlyPlan, isLoadingPlan]);

  const updateIndicators = () => {
    const el = daysRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  const onDragStart = (e: DragEvent, id: string) => {
    try {
      e.dataTransfer?.setData("text/plain", id);
    } catch (err) {}
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const onDropToDay = (e: DragEvent, day: DayKey) => {
    e.preventDefault();
    try {
      const id = e.dataTransfer?.getData("text/plain");
      if (id) addRoutineToDay(id, day);
    } catch (err) {}
  };

  const removeFromDay = (day: DayKey, rid: string) => {
    setPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        routines: prev[day].routines.filter((x) => x !== rid),
      },
    }));
  };

  const clearPlan = () => {
    setPlan(defaultPlan);
    try {
      saveWeeklyPlan(defaultPlan);
    } catch (e) {}
  };

  // Funciones para calendario mensual
  const formatDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Obtener el día actual de la semana
  const getCurrentDayKey = (): DayKey | null => {
    const today = new Date();
    const dayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayMap: DayKey[] = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    return dayMap[dayIndex];
  };

  const handleStartRoutine = (routineId: string) => {
    // Si ya hay un entrenamiento activo para esta misma rutina, solo navegar
    if (activeWorkout?.routineId === routineId) {
      router.push(`/workout/${routineId}`);
      return;
    }
    const routine = routines.find((r) => r.id === routineId);
    if (routine) {
      startWorkout(routine);
      router.push(`/workout/${routineId}`);
    }
  };

  const addRoutineToMonthDay = (routineId: string, dateKey: string) => {
    if (!dateKey) return;

    setMonthlyPlan((prev) => {
      const dayPlan = prev[dateKey] || {
        routines: [],
        blocked: false,
        note: "",
      };

      if (dayPlan.blocked) {
        try {
          info("Ese día está bloqueado. Desbloquéalo primero.");
        } catch {}
        return prev;
      }

      if (dayPlan.routines.includes(routineId)) {
        try {
          info("Esta rutina ya está asignada a este día");
        } catch {}
        return prev;
      }

      return {
        ...prev,
        [dateKey]: {
          ...dayPlan,
          routines: [...dayPlan.routines, routineId],
        },
      };
    });
  };

  const removeFromMonthDay = (dateKey: string, routineId: string) => {
    setMonthlyPlan((prev) => {
      const dayPlan = prev[dateKey];
      if (!dayPlan) return prev;

      return {
        ...prev,
        [dateKey]: {
          ...dayPlan,
          routines: dayPlan.routines.filter((id) => id !== routineId),
        },
      };
    });
  };

  const toggleBlockMonthDay = (dateKey: string) => {
    setMonthlyPlan((prev) => {
      const dayPlan = prev[dateKey] || {
        routines: [],
        blocked: false,
        note: "",
      };
      return {
        ...prev,
        [dateKey]: {
          ...dayPlan,
          blocked: !dayPlan.blocked,
          routines: dayPlan.blocked ? dayPlan.routines : [], // Limpiar rutinas al bloquear
        },
      };
    });
  };

  const saveMonthDayNote = (dateKey: string, note: string) => {
    setMonthlyPlan((prev) => {
      const dayPlan = prev[dateKey] || {
        routines: [],
        blocked: false,
        note: "",
      };
      return {
        ...prev,
        [dateKey]: {
          ...dayPlan,
          note,
        },
      };
    });
  };

  const toggleBlockWeekDay = (day: DayKey) => {
    setPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        blocked: !prev[day].blocked,
        routines: prev[day].blocked ? prev[day].routines : [], // Limpiar rutinas al bloquear
      },
    }));
  };

  const saveWeekDayNote = (day: DayKey, note: string) => {
    setPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        note,
      },
    }));
  };

  // Memoizar rutinas filtradas para evitar recalcular en cada render
  const filteredRoutines = React.useMemo(() => {
    if (!searchQuery) return routines;
    const query = searchQuery.toLowerCase();
    return routines.filter(
      (r) =>
        (r.name || "").toLowerCase().includes(query) ||
        (r.description || "").toLowerCase().includes(query),
    );
  }, [routines, searchQuery]);

  // Todas las rutinas están disponibles para asignar a cualquier día (pueden repetirse)
  const availableRoutines = filteredRoutines;

  // Memoizar el mapa de rutinas para búsqueda rápida
  const routinesMap = React.useMemo(() => {
    return routines.reduce(
      (acc, r) => ({ ...acc, [r.id]: r }),
      {} as Record<string, (typeof routines)[0]>,
    );
  }, [routines]);

  const addRoutineToDay = (routineId: string, day: DayKey | "") => {
    if (!day) {
      try {
        info("Selecciona un día primero");
      } catch {}
      return;
    }
    if (plan[day]?.blocked) {
      try {
        info(
          "Ese día está bloqueado (descanso). Desbloquéalo primero para agregar rutinas.",
        );
      } catch {}
      return;
    }
    // Verificar si la rutina ya está asignada a ese día
    if (plan[day]?.routines?.includes(routineId)) {
      try {
        info("Esta rutina ya está asignada a este día");
      } catch {}
      return;
    }
    setPlan((prev) => {
      const next = { ...prev } as Plan;
      // Agregar la rutina al día sin eliminarla de otros días (permitir repetición)
      if (!next[day].routines.includes(routineId)) {
        next[day].routines = [...next[day].routines, routineId];
      }
      return next;
    });
    // Cerrar bottom sheet después de agregar
    if (isRoutineSheetOpen) {
      setIsRoutineSheetOpen(false);
      setSelectedDayForQuickAdd(null);
    }
    // NO limpiar la selección para permitir agregar a más días
    // setSelectedDayByRoutine(prev => ({ ...prev, [routineId]: '' }));
  };

  return (
    <div className="mb-6">
      {/* Header — apilado en móvil, fila en desktop */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Planificador</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              try {
                const confirmed = await confirm({
                  title: "Eliminar planificación",
                  message: `Se eliminará toda la planificación ${viewMode === "weekly" ? "semanal" : "mensual"}. Esto no se puede deshacer. ¿Deseas continuar?`,
                  confirmText: "Eliminar definitivamente",
                  cancelText: "Cancelar",
                  variant: "warning",
                });
                if (confirmed) {
                  if (viewMode === "weekly") {
                    clearPlan();
                  } else {
                    setMonthlyPlan({});
                    try {
                      saveMonthlyPlan({});
                    } catch (e) {}
                  }
                  try {
                    info("Planificación eliminada");
                  } catch {}
                }
              } catch (e) {
                // ignore
              }
            }}
          >
            Limpiar
          </Button>
        </div>

        {/* Selector de vista — full-width en móvil */}
        <div className="flex gap-1 bg-gray-800 rounded-xl p-1">
          <button
            onClick={() => setViewMode("weekly")}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === "weekly"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            📅 Semanal
          </button>
          <button
            onClick={() => setViewMode("monthly")}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === "monthly"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🗓️ Mensual
          </button>
        </div>
      </div>

      {/* Vista Mensual */}
      {viewMode === "monthly" ? (
        <>
          <MonthlyCalendar
            currentDate={currentDate}
            monthlyPlan={monthlyPlan}
            weeklyPlan={plan}
            routines={routines}
            onPreviousMonth={goToPreviousMonth}
            onNextMonth={goToNextMonth}
            onToday={goToToday}
            onDayClick={(dateKey) => setSelectedMonthDay(dateKey)}
            isLoading={isLoadingPlan || routinesLoading}
          />

          {/* Modal para gestionar día del mes */}
          {selectedMonthDay && (
            <DayPlanModal
              isOpen={!!selectedMonthDay}
              onClose={() => setSelectedMonthDay(null)}
              dateKey={selectedMonthDay}
              dayPlan={
                monthlyPlan[selectedMonthDay] || {
                  routines: [],
                  blocked: false,
                  note: "",
                }
              }
              routines={routines}
              onAddRoutine={(routineId) =>
                addRoutineToMonthDay(routineId, selectedMonthDay)
              }
              onRemoveRoutine={(routineId) =>
                removeFromMonthDay(selectedMonthDay, routineId)
              }
              onToggleBlock={() => toggleBlockMonthDay(selectedMonthDay)}
              onSaveNote={(note) => saveMonthDayNote(selectedMonthDay, note)}
            />
          )}
        </>
      ) : (
        /* Vista Semanal */
        <>
          {/* Toggle compacto entre modo visualización y edición */}
          <div className="mb-4 flex gap-1 bg-gray-800 rounded-xl p-1">
            <button
              onClick={() => setWeeklyViewMode("view")}
              className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                weeklyViewMode === "view"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              👁️ Visualizar
            </button>
            <button
              onClick={() => setWeeklyViewMode("edit")}
              className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                weeklyViewMode === "edit"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              ✏️ Planificar
            </button>
          </div>

          {/* MODO VISUALIZACIÓN */}
          {weeklyViewMode === "view" ? (
            <div className="space-y-4">
              {/* Vista del día actual (predeterminado) */}
              {!showFullWeek ? (
                <>
                  {(() => {
                    const todayKey = getCurrentDayKey();
                    if (!todayKey) return null;

                    const dayPlan = plan[todayKey];
                    const routineCount = dayPlan?.routines?.length || 0;
                    const isBlocked = dayPlan?.blocked;

                    return (
                      <div className="space-y-4">
                        {/* Tarjeta grande del día actual */}
                        <div
                          className={`relative p-6 rounded-2xl shadow-2xl ${
                            isBlocked
                              ? "bg-linear-to-br from-red-600 to-red-700"
                              : routineCount > 0
                                ? "bg-linear-to-br from-blue-600 to-purple-600"
                                : "bg-linear-to-br from-gray-700 to-gray-800"
                          }`}
                        >
                          {/* Badge HOY */}
                          <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 text-sm font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                            HOY
                          </div>

                          {/* Encabezado */}
                          <div className="mb-6">
                            <div className="text-white/80 text-sm font-medium mb-1">
                              {new Date().toLocaleDateString("es-ES", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">
                              {LABELS[todayKey]}
                            </h2>
                            {isBlocked && (
                              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                <span className="text-lg">🔒</span>
                                <span className="text-white font-semibold">
                                  Día de Descanso
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Contenido */}
                          {isLoadingPlan || routinesLoading ? (
                            <div className="flex items-center justify-center py-8">
                              <svg
                                className="animate-spin h-8 w-8 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                ></path>
                              </svg>
                            </div>
                          ) : isBlocked ? (
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                              <div className="text-6xl mb-4">😴</div>
                              <p className="text-xl text-white font-semibold mb-2">
                                Día de Descanso
                              </p>
                              <p className="text-white/80">
                                Aprovecha para recuperarte
                              </p>
                              {dayPlan?.note && (
                                <div className="mt-4 p-3 bg-white/10 rounded-lg">
                                  <p className="text-sm text-white/90">
                                    📝 {dayPlan.note}
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : routineCount === 0 ? (
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center border border-white/20">
                              <div className="w-20 h-20 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                                <span className="text-5xl">📋</span>
                              </div>
                              <p className="text-2xl text-white font-bold mb-2">
                                Sin Rutinas
                              </p>
                              <p className="text-white/70 mb-6 text-sm">
                                No hay rutinas programadas para hoy
                              </p>
                              <button
                                onClick={() => {
                                  setWeeklyViewMode("edit");
                                  setSelectedWeekDay(todayKey);
                                }}
                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all active:scale-95 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
                              >
                                <Plus className="w-5 h-5" />
                                Planificar Hoy
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {/* Contador de rutinas */}
                              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/20">
                                <div className="text-white/90 font-medium">
                                  {routineCount}{" "}
                                  {routineCount === 1 ? "Rutina" : "Rutinas"}{" "}
                                  Programadas
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                  <span className="text-white font-bold text-lg">
                                    {routineCount}
                                  </span>
                                </div>
                              </div>

                              {/* Lista de rutinas */}
                              {dayPlan.routines.map((rid, index) => {
                                const routine = routinesMap[rid];
                                if (!routine) return null;
                                return (
                                  <div
                                    key={rid}
                                    className="bg-white/15 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all"
                                  >
                                    <div className="flex items-start gap-4">
                                      {/* Número */}
                                      <div className="shrink-0 w-10 h-10 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center">
                                        <span className="text-white font-bold text-lg">
                                          {index + 1}
                                        </span>
                                      </div>

                                      {/* Info de la rutina */}
                                      <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-bold text-lg mb-1">
                                          {routine.name}
                                        </h4>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                          <span className="inline-flex items-center gap-1 text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                                            <span>💪</span>
                                            {routine.exercises.length}{" "}
                                            ejercicios
                                          </span>
                                          {routine.description && (
                                            <span className="text-xs text-white/80 line-clamp-1">
                                              {routine.description}
                                            </span>
                                          )}
                                        </div>

                                        {/* Botón Iniciar / Continuar */}
                                        {activeWorkout?.routineId === routine.id ? (
                                          <button
                                            onClick={() => router.push(`/workout/${routine.id}`)}
                                            className="w-full py-2.5 bg-green-400 text-white hover:bg-green-300 rounded-lg font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg"
                                          >
                                            <Play className="w-4 h-4" />
                                            <span>Continuar Entrenamiento</span>
                                          </button>
                                        ) : activeWorkout ? (
                                          <button
                                            disabled
                                            className="w-full py-2.5 bg-white/50 text-blue-400 rounded-lg font-semibold flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
                                          >
                                            <Play className="w-4 h-4" />
                                            <span>Entrenamiento en curso</span>
                                          </button>
                                        ) : (
                                          <button
                                            onClick={() =>
                                              handleStartRoutine(routine.id)
                                            }
                                            className="w-full py-2.5 bg-white text-blue-600 hover:bg-blue-50 rounded-lg font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg"
                                          >
                                            <Play className="w-4 h-4" />
                                            <span>Iniciar Entrenamiento</span>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Nota del día */}
                              {dayPlan?.note && (
                                <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                                  <div className="flex items-start gap-2">
                                    <span className="text-lg">📝</span>
                                    <p className="text-white/90 text-sm flex-1">
                                      {dayPlan.note}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Botón para editar */}
                          {!isBlocked && routineCount > 0 && (
                            <button
                              onClick={() => setSelectedWeekDay(todayKey)}
                              className="mt-6 w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold rounded-xl transition-all active:scale-95"
                            >
                              Ver Detalles / Editar
                            </button>
                          )}
                        </div>

                        {/* Botón para ver toda la semana */}
                        <button
                          onClick={() => setShowFullWeek(true)}
                          className="w-full py-4 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg border border-slate-600"
                        >
                          <span className="text-lg">📅</span>
                          <span>Ver Toda la Semana</span>
                        </button>
                      </div>
                    );
                  })()}
                </>
              ) : (
                /* Vista de toda la semana */
                <>
                  {/* Botón para volver al día actual */}
                  <button
                    onClick={() => setShowFullWeek(false)}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 mb-4"
                  >
                    <span>👁️</span>
                    <span>Ver Solo Hoy</span>
                  </button>

                  {/* Lista de todos los días */}
                  <div className="space-y-3">
                    {DAYS.map((day) => {
                      const dayPlan = plan[day];
                      const isToday = getCurrentDayKey() === day;
                      const routineCount = dayPlan?.routines?.length || 0;
                      const isBlocked = dayPlan?.blocked;

                      return (
                        <div
                          key={day}
                          onClick={() => setSelectedWeekDay(day)}
                          className={`relative p-4 rounded-xl shadow-lg transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                            isToday
                              ? "bg-linear-to-r from-blue-600 to-blue-500 ring-4 ring-blue-400/50"
                              : isBlocked
                                ? "bg-linear-to-r from-red-900/40 to-red-800/30 border-2 border-red-600/50"
                                : routineCount > 0
                                  ? "bg-linear-to-r from-emerald-900/50 to-emerald-800/40 border-2 border-emerald-500/60"
                                  : "bg-linear-to-r from-gray-800 to-gray-700 border-2 border-gray-600"
                          }`}
                        >
                          {/* Badge "HOY" */}
                          {isToday && (
                            <div className="absolute top-2 right-2 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                              HOY
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            {/* Información del día */}
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3
                                  className={`text-lg font-bold ${isToday ? "text-white" : "text-gray-100"}`}
                                >
                                  {LABELS[day]}
                                </h3>
                                {isBlocked && (
                                  <span className="text-sm bg-red-500 text-white px-2 py-1 rounded-full font-semibold">
                                    🔒 Descanso
                                  </span>
                                )}
                              </div>

                              {/* Rutinas del día */}
                              {isLoadingPlan || routinesLoading ? (
                                <div className="flex items-center gap-2">
                                  <svg
                                    className="animate-spin h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    ></path>
                                  </svg>
                                  <span className="text-sm text-gray-300">
                                    Cargando...
                                  </span>
                                </div>
                              ) : isBlocked ? (
                                <div className="space-y-1">
                                  <p className="text-sm text-red-200">
                                    Día de descanso programado
                                  </p>
                                  {dayPlan?.note && (
                                    <p className="text-xs text-red-300 italic">
                                      📝 {dayPlan.note}
                                    </p>
                                  )}
                                </div>
                              ) : routineCount === 0 ? (
                                <p className="text-sm text-gray-300">
                                  Sin rutinas asignadas
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {dayPlan.routines.map((rid, index) => {
                                    const routine = routinesMap[rid];
                                    if (!routine) return null;
                                    return (
                                      <div
                                        key={rid}
                                        className={`flex items-center gap-3 p-2 rounded-lg ${
                                          isToday
                                            ? "bg-white/20 backdrop-blur-sm"
                                            : "bg-gray-900/40"
                                        }`}
                                      >
                                        <div
                                          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                            isToday
                                              ? "bg-white/30 text-white"
                                              : "bg-emerald-500/30 text-emerald-300"
                                          }`}
                                        >
                                          {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p
                                            className={`text-sm font-semibold truncate ${
                                              isToday
                                                ? "text-white"
                                                : "text-gray-100"
                                            }`}
                                          >
                                            {routine.name}
                                          </p>
                                          <p
                                            className={`text-xs ${
                                              isToday
                                                ? "text-blue-100"
                                                : "text-gray-400"
                                            }`}
                                          >
                                            {routine.exercises.length}{" "}
                                            ejercicios
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  {dayPlan?.note && (
                                    <p className="text-xs text-gray-300 italic mt-2">
                                      📝 {dayPlan.note}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Indicador de cantidad */}
                            <div className="shrink-0 ml-4">
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg ${
                                  isToday
                                    ? "bg-white text-blue-600"
                                    : routineCount > 0
                                      ? "bg-emerald-500 text-white"
                                      : "bg-gray-600 text-gray-400"
                                }`}
                              >
                                {isBlocked ? "🔒" : routineCount}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ) : (
            /* MODO EDICIÓN (código existente) */
            <>
              {/* Tarjetas de días — vertical en móvil, grid en desktop */}
              <div className="mb-2">
                <div className="flex flex-col gap-2 md:grid md:grid-cols-7 md:gap-3">
                  {DAYS.map((day) => {
                    const routineCount = plan[day]?.routines?.length || 0;
                    const isBlocked = plan[day]?.blocked;
                    const isToday = getCurrentDayKey() === day;

                    return (
                      <div
                        key={day}
                        onClick={() => setSelectedWeekDay(day)}
                        onDrop={(e) => onDropToDay(e as any, day)}
                        onDragOver={onDragOver as any}
                        className={`relative p-3 md:p-4 rounded-xl shadow-md md:min-h-40 text-left transition-all active:scale-[0.98] cursor-pointer ${
                          isToday
                            ? "ring-2 ring-blue-400 ring-offset-1 ring-offset-gray-900"
                            : ""
                        } ${
                          isBlocked
                            ? "bg-linear-to-br from-red-900/30 to-red-800/20 border-2 border-red-600/50"
                            : routineCount > 0
                              ? "bg-linear-to-br from-emerald-900/40 to-emerald-800/30 border-2 border-emerald-500/60"
                              : "bg-linear-to-br from-gray-900/60 to-gray-800/50 border-2 border-gray-700"
                        }`}
                      >
                        {/* Badge HOY */}
                        {isToday && (
                          <div className="absolute -top-2 left-3 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg z-10">
                            HOY
                          </div>
                        )}

                        {/* Header del día — fila horizontal en móvil para compactar */}
                        <div className="flex items-center gap-3">
                          {/* Nombre del día */}
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span
                              className={`text-sm font-bold uppercase tracking-wider ${
                                isToday ? "text-blue-300" : "text-gray-300"
                              }`}
                            >
                              {LABELS[day]}
                            </span>
                            {isBlocked && (
                              <span className="text-xs font-bold text-red-300">
                                🔒
                              </span>
                            )}
                          </div>

                          {/* Rutinas inline en móvil */}
                          <div className="flex items-center gap-1.5 md:hidden flex-1 min-w-0 overflow-hidden">
                            {!isBlocked &&
                              !isLoadingPlan &&
                              !routinesLoading &&
                              ((plan[day]?.routines || []).length > 0 ? (
                                <div className="flex items-center gap-1 overflow-hidden">
                                  {(plan[day]?.routines || [])
                                    .slice(0, 2)
                                    .map((rid) => {
                                      const r = routinesMap[rid];
                                      if (!r) return null;
                                      return (
                                        <span
                                          key={rid}
                                          className="text-xs bg-gray-800/60 text-gray-200 px-2 py-0.5 rounded-md truncate max-w-[120px]"
                                        >
                                          {r.name}
                                        </span>
                                      );
                                    })}
                                  {(plan[day]?.routines || []).length > 2 && (
                                    <span className="text-xs text-gray-400">
                                      +{(plan[day]?.routines || []).length - 2}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-500 italic">
                                  Sin rutinas
                                </span>
                              ))}
                            {isBlocked && (
                              <span className="text-xs text-red-300/80">
                                Descanso
                              </span>
                            )}
                          </div>

                          {/* Acciones */}
                          <div className="flex items-center gap-2 shrink-0">
                            {!isBlocked && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDayForQuickAdd(day);
                                  setIsRoutineSheetOpen(true);
                                }}
                                className="p-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg transition-all active:scale-90"
                                title="Agregar rutina rápida"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            )}
                            <span
                              className={`text-sm font-bold min-w-[32px] text-center px-2.5 py-1.5 rounded-full shadow-lg ${
                                routineCount > 0
                                  ? "bg-emerald-500 text-white"
                                  : "bg-gray-700/80 text-gray-400"
                              }`}
                            >
                              {routineCount}
                            </span>
                          </div>
                        </div>

                        {/* Contenido expandido — solo visible en desktop */}
                        <div className="hidden md:block mt-3 border-t border-gray-700/50 pt-3">
                          {plan[day]?.blocked ? (
                            <div className="space-y-2">
                              <div className="p-3 rounded-md bg-linear-to-r from-red-900/10 to-red-900/5 border border-red-700/20 overflow-auto max-h-24">
                                <p className="text-sm font-semibold text-red-300">
                                  Día de descanso
                                </p>
                                {plan[day]?.note ? (
                                  <p className="text-xs text-gray-300 mt-1">
                                    {plan[day].note}
                                  </p>
                                ) : (
                                  <p className="text-xs text-gray-300 mt-1">
                                    Sin nota
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : isLoadingPlan || routinesLoading ? (
                            <div className="flex items-center justify-center py-6">
                              <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                ></path>
                              </svg>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {(plan[day]?.routines || []).map((rid) => {
                                const r = routinesMap[rid];
                                if (!r) return null;
                                return (
                                  <div
                                    key={rid}
                                    className="flex items-center gap-2 bg-gray-800/40 hover:bg-gray-700/50 p-2 rounded-md border border-gray-700 transition-colors text-left"
                                    title={r.name}
                                  >
                                    <p className="text-xs text-gray-100 truncate flex-1 min-w-0">
                                      {r.name}
                                    </p>
                                  </div>
                                );
                              })}
                              {plan[day]?.note && (
                                <div className="text-xs text-gray-300 italic truncate">
                                  📝 {plan[day].note}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Sheet para rutinas (móvil) */}
              <BottomSheet
                isOpen={isRoutineSheetOpen}
                onClose={() => {
                  setIsRoutineSheetOpen(false);
                  setSelectedDayForQuickAdd(null);
                }}
                title={
                  selectedDayForQuickAdd
                    ? `Agregar a ${LABELS[selectedDayForQuickAdd]}`
                    : "Selecciona una rutina"
                }
                maxHeight="85vh"
              >
                <div className="p-4">
                  {selectedDayForQuickAdd && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        📅 Agregando a:{" "}
                        <span className="font-bold">
                          {LABELS[selectedDayForQuickAdd]}
                        </span>
                      </p>
                    </div>
                  )}

                  {isLoadingPlan || routinesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <svg
                        className="animate-spin h-8 w-8 text-blue-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                    </div>
                  ) : availableRoutines.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">🏋️</div>
                      <p className="text-gray-500 dark:text-gray-400">
                        No hay rutinas disponibles
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {availableRoutines.map((r) => {
                        const alreadyAdded = !!(
                          selectedDayForQuickAdd &&
                          plan[selectedDayForQuickAdd]?.routines?.includes(r.id)
                        );
                        const displayName =
                          r.name.length > 35
                            ? r.name.substring(0, 35) + "..."
                            : r.name;

                        return (
                          <button
                            key={r.id}
                            onClick={() => {
                              if (selectedDayForQuickAdd) {
                                addRoutineToDay(r.id, selectedDayForQuickAdd);
                              } else {
                                // Si no hay día seleccionado, mostrar selector
                                setSelectedDayByRoutine((prev) => ({
                                  ...prev,
                                  [r.id]: "",
                                }));
                              }
                            }}
                            disabled={alreadyAdded}
                            title={r.name}
                            className={`w-full text-left p-3 rounded-lg transition-all ${
                              alreadyAdded
                                ? "bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 opacity-60 cursor-not-allowed"
                                : "bg-linear-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg active:scale-[0.98]"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {!alreadyAdded && (
                                <div className="shrink-0">
                                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <Plus className="w-5 h-5 text-white" />
                                  </div>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div
                                  className={`font-semibold mb-0.5 ${alreadyAdded ? "text-gray-700 dark:text-gray-300" : "text-white"}`}
                                >
                                  {displayName}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                      alreadyAdded
                                        ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                        : "bg-white/20 text-white backdrop-blur-sm"
                                    }`}
                                  >
                                    {r.exercises.length} ejercicios
                                  </span>
                                  {alreadyAdded && (
                                    <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-medium">
                                      ✓ Agregada
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </BottomSheet>

              {/* Desktop: Rutinas disponibles */}
              <div className="mt-4 hidden md:block">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-300">
                    Rutinas disponibles
                  </h3>
                  <span className="text-xs text-gray-500">
                    Arrastra al día o usa el selector
                  </span>
                </div>

                <div className="max-h-72 overflow-auto rounded-xl border border-gray-700/50 bg-gray-800/30 p-3">
                  {isLoadingPlan || routinesLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <svg
                        className="animate-spin h-6 w-6 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                      <span className="ml-2 text-sm text-gray-500">
                        Cargando rutinas...
                      </span>
                    </div>
                  ) : availableRoutines.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="text-3xl mb-2">🏋️</div>
                      <p className="text-sm text-gray-500">
                        No se encontraron rutinas
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {availableRoutines.map((r) => (
                        <div
                          key={r.id}
                          draggable
                          onDragStart={(e) => onDragStart(e, r.id)}
                          className="group flex items-center gap-3 p-3 rounded-lg bg-gray-900/50 border border-gray-700/50 hover:border-gray-600 hover:bg-gray-800/60 transition-all cursor-grab active:cursor-grabbing"
                        >
                          {/* Drag handle */}
                          <div className="text-gray-500 group-hover:text-gray-300 shrink-0 transition-colors">
                            <GripVertical className="w-4 h-4" />
                          </div>

                          {/* Info de la rutina */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-gray-100 truncate">
                                {r.name}
                              </span>
                              <span className="shrink-0 text-xs text-gray-400 px-2 py-0.5 bg-gray-800 rounded-full border border-gray-700">
                                {r.exercises.length} ej.
                              </span>
                            </div>
                            {r.description && (
                              <p className="text-xs text-gray-500 truncate mt-0.5">
                                {r.description}
                              </p>
                            )}
                          </div>

                          {/* Selector de día + botón agregar */}
                          <div className="flex items-center gap-2 shrink-0">
                            <select
                              value={selectedDayByRoutine[r.id] ?? ""}
                              onChange={(e) =>
                                setSelectedDayByRoutine((prev) => ({
                                  ...prev,
                                  [r.id]: e.target.value as DayKey | "",
                                }))
                              }
                              className="px-3 py-1.5 bg-gray-800 border border-gray-700 text-sm text-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 min-w-[130px]"
                              aria-label={`Seleccionar día para ${r.name}`}
                            >
                              <option value="">Día...</option>
                              {DAYS.map((d) => {
                                const alreadyAdded =
                                  Array.isArray(plan[d]?.routines) &&
                                  plan[d].routines.includes(r.id);
                                const isBlocked = !!plan[d]?.blocked;
                                if (isBlocked) return null;
                                return (
                                  <option key={d} value={d}>
                                    {LABELS[d]}
                                    {alreadyAdded ? " ✓" : ""}
                                  </option>
                                );
                              })}
                            </select>

                            <button
                              aria-label={`Agregar ${r.name} al día seleccionado`}
                              onClick={() =>
                                addRoutineToDay(
                                  r.id,
                                  (selectedDayByRoutine[r.id] ?? "") as
                                    | DayKey
                                    | "",
                                )
                              }
                              disabled={!selectedDayByRoutine[r.id]}
                              className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                                selectedDayByRoutine[r.id]
                                  ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md active:scale-95"
                                  : "bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed"
                              }`}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Modal para gestionar día de la semana - DISPONIBLE EN TODOS LOS MODOS */}
      {selectedWeekDay && (
        <DayPlanModal
          isOpen={!!selectedWeekDay}
          onClose={() => setSelectedWeekDay(null)}
          dateKey={selectedWeekDay}
          dayPlan={plan[selectedWeekDay]}
          routines={routines}
          onAddRoutine={(routineId) =>
            addRoutineToDay(routineId, selectedWeekDay)
          }
          onRemoveRoutine={(routineId) =>
            removeFromDay(selectedWeekDay, routineId)
          }
          onToggleBlock={() => toggleBlockWeekDay(selectedWeekDay)}
          onSaveNote={(note) => saveWeekDayNote(selectedWeekDay, note)}
          isWeeklyView={true}
        />
      )}
    </div>
  );
}
