'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Search, Filter, Calendar, X } from '@/components/icons/lucide';
import type { WorkoutSession, Routine } from '@/types';

interface SessionFiltersProps {
  sessions: WorkoutSession[];
  routines: Routine[];
  onFilteredSessionsChange: (filtered: WorkoutSession[]) => void;
}

export function SessionFilters({ sessions, routines, onFilteredSessionsChange }: SessionFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoutine, setSelectedRoutine] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | '3months'>('all');

  const filteredSessions = useMemo(() => {
    let filtered = [...sessions];

    // Filtro por búsqueda de texto
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(session => {
        const routineName = routines.find(r => r.id === session.routineId)?.name?.toLowerCase() || '';
        const hasExercise = session.exercises?.some(ex => 
          ex.exerciseName?.toLowerCase().includes(lowerSearch)
        ) || false;
        const hasNote = session.notes?.toLowerCase().includes(lowerSearch) || false;
        
        return routineName.includes(lowerSearch) || hasExercise || hasNote;
      });
    }

    // Filtro por rutina
    if (selectedRoutine !== 'all') {
      filtered = filtered.filter(session => session.routineId === selectedRoutine);
    }

    // Filtro por rango de fecha
    if (dateRange !== 'all') {
      const now = new Date();
      let daysBack = 0;
      
      switch (dateRange) {
        case 'week':
          daysBack = 7;
          break;
        case 'month':
          daysBack = 30;
          break;
        case '3months':
          daysBack = 90;
          break;
      }
      
      const cutoffDate = new Date(now);
      cutoffDate.setDate(cutoffDate.getDate() - daysBack);
      
      filtered = filtered.filter(session => 
        new Date(session.date) >= cutoffDate
      );
    }

    return filtered;
  }, [sessions, searchTerm, selectedRoutine, dateRange, routines]);

  // Actualizar cuando cambian los filtros usando useEffect
  // Llamar al callback solo si el resultado cambió para evitar loops de render
  const prevSerializedRef = useRef<string>('')
  useEffect(() => {
    try {
      const serialized = JSON.stringify(filteredSessions)
      if (prevSerializedRef.current === serialized) return
      prevSerializedRef.current = serialized
      onFilteredSessionsChange(filteredSessions)
    } catch (e) {
      // Fallback: si falla la serialización, llamar al callback una vez
      onFilteredSessionsChange(filteredSessions)
    }
  }, [filteredSessions, onFilteredSessionsChange])

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedRoutine('all');
    setDateRange('all');
  };

  const activeFiltersCount = 
    (searchTerm ? 1 : 0) + 
    (selectedRoutine !== 'all' ? 1 : 0) + 
    (dateRange !== 'all' ? 1 : 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <X className="w-4 h-4" />
              Limpiar
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Búsqueda de texto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por rutina, ejercicio o notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtro por rutina */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rutina
            </label>
            <select
              value={selectedRoutine}
              onChange={(e) => setSelectedRoutine(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las rutinas</option>
              {routines.map(routine => (
                <option key={routine.id} value={routine.id}>
                  {routine.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Período
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDateRange('all')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Todo
              </button>
              <button
                onClick={() => setDateRange('week')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                7 días
              </button>
              <button
                onClick={() => setDateRange('month')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                30 días
              </button>
              <button
                onClick={() => setDateRange('3months')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === '3months'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                90 días
              </button>
            </div>
          </div>

          {/* Resumen de resultados */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {filteredSessions.length}
              </span> sesiones encontradas
              {activeFiltersCount > 0 && ` (${sessions.length} total)`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
