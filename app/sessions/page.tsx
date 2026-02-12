'use client';

import React, { useState, useMemo } from 'react';
import { useGym } from '@/context/GymContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ClientOnly } from '@/components/ClientOnly';
import { SessionFilters } from '@/components/SessionFilters';
import { SessionComparison } from '@/components/SessionComparison';
import type { WorkoutSession } from '@/types';

export default function SessionsPage() {
  const { sessions: serverSessions, routines, loading } = useGym();
  
  const [localSessions, setLocalSessions] = useState<WorkoutSession[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedA = localStorage.getItem('workoutSessions');
        const storedB = localStorage.getItem('gym_tracker_sessions');

        const a: WorkoutSession[] = storedA ? JSON.parse(storedA) : [];
        const b: WorkoutSession[] = storedB ? JSON.parse(storedB) : [];

        // Merge and dedupe by id (or by date+routine as fallback)
        const map = new Map<string, WorkoutSession>();
        const keyFor = (s: WorkoutSession) => s.id || `${s.date}-${s.routineId}`;

        [...b, ...a].forEach(s => map.set(keyFor(s), s));

        return Array.from(map.values());
      } catch (err) {
        // fall back to empty
         
        console.warn('Error parsing local sessions:', err);
        return [];
      }
    }
    return [];
  });

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Historial de Sesiones
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Revisa tus entrenamientos anteriores
            </p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={hideDeletedRoutines}
                onChange={(e) => setHideDeletedRoutines(e.target.checked)}
                className="form-checkbox h-4 w-4"
              />
              Ocultar rutinas eliminadas
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Filtros en sidebar */}
            <div className="lg:col-span-1">
              <SessionFilters
                sessions={sessions}
                routines={routines}
                onFilteredSessionsChange={setFilteredSessions}
              />
            </div>

            {/* Lista de sesiones */}
            <div className="lg:col-span-2">
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
                  {filteredSessions.map((session) => (
                    <Card key={session.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{getRoutineName(session.routineId)}</CardTitle>
                          <ClientOnly fallback={<span className="text-sm text-gray-600 dark:text-gray-400">Cargando...</span>}>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(session.date).toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </ClientOnly>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Ejercicios completados: {session.exercises.length}
                          </p>
                          {session.totalDuration !== undefined && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Duración: {formatDuration(session.totalDuration)}
                            </p>
                          )}
                          {session.notes && (
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                <strong>Notas:</strong> {session.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
