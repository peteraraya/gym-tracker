import { renderHook, act } from '@testing-library/react'
import { usePagination } from '@/hooks/usePagination'

describe('usePagination Hook', () => {
  const createItems = (count: number) => Array.from({ length: count }, (_, i) => ({ id: i, name: `Item ${i}` }))

  describe('initial state', () => {
    it('should initialize with correct defaults', () => {
      const { result } = renderHook(() => usePagination({ items: createItems(25) }))

      expect(result.current.page).toBe(0)
      expect(result.current.pageSize).toBe(10)
      expect(result.current.totalPages).toBe(3)
      expect(result.current.totalItems).toBe(25)
      expect(result.current.currentPageItems).toHaveLength(10)
      expect(result.current.currentPageItems[0].id).toBe(0)
    })

    it('should respect custom pageSize', () => {
      const { result } = renderHook(() => usePagination({ items: createItems(25), pageSize: 5 }))

      expect(result.current.pageSize).toBe(5)
      expect(result.current.totalPages).toBe(5)
      expect(result.current.currentPageItems).toHaveLength(5)
    })

    it('should respect initialPage', () => {
      const { result } = renderHook(() => usePagination({ items: createItems(25), initialPage: 1 }))

      expect(result.current.page).toBe(1)
      expect(result.current.currentPageItems[0].id).toBe(10)
    })

    it('should handle empty items array', () => {
      const { result } = renderHook(() => usePagination({ items: [] }))

      expect(result.current.page).toBe(0)
      expect(result.current.totalPages).toBe(1)
      expect(result.current.totalItems).toBe(0)
      expect(result.current.currentPageItems).toHaveLength(0)
      expect(result.current.isPaginated).toBe(false)
    })

    it('should not paginate when items fit in one page', () => {
      const { result } = renderHook(() => usePagination({ items: createItems(5) }))

      expect(result.current.isPaginated).toBe(false)
      expect(result.current.hasNextPage).toBe(false)
      expect(result.current.hasPrevPage).toBe(false)
    })
  })

  describe('page navigation', () => {
    it('should navigate to next page', () => {
      const { result } = renderHook(() => usePagination({ items: createItems(25) }))

      act(() => { result.current.nextPage() })

      expect(result.current.page).toBe(1)
      expect(result.current.currentPageItems[0].id).toBe(10)
    })

    it('should navigate to previous page', () => {
      const { result } = renderHook(() => usePagination({ items: createItems(25), initialPage: 1 }))

      act(() => { result.current.prevPage() })

      expect(result.current.page).toBe(0)
    })

    it('should not go beyond last page', () => {
      const { result } = renderHook(() => usePagination({ items: createItems(25), initialPage: 2 }))

      act(() => { result.current.nextPage() })

      expect(result.current.page).toBe(2)
    })

    it('should not go below first page', () => {
      const { result } = renderHook(() => usePagination({ items: createItems(25) }))

      act(() => { result.current.prevPage() })

      expect(result.current.page).toBe(0)
    })

    it('should go to specific page with goToPage', () => {
      const { result } = renderHook(() => usePagination({ items: createItems(25) }))

      act(() => { result.current.goToPage(2) })

      expect(result.current.page).toBe(2)
      expect(result.current.currentPageItems[0].id).toBe(20)
    })

    it('should clamp goToPage within valid range', () => {
      const { result } = renderHook(() => usePagination({ items: createItems(25) }))

      act(() => { result.current.goToPage(99) })

      expect(result.current.page).toBe(2)
    })

    it('should go to first page', () => {
      const { result } = renderHook(() => usePagination({ items: createItems(25), initialPage: 2 }))

      act(() => { result.current.firstPage() })

      expect(result.current.page).toBe(0)
    })

    it('should go to last page', () => {
      const { result } = renderHook(() => usePagination({ items: createItems(25) }))

      act(() => { result.current.lastPage() })

      expect(result.current.page).toBe(2)
      expect(result.current.currentPageItems[0].id).toBe(20)
    })
  })

  describe('page size changes', () => {
    it('should reset to page 0 when pageSize changes', () => {
      const { result } = renderHook(() => usePagination({ items: createItems(25), initialPage: 2 }))

      act(() => { result.current.setPageSize(25) })

      expect(result.current.page).toBe(0)
      expect(result.current.pageSize).toBe(25)
      expect(result.current.totalPages).toBe(1)
    })
  })

  describe('load more', () => {
    it('should increment page', () => {
      const { result } = renderHook(() => usePagination({ items: createItems(25) }))

      act(() => { result.current.loadMore() })

      expect(result.current.page).toBe(1)
    })
  })

  describe('reset', () => {
    it('should reset to page 0', () => {
      const { result } = renderHook(() => usePagination({ items: createItems(25), initialPage: 2 }))

      act(() => { result.current.reset() })

      expect(result.current.page).toBe(0)
    })
  })

  describe('visible items', () => {
    it('should return all items up to current page', () => {
      const { result } = renderHook(() => usePagination({ items: createItems(25), initialPage: 1 }))

      expect(result.current.visibleCount).toBe(20)
      expect(result.current.visibleItems).toHaveLength(20)
    })
  })

  describe('hasNextPage / hasPrevPage', () => {
    it('should correctly report hasNextPage', () => {
      const { result } = renderHook(() => usePagination({ items: createItems(25) }))

      expect(result.current.hasNextPage).toBe(true)
      expect(result.current.hasPrevPage).toBe(false)

      act(() => { result.current.goToPage(1) })

      expect(result.current.hasNextPage).toBe(true)
      expect(result.current.hasPrevPage).toBe(true)

      act(() => { result.current.lastPage() })

      expect(result.current.hasNextPage).toBe(false)
      expect(result.current.hasPrevPage).toBe(true)
    })
  })

  describe('items change', () => {
    it('should reset to page 0 when items change', () => {
      const { result, rerender } = renderHook(
        ({ items }) => usePagination({ items, initialPage: 2 }),
        { initialProps: { items: createItems(50) } }
      )

      expect(result.current.page).toBe(2)

      rerender({ items: createItems(5) })

      expect(result.current.page).toBe(0)
    })
  })
})
