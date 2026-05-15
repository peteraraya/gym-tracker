'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Search, Filter, Calendar, X } from '@/components/icons/lucide';
import type { Routine } from '@/types';

interface FilterState {
  searchTerm: string;
  selectedRoutine: string;
  dateRange: 'all' | 'week' | 'month' | '3months';
}

interface SessionFiltersProps {
  routines: Routine[];
  totalSessions: number;
  filteredCount: number;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export function SessionFilters({
  routines,
  totalSessions,
  filteredCount,
  filters,
  onFilterChange,
}: SessionFiltersProps) {
  const updateFilter = (updates: Partial<FilterState>) => {
    onFilterChange({ ...filters, ...updates });
  };

  const clearFilters = () => {
    onFilterChange({
      searchTerm: '',
      selectedRoutine: 'all',
      dateRange: 'all',
    });
  };

  const activeFiltersCount =
    (filters.searchTerm ? 1 : 0) +
    (filters.selectedRoutine !== 'all' ? 1 : 0) +
    (filters.dateRange !== 'all' ? 1 : 0);

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
                value={filters.searchTerm}
                onChange={(e) => updateFilter({ searchTerm: e.target.value })}
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
              value={filters.selectedRoutine}
              onChange={(e) => updateFilter({ selectedRoutine: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las rutinas</option>
              {routines.map((routine) => (
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
                onClick={() => updateFilter({ dateRange: 'all' })}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.dateRange === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Todo
              </button>
              <button
                onClick={() => updateFilter({ dateRange: 'week' })}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.dateRange === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                7 días
              </button>
              <button
                onClick={() => updateFilter({ dateRange: 'month' })}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.dateRange === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                30 días
              </button>
              <button
                onClick={() => updateFilter({ dateRange: '3months' })}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.dateRange === '3months'
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
                {filteredCount}
              </span>{' '}
              sesiones encontradas
              {activeFiltersCount > 0 && ` (${totalSessions} total)`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
