import { renderHook, act } from '@testing-library/react'
import { useFilteredData } from '@/hooks/useFilteredData'

describe('useFilteredData Hook', () => {
  const items = [
    { id: '1', name: 'Bench Press', muscleGroup: 'pecho' },
    { id: '2', name: 'Squat', muscleGroup: 'piernas' },
    { id: '3', name: 'Deadlift', muscleGroup: 'espalda' },
    { id: '4', name: 'Shoulder Press', muscleGroup: 'hombros' },
    { id: '5', name: 'Bench Press Incline', muscleGroup: 'pecho' },
  ]

  const filterFn = (item: { name: string }, search: string) =>
    item.name.toLowerCase().includes(search)

  describe('filtering', () => {
    it('should return all items when search is empty', () => {
      const { result } = renderHook(() => useFilteredData(items, '', filterFn))

      expect(result.current.total).toBe(5)
      expect(result.current.data).toHaveLength(5)
    })

    it('should filter items by search term', () => {
      const { result } = renderHook(() => useFilteredData(items, 'bench', filterFn))

      expect(result.current.total).toBe(2)
      expect(result.current.data).toHaveLength(2)
    })

    it('should return empty when no items match', () => {
      const { result } = renderHook(() => useFilteredData(items, 'nonexistent', filterFn))

      expect(result.current.total).toBe(0)
      expect(result.current.data).toHaveLength(0)
    })
  })

  describe('pagination', () => {
    it('should paginate results with default itemsPerPage', () => {
      const { result } = renderHook(() => useFilteredData(items, '', filterFn, { itemsPerPage: 2 }))

      expect(result.current.currentPage).toBe(1)
      expect(result.current.totalPages).toBe(3)
      expect(result.current.data).toHaveLength(2)
      expect(result.current.data[0].id).toBe('1')
    })

    it('should navigate between pages', () => {
      const { result } = renderHook(() => useFilteredData(items, '', filterFn, { itemsPerPage: 2 }))

      act(() => { result.current.setCurrentPage(2) })

      expect(result.current.currentPage).toBe(2)
      expect(result.current.data[0].id).toBe('3')
    })

    it('should report hasNextPage and hasPrevPage correctly', () => {
      const { result } = renderHook(() => useFilteredData(items, '', filterFn, { itemsPerPage: 2 }))

      expect(result.current.hasPrevPage).toBe(false)
      expect(result.current.hasNextPage).toBe(true)

      act(() => { result.current.setCurrentPage(3) })

      expect(result.current.hasPrevPage).toBe(true)
      expect(result.current.hasNextPage).toBe(false)
    })
  })

  describe('page reset on filter change', () => {
    it('should reset page when filter reduces results below current page', () => {
      const { result, rerender } = renderHook(
        ({ searchTerm }) => useFilteredData(items, searchTerm, filterFn, { itemsPerPage: 2 }),
        { initialProps: { searchTerm: '' } }
      )

      // Go to page 3
      act(() => { result.current.setCurrentPage(3) })
      expect(result.current.currentPage).toBe(3)

      // Filter to only 2 items (1 page)
      rerender({ searchTerm: 'bench' })

      expect(result.current.totalPages).toBe(1)
      expect(result.current.currentPage).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle empty items array', () => {
      const { result } = renderHook(() => useFilteredData([], '', filterFn))

      expect(result.current.total).toBe(0)
      expect(result.current.totalPages).toBe(0)
      expect(result.current.data).toHaveLength(0)
    })

    it('should handle custom filter function', () => {
      const customFilter = (item: { muscleGroup: string }, search: string) =>
        item.muscleGroup === search

      const { result } = renderHook(() => useFilteredData(items, 'pecho', customFilter))

      expect(result.current.total).toBe(2)
    })
  })
})
