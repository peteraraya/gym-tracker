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
  const { sessions: serverSessions, routines } = useGym();

  const [localSessions, setLocalSessions] = useState<WorkoutSession[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('workoutSessions');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  // Combina sesiones del servidor y sesiones importadas en localStorage
  const sessions = useMemo(() => {
    return [...serverSessions, ...localSessions];
  }, [serverSessions, localSessions]);

  const [filteredSessions, setFilteredSessions] = useState<WorkoutSession[]>(sessions);

  // Keep filteredSessions in sync when sessions change
  React.useEffect(() => {
    setFilteredSessions(sessions);
  }, [sessions]);

  const getRoutineName = (routineId: string) => {
    const routine = routines.find((r) => r.id === routineId);
    return routine ? routine.name : 'Rutina eliminada';
  };

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
          {sessions.length > 1 && (
            <SessionComparison sessions={sessions} routines={routines} />
          )}
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
