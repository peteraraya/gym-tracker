import { renderHook } from '@testing-library/react'
import { useSessionStats } from '@/hooks/useSessionStats'
import { createMockSession } from '@/__tests__/helpers/mockData'

describe('useSessionStats Hook', () => {
  it('should return zero stats for empty sessions', () => {
    const { result } = renderHook(() => useSessionStats([]))

    expect(result.current).toEqual({
      totalVolume: 0,
      totalSets: 0,
      totalExercises: 0,
      averageDuration: 0,
      totalSessions: 0,
    })
  })

  it('should calculate total volume correctly', () => {
    const sessions = [
      createMockSession({
        id: 's1',
        exercises: [{
          exerciseId: 'ex-1',
          exerciseName: 'Bench Press',
          completedSets: 3,
          actualReps: [10, 10, 10],
          actualWeight: [80, 80, 80],
        }],
      }),
    ]

    const { result } = renderHook(() => useSessionStats(sessions))

    // 10*80 + 10*80 + 10*80 = 2400
    expect(result.current.totalVolume).toBe(2400)
  })

  it('should calculate total sets correctly', () => {
    const sessions = [
      createMockSession({
        id: 's1',
        exercises: [
          { exerciseId: 'ex-1', exerciseName: 'Bench', completedSets: 3, actualReps: [10, 10, 10], actualWeight: [80, 80, 80] },
          { exerciseId: 'ex-2', exerciseName: 'Squat', completedSets: 4, actualReps: [8, 8, 8, 8], actualWeight: [100, 100, 100, 100] },
        ],
      }),
    ]

    const { result } = renderHook(() => useSessionStats(sessions))

    expect(result.current.totalSets).toBe(7)
  })

  it('should calculate total exercises correctly', () => {
    const sessions = [
      createMockSession({ id: 's1', exercises: [
        { exerciseId: 'ex-1', exerciseName: 'Bench', completedSets: 3, actualReps: [10], actualWeight: [80] },
        { exerciseId: 'ex-2', exerciseName: 'Squat', completedSets: 3, actualReps: [10], actualWeight: [100] },
      ]}),
      createMockSession({ id: 's2', exercises: [
        { exerciseId: 'ex-3', exerciseName: 'Deadlift', completedSets: 3, actualReps: [5], actualWeight: [120] },
      ]}),
    ]

    const { result } = renderHook(() => useSessionStats(sessions))

    expect(result.current.totalExercises).toBe(3)
  })

  it('should calculate average duration correctly', () => {
    const sessions = [
      createMockSession({ id: 's1', totalDuration: 3600 }),
      createMockSession({ id: 's2', totalDuration: 1800 }),
      createMockSession({ id: 's3' }),
    ]

    const { result } = renderHook(() => useSessionStats(sessions))

    // Only 2 sessions have duration: (3600 + 1800) / 2 = 2700
    expect(result.current.averageDuration).toBe(2700)
  })

  it('should count total sessions', () => {
    const sessions = [
      createMockSession({ id: 's1' }),
      createMockSession({ id: 's2' }),
      createMockSession({ id: 's3' }),
    ]

    const { result } = renderHook(() => useSessionStats(sessions))

    expect(result.current.totalSessions).toBe(3)
  })

  it('should handle sessions with undefined exercises', () => {
    const sessions = [
      createMockSession({ id: 's1', exercises: [] as any }),
    ]

    const { result } = renderHook(() => useSessionStats(sessions))

    expect(result.current.totalVolume).toBe(0)
    expect(result.current.totalSets).toBe(0)
  })
})
