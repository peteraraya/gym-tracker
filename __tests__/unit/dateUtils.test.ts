import {
  normalizeToMidnight,
  isSameDay,
  isPreviousDay,
  calculateSessionVolume,
  calculateTotalSets,
  calculateTotalVolume,
  filterSessionsByMonth,
  calculateStreak,
} from '@/lib/utils/dateUtils'
import { createMockSession } from '@/__tests__/helpers/mockData'

describe('dateUtils', () => {
  describe('normalizeToMidnight', () => {
    it('should set time to 00:00:00.000', () => {
      const date = new Date(2025, 5, 15, 14, 30, 45, 123)
      const result = normalizeToMidnight(date)

      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
      expect(result.getMilliseconds()).toBe(0)
    })

    it('should not mutate the original date', () => {
      const original = new Date(2025, 5, 15, 14, 30, 45)
      const copy = new Date(original.getTime())

      normalizeToMidnight(original)

      expect(original.getTime()).toBe(copy.getTime())
    })
  })

  describe('isSameDay', () => {
    it('should return true for same day at different times', () => {
      const d1 = new Date(2025, 5, 15, 8, 0, 0)
      const d2 = new Date(2025, 5, 15, 22, 30, 0)

      expect(isSameDay(d1, d2)).toBe(true)
    })

    it('should return false for different days', () => {
      const d1 = new Date(2025, 5, 15)
      const d2 = new Date(2025, 5, 16)

      expect(isSameDay(d1, d2)).toBe(false)
    })
  })

  describe('isPreviousDay', () => {
    it('should return true when date1 is exactly one day before date2', () => {
      const d1 = new Date(2025, 5, 14)
      const d2 = new Date(2025, 5, 15)

      expect(isPreviousDay(d1, d2)).toBe(true)
    })

    it('should return false for same day', () => {
      const d1 = new Date(2025, 5, 15)
      const d2 = new Date(2025, 5, 15)

      expect(isPreviousDay(d1, d2)).toBe(false)
    })

    it('should return false for two days before', () => {
      const d1 = new Date(2025, 5, 13)
      const d2 = new Date(2025, 5, 15)

      expect(isPreviousDay(d1, d2)).toBe(false)
    })
  })

  describe('calculateSessionVolume', () => {
    it('should calculate volume as sum of reps * weight', () => {
      const exercises = [
        { actualReps: [10, 10, 10], actualWeight: [80, 80, 80] },
        { actualReps: [8, 8], actualWeight: [100, 100] },
      ]

      // 10*80 + 10*80 + 10*80 + 8*100 + 8*100 = 2400 + 1600 = 4000
      expect(calculateSessionVolume(exercises)).toBe(4000)
    })

    it('should handle missing weight as 0', () => {
      const exercises = [
        { actualReps: [10, 10, 10] },
      ]

      expect(calculateSessionVolume(exercises)).toBe(0)
    })

    it('should return 0 for undefined exercises', () => {
      expect(calculateSessionVolume(undefined)).toBe(0)
      expect(calculateSessionVolume([])).toBe(0)
    })

    it('should handle empty reps array', () => {
      const exercises = [
        { actualReps: [] },
      ]

      expect(calculateSessionVolume(exercises)).toBe(0)
    })
  })

  describe('calculateTotalSets', () => {
    it('should count total sets across exercises', () => {
      const exercises = [
        { actualReps: [10, 10, 10] },
        { actualReps: [8, 8] },
      ]

      expect(calculateTotalSets(exercises)).toBe(5)
    })

    it('should return 0 for undefined exercises', () => {
      expect(calculateTotalSets(undefined)).toBe(0)
      expect(calculateTotalSets([])).toBe(0)
    })
  })

  describe('calculateTotalVolume', () => {
    it('should sum volume across all sessions', () => {
      const sessions = [
        createMockSession({
          id: 's1',
          exercises: [{ exerciseId: 'ex-1', exerciseName: 'Bench', completedSets: 3, actualReps: [10, 10, 10], actualWeight: [80, 80, 80] }],
        }),
        createMockSession({
          id: 's2',
          exercises: [{ exerciseId: 'ex-1', exerciseName: 'Bench', completedSets: 3, actualReps: [10, 10, 10], actualWeight: [80, 80, 80] }],
        }),
      ]

      // Each session: 2400, total: 4800
      expect(calculateTotalVolume(sessions)).toBe(4800)
    })

    it('should return 0 for empty sessions', () => {
      expect(calculateTotalVolume([])).toBe(0)
    })
  })

  describe('filterSessionsByMonth', () => {
    it('should filter sessions by month and year', () => {
      const sessions = [
        createMockSession({ id: 's1', date: new Date(2025, 5, 1) }),
        createMockSession({ id: 's2', date: new Date(2025, 5, 15) }),
        createMockSession({ id: 's3', date: new Date(2025, 6, 1) }),
        createMockSession({ id: 's4', date: new Date(2024, 5, 1) }),
      ]

      const result = filterSessionsByMonth(sessions, 5, 2025)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('s1')
      expect(result[1].id).toBe('s2')
    })

    it('should return empty array when no sessions match', () => {
      const sessions = [
        createMockSession({ id: 's1', date: new Date(2025, 5, 1) }),
      ]

      const result = filterSessionsByMonth(sessions, 11, 2025)

      expect(result).toHaveLength(0)
    })
  })

  describe('calculateStreak', () => {
    it('should return 0 for empty sessions', () => {
      expect(calculateStreak([])).toBe(0)
    })

    it('should calculate streak for consecutive days', () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const twoDaysAgo = new Date(today)
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

      const sessions = [
        createMockSession({ id: 's1', date: twoDaysAgo }),
        createMockSession({ id: 's2', date: yesterday }),
        createMockSession({ id: 's3', date: today }),
      ]

      expect(calculateStreak(sessions)).toBe(3)
    })

    it('should return 0 if last session was more than a day ago', () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const threeDaysAgo = new Date(today)
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

      const sessions = [
        createMockSession({ id: 's1', date: threeDaysAgo }),
      ]

      expect(calculateStreak(sessions)).toBe(0)
    })

    it('should count streak starting from yesterday', () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const twoDaysAgo = new Date(today)
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

      const sessions = [
        createMockSession({ id: 's1', date: twoDaysAgo }),
        createMockSession({ id: 's2', date: yesterday }),
      ]

      expect(calculateStreak(sessions)).toBe(2)
    })

    it('should handle duplicate dates on same day', () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const today2 = new Date(today)
      today2.setHours(12, 0, 0, 0)

      const sessions = [
        createMockSession({ id: 's1', date: today }),
        createMockSession({ id: 's2', date: today2 }),
      ]

      expect(calculateStreak(sessions)).toBe(1)
    })
  })
})
