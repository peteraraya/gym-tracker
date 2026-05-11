"use client";

// Evita prerender estático para esta página (usa hooks de navegación del cliente)
export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGym } from "@/context/GymContext";
import { useWorkout } from "@/context/WorkoutContext";
import { useToast, useConfirm } from "@/context/NotificationContext";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { RoutineForm } from "@/components/RoutineForm";
import RoutineWizard from "@/components/RoutineWizard";
import WeeklyPlanner from "@/components/WeeklyPlanner";
import ProtectedRoute from "@/components/ProtectedRoute";
import { generateRoutine } from "@/lib/routineGenerator";
import {
  Plus,
  ClipboardList,
  Zap,
  Play,
  Pencil,
  Trash2,
  Copy,
  Flame,
  Dumbbell,
} from "@/components/icons/lucide";
import { useTranslations } from "@/context/LocaleContext";
import { PageHeader, PageLayout, PageContent } from "@/layouts";
import {
  RoutineCard,
  EmptyStateCard,
  SearchInput,
  LoadingSpinner,
  CardGrid,
} from "@/components/shared";
import { usePlanning } from "@/hooks/usePlanning";
import { GOAL_LABELS, DAYS, DAY_LABELS_SHORT } from "@/types/planning";
import Link from "next/link";

