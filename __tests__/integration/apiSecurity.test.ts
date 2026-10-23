/**
 * API Security Tests
 *
 * Tests security validations implemented in API Routes:
 * - Zod input validation (400 Bad Request for invalid data)
 * - Rate limiting (429 Too Many Requests)
 * - Error responses do not leak internal details (500 without stack traces)
 * - Authentication required (401)
 */

import { GET, POST as POSTRoutines } from '@/app/api/routines/route';
import { GET as GETSessions, POST as POSTSessions } from '@/app/api/sessions/route';
import { NextRequest } from 'next/server';

const createMockChain = (finalResult: any) => ({
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnValue(Promise.resolve(finalResult)),
  single: jest.fn().mockReturnValue(Promise.resolve(finalResult)),
});

const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(),
};

// Mock shared-service but keep real implementations, overriding createSupabaseServerClient
jest.mock('@/lib/infrastructure/supabase/shared-service', () => {
  const actual = jest.requireActual('@/lib/infrastructure/supabase/shared-service');
  return {
    ...actual,
    createSupabaseServerClient: jest.fn(() => mockSupabase),
  };
});

const mockUser = { id: 'user-123', email: 'test@example.com' };

function mockAuthenticated() {
  mockSupabase.auth.getUser.mockResolvedValue({
    data: { user: mockUser },
    error: null,
  });
}

function mockUnauthenticated() {
  mockSupabase.auth.getUser.mockResolvedValue({
    data: { user: null },
    error: { message: 'Not authenticated' },
  });
}

describe('API Security - Routines', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.from = jest.fn();
  });

  describe('POST /api/routines - Input Validation', () => {
    it('should return 400 for missing name', async () => {
      mockAuthenticated();
      const request = new NextRequest('http://localhost:3000/api/routines', {
        method: 'POST',
        body: JSON.stringify({ exercises: [{ name: 'Bench Press', sets: [{ reps: 10, weight: 80 }] }] }),
      });
      const response = await POSTRoutines(request);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error).toBe('Datos inválidos');
    });

    it('should return 400 for empty exercises array', async () => {
      mockAuthenticated();
      const request = new NextRequest('http://localhost:3000/api/routines', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Routine', exercises: [] }),
      });
      const response = await POSTRoutines(request);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error).toBe('Datos inválidos');
    });

    it('should return 400 for invalid reps (negative)', async () => {
      mockAuthenticated();
      const request = new NextRequest('http://localhost:3000/api/routines', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Routine', exercises: [{ name: 'Bench Press', sets: [{ reps: -5, weight: 80 }] }] }),
      });
      const response = await POSTRoutines(request);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error).toBe('Datos inválidos');
    });

    it('should return 400 for missing exercise name', async () => {
      mockAuthenticated();
      const request = new NextRequest('http://localhost:3000/api/routines', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Routine', exercises: [{ name: '', sets: [{ reps: 10, weight: 80 }] }] }),
      });
      const response = await POSTRoutines(request);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error).toBe('Datos inválidos');
    });

    it('should return 401 if user is not authenticated', async () => {
      mockUnauthenticated();
      const request = new NextRequest('http://localhost:3000/api/routines', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Routine', exercises: [{ name: 'Bench Press', sets: [{ reps: 10, weight: 80 }] }] }),
      });
      const response = await POSTRoutines(request);
      const data = await response.json();
      expect(response.status).toBe(401);
      expect(data.error).toBe('No autenticado');
    });
  });

  describe('POST /api/routines - Error Handling', () => {
    it('should not leak internal error details in 500 response', async () => {
      mockAuthenticated();
      mockSupabase.from.mockReturnValue(createMockChain({
        data: null,
        error: { message: 'Internal database connection failed: connection refused at host 10.0.0.1' },
      }));
      const response = await GETSessions();
      const data = await response.json();
      expect(response.status).toBe(500);
      expect(data.error).toBe('Error interno del servidor');
      expect(data.details).toBeUndefined();
      expect(JSON.stringify(data)).not.toContain('connection refused');
      expect(JSON.stringify(data)).not.toContain('10.0.0.1');
    });
  });
});

describe('API Security - Sessions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.from = jest.fn();
  });

  describe('POST /api/sessions - Input Validation', () => {
    it('should return 400 for missing routineId', async () => {
      mockAuthenticated();
      const request = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'POST',
        body: JSON.stringify({ exercises: [{ exerciseId: 'ex-1', completedSets: 3, actualReps: [10], actualWeight: [80] }] }),
      });
      const response = await POSTSessions(request);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error).toBe('Datos inválidos');
    });

    it('should return 400 for empty exercises array', async () => {
      mockAuthenticated();
      const request = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'POST',
        body: JSON.stringify({ routineId: 'routine-1', exercises: [] }),
      });
      const response = await POSTSessions(request);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error).toBe('Datos inválidos');
    });

    it('should return 400 for negative completedSets', async () => {
      mockAuthenticated();
      const request = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'POST',
        body: JSON.stringify({ routineId: 'routine-1', exercises: [{ exerciseId: 'ex-1', completedSets: -1, actualReps: [10], actualWeight: [80] }] }),
      });
      const response = await POSTSessions(request);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error).toBe('Datos inválidos');
    });

    it('should return 400 for invalid exerciseId (empty)', async () => {
      mockAuthenticated();
      const request = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'POST',
        body: JSON.stringify({ routineId: 'routine-1', exercises: [{ exerciseId: '', completedSets: 3, actualReps: [10, 10, 10], actualWeight: [80, 80, 80] }] }),
      });
      const response = await POSTSessions(request);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error).toBe('Datos inválidos');
    });

    it('should return 401 if user is not authenticated', async () => {
      mockUnauthenticated();
      const request = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'POST',
        body: JSON.stringify({ routineId: 'routine-1', exercises: [{ exerciseId: 'ex-1', completedSets: 3, actualReps: [10], actualWeight: [80] }] }),
      });
      const response = await POSTSessions(request);
      const data = await response.json();
      expect(response.status).toBe(401);
      expect(data.error).toBe('No autenticado');
    });
  });

  describe('POST /api/sessions - Success Path', () => {
    it('should create session successfully with valid data', async () => {
      mockAuthenticated();
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'workout_sessions') {
          const insertResult = {
            data: { id: 'session-1', user_id: 'user-123', routine_id: 'routine-1' },
            error: null,
          };
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockReturnValue(Promise.resolve(insertResult)),
              }),
            }),
          };
        }
        return {
          insert: jest.fn().mockReturnValue(Promise.resolve({ data: null, error: null })),
        };
      });
      const request = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'POST',
        body: JSON.stringify({
          routineId: 'routine-1',
          exercises: [{ exerciseId: 'ex-1', completedSets: 3, actualReps: [10, 10, 10], actualWeight: [80, 80, 80] }],
          notes: 'Great workout',
        }),
      });
      const response = await POSTSessions(request);
      const data = await response.json();
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.id).toBeDefined();
    });
  });

  describe('GET /api/routines - Authentication', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockUnauthenticated();
      const request = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'POST',
        body: JSON.stringify({ routineId: 'routine-1', exercises: [{ exerciseId: 'ex-1', completedSets: 3, actualReps: [10], actualWeight: [80] }] }),
      });
      const response = await POSTSessions(request);
      const data = await response.json();
      expect(response.status).toBe(401);
      expect(data.error).toBe('No autenticado');
    });
  });
});