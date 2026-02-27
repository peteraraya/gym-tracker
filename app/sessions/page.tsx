'use client';

import { useState, useMemo, useEffect } from 'react';
import { useGym } from '@/context/GymContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ClientOnly } from '@/components/ClientOnly';
import { SessionFilters } from '@/components/SessionFilters';
import { SessionComparison } from '@/components/SessionComparison';
import type { WorkoutSession } from '@/types';
import * as storageService from '@/lib/storage/storage';
import { useSessionStats } from '@/hooks/useSessionStats';
import { PageLayout } from '@/components/PageLayout';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';

export default function SessionsPage() {
  const { sessions: serverSessions, routines, loading } = useGym();
  
  const [localSessions, setLocalSessions] = useState<WorkoutSession[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const all = await storageService.getSessions();
        // Merge and dedupe by id (or by date+routine as fallback)
        const map = new Map<string, WorkoutSession>();
        const keyFor = (s: WorkoutSession) => s.id || `${s.date}-${s.routineId}`;
        (all || []).forEach(s => map.set(keyFor(s), s));
        const merged = Array.from(map.values());
        if (mounted) setLocalSessions(merged);
      } catch (err) {
        console.warn('Error loading local sessions:', err);
      }
    })();
    return () => { mounted = false };
  }, []);

  // Combina sesiones del servidor y sesiones importadas en localStorage
  // Evitar eliminar sesiones distintas con el mismo nombre: dedupe SOLO por `id`.
  // Para sesiones sin `id` asignamos un id temporal basado en el índice para permitir selección/comparación.
  const sessions = useMemo(() => {
    const serverById = new Map<string, WorkoutSession>();
    serverSessions.forEach(s => { if (s.id) serverById.set(s.id, s); });

    const merged: WorkoutSession[] = [];

    // Añadir todas las sesiones del servidor
    serverSessions.forEach(s => merged.push(s));

    // Añadir las locales solo si no colisionan por id con servidor
    localSessions.forEach(s => {
      if (s.id && serverById.has(s.id)) return; // servidor ya tiene la versión
      merged.push(s);
    });

    // Asegurar que cada sesión tenga un `id` estable (generar temporal para las que no tienen)
    return merged.map((s, idx) => ({
      ...s,
      id: s.id || `__local_${idx}_${new Date(s.date).getTime()}`,
    }));
  }, [serverSessions, localSessions]);

  const [filteredSessions, setFilteredSessions] = useState<WorkoutSession[]>(sessions);
  
  // Calcular estadísticas usando el hook
  const stats = useSessionStats(sessions);

  function formatDuration(seconds?: number) {
    if (!seconds && seconds !== 0) return '-';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${s}s`;
  }

  // Opción para ocultar sesiones cuya rutina fue eliminada
  // Cambiado a `false` para mostrar por defecto las sesiones huérfanas.
  const [hideDeletedRoutines, setHideDeletedRoutines] = React.useState<boolean>(false);

  // Keep filteredSessions in sync when sessions change
  React.useEffect(() => {
    setFilteredSessions(sessions);
  }, [sessions]);

  // Computar sesiones que se muestran según la opción de ocultar rutinas eliminadas
  const displayedSessions = React.useMemo(() => {
    if (!hideDeletedRoutines) return sessions;
    return sessions.filter(s => routines.some(r => r.id === s.routineId));
  }, [sessions, hideDeletedRoutines, routines]);

  // Mantener filteredSessions sincronizado con displayedSessions
  React.useEffect(() => {
    setFilteredSessions(displayedSessions);
  }, [displayedSessions]);

  const getRoutineName = (routineId: string) => {
    const routine = routines.find((r) => r.id === routineId);
    return routine ? routine.name : 'Rutina eliminada';
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Historial de Sesiones
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Revisa tus entrenamientos anteriores
                </p>
              </div>
            </div>

            <div className="text-center py-12">
              <div className="text-6xl mb-4">⏳</div>
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Cargando sesiones...
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Cargando historial de sesiones, espera unos segundos
              </p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header mejorado */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            📊 Historial de Sesiones
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Revisa y analiza tus entrenamientos anteriores
          </p>
          
          {/* Estadísticas rápidas */}
          {sessions.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Sesiones</div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">{sessions.length}</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                <div className="text-sm text-green-600 dark:text-green-400 font-medium">Filtradas</div>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">{filteredSessions.length}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Rutinas Únicas</div>
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                  {new Set(sessions.map(s => s.routineId)).size}
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">Este Mes</div>
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

          {/* Controles superiores */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={hideDeletedRoutines}
                onChange={(e) => setHideDeletedRoutines(e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-600 rounded"
              />
              <span>Ocultar rutinas eliminadas</span>
            </label>
            {displayedSessions.length > 1 && (
              <SessionComparison sessions={displayedSessions} routines={routines} />
            )}
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No hay sesiones registradas
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Completa tu primera rutina para ver tu historial aquí
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filtros en sidebar - más compacto */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <SessionFilters
                  sessions={sessions}
                  routines={routines}
                  onFilteredSessionsChange={setFilteredSessions}
                />
              </div>
            </div>

            {/* Lista de sesiones - más espacio */}
            <div className="lg:col-span-3">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    No se encontraron sesiones
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Intenta cambiar los filtros de búsqueda
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSessions.map((session) => {
                    const routineName = getRoutineName(session.routineId);
                    const isDeleted = routineName === 'Rutina eliminada';
                    
                    return (
                      <Card 
                        key={session.id}
                        className={`hover:shadow-lg transition-all ${isDeleted ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10' : ''}`}
                      >
                        <div className="p-6">
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
                            
                            {session.totalDuration !== undefined && (
                              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <span className="text-blue-600 dark:text-blue-400">⏱️</span>
                                <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                  {formatDuration(session.totalDuration)}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-3 mb-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                                {session.exercises.length}
                              </span>
                              <span className="text-green-700 dark:text-green-300 text-sm">
                                ejercicio{session.exercises.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            
                            {session.exercises.length > 0 && (
                              <>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                  <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm">
                                    {session.exercises.reduce((total, ex) => total + (ex.actualReps?.length || 0), 0)}
                                  </span>
                                  <span className="text-purple-700 dark:text-purple-300 text-sm">
                                    series totales
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                  <span className="text-orange-600 dark:text-orange-400 font-semibold text-sm">
                                    {session.exercises.reduce((total, ex) => {
                                      if (!ex.actualReps || !ex.actualWeight) return total;
                                      return total + ex.actualReps.reduce((sum, reps, idx) => 
                                        sum + (reps * (ex.actualWeight?.[idx] || 0)), 0
                                      );
                                    }, 0).toLocaleString()}
                                  </span>
                                  <span className="text-orange-700 dark:text-orange-300 text-sm">
                                    kg volumen
                                  </span>
                                </div>
                              </>
                            )}
                          </div>

                          {session.notes && (
                            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                              <div className="flex items-start gap-2">
                                <span className="text-amber-600 dark:text-amber-400 text-lg">📝</span>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
                                    Notas de la sesión:
                                  </p>
                                  <p className="text-sm text-amber-800 dark:text-amber-200">
                                    {session.notes}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}
