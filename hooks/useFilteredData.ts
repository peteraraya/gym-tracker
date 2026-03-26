/**
 * Hook genérico para filtrado y paginación de datos
 * 
 * Centraliza la lógica de filtrado + paginación que estaba duplicada
 * en múltiples componentes (exercises, sessions, etc.)
 */

import { useState, useMemo } from 'react';

interface UseFilteredDataOptions {
  itemsPerPage?: number;
}

interface UseFilteredDataResult<T> {
  data: T[];
  total: number;
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function useFilteredData<T>(
  items: T[],
  searchTerm: string,
  filterFn: (item: T, search: string) => boolean,
  options: UseFilteredDataOptions = {}
): UseFilteredDataResult<T> {
  const { itemsPerPage = 10 } = options;
  const [currentPage, setCurrentPageState] = useState(1);

  // Wrapper para setCurrentPage que acepta número o función
  const setCurrentPage = (page: number | ((prev: number) => number)) => {
    if (typeof page === 'function') {
      setCurrentPageState(page);
    } else {
      setCurrentPageState(page);
    }
  };

  // Filtrar datos
  const filtered = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return items.filter(item => filterFn(item, searchLower));
  }, [items, searchTerm, filterFn]);

  // Paginar datos
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // Reset a página 1 si el filtrado reduce los resultados
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPageState(1);
    }
  }, [totalPages, currentPage]);

  return {
    data: paginated,
    total: filtered.length,
    currentPage,
    setCurrentPage,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
}
