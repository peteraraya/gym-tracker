"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useGym } from "@/context/GymContext";
import { useToast } from "@/context/NotificationContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { ClientOnly } from "@/components/shared/ClientOnly";
import { SessionFilters } from "@/components/features/sessions/SessionFilters";
import { SessionComparison } from "@/components/features/sessions/SessionComparison";
import { EditSessionModal } from "@/components/features/sessions/EditSessionModal";
import { Pagination } from "@/components/shared/Pagination";
import { usePagination } from "@/hooks/usePagination";
import type { WorkoutSession, Routine } from "@/types";
import * as storageService from "@/lib/storage/storage";
import { useSessionStats } from "@/hooks/useSessionStats";
import { useConfirm } from "@/context/NotificationContext";
import { useLocale } from "@/context/LocaleContext";
import { Calendar } from "@/components/icons/lucide";
import { PageHeader, PageLayout, PageContent } from "@/layouts";
import {
  EmptyStateCard,
  LoadingSpinner,
  SessionCard as SharedSessionCard,
  StatBadge,
} from "@/components/shared";

const SESSIONS_PER_PAGE = 10;

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

export default function SessionsPage() {
  const {
    sessions: serverSessions,
    routines,
    loading,
    updateSession,
    deleteSession,
  } = useGym();
  const { success, error: showError } = useToast();
  const { confirm } = useConfirm();
  const { t } = useLocale();
  const tS = useCallback((key: string) => t(`sessions.${key}`), [t]);

  const [localSessions, setLocalSessions] = useState<WorkoutSession[]>([]);
  const [editingSession, setEditingSession] = useState<WorkoutSession | null>(
    null,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [hideDeletedRoutines, setHideDeletedRoutines] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const stats = useSessionStats(sessions);

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

  if (loading) {
    return (
      <ProtectedRoute>
        <PageLayout>
          <PageHeader
            title="Historial de Sesiones"
            subtitle="Revisa y analiza tus entrenamientos anteriores"
            icon={<Calendar className="w-7 h-7 text-white" />}
            gradient="from-green-700 via-emerald-700 to-teal-800"
          />
          <PageContent>
            <LoadingSpinner size="lg" message="Cargando sesiones..." />
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
          gradient="from-green-700 via-emerald-700 to-teal-800"
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
                  {new Set(sessions.map((s) => s.routineId)).size}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <div className="text-sm text-white/80 font-medium">
                  {tS("thisMonth")}
                </div>
                <div className="text-2xl font-bold text-white mt-1">
                  {
                    sessions.filter((s) => {
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

          {/* Top controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4">
            <label className="flex items-center gap-2 text-sm text-white/90 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20 hover:bg-white/20 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={hideDeletedRoutines}
                onChange={(e) => setHideDeletedRoutines(e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-600 rounded"
              />
              <span>Ocultar rutinas eliminadas</span>
            </label>
            {filteredSessions.length > 1 && (
              <SessionComparison
                sessions={filteredSessions}
                routines={routines}
              />
            )}
          </div>
        </PageHeader>

        <PageContent>
          {sessions.length === 0 ? (
            <EmptyStateCard
              icon="📊"
              title="No hay sesiones registradas"
              description="Completa tu primera rutina para ver tu historial aquí"
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Filters sidebar */}
              <div className="lg:col-span-1">
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
                    <div className="space-y-3">
                      {pagination.currentPageItems.map((session) => {
                        const routine = routines.find(
                          (r) => r.id === session.routineId,
                        );
                        const routineName =
                          routine?.name ?? tS("routineDeleted");
                        const isDeleted = !routine;

                        return (
                          <SharedSessionCard
                            key={session.id}
                            session={session}
                            routineName={routineName}
                            isRoutineDeleted={isDeleted}
                            onEdit={handleEditSession}
                            onDelete={handleDeleteSession}
                          />
                        );
                      })}
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
