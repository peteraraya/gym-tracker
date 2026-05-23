import { GET, POST } from '@/app/api/sessions/route'
import { NextRequest } from 'next/server'
import { createMockSession } from '@/__tests__/helpers/mockData'

const createMockChain = (finalResult: any) => ({
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnValue(Promise.resolve(finalResult)),
  single: jest.fn().mockReturnValue(Promise.resolve(finalResult)),
})

const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(),
}

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => mockSupabase),
}))

describe('Sessions API - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/sessions', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('autenticación')
    })

    it('should return sessions for authenticated user', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockSessionsData = [
        {
          id: 'session-1',
          routine_id: 'routine-1',
          date: new Date(),
          notes: 'Great workout',
          routines: { name: 'Push Day' },
          session_exercises: [
            {
              exercise_id: 'ex-1',
              exercises: { name: 'Bench Press' },
              completed_sets: 3,
              actual_reps: [10, 10, 8],
              actual_weight: [80, 80, 80],
            },
          ],
        },
      ]

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabase.from.mockReturnValue(createMockChain({
        data: mockSessionsData,
        error: null,
      }))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
    })

    it('should return 500 on database error', async () => {
      const mockUser = { id: 'user-123' }
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabase.from.mockReturnValue(createMockChain({
        data: null,
        error: { message: 'Database error' },
      }))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error.toLowerCase()).toContain('error')
    })
  })

  describe('POST /api/sessions', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      const request = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'POST',
        body: JSON.stringify({
          routineId: 'routine-1',
          exercises: [],
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('autenticación')
    })

    it('should return 400 if routineId is missing', async () => {
      const mockUser = { id: 'user-123' }
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const request = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'POST',
        body: JSON.stringify({
          exercises: [],
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('inválidos')
    })

    it('should return 400 if exercises array is empty', async () => {
      const mockUser = { id: 'user-123' }
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const request = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'POST',
        body: JSON.stringify({
          routineId: 'routine-1',
          exercises: [],
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('inválidos')
    })

    it('should create session successfully', async () => {
      const mockUser = { id: 'user-123' }
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'workout_sessions') {
          const insertResult = {
            data: { id: 'session-1', user_id: 'user-123', routine_id: 'routine-1' },
            error: null,
          }
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockReturnValue(Promise.resolve(insertResult)),
              }),
            }),
          }
        }
        return {
          insert: jest.fn().mockReturnValue(Promise.resolve({
            data: null,
            error: null,
          })),
        }
      })

      const request = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'POST',
        body: JSON.stringify({
          routineId: 'routine-1',
          exercises: [{
            exerciseId: 'ex-1',
            completedSets: 3,
            actualReps: [10, 10, 10],
            actualWeight: [80, 80, 80],
          }],
          notes: 'Great workout',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.id).toBeDefined()
    })

    it('should rollback session if exercises insert fails', async () => {
      const mockUser = { id: 'user-123' }
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const deleteMock = jest.fn().mockReturnThis()

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'session_exercises') {
          return {
            insert: jest.fn().mockReturnValue(Promise.resolve({
              data: null,
              error: { message: 'Insert failed' },
            })),
          }
        }
        if (table === 'workout_sessions') {
          const insertResult = {
            data: { id: 'session-1' },
            error: null,
          }
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockReturnValue(Promise.resolve(insertResult)),
              }),
            }),
            delete: deleteMock,
            eq: jest.fn().mockReturnThis(),
          }
        }
        return {
          insert: jest.fn().mockReturnValue(Promise.resolve({
            data: null,
            error: null,
          })),
        }
      })

      const request = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'POST',
        body: JSON.stringify({
          routineId: 'routine-1',
          exercises: [{
            exerciseId: 'ex-1',
            completedSets: 3,
            actualReps: [10, 10, 10],
            actualWeight: [80, 80, 80],
          }],
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('ejercicios')
      expect(deleteMock).toHaveBeenCalled()
    })
  })
})
