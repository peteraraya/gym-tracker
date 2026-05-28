"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useGym } from "@/context/GymContext";
import { useToast } from "@/context/NotificationContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { SessionFilters } from "@/components/features/sessions/SessionFilters";
import { SessionComparison } from "@/components/features/sessions/SessionComparison";
import { EditSessionModal } from "@/components/features/sessions/EditSessionModal";
import { Pagination } from "@/components/shared/Pagination";
import { usePagination } from "@/hooks/ui/usePagination";
import type { WorkoutSession, Routine } from "@/types";
import * as storageService from "@/lib/storage/storage";
import { useConfirm } from "@/context/NotificationContext";
import { useLocale } from "@/context/LocaleContext";
import { useWorkout } from "@/context/WorkoutContext";
import { Calendar, Filter } from "@/components/icons/lucide";
import { getWeekStart } from '@/lib/utils/dateUtils';
import { PageHeader, PageLayout, PageContent } from "@/layouts";
import {
  EmptyStateCard,
  SessionCard as SharedSessionCard,
} from "@/components/shared";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ListItemSkeleton } from "@/components/ui/Skeleton";
import type { WorkoutSession as WS } from "@/types";

const SESSIONS_PER_PAGE = 10;

// ── Timeline helpers ─────────────────────────────────────────────────────────
function getMondayOf(date: Date): Date {
  return getWeekStart(date, 'monday');
}

function weekLabel(monday: Date): string {
  const today = getMondayOf(new Date());
  const diffMs = today.getTime() - monday.getTime();
  const diffWeeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
  if (diffWeeks === 0) return "Esta semana";
  if (diffWeeks === 1) return "Semana pasada";
  const end = new Date(monday);
  end.setDate(monday.getDate() + 6);
  return `${monday.getDate()} – ${end.getDate()} ${end.toLocaleDateString("es-ES", { month: "short" })}`;
}

function groupSessionsByWeek(items: WS[]): Array<{ label: string; sessions: WS[] }> {
  const map = new Map<string, { monday: Date; sessions: WS[] }>();
  for (const s of items) {
    const monday = getMondayOf(new Date(s.date));
    const key = monday.toISOString();
    if (!map.has(key)) map.set(key, { monday, sessions: [] });
    map.get(key)!.sessions.push(s);
  }
  return Array.from(map.values())
    .sort((a, b) => b.monday.getTime() - a.monday.getTime())
    .map(({ monday, sessions }) => ({ label: weekLabel(monday), sessions }));
}
// ─────────────────────────────────────────────────────────────────────────────

interface FilterState {
  searchTerm: string;
  selectedRoutine: string;
  dateRange: "all" | "week" | "month" | "3months";
}

const DEFAULT_FILTERS: FilterState = {
  searchTerm: "",
  selectedRoutine: "all",
  dateRange: "all",
};

function applyFilters(
  sessions: WorkoutSession[],
  routines: Routine[],
  filters: FilterState,
): WorkoutSession[] {
  let filtered = [...sessions];

  if (filters.searchTerm) {
    const lowerSearch = filters.searchTerm.toLowerCase();
    filtered = filtered.filter((session) => {
      const routineName =
        routines.find((r) => r.id === session.routineId)?.name?.toLowerCase() ||
        "";
      const hasExercise =
        session.exercises?.some((ex) =>
          ex.exerciseName?.toLowerCase().includes(lowerSearch),
        ) || false;
      const hasNote =
        session.notes?.toLowerCase().includes(lowerSearch) || false;
      return routineName.includes(lowerSearch) || hasExercise || hasNote;
    });
  }

  if (filters.selectedRoutine !== "all") {
    filtered = filtered.filter(
      (session) => session.routineId === filters.selectedRoutine,
    );
  }

  if (filters.dateRange !== "all") {
    const now = new Date();
    let daysBack = 0;
    switch (filters.dateRange) {
      case "week":
        daysBack = 7;
        break;
      case "month":
        daysBack = 30;
        break;
      case "3months":
        daysBack = 90;
        break;
    }
    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    filtered = filtered.filter(
      (session) => new Date(session.date) >= cutoffDate,
    );
  }

  return filtered;
}

