import type { WorkoutSession, Routine, Exercise } from '@/types'

/**
 * Mock data factory para testing
 */

export const createMockRoutine = (overrides?: Partial<Routine>): Routine => ({
  id: 'routine-1',
  name: 'Push Day',
  description: 'Chest, shoulders, triceps',
  image: '/images/push.jpg',
  exercises: [
    {
      id: 'ex-1',
      name: 'Bench Press',
      sets: 3,
      reps: 10,
      weight: 80,
      notes: 'Focus on form',
    },
    {
      id: 'ex-2',
      name: 'Shoulder Press',
      sets: 3,
      reps: 12,
      weight: 40,
    },
  ],
  restBetweenSets: 90,
  restBetweenExercises: 120,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  ...overrides,
})

export const createMockSession = (overrides?: Partial<WorkoutSession>): WorkoutSession => ({
  id: 'session-1',
  routineId: 'routine-1',
  date: new Date('2025-11-30'),
  exercises: [
    {
      exerciseId: 'ex-1',
      exerciseName: 'Bench Press',
      completedSets: 3,
      actualReps: [10, 10, 8],
      actualWeight: [80, 80, 80],
    },
    {
      exerciseId: 'ex-2',
      exerciseName: 'Shoulder Press',
      completedSets: 3,
      actualReps: [12, 12, 10],
      actualWeight: [40, 40, 40],
    },
  ],
  notes: 'Good session, feeling strong',
  ...overrides,
})

export const createMultipleSessions = (count: number): WorkoutSession[] => {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date('2025-11-30')
    date.setDate(date.getDate() - i)
    
    return createMockSession({
      id: `session-${i + 1}`,
      date,
      exercises: [
        {
          exerciseId: 'ex-1',
          exerciseName: 'Bench Press',
          completedSets: 3,
          actualReps: [10, 10, 8],
          actualWeight: [80 + i * 2.5, 80 + i * 2.5, 80 + i * 2.5], // Progressive overload
        },
      ],
    })
  })
}

export const createMockExercise = (overrides?: Partial<Exercise>): Exercise => ({
  id: 'ex-1',
  name: 'Bench Press',
  sets: 3,
  reps: 10,
  weight: 80,
  notes: '',
  ...overrides,
})

export const mockSupabaseResponse = <T>(data: T, error: any = null) => ({
  data,
  error,
})

export const mockSupabaseError = (message: string) => ({
  data: null,
  error: { message, status: 500 },
})

export const mockUserProfile = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  created_at: new Date('2025-01-01'),
}

export const mockAuthUser = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
    aud: 'authenticated',
    role: 'authenticated',
    created_at: '2025-01-01T00:00:00.000Z',
  },
  error: null,
}
