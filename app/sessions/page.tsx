'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ClientOnly } from '@/components/ClientOnly';
import { SessionFilters } from '@/components/SessionFilters';
import { SessionComparison } from '@/components/SessionComparison';
import { EditSessionModal } from '@/components/EditSessionModal';
import { Pagination } from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';
import type { WorkoutSession, Routine } from '@/types';
import * as storageService from '@/lib/storage/storage';
import { useSessionStats } from '@/hooks/useSessionStats';
import { LoadingState } from '@/components/LoadingState';
import { useConfirm } from '@/context/ConfirmContext';
import { useLocale } from '@/context/LocaleContext';

const SESSIONS_PER_PAGE = 10;

interface FilterState {
  searchTerm: string;
  selectedRoutine: string;
  dateRange: 'all' | 'week' | 'month' | '3months';
}

const DEFAULT_FILTERS: FilterState = {
  searchTerm: '',
  selectedRoutine: 'all',
  dateRange: 'all',
};

function formatDuration(seconds?: number) {
  if (!seconds && seconds !== 0) return '-';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

function SessionCard({
  session,
  routines,
  tS,
  onEdit,
  onDelete,
}: {
  session: WorkoutSession;
  routines: { id: string; name: string }[];
  tS: (key: string) => string;
  onEdit: (session: WorkoutSession) => void;
  onDelete: (session: WorkoutSession) => void;
}) {
  const routine = routines.find(r => r.id === session.routineId);
  const routineName = routine?.name ?? tS('routineDeleted');
  const isDeleted = !routine;

  const totalSets = session.exercises.reduce((t, ex) => t + (ex.actualReps?.length || 0), 0);
  const totalVolume = session.exercises.reduce((total, ex) => {
    if (!ex.actualReps || !ex.actualWeight) return total;
    return total + ex.actualReps.reduce((sum, reps, idx) =>
      sum + reps * (ex.actualWeight?.[idx] || 0), 0);
  }, 0);

  return (
    <Card className={`hover:shadow-lg transition-all ${isDeleted ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10' : ''}`}>
      <div className="p-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className={`text-xl font-bold ${isDeleted ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                {routineName}
              </h3>
              {isDeleted && (
                <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
                  Eliminada
                </span>
              )}
            </div>
            <ClientOnly fallback={<span className="text-sm text-gray-500">Cargando fecha...</span>}>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>📅</span>
                <span>
                  {new Date(session.date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </ClientOnly>
          </div>

          <div className="flex items-center gap-2">
            {session.totalDuration !== undefined && (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <span className="text-blue-600 dark:text-blue-400">⏱️</span>
                <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  {formatDuration(session.totalDuration)}
                </span>
              </div>
            )}
            <button
              onClick={() => onEdit(session)}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
              title="Editar sesión"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span className="hidden sm:inline">Editar</span>
            </button>
            <button
              onClick={() => onDelete(session)}
              className="px-3 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
              title="Eliminar sesión"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="hidden sm:inline">Eliminar</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <span className="text-green-600 dark:text-green-400 font-semibold text-sm">{session.exercises.length}</span>
            <span className="text-green-700 dark:text-green-300 text-sm">
              ejercicio{session.exercises.length !== 1 ? 's' : ''}
            </span>
          </div>
          {totalSets > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm">{totalSets}</span>
              <span className="text-purple-700 dark:text-purple-300 text-sm">series totales</span>
            </div>
          )}
          {totalVolume > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <span className="text-orange-600 dark:text-orange-400 font-semibold text-sm">{totalVolume.toLocaleString()}</span>
              <span className="text-orange-700 dark:text-orange-300 text-sm">kg volumen</span>
            </div>
          )}
        </div>

        {session.notes && (
          <div className="bg-linear-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <span className="text-amber-600 dark:text-amber-400 text-lg">📝</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">Notas de la sesión:</p>
                <p className="text-sm text-amber-800 dark:text-amber-200">{session.notes}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function applyFilters(
  sessions: WorkoutSession[],
  routines: Routine[],
  filters: FilterState,
): WorkoutSession[] {
  let filtered = [...sessions];

  if (filters.searchTerm) {
    const lowerSearch = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(session => {
      const routineName = routines.find(r => r.id === session.routineId)?.name?.toLowerCase() || '';
      const hasExercise = session.exercises?.some(ex =>
        ex.exerciseName?.toLowerCase().includes(lowerSearch)
      ) || false;
      const hasNote = session.notes?.toLowerCase().includes(lowerSearch) || false;
      return routineName.includes(lowerSearch) || hasExercise || hasNote;
    });
  }

  if (filters.selectedRoutine !== 'all') {
    filtered = filtered.filter(session => session.routineId === filters.selectedRoutine);
  }

  if (filters.dateRange !== 'all') {
    const now = new Date();
    let daysBack = 0;
    switch (filters.dateRange) {
      case 'week': daysBack = 7; break;
      case 'month': daysBack = 30; break;
      case '3months': daysBack = 90; break;
    }
    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    filtered = filtered.filter(session => new Date(session.date) >= cutoffDate);
  }

  return filtered;
}

export default function SessionsPage() {
  const { sessions: serverSessions, routines, loading, updateSession, deleteSession } = useGym();
  const { success, error: showError } = useToast();
  const { confirm } = useConfirm();
  const { t } = useLocale();
  const tS = useCallback((key: string) => t(`sessions.${key}`), [t]);

  const [localSessions, setLocalSessions] = useState<WorkoutSession[]>([]);
  const [editingSession, setEditingSession] = useState<WorkoutSession | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [hideDeletedRoutines, setHideDeletedRoutines] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const all = await storageService.getSessions();
        const map = new Map<string, WorkoutSession>();
        const keyFor = (s: WorkoutSession) => s.id || `${s.date}-${s.routineId}`;
        (all || []).forEach(s => map.set(keyFor(s), s));
        if (mounted) setLocalSessions(Array.from(map.values()));
      } catch (err) {
        console.warn('Error loading local sessions:', err);
      }
    })();
    return () => { mounted = false };
  }, []);

  const sessions = useMemo(() => {
    const serverById = new Map<string, WorkoutSession>();
    serverSessions.forEach(s => { if (s.id) serverById.set(s.id, s); });

    const merged: WorkoutSession[] = [];
    serverSessions.forEach(s => merged.push(s));
    localSessions.forEach(s => {
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
    return sessions.filter(s => routines.some(r => r.id === s.routineId));
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
      success(tS('toast.updateSuccess'));
      setIsEditModalOpen(false);
      setEditingSession(null);
    } catch (err) {
      console.error('Error updating session:', err);
      showError(tS('toast.updateError'));
    }
  };

  const handleDeleteSession = async (session: WorkoutSession) => {
    const routineName = routines.find(r => r.id === session.routineId)?.name ?? tS('routineDeleted');
    const sessionDate = new Date(session.date).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    const confirmed = await confirm({
      title: tS('confirmDelete.title'),
      message: `${tS('confirmDelete.message')} "${routineName}" del ${sessionDate}${tS('confirmDelete.suffix')}`,
      confirmText: tS('confirmDelete.confirmText'),
      cancelText: tS('confirmDelete.cancelText'),
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      await deleteSession(session.id);
      success(tS('toast.deleteSuccess'));
    } catch (err) {
      console.error('Error deleting session:', err);
      showError(tS('toast.deleteError'));
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <LoadingState message={tS('loading')} />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              📊 Historial de Sesiones
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
              Revisa y analiza tus entrenamientos anteriores
            </p>

            {/* Quick stats */}
            {sessions.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">{tS('totalSessions')}</div>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">{sessions.length}</div>
                </div>
                <div className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="text-sm text-green-600 dark:text-green-400 font-medium">{tS('filtered')}</div>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">{filteredSessions.length}</div>
                </div>
                <div className="bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                  <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">{tS('uniqueRoutines')}</div>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                    {new Set(sessions.map(s => s.routineId)).size}
                  </div>
                </div>
                <div className="bg-linear-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                  <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">{tS('thisMonth')}</div>
                  <div className="text-2xl font-bold text-orange-900 dark:text-orange-100 mt-1">
                    {sessions.filter(s => {
                      const date = new Date(s.date);
                      const now = new Date();
                      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                    }).length}
                  </div>
                </div>
              </div>
            )}

            {/* Top controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideDeletedRoutines}
                  onChange={(e) => setHideDeletedRoutines(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600 rounded"
                />
                <span>Ocultar rutinas eliminadas</span>
              </label>
              {filteredSessions.length > 1 && (
                <SessionComparison sessions={filteredSessions} routines={routines} />
              )}
            </div>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">📊</div>
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No hay sesiones registradas
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Completa tu primera rutina para ver tu historial aquí
              </p>
            </div>
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
                  <div className="text-center py-8">
                    <div className="text-5xl mb-3">🔍</div>
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      No se encontraron sesiones
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Intenta cambiar los filtros de búsqueda
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {pagination.currentPageItems.map((session) => (
                        <SessionCard
                          key={session.id}
                          session={session}
                          routines={routines}
                          tS={tS}
                          onEdit={handleEditSession}
                          onDelete={handleDeleteSession}
                        />
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
          )}
        </div>

        {/* Edit modal */}
        <EditSessionModal
          session={editingSession}
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setEditingSession(null); }}
          onSave={handleSaveSession}
        />
      </div>
    </ProtectedRoute>
  );
}
