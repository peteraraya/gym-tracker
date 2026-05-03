import { GET, POST } from '@/app/api/routines/route'
import { NextRequest } from 'next/server'

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

describe('Routines API - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/routines', () => {
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

    it('should return routines for authenticated user', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockRoutinesData = [
        {
          id: 'routine-1',
          name: 'Push Day',
          description: 'Chest and triceps',
          image_url: '/images/push.jpg',
          rest_between_sets: 90,
          rest_between_exercises: 120,
          created_at: new Date('2025-01-01'),
          updated_at: new Date('2025-01-01'),
          exercises: [
            {
              id: 'ex-1',
              name: 'Bench Press',
              sets_data: [{ reps: 10, weight: 80 }],
              equipment: 'Barra',
              notes: 'Focus on form',
              order_index: 0,
            },
          ],
        },
      ]

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabase.from.mockReturnValue(createMockChain({
        data: mockRoutinesData,
        error: null,
      }))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data[0].name).toBe('Push Day')
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
      expect(data.error).toContain('obtener')
    })
  })

  describe('POST /api/routines', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      const request = new NextRequest('http://localhost:3000/api/routines', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Routine',
          exercises: [{ name: 'Bench Press', sets: [{ reps: 10, weight: 80 }] }],
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('autenticación')
    })

    it('should return 400 if name is missing', async () => {
      const mockUser = { id: 'user-123' }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const request = new NextRequest('http://localhost:3000/api/routines', {
        method: 'POST',
        body: JSON.stringify({
          exercises: [{ name: 'Bench Press', sets: [{ reps: 10, weight: 80 }] }],
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

      const request = new NextRequest('http://localhost:3000/api/routines', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Routine',
          exercises: [],
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('inválidos')
    })

    it('should return 400 if exercise is missing name', async () => {
      const mockUser = { id: 'user-123' }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const request = new NextRequest('http://localhost:3000/api/routines', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Routine',
          exercises: [{ sets: [{ reps: 10, weight: 80 }] }],
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('inválidos')
    })

    it('should return 400 if exercise has no sets', async () => {
      const mockUser = { id: 'user-123' }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const request = new NextRequest('http://localhost:3000/api/routines', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Routine',
          exercises: [{ name: 'Bench Press', sets: [] }],
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('inválidos')
    })

    it('should create routine successfully', async () => {
      const mockUser = { id: 'user-123' }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'routines') {
          const insertResult = {
            data: { id: 'routine-1', user_id: 'user-123', name: 'Push Day' },
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

      const request = new NextRequest('http://localhost:3000/api/routines', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Push Day',
          description: 'Chest and triceps',
          exercises: [{
            name: 'Bench Press',
            sets: [{ reps: 10, weight: 80 }, { reps: 10, weight: 80 }],
            equipment: 'Barra',
          }],
          restBetweenSets: 90,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.id).toBeDefined()
    })

    it('should rollback routine if exercises insert fails', async () => {
      const mockUser = { id: 'user-123' }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const deleteMock = jest.fn().mockReturnThis()

      mockSupabase.from = jest.fn((table) => {
        if (table === 'exercises') {
          return {
            insert: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Insert failed' },
            }),
          }
        }
        return {
          select: jest.fn().mockReturnThis(),
          insert: jest.fn().mockReturnThis(),
          delete: deleteMock,
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValueOnce({
            data: { id: 'routine-1' },
            error: null,
          }),
        }
      })

      const request = new NextRequest('http://localhost:3000/api/routines', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Push Day',
          exercises: [{ name: 'Bench Press', sets: [{ reps: 10, weight: 80 }] }],
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
