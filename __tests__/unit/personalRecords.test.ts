import { 
  calculatePersonalRecords, 
  calculateExerciseProgress,
  compareSessions,
  getRecentRoutineSessions 
} from '@/lib/exercises/personalRecords'
import { createMockSession, createMultipleSessions } from '@/__tests__/helpers/mockData'

describe('Personal Records Library - Unit Tests', () => {
  describe('calculatePersonalRecords', () => {
    it('should return empty array for no sessions', () => {
      const result = calculatePersonalRecords([])
      expect(result).toEqual([])
    })

    it('should calculate personal record for single session', () => {
      const session = createMockSession()
      const result = calculatePersonalRecords([session])
      
      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        exerciseName: expect.any(String),
        maxWeight: expect.any(Number),
        reps: expect.any(Number),
        date: expect.any(Date),
        sessionId: session.id,
      })
    })

    it('should find maximum weight × reps across multiple sessions', () => {
      const sessions = createMultipleSessions(5)
      const result = calculatePersonalRecords(sessions)
      
      expect(result).toHaveLength(1)
      expect(result[0].exerciseName).toBe('Bench Press')
      // La última sesión tiene el peso más alto (80 + 4*2.5 = 90)
      expect(result[0].maxWeight).toBe(90)
    })

    it('should sort records by volume (weight × reps)', () => {
      const session = createMockSession({
        exercises: [
          {
            exerciseId: 'ex-1',
            exerciseName: 'Bench Press',
            completedSets: 1,
            actualReps: [10],
            actualWeight: [100], // Volume: 1000
          },
          {
            exerciseId: 'ex-2',
            exerciseName: 'Squat',
            completedSets: 1,
            actualReps: [5],
            actualWeight: [150], // Volume: 750
          },
        ],
      })

      const result = calculatePersonalRecords([session])
      
      expect(result[0].exerciseName).toBe('Bench Press')
      expect(result[1].exerciseName).toBe('Squat')
    })
  })

  describe('calculateExerciseProgress', () => {
    it('should return null for exercise not found', () => {
      const sessions = createMultipleSessions(3)
      const result = calculateExerciseProgress(sessions, 'Non Existent Exercise')
      
      expect(result).toBeNull()
    })

    it('should calculate progress metrics correctly', () => {
      const sessions = createMultipleSessions(5)
      const result = calculateExerciseProgress(sessions, 'Bench Press')
      
      expect(result).not.toBeNull()
      expect(result).toMatchObject({
        sessions: 5,
        totalVolume: expect.any(Number),
        currentWeight: expect.any(Number),
        previousWeight: expect.any(Number),
        personalRecord: expect.any(Object),
        trend: expect.stringMatching(/^(up|down|stable)$/),
        improvement: expect.any(Number),
      })
    })

    it('should detect upward trend with >5% improvement', () => {
      const sessions = [
        createMockSession({
          id: 'session-1',
          date: new Date('2025-11-01'),
          exercises: [{
            exerciseId: 'ex-1',
            exerciseName: 'Bench Press',
            completedSets: 3,
            actualReps: [10, 10, 10],
            actualWeight: [70, 70, 70],
          }],
        }),
        createMockSession({
          id: 'session-2',
          date: new Date('2025-11-30'),
          exercises: [{
            exerciseId: 'ex-1',
            exerciseName: 'Bench Press',
            completedSets: 3,
            actualReps: [10, 10, 10],
            actualWeight: [80, 80, 80], // >14% improvement
          }],
        }),
      ]

      const result = calculateExerciseProgress(sessions, 'Bench Press')
      
      expect(result?.trend).toBe('up')
      expect(result?.improvement).toBeGreaterThan(5)
    })

    it('should detect downward trend with >5% decrease', () => {
      const sessions = [
        createMockSession({
          id: 'session-1',
          date: new Date('2025-11-01'),
          exercises: [{
            exerciseId: 'ex-1',
            exerciseName: 'Bench Press',
            completedSets: 3,
            actualReps: [10, 10, 10],
            actualWeight: [80, 80, 80],
          }],
        }),
        createMockSession({
          id: 'session-2',
          date: new Date('2025-11-30'),
          exercises: [{
            exerciseId: 'ex-1',
            exerciseName: 'Bench Press',
            completedSets: 3,
            actualReps: [10, 10, 10],
            actualWeight: [70, 70, 70], // -12.5% decrease
          }],
        }),
      ]

      const result = calculateExerciseProgress(sessions, 'Bench Press')
      
      expect(result?.trend).toBe('down')
      expect(result?.improvement).toBeLessThan(-5)
    })

    it('should detect stable trend with <5% change', () => {
      const sessions = [
        createMockSession({
          id: 'session-1',
          exercises: [{
            exerciseId: 'ex-1',
            exerciseName: 'Bench Press',
            completedSets: 3,
            actualReps: [10, 10, 10],
            actualWeight: [80, 80, 80],
          }],
        }),
        createMockSession({
          id: 'session-2',
          exercises: [{
            exerciseId: 'ex-1',
            exerciseName: 'Bench Press',
            completedSets: 3,
            actualReps: [10, 10, 10],
            actualWeight: [81, 81, 81], // 1.25% improvement
          }],
        }),
      ]

      const result = calculateExerciseProgress(sessions, 'Bench Press')
      
      expect(result?.trend).toBe('stable')
    })
  })

  describe('compareSessions', () => {
    it('should compare two sessions correctly', () => {
      const session1 = createMockSession({ id: 'session-1' })
      const session2 = createMockSession({ 
        id: 'session-2',
        exercises: [{
          exerciseId: 'ex-1',
          exerciseName: 'Bench Press',
          completedSets: 3,
          actualReps: [12, 12, 10],
          actualWeight: [85, 85, 85],
        }],
      })

      const result = compareSessions(session1, session2)
      
      expect(result).toMatchObject({
        commonExercises: expect.arrayContaining(['Bench Press']),
        differences: expect.any(Array),
      })
    })

    it('should identify exercises only in one session', () => {
      const session1 = createMockSession({
        exercises: [{
          exerciseId: 'ex-1',
          exerciseName: 'Bench Press',
          completedSets: 3,
          actualReps: [10, 10, 10],
          actualWeight: [80, 80, 80],
        }],
      })

      const session2 = createMockSession({
        exercises: [{
          exerciseId: 'ex-2',
          exerciseName: 'Squat',
          completedSets: 3,
          actualReps: [8, 8, 8],
          actualWeight: [100, 100, 100],
        }],
      })

      const result = compareSessions(session1, session2)
      
      expect(result.onlyInSession1).toContain('Bench Press')
      expect(result.onlyInSession2).toContain('Squat')
      expect(result.commonExercises).toHaveLength(0)
    })
  })

  describe('getRecentRoutineSessions', () => {
    it('should filter sessions by routine ID', () => {
      const sessions = [
        createMockSession({ id: 'session-1', routineId: 'routine-1' }),
        createMockSession({ id: 'session-2', routineId: 'routine-2' }),
        createMockSession({ id: 'session-3', routineId: 'routine-1' }),
      ]

      const result = getRecentRoutineSessions(sessions, 'routine-1', 10)
      
      expect(result).toHaveLength(2)
      expect(result.every(s => s.routineId === 'routine-1')).toBe(true)
    })

    it('should limit number of results', () => {
      const sessions = Array.from({ length: 10 }, (_, i) => 
        createMockSession({ id: `session-${i}`, routineId: 'routine-1' })
      )

      const result = getRecentRoutineSessions(sessions, 'routine-1', 5)
      
      expect(result).toHaveLength(5)
    })

    it('should return sessions in descending date order', () => {
      const sessions = [
        createMockSession({ id: 'session-1', routineId: 'routine-1', date: new Date('2025-11-01') }),
        createMockSession({ id: 'session-2', routineId: 'routine-1', date: new Date('2025-11-15') }),
        createMockSession({ id: 'session-3', routineId: 'routine-1', date: new Date('2025-11-30') }),
      ]

      const result = getRecentRoutineSessions(sessions, 'routine-1', 10)
      
      expect(result[0].date.getTime()).toBeGreaterThanOrEqual(result[1].date.getTime())
      expect(result[1].date.getTime()).toBeGreaterThanOrEqual(result[2].date.getTime())
    })
  })
})
