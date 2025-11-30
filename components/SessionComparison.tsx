'use client';

import React, { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import type { WorkoutSession, Routine } from '@/types';

interface SessionComparisonProps {
  sessions: WorkoutSession[];
  routines: Routine[];
}

export function SessionComparison({ sessions, routines }: SessionComparisonProps) {
  const [showModal, setShowModal] = useState(false);
  const [session1Id, setSession1Id] = useState<string>('');
  const [session2Id, setSession2Id] = useState<string>('');

  const session1 = useMemo(
    () => sessions.find(s => s.id === session1Id),
    [sessions, session1Id]
  );

  const session2 = useMemo(
    () => sessions.find(s => s.id === session2Id),
    [sessions, session2Id]
  );

  const getRoutineName = (routineId: string) => {
    return routines.find(r => r.id === routineId)?.name || 'Desconocida';
  };

  const comparison = useMemo(() => {
    if (!session1 || !session2) return null;

    const exerciseMap = new Map<string, {
      session1?: { weight: number; reps: number; sets: number };
      session2?: { weight: number; reps: number; sets: number };
    }>();

    // Procesar ejercicios de sesión 1
    session1.exercises.forEach(ex => {
      if (!ex.exerciseName) return;
      
      const totalReps = ex.actualReps.reduce((sum: number, reps: number) => sum + reps, 0);
      const avgWeight = ex.actualWeight.reduce((sum: number, weight: number) => sum + weight, 0) / ex.actualWeight.length;
      
      exerciseMap.set(ex.exerciseName, {
        session1: {
          weight: Math.round(avgWeight * 10) / 10,
          reps: totalReps,
          sets: ex.completedSets
        }
      });
    });

    // Procesar ejercicios de sesión 2
    session2.exercises.forEach(ex => {
      if (!ex.exerciseName) return;
      
      const totalReps = ex.actualReps.reduce((sum: number, reps: number) => sum + reps, 0);
      const avgWeight = ex.actualWeight.reduce((sum: number, weight: number) => sum + weight, 0) / ex.actualWeight.length;
      
      const existing = exerciseMap.get(ex.exerciseName) || {};
      exerciseMap.set(ex.exerciseName, {
        ...existing,
        session2: {
          weight: Math.round(avgWeight * 10) / 10,
          reps: totalReps,
          sets: ex.completedSets
        }
      });
    });

    return Array.from(exerciseMap.entries()).map(([name, data]) => ({
      exerciseName: name,
      ...data
    }));
  }, [session1, session2]);

  const getTrendIcon = (val1?: number, val2?: number) => {
    if (!val1 || !val2) return <Minus className="w-4 h-4 text-gray-400" />;
    if (val2 > val1) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (val2 < val1) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getPercentageChange = (val1?: number, val2?: number) => {
    if (!val1 || !val2) return null;
    const change = ((val2 - val1) / val1) * 100;
    return change.toFixed(1);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Comparar Sesiones
      </button>

      <Modal title="Comparar Sesiones" isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="space-y-6">
          {/* Selectores de sesiones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Primera Sesión
              </label>
              <select
                value={session1Id}
                onChange={(e) => setSession1Id(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Selecciona una sesión</option>
                {sessions.map(session => (
                  <option key={session.id} value={session.id}>
                    {getRoutineName(session.routineId)} - {new Date(session.date).toLocaleDateString('es-ES')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Segunda Sesión
              </label>
              <select
                value={session2Id}
                onChange={(e) => setSession2Id(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Selecciona una sesión</option>
                {sessions.map(session => (
                  <option key={session.id} value={session.id}>
                    {getRoutineName(session.routineId)} - {new Date(session.date).toLocaleDateString('es-ES')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparación */}
          {comparison && session1 && session2 ? (
            <div className="space-y-4">
              {/* Encabezado de comparación */}
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex-1 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sesión 1</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {new Date(session1.date).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <ArrowRight className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-4" />
                <div className="flex-1 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sesión 2</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {new Date(session2.date).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>

              {/* Tabla de comparación */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                          Ejercicio
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                          Peso Prom.
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                          Reps Totales
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                          Series
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {comparison.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {item.exerciseName}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {item.session1?.weight || '-'} kg
                              </span>
                              {getTrendIcon(item.session1?.weight, item.session2?.weight)}
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {item.session2?.weight || '-'} kg
                              </span>
                              {getPercentageChange(item.session1?.weight, item.session2?.weight) && (
                                <span className={`text-xs ${
                                  (item.session2?.weight || 0) > (item.session1?.weight || 0)
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
                                }`}>
                                  ({getPercentageChange(item.session1?.weight, item.session2?.weight)}%)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {item.session1?.reps || '-'}
                              </span>
                              {getTrendIcon(item.session1?.reps, item.session2?.reps)}
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {item.session2?.reps || '-'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {item.session1?.sets || '-'}
                              </span>
                              {getTrendIcon(item.session1?.sets, item.session2?.sets)}
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {item.session2?.sets || '-'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notas */}
              {(session1.notes || session2.notes) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notas Sesión 1:
                    </p>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                      {session1.notes || 'Sin notas'}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notas Sesión 2:
                    </p>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                      {session2.notes || 'Sin notas'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              Selecciona dos sesiones para compararlas
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