function SessionDetailContent({ session, routines }: { session: WS; routines: Routine[] }) {
  const formatDuration = (s?: number) => {
    if (!s) return null;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };
  const routine = routines.find((r) => r.id === session.routineId);
  const dur = formatDuration(session.totalDuration);
  const vol = session.totalVolume ?? 0;

  return (
    <div className="p-4 space-y-4">
      {/* Meta */}
      <div className="flex flex-wrap gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <span>{new Date(session.date).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
        {dur && <span>· {dur}</span>}
        {vol > 0 && <span>· {vol >= 1000 ? `${(vol / 1000).toFixed(1)}t` : `${vol}kg`}</span>}
        {!routine && <span className="text-red-500">· Rutina eliminada</span>}
      </div>

      {/* Exercises */}
      <div className="space-y-3">
        {session.exercises.map((ex, i) => {
          const sets = ex.actualReps?.length ?? ex.completedSets ?? 0;
          return (
            <div key={i} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">{ex.exerciseName || "Ejercicio"}</p>
                <span className="text-xs text-zinc-400">{sets} serie{sets !== 1 ? "s" : ""}</span>
              </div>
              {ex.actualReps && ex.actualReps.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {ex.actualReps.map((reps, si) => {
                    const w = ex.actualWeight?.[si];
                    return (
                      <span key={si} className="text-xs px-2 py-0.5 bg-white dark:bg-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-600">
                        {reps} rep{w ? ` × ${w}kg` : ""}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Notes */}
      {session.notes && (
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-900 dark:text-amber-200">📝 {session.notes}</p>
        </div>
      )}
    </div>
  );
}

export default function SessionsPage() {
  const {
    sessions: serverSessions,
    routines,
    loading,
    updateSession,
    deleteSession,
    refreshRoutines,
  } = useGym();
  const { success, error: showError } = useToast();
  const { confirm } = useConfirm();
  const { t } = useLocale();
  const tS = useCallback((key: string) => t(`sessions.${key}`), [t]);

  const { updateModifiedRoutine } = useWorkout();

  const [localSessions, setLocalSessions] = useState<WorkoutSession[]>([]);
  const [editingSession, setEditingSession] = useState<WorkoutSession | null>(
    null,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingSession, setViewingSession] = useState<WorkoutSession | null>(null);
  const [hideDeletedRoutines, setHideDeletedRoutines] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const all = await storageService.getSessions();
        const map = new Map<string, WorkoutSession>();
        const keyFor = (s: WorkoutSession) =>
          s.id || `${s.date}-${s.routineId}`;
        (all || []).forEach((s) => map.set(keyFor(s), s));
        if (mounted) setLocalSessions(Array.from(map.values()));
      } catch (err) {
        console.warn("Error loading local sessions:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const sessions = useMemo(() => {
    const serverById = new Map<string, WorkoutSession>();
    serverSessions.forEach((s) => {
      if (s.id) serverById.set(s.id, s);
    });

    const merged: WorkoutSession[] = [];
    serverSessions.forEach((s) => merged.push(s));
    localSessions.forEach((s) => {
      if (s.id && serverById.has(s.id)) return;
      merged.push(s);
    });

    return merged.map((s, idx) => ({
      ...s,
      id: s.id || `__local_${idx}_${new Date(s.date).getTime()}`,
    }));
  }, [serverSessions, localSessions]);

  const displayedSessions = useMemo(() => {
    if (!hideDeletedRoutines) return sessions;
    return sessions.filter((s) => routines.some((r) => r.id === s.routineId));
  }, [sessions, hideDeletedRoutines, routines]);

  const filteredSessions = useMemo(() => {
    return applyFilters(displayedSessions, routines, filters);
  }, [displayedSessions, routines, filters]);

  const pagination = usePagination({
    items: filteredSessions,
    pageSize: SESSIONS_PER_PAGE,
  });

  const handleEditSession = (session: WorkoutSession) => {
    setEditingSession(session);
    setIsEditModalOpen(true);
  };

  const handleViewSession = (session: WorkoutSession) => {
    setViewingSession(session);
  };

  const handleSaveSession = async (updatedSession: WorkoutSession) => {
    try {
      await updateSession(updatedSession);
      success(tS("toast.updateSuccess"));
      setIsEditModalOpen(false);
      setEditingSession(null);
    } catch (err) {
      console.error("Error updating session:", err);
      showError(tS("toast.updateError"));
    }
  };

  const handleDeleteSession = async (session: WorkoutSession) => {
    const routineName =
      routines.find((r) => r.id === session.routineId)?.name ??
      tS("routineDeleted");
    const sessionDate = new Date(session.date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const confirmed = await confirm({
      title: tS("confirmDelete.title"),
      message: `${tS("confirmDelete.message")} "${routineName}" del ${sessionDate}${tS("confirmDelete.suffix")}`,
      confirmText: tS("confirmDelete.confirmText"),
      cancelText: tS("confirmDelete.cancelText"),
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      await deleteSession(session.id);
      success(tS("toast.deleteSuccess"));
    } catch (err) {
      console.error("Error deleting session:", err);
      showError(tS("toast.deleteError"));
    }
  };

  const handleSyncRoutine = async (session: WorkoutSession) => {
    if (!session.routineId) {
      showError(tS('noRoutineFound'));
      return;
    }

    const routine = routines.find((r) => r.id === session.routineId);
    if (!routine) {
      showError(tS('routineDeleted'));
      return;
    }

    const confirmed = await confirm({
      title: t('sessions.confirmSync.title'),
      message: t('sessions.confirmSync.message').replace('{routineName}', routine.name),
      confirmText: t('sessions.confirmSync.confirmText'),
      cancelText: t('sessions.confirmSync.cancelText'),
    });

    if (!confirmed) return;

    try {
      const updatedExercises = routine.exercises.map((ex) => {
        const se = session.exercises.find(
          (s) => String(s.exerciseId) === String(ex.id) || s.exerciseName === ex.name,
        );
        const origSets = ex.sets || [];
        const seReps = se?.actualReps || [];
        const seWeights = se?.actualWeight || [];
        const maxLen = Math.max(origSets.length, seReps.length);
        const newSets = [] as any[];
        for (let i = 0; i < maxLen; i++) {
          const orig = origSets[i] || { reps: 0, weight: 0, type: undefined, notes: undefined };
          const reps = (seReps[i] !== undefined && seReps[i] !== null) ? seReps[i] : orig.reps;
          // Solo usar el peso de la sesión si es mayor que 0; de lo contrario conservar
          // el peso definido en la rutina para evitar borrar pesos con un valor vacío/0.
          const weight = (seWeights[i] !== undefined && seWeights[i] !== null && seWeights[i] > 0) ? seWeights[i] : (orig.weight || 0);
          // `restBetweenSets` pertenece al ejercicio, no a la serie. No incluirla en el objeto Set.
          newSets.push({ reps, weight, type: orig.type, notes: orig.notes });
        }
        return { ...ex, sets: newSets };
      });

      const updatedRoutine = {
        ...routine,
        exercises: updatedExercises.map((ex) => ({
          id: ex.id,
          name: ex.name,
          sets: ex.sets.map((s: any) => ({ reps: s.reps, weight: s.weight || 0, type: s.type, notes: s.notes })),
          notes: ex.notes,
          equipment: ex.equipment,
          technique: ex.technique,
          recommendedSets: ex.recommendedSets,
          recommendedReps: ex.recommendedReps,
          restTime: ex.restTime,
          restBetweenSets: ex.restBetweenSets,
          useSmartRest: ex.useSmartRest,
        })),
      } as any;

      await updateModifiedRoutine(updatedRoutine);
      // Refrescar la lista de rutinas en el contexto global
      try { await refreshRoutines(); } catch {}

      success(t('sessions.toast.syncSuccess'));
    } catch (err) {
      console.error('Error sincronizando rutina desde sesión', err);
      showError(t('sessions.toast.syncError'));
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <PageLayout>
          <PageHeader
            title="Historial de Sesiones"
            subtitle="Revisa y analiza tus entrenamientos anteriores"
            icon={<Calendar className="w-7 h-7 text-white" />}
            gradient="from-indigo-600 to-violet-600"
          />
          <PageContent>
            <div className="space-y-4 max-w-3xl mx-auto mt-4">
              <ListItemSkeleton />
              <ListItemSkeleton />
              <ListItemSkeleton />
              <ListItemSkeleton />
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
          title="Historial de Sesiones"
          subtitle="Revisa y analiza tus entrenamientos anteriores"
          icon={<Calendar className="w-7 h-7 text-white" />}
          gradient="from-indigo-600 to-violet-600"
        >
          {/* Quick stats */}
          {sessions.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <div className="text-sm text-white/80 font-medium">
                  {tS("totalSessions")}
                </div>
                <div className="text-2xl font-bold text-white mt-1">
                  {sessions.length}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <div className="text-sm text-white/80 font-medium">
                  {tS("filtered")}
                </div>
                <div className="text-2xl font-bold text-white mt-1">
                  {filteredSessions.length}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <div className="text-sm text-white/80 font-medium">
                  {tS("uniqueRoutines")}
                </div>
                <div className="text-2xl font-bold text-white mt-1">
                  {new Set(filteredSessions.map((s) => s.routineId)).size}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <div className="text-sm text-white/80 font-medium">
                  {tS("thisMonth")}
                </div>
                <div className="text-2xl font-bold text-white mt-1">
                  {
                    filteredSessions.filter((s) => {
                      const date = new Date(s.date);
                      const now = new Date();
                      return (
                        date.getMonth() === now.getMonth() &&
                        date.getFullYear() === now.getFullYear()
                      );
                    }).length
                  }
                </div>
              </div>
            </div>
          )}

        </PageHeader>

        <PageContent>
          {sessions.length === 0 ? (
            <EmptyStateCard
              icon="📊"
              title="No hay sesiones registradas"
              description="Completa tu primera rutina para ver tu historial aquí"
            />
          ) : (
            <>
              {/* Toolbar: filtros mobile + comparación */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <button
                  onClick={() => setIsFilterSheetOpen(true)}
                  className="lg:hidden flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Filtros
                  {(filters.searchTerm || filters.selectedRoutine !== "all" || filters.dateRange !== "all") && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  )}
                </button>
                <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hideDeletedRoutines}
                    onChange={(e) => setHideDeletedRoutines(e.target.checked)}
                    className="form-checkbox h-4 w-4 text-blue-600 rounded"
                  />
                  <span>Ocultar eliminadas</span>
                </label>
                {filteredSessions.length > 1 && (
                  <SessionComparison
                    sessions={filteredSessions}
                    routines={routines}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Filters sidebar — solo desktop */}
                <div className="hidden lg:block lg:col-span-1">
                  <div className="sticky top-4">
                    <SessionFilters
                      routines={routines}
                      totalSessions={displayedSessions.length}
                      filteredCount={filteredSessions.length}
                      filters={filters}
                      onFilterChange={setFilters}
                    />
                  </div>
                </div>

                {/* Session list */}
                <div className="lg:col-span-3">
                  {filteredSessions.length === 0 ? (
                    <EmptyStateCard
                      icon="🔍"
                      title="No se encontraron sesiones"
                      description="Intenta cambiar los filtros de búsqueda"
                    />
                  ) : (
                    <>
                      {/* Timeline agrupado por semana */}
                      <div className="relative">
                        {groupSessionsByWeek(pagination.currentPageItems).map((group, gi) => (
                          <div key={gi} className="mb-6">
                            {/* Separador de semana */}
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider whitespace-nowrap">
                                {group.label}
                              </span>
                              <div className="flex-1 h-px bg-indigo-200 dark:bg-indigo-800/60" />
                              <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">
                                {group.sessions.length} sesión{group.sessions.length !== 1 ? "es" : ""}
                              </span>
                            </div>

                            {/* Sesiones con línea de tiempo */}
                            <div className="relative pl-6">
                              {/* Línea vertical */}
                              <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-linear-to-b from-indigo-400 via-violet-400 to-transparent dark:from-indigo-600 dark:via-violet-700" />

                              <div className="space-y-3">
                                {group.sessions.map((session) => {
                                  const routine = routines.find(
                                    (r) => r.id === session.routineId,
                                  );
                                  const routineName =
                                    routine?.name ?? tS("routineDeleted");
                                  const isDeleted = !routine;

                                  return (
                                    <div key={session.id} className="relative">
                                      {/* Dot en la línea */}
                                      <div className="absolute -left-4 top-4 w-2.5 h-2.5 rounded-full bg-indigo-500 dark:bg-indigo-400 ring-2 ring-white dark:ring-zinc-950 shrink-0" />
                                      <SharedSessionCard
                                        session={session}
                                        routineName={routineName}
                                        isRoutineDeleted={isDeleted}
                                        onView={handleViewSession}
                                        onEdit={handleEditSession}
                                        onDelete={handleDeleteSession}
                                        onSync={handleSyncRoutine}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {pagination.isPaginated && (
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <Pagination
                            page={pagination.page}
                            totalPages={pagination.totalPages}
                            totalItems={pagination.totalItems}
                            pageSize={pagination.pageSize}
                            hasNextPage={pagination.hasNextPage}
                            hasPrevPage={pagination.hasPrevPage}
                            onPageChange={pagination.goToPage}
                            onNextPage={pagination.nextPage}
                            onPrevPage={pagination.prevPage}
                            onFirstPage={pagination.firstPage}
                            onLastPage={pagination.lastPage}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* BottomSheet de filtros — solo mobile */}
              <BottomSheet
                isOpen={isFilterSheetOpen}
                onClose={() => setIsFilterSheetOpen(false)}
                title="Filtros"
                maxHeight="85vh"
              >
                <div className="p-4">
                  <SessionFilters
                    routines={routines}
                    totalSessions={displayedSessions.length}
                    filteredCount={filteredSessions.length}
                    filters={filters}
                    onFilterChange={(f) => {
                      setFilters(f);
                    }}
                  />
                </div>
              </BottomSheet>

              {/* Detail sheet */}
              {viewingSession && (
                <BottomSheet
                  isOpen={!!viewingSession}
                  onClose={() => setViewingSession(null)}
                  title={viewingSession.routineName || routines.find(r => r.id === viewingSession.routineId)?.name || "Detalle"}
                  maxHeight="90vh"
                >
                  <SessionDetailContent session={viewingSession} routines={routines} />
                </BottomSheet>
              )}
            </>
          )}

          {/* Edit modal */}
          <EditSessionModal
            session={editingSession}
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingSession(null);
            }}
            onSave={handleSaveSession}
          />
        </PageContent>
      </PageLayout>
    </ProtectedRoute>
  );
}
