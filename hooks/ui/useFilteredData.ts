/**
 * Hook generico para filtrado y paginacion de datos
 *
 * Centraliza la logica de filtrado + paginacion que estaba duplicada
 * en multiples componentes (exercises, sessions, etc.)
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
  const [requestedPage, setRequestedPage] = useState(1);

  const filtered = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return items.filter(item => filterFn(item, searchLower));
  }, [items, searchTerm, filterFn]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentPage =
    totalPages > 0 && requestedPage > totalPages ? 1 : requestedPage;

  const setCurrentPage = (page: number | ((prev: number) => number)) => {
    if (typeof page === 'function') {
      setRequestedPage(page(currentPage));
    } else {
      setRequestedPage(page);
    }
  };

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

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