export default function RoutinesPage() {
  const router = useRouter();
  const { routines, deleteRoutine, loading, addRoutine } = useGym();
  const { startWorkout, isWorkoutActive, activeWorkout } = useWorkout();
  const { success, error } = useToast();
  const { confirm } = useConfirm();
  const t = useTranslations("routines");
  const planning = usePlanning();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>("");
  // ✅ FASE 3 - Problema #17: Debounce para searchFilter
  const [debouncedSearchFilter, setDebouncedSearchFilter] =
    useState<string>("");

  // Debounce del searchFilter para evitar recalcular filteredRoutines en cada tecla
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchFilter(searchFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchFilter]);

  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [startingWorkoutId, setStartingWorkoutId] = useState<string | null>(
    null,
  );

  const handleEdit = useCallback((id: string) => {
    setEditingRoutine(id);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingRoutine(null);
  }, []);

  const handleWizardComplete = async (data: any) => {
    try {
      // Generar rutinas usando el generador inteligente (ahora retorna array)
      const generatedRoutines = await generateRoutine(data);

      // Agregar todas las rutinas al contexto
      for (const generatedRoutine of generatedRoutines) {
        // Remover campos que addRoutine no espera (id, createdAt, updatedAt)
        const { id, createdAt, updatedAt, ...routineData } = generatedRoutine;
        await addRoutine(routineData);
      }

      setIsWizardOpen(false);
      success(
        `¡${generatedRoutines.length} rutina(s) creada(s) exitosamente! Puedes editarlas si lo deseas.`,
      );
    } catch (err) {
      console.error("Error generating routine:", err);
      error("Error al generar la rutina. Intenta de nuevo.");
    }
  };

  // Abrir modal si la URL contiene ?create=1 (lee desde window para evitar hooks de navegación en prerender)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("create") === "1") {
      setIsModalOpen(true);
    }

    // Inicializar filtro desde localStorage (escrito por WeeklyPlanner)
    try {
      const stored = localStorage.getItem("weekly_routines_search") || "";
      setSearchFilter(stored);
    } catch (e) {}
  }, []);

  // Escuchar cambios en localStorage para sincronizar el filtro (cuando se modifica desde WeeklyPlanner)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (e: StorageEvent) => {
      if (e.key === "weekly_routines_search") {
        setSearchFilter(e.newValue || "");
      }
    };

    const customHandler = (e: CustomEvent) => {
      setSearchFilter(e.detail || "");
    };

    window.addEventListener("storage", handler);
    window.addEventListener(
      "weekly_routines_search_changed",
      customHandler as EventListener,
    );

    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener(
        "weekly_routines_search_changed",
        customHandler as EventListener,
      );
    };
  }, []);

  const handleDelete = async (id: string) => {
    // Encontrar el nombre de la rutina para mostrarlo en la confirmación
    const routine = routines.find((r) => r.id === id);
    const routineName = routine?.name || "esta rutina";

    const confirmed = await confirm({
      title: t("confirmDelete.title"),
      message: `${t("confirmDelete.message")} "${routineName}"? Esta acción no se puede deshacer.`,
      confirmText: t("confirmDelete.confirmText"),
      cancelText: t("confirmDelete.cancelText"),
      variant: "danger",
    });

    if (confirmed) {
      try {
        await deleteRoutine(id);
        success(t("toast.deleteSuccess"));
      } catch (err) {
        console.error("Error deleting routine:", err);
        error(t("toast.deleteError"));
      }
    }
  };

  const handleDuplicate = useCallback(
    async (id: string) => {
      if (duplicatingId) return; // Evitar duplicaciones múltiples

      try {
        const routineToDuplicate = routines.find((r) => r.id === id);
        if (!routineToDuplicate) {
          error("Rutina no encontrada");
          return;
        }

        const confirmed = await confirm({
          title: "Duplicar Rutina",
          message: `¿Deseas crear una copia de "${routineToDuplicate.name}"?`,
          confirmText: "Duplicar",
          cancelText: "Cancelar",
        });

        if (confirmed) {
          setDuplicatingId(id);

          // Toast de progreso
          success("⏳ Duplicando rutina...");

          // Pequeño delay para que el usuario vea el feedback
          await new Promise((resolve) => setTimeout(resolve, 300));

          const duplicatedRoutine = {
            ...routineToDuplicate,
            id: `routine_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            name: `${routineToDuplicate.name} (Copia)`,
            exercises: routineToDuplicate.exercises.map((ex) => ({
              ...ex,
              id: `exercise_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            })),
          };

          await addRoutine(duplicatedRoutine);

          // Toast de éxito
          success("✅ Rutina duplicada exitosamente");

          try {
            if (typeof window !== "undefined" && (window as any).gtag) {
              (window as any).gtag("event", "routine_duplicated", {
                routine_name: routineToDuplicate.name,
              });
            }
          } catch (e) {
            // ignore analytics errors
          }
        }
      } catch (e) {
        console.error("Error duplicating routine:", e);
        error("❌ Error al duplicar la rutina");
      } finally {
        setDuplicatingId(null);
      }
    },
    [duplicatingId, routines, confirm, addRoutine, success, error],
  );

  const handleStartWorkout = useCallback(
    async (routineId: string) => {
      if (startingWorkoutId) return; // Prevenir clicks múltiples

      try {
        // Si hay un workout activo, preguntar si quiere cancelarlo
        if (isWorkoutActive && activeWorkout?.routineId !== routineId) {
          const confirmed = await confirm({
            title: t("confirmActive.title"),
            message: t("confirmActive.message"),
            confirmText: t("confirmActive.confirmText"),
            cancelText: t("confirmActive.cancelText"),
            variant: "warning",
          });

          if (!confirmed) {
            return;
          }
        }

        const routine = routines.find((r) => r.id === routineId);
        if (routine) {
          setStartingWorkoutId(routineId);
          startWorkout(routine);
          router.push(`/workout/${routineId}`);
        }
      } catch (e) {
        console.error("Error starting workout:", e);
        setStartingWorkoutId(null);
      }
    },
    [
      startingWorkoutId,
      isWorkoutActive,
      activeWorkout,
      routines,
      confirm,
      startWorkout,
      router,
      t,
    ],
  );

  // Filtrado optimizado con useMemo
  const filteredRoutines = useMemo(() => {
    if (!searchFilter.trim()) return routines;
    const query = searchFilter.toLowerCase();
    return routines.filter(
      (r) =>
        (r.name || "").toLowerCase().includes(query) ||
        (r.description || "").toLowerCase().includes(query),
    );
  }, [routines, searchFilter]);

  return (
    <ProtectedRoute>
      <PageLayout>
        <PageHeader
          title={t("title")}
          subtitle={t("subtitle")}
          icon={<ClipboardList className="w-7 h-7 text-white" />}
          gradient="from-slate-700 via-slate-800 to-gray-900"
          actions={
            <>
              <Button
                variant="secondary"
                onClick={() => setIsWizardOpen(true)}
                className="w-full sm:w-auto bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm shadow-md"
              >
                <Zap className="w-4 h-4" />
                Asistente
              </Button>
              <Button
                variant="primary"
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto bg-white text-slate-800 hover:bg-white/90 shadow-md font-semibold"
              >
                <Plus className="w-4 h-4" />
                {t("newRoutine")}
              </Button>
            </>
          }
        />

        <PageContent>
          {/* Banner de mesociclo activo */}
          {planning.activeMesocycle &&
            (() => {
              const currentWeek = planning.getCurrentWeekPlan();
              const todayKey = (
                [
                  "sunday",
                  "monday",
                  "tuesday",
                  "wednesday",
                  "thursday",
                  "friday",
                  "saturday",
                ] as const
              )[new Date().getDay()];
              const todaySchedule = currentWeek?.dailySchedule?.[todayKey];
              const todayRoutines = (todaySchedule?.routineIds ?? [])
                .map((id) => routines.find((r) => r.id === id))
                .filter(Boolean);
              return (
                <div className="mb-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-900/10 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl">📅</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          Mesociclo activo
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full font-medium">
                          {GOAL_LABELS[planning.activeMesocycle.goal]}
                        </span>
                        {currentWeek && (
                          <span className="text-xs text-gray-500">
                            Sem. {currentWeek.weekNumber}/
                            {planning.activeMesocycle.weeks}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                        {planning.activeMesocycle.name}
                      </p>
                      {todaySchedule?.isRest ? (
                        <p className="text-xs text-purple-500">
                          💤 Hoy es día de descanso según tu planificación
                        </p>
                      ) : todayRoutines.length > 0 ? (
                        <p className="text-xs text-gray-500">
                          Hoy ({DAY_LABELS_SHORT[todayKey]}):{" "}
                          {todayRoutines.map((r) => r!.name).join(", ")}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400">
                          Sin rutina asignada para hoy
                        </p>
                      )}
                    </div>
                  </div>
                  <Link
                    href="/planning"
                    className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
                  >
                    Ver planificación →
                  </Link>
                </div>
              );
            })()}

          {/* Weekly Planner */}
          <div className="mb-6">
            <WeeklyPlanner searchQuery={debouncedSearchFilter} />
          </div>

          {/* Search */}
          <div className="mb-6">
            <SearchInput
              value={searchFilter}
              onChange={(v) => {
                setSearchFilter(v);
                try {
                  localStorage.setItem("weekly_routines_search", v);
                  try {
                    window.dispatchEvent(
                      new CustomEvent("weekly_routines_search_changed", {
                        detail: v,
                      }),
                    );
                  } catch (e) {}
                } catch (e) {}
              }}
              placeholder="🔍 Buscar rutinas por nombre o descripción..."
            />
          </div>
          {/* Content */}
          {loading ? (
            <LoadingSpinner
              size="lg"
              message={t("loading")}
              className="py-20"
            />
          ) : routines.length === 0 ? (
            <EmptyStateCard
              icon={<ClipboardList className="w-12 h-12" />}
              title={t("empty.title")}
              description={t("empty.description")}
              actionLabel={t("empty.createButton")}
              onAction={() => setIsModalOpen(true)}
              secondaryActionLabel="Asistente"
              onSecondaryAction={() => setIsWizardOpen(true)}
            />
          ) : filteredRoutines.length === 0 ? (
            <EmptyStateCard
              icon="🔍"
              title="No se encontraron rutinas"
              description="Intenta con otro término de búsqueda"
              actionLabel="Limpiar búsqueda"
              onAction={() => setSearchFilter("")}
            />
          ) : (
            <CardGrid cols={3}>
              {filteredRoutines.map((routine) => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  isActive={activeWorkout?.routineId === routine.id}
                  isStarting={startingWorkoutId === routine.id}
                  isDuplicating={duplicatingId === routine.id}
                  onStart={handleStartWorkout}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                />
              ))}
            </CardGrid>
          )}

          {/* Floating Free Workout button */}
          <div className="fixed top-6 right-4 sm:bottom-8 sm:right-6 z-40">
            <button
              onClick={() => router.push("/workout/free")}
              aria-label="Entrenamiento Libre - Entrena sin rutina predefinida"
              title="Entrenamiento Libre"
              className="group flex items-center justify-center gap-2 px-5 py-4 sm:w-14 sm:h-14 sm:p-0 rounded-full bg-linear-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              <span className="text-sm font-semibold sm:hidden">Libre</span>
            </button>
          </div>

          {/* Modals */}
          <Modal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            title={editingRoutine ? t("modal.editTitle") : t("modal.newTitle")}
            closeOnClickOutside={false}
            closeOnEscape={false}
          >
            <RoutineForm
              routineId={editingRoutine}
              onClose={handleCloseModal}
            />
          </Modal>

          {isWizardOpen && (
            <RoutineWizard
              onComplete={handleWizardComplete}
              onCancel={() => setIsWizardOpen(false)}
            />
          )}
        </PageContent>
      </PageLayout>
    </ProtectedRoute>
  );
}
