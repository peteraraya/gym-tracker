import {
  estimate1RM,
  recommendWeightIncrease,
  recommendForSession,
} from '@/lib/workout/progression'
import { createMockSession } from '@/__tests__/helpers/mockData'

describe('Progression Library', () => {
  describe('estimate1RM', () => {
    it('should calculate 1RM using Epley formula', () => {
      // Epley: weight * (1 + reps/30)
      // 100kg * (1 + 8/30) = 100 * 1.267 = 126.7 -> rounded to 127
      expect(estimate1RM(100, 8)).toBe(127)
    })

    it('should return correct 1RM for 1 rep', () => {
      // 100 * (1 + 1/30) = 103.3 -> 103
      expect(estimate1RM(100, 1)).toBe(103)
    })

    it('should return 0 for invalid inputs', () => {
      expect(estimate1RM(0, 5)).toBe(0)
      expect(estimate1RM(100, 0)).toBe(0)
      expect(estimate1RM(100, -1)).toBe(0)
    })
  })

  describe('recommendWeightIncrease', () => {
    it('should not recommend with insufficient history', () => {
      const sessions = [
        createMockSession({
          id: 's1',
          exercises: [{
            exerciseId: 'bench',
            exerciseName: 'Bench Press',
            completedSets: 3,
            actualReps: [10, 10, 10],
            actualWeight: [80, 80, 80],
          }],
        }),
      ]

      const result = recommendWeightIncrease('bench', sessions)

      expect(result.recommend).toBe(false)
      expect(result.reason).toBe('Historial insuficiente')
    })

    it('should recommend when 2-for-2 rule is met', () => {
      const sessions = [
        createMockSession({
          id: 's1',
          date: new Date('2025-11-01'),
          exercises: [{
            exerciseId: 'bench',
            exerciseName: 'Bench Press',
            completedSets: 3,
            actualReps: [10, 10, 10], // Last set: 10 reps (>= 8)
            actualWeight: [80, 80, 80],
          }],
        }),
        createMockSession({
          id: 's2',
          date: new Date('2025-11-08'),
          exercises: [{
            exerciseId: 'bench',
            exerciseName: 'Bench Press',
            completedSets: 3,
            actualReps: [10, 10, 10], // Last set: 10 reps (>= 8)
            actualWeight: [80, 80, 80],
          }],
        }),
      ]

      const result = recommendWeightIncrease('bench', sessions, { repTarget: 8 })

      expect(result.recommend).toBe(true)
      expect(result.reason).toBe('2-for-2 alcanzado')
      expect(result.suggestedWeight).toBe(82.5) // 80 + 2.5
    })

    it('should not recommend when 2-for-2 rule is not met', () => {
      const sessions = [
        createMockSession({
          id: 's1',
          date: new Date('2025-11-01'),
          exercises: [{
            exerciseId: 'bench',
            exerciseName: 'Bench Press',
            completedSets: 3,
            actualReps: [10, 10, 7], // Last set: 7 reps (< 8)
            actualWeight: [80, 80, 80],
          }],
        }),
        createMockSession({
          id: 's2',
          date: new Date('2025-11-08'),
          exercises: [{
            exerciseId: 'bench',
            exerciseName: 'Bench Press',
            completedSets: 3,
            actualReps: [10, 10, 10], // Last set: 10 reps (>= 8)
            actualWeight: [80, 80, 80],
          }],
        }),
      ]

      const result = recommendWeightIncrease('bench', sessions, { repTarget: 8 })

      expect(result.recommend).toBe(false)
      expect(result.reason).toBe('No cumple 2-for-2')
    })

    it('should use custom repTarget', () => {
      const sessions = [
        createMockSession({
          id: 's1',
          date: new Date('2025-11-01'),
          exercises: [{
            exerciseId: 'bench',
            exerciseName: 'Bench Press',
            completedSets: 3,
            actualReps: [10, 10, 10],
            actualWeight: [80, 80, 80],
          }],
        }),
        createMockSession({
          id: 's2',
          date: new Date('2025-11-08'),
          exercises: [{
            exerciseId: 'bench',
            exerciseName: 'Bench Press',
            completedSets: 3,
            actualReps: [10, 10, 10],
            actualWeight: [80, 80, 80],
          }],
        }),
      ]

      // With repTarget=12, 10 reps doesn't meet the target
      const result = recommendWeightIncrease('bench', sessions, { repTarget: 12 })

      expect(result.recommend).toBe(false)
    })

    it('should use smaller increment for non-compound exercises', () => {
      const sessions = [
        createMockSession({
          id: 's1',
          date: new Date('2025-11-01'),
          exercises: [{
            exerciseId: 'curl',
            exerciseName: 'Bicep Curl',
            completedSets: 3,
            actualReps: [10, 10, 10],
            actualWeight: [20, 20, 20],
          }],
        }),
        createMockSession({
          id: 's2',
          date: new Date('2025-11-08'),
          exercises: [{
            exerciseId: 'curl',
            exerciseName: 'Bicep Curl',
            completedSets: 3,
            actualReps: [10, 10, 10],
            actualWeight: [20, 20, 20],
          }],
        }),
      ]

      const result = recommendWeightIncrease('curl', sessions, { compound: false })

      expect(result.recommend).toBe(true)
      // 20 + 1.25 = 21.25, rounded to 0.5 increment = 21.5
      expect(result.suggestedWeight).toBe(21.5)
    })

    it('should return last weights in recommendation', () => {
      const sessions = [
        createMockSession({
          id: 's1',
          date: new Date('2025-11-01'),
          exercises: [{
            exerciseId: 'bench',
            exerciseName: 'Bench Press',
            completedSets: 3,
            actualReps: [10, 10, 10],
            actualWeight: [75, 75, 75],
          }],
        }),
        createMockSession({
          id: 's2',
          date: new Date('2025-11-08'),
          exercises: [{
            exerciseId: 'bench',
            exerciseName: 'Bench Press',
            completedSets: 3,
            actualReps: [10, 10, 10],
            actualWeight: [80, 80, 80],
          }],
        }),
      ]

      const result = recommendWeightIncrease('bench', sessions)

      expect(result.lastWeights).toBeDefined()
      expect(result.lastWeights?.length).toBeGreaterThanOrEqual(1)
    })

    it('should handle exercise not present in sessions', () => {
      const sessions = [
        createMockSession({
          id: 's1',
          exercises: [{
            exerciseId: 'squat',
            exerciseName: 'Squat',
            completedSets: 3,
            actualReps: [10, 10, 10],
            actualWeight: [100, 100, 100],
          }],
        }),
      ]

      const result = recommendWeightIncrease('bench', sessions)

      expect(result.recommend).toBe(false)
      expect(result.reason).toBe('Historial insuficiente')
    })
  })

  describe('recommendForSession', () => {
    it('should generate recommendations for all exercises in session', () => {
      const session = createMockSession({
        exercises: [
          { exerciseId: 'bench', exerciseName: 'Bench Press', completedSets: 3, actualReps: [10, 10, 10], actualWeight: [80, 80, 80] },
          { exerciseId: 'squat', exerciseName: 'Squat', completedSets: 3, actualReps: [10, 10, 10], actualWeight: [100, 100, 100] },
        ],
      })

      const allSessions = [
        createMockSession({
          id: 's1',
          date: new Date('2025-11-01'),
          exercises: [
            { exerciseId: 'bench', exerciseName: 'Bench Press', completedSets: 3, actualReps: [10, 10, 10], actualWeight: [80, 80, 80] },
            { exerciseId: 'squat', exerciseName: 'Squat', completedSets: 3, actualReps: [10, 10, 10], actualWeight: [100, 100, 100] },
          ],
        }),
        createMockSession({
          id: 's2',
          date: new Date('2025-11-08'),
          exercises: [
            { exerciseId: 'bench', exerciseName: 'Bench Press', completedSets: 3, actualReps: [10, 10, 10], actualWeight: [80, 80, 80] },
            { exerciseId: 'squat', exerciseName: 'Squat', completedSets: 3, actualReps: [10, 10, 10], actualWeight: [100, 100, 100] },
          ],
        }),
      ]

      const results = recommendForSession(session, allSessions)

      expect(results).toHaveLength(2)
      expect(results[0].exerciseId).toBe('bench')
      expect(results[1].exerciseId).toBe('squat')
    })

    it('should return empty array for session without exercises', () => {
      const session = createMockSession({ exercises: [] })
      const results = recommendForSession(session, [])

      expect(results).toHaveLength(0)
    })
  })
})
