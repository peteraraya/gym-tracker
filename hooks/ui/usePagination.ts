import { useState, useMemo, useCallback } from 'react';

export interface UsePaginationOptions<T> {
  items: T[];
  pageSize?: number;
  initialPage?: number;
}

export interface UsePaginationResult<T> {
  currentPageItems: T[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  isPaginated: boolean;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  firstPage: () => void;
  lastPage: () => void;
  reset: () => void;
  setPageSize: (size: number) => void;
  loadMore: () => void;
  visibleCount: number;
  visibleItems: T[];
}

const DEFAULT_PAGE_SIZE = 10;

export function usePagination<T>({
  items,
  pageSize = DEFAULT_PAGE_SIZE,
  initialPage = 0,
}: UsePaginationOptions<T>): UsePaginationResult<T> {
  const [page, setPage] = useState(initialPage);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  const totalPages = Math.max(1, Math.ceil(items.length / currentPageSize));

  // Reset to page 0 when items reference changes (filters applied)
  const safePage = page >= totalPages ? 0 : page;

  const currentPageItems = useMemo(() => {
    const start = safePage * currentPageSize;
    return items.slice(start, start + currentPageSize);
  }, [items, safePage, currentPageSize]);

  const visibleItems = useMemo(() => {
    return items.slice(0, (safePage + 1) * currentPageSize);
  }, [items, safePage, currentPageSize]);

  const nextPage = useCallback(() => {
    setPage((prev) => {
      const tp = Math.max(1, Math.ceil(items.length / currentPageSize));
      return Math.min(prev + 1, tp - 1);
    });
  }, [items, currentPageSize]);

  const prevPage = useCallback(() => {
    setPage((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToPage = useCallback((p: number) => {
    setPage(Math.max(0, Math.min(p, totalPages - 1)));
  }, [totalPages]);

  const firstPage = useCallback(() => setPage(0), []);
  const lastPage = useCallback(() => {
    setPage(Math.max(0, totalPages - 1));
  }, [totalPages]);
  const reset = useCallback(() => setPage(0), []);

  const setPageSize = useCallback((size: number) => {
    setCurrentPageSize(size);
    setPage(0);
  }, []);

  const loadMore = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  return {
    currentPageItems,
    page: safePage,
    pageSize: currentPageSize,
    totalPages,
    totalItems: items.length,
    hasNextPage: safePage < totalPages - 1,
    hasPrevPage: safePage > 0,
    isPaginated: items.length > currentPageSize,
    nextPage,
    prevPage,
    goToPage,
    firstPage,
    lastPage,
    reset,
    setPageSize,
    loadMore,
    visibleCount: visibleItems.length,
    visibleItems,
  };
}
