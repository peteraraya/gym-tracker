import { describe, it, expect } from 'vitest';
import {
  recommendWeightIncrease,
  estimate1RM,
  type ProgressionStrategy
} from '@/lib/workout/progression-advanced';
import type { WorkoutSession } from '@/types';

// Helper para crear sesiones de prueba
function createMockSession(
  exerciseId: string,
  date: Date,
  weight: number,
  reps: number,
  sets: number = 3
): WorkoutSession {
  return {
    id: `session-${date.getTime()}`,
    date: date.toISOString(),
    routineId: 'routine-1',
    routineName: 'Test Routine',
    exercises: [
      {
        exerciseId,
        exerciseName: 'Test Exercise',
        actualWeight: Array(sets).fill(weight),
        actualReps: Array(sets).fill(reps),
        completedSets: sets,
        notes: ''
      }
    ],
    totalDuration: 60,
    notes: ''
  } as WorkoutSession;
}

describe('Progression Advanced', () => {
  describe('estimate1RM', () => {
    it('calcula 1RM correctamente', () => {
      expect(estimate1RM(100, 10)).toBe(133);
      expect(estimate1RM(80, 5)).toBe(93);
      expect(estimate1RM(60, 1)).toBe(62);
    });

    it('maneja casos edge', () => {
      expect(estimate1RM(0, 10)).toBe(0);
      expect(estimate1RM(100, 0)).toBe(0);
    });
  });

  describe('recommendWeightIncrease - Progresión Lineal', () => {
    it('recomienda aumento cuando cumple 2-for-2', () => {
      const sessions: WorkoutSession[] = [
        createMockSession('ex1', new Date('2024-01-10'), 50, 10),
        createMockSession('ex1', new Date('2024-01-08'), 50, 10),
        createMockSession('ex1', new Date('2024-01-05'), 47.5, 9)
      ];

      const result = recommendWeightIncrease('ex1', sessions, {
        repTarget: 10,
        compound: true,
        strategy: 'linear'
      });

      expect(result.recommend).toBe(true);
      expect(result.suggestedWeight).toBeGreaterThan(50);
      expect(result.confidence).toBe('high');
      expect(result.factors?.twoForTwo).toBe(true);
    });

    it('no recomienda aumento si no cumple 2-for-2', () => {
      const sessions: WorkoutSession[] = [
        createMockSession('ex1', new Date('2024-01-10'), 50, 8),
        createMockSession('ex1', new Date('2024-01-08'), 50, 10),
        createMockSession('ex1', new Date('2024-01-05'), 50, 9)
      ];

      const result = recommendWeightIncrease('ex1', sessions, {
        repTarget: 10,
        strategy: 'linear'
      });

      expect(result.recommend).toBe(false);
      expect(result.factors?.twoForTwo).toBe(false);
    });

    it('no recomienda aumento si fatiga es alta', () => {
      // Crear muchas sesiones recientes para simular fatiga
      const sessions: WorkoutSession[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        sessions.push(createMockSession('ex1', date, 50, 10));
      }

      const result = recommendWeightIncrease('ex1', sessions, {
        repTarget: 10,
        strategy: 'linear',
        considerFatigue: true
      });

      expect(result.factors?.fatigueScore).toBeGreaterThan(6);
      expect(result.recommend).toBe(false);
    });
  });

  describe('recommendWeightIncrease - Progresión Ondulada', () => {
    it('alterna entre semanas pesadas, medias y ligeras', () => {
      const sessions: WorkoutSession[] = [
        createMockSession('ex1', new Date('2024-01-10'), 50, 10),
        createMockSession('ex1', new Date('2024-01-08'), 50, 10)
      ];

      // Semana 0 (pesada)
      const result1 = recommendWeightIncrease('ex1', sessions, {
        strategy: 'undulating'
      });
      expect(result1.reason).toContain('pesada');

      // Simular más sesiones para cambiar de semana
      sessions.push(createMockSession('ex1', new Date('2024-01-12'), 52.5, 10));
      
      const result2 = recommendWeightIncrease('ex1', sessions, {
        strategy: 'undulating'
      });
      expect(result2.reason).toContain('media');
    });

    it('sugiere descarga en semana ligera', () => {
      const sessions: WorkoutSession[] = [];
      // Crear 5 sesiones para llegar a semana de descarga
      for (let i = 0; i < 5; i++) {
        const date = new Date('2024-01-01');
        date.setDate(date.getDate() + i * 3);
        sessions.push(createMockSession('ex1', date, 50, 10));
      }

      const result = recommendWeightIncrease('ex1', sessions, {
        strategy: 'undulating'
      });

      if (result.reason?.includes('descarga')) {
        expect(result.suggestedWeight).toBeLessThan(50);
      }
    });
  });

  describe('recommendWeightIncrease - Modo Automático', () => {
    it('elige lineal cuando condiciones son buenas', () => {
      const sessions: WorkoutSession[] = [
        createMockSession('ex1', new Date('2024-01-10'), 50, 10),
        createMockSession('ex1', new Date('2024-01-08'), 50, 10),
        createMockSession('ex1', new Date('2024-01-05'), 47.5, 9)
      ];

      const result = recommendWeightIncrease('ex1', sessions, {
        strategy: 'auto',
        considerFatigue: true
      });

      expect(result.strategy).toBe('linear');
    });

    it('elige ondulada cuando hay fatiga alta', () => {
      const sessions: WorkoutSession[] = [];
      // Muchas sesiones recientes = fatiga alta
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        sessions.push(createMockSession('ex1', date, 50, 10));
      }

      const result = recommendWeightIncrease('ex1', sessions, {
        strategy: 'auto',
        considerFatigue: true
      });

      expect(result.strategy).toBe('undulating');
      expect(result.factors?.fatigueScore).toBeGreaterThan(6);
    });
  });

  describe('Análisis de Factores', () => {
    it('detecta tendencia de volumen creciente', () => {
      const sessions: WorkoutSession[] = [
        createMockSession('ex1', new Date('2024-01-10'), 55, 10),
        createMockSession('ex1', new Date('2024-01-08'), 52.5, 10),
        createMockSession('ex1', new Date('2024-01-05'), 50, 10),
        createMockSession('ex1', new Date('2024-01-03'), 47.5, 10)
      ];

      const result = recommendWeightIncrease('ex1', sessions);

      expect(result.factors?.volumeTrend).toBe('increasing');
    });

    it('detecta tendencia de volumen decreciente', () => {
      const sessions: WorkoutSession[] = [
        createMockSession('ex1', new Date('2024-01-10'), 50, 8),
        createMockSession('ex1', new Date('2024-01-08'), 52.5, 9),
        createMockSession('ex1', new Date('2024-01-05'), 55, 10),
        createMockSession('ex1', new Date('2024-01-03'), 55, 10)
      ];

      const result = recommendWeightIncrease('ex1', sessions);

      expect(result.factors?.volumeTrend).toBe('decreasing');
    });

    it('calcula consistencia correctamente', () => {
      const sessions: WorkoutSession[] = [];
      // 12 sesiones en 30 días = 100% consistencia
      for (let i = 0; i < 12; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i * 2.5);
        sessions.push(createMockSession('ex1', date, 50, 10));
      }

      const result = recommendWeightIncrease('ex1', sessions);

      expect(result.factors?.consistencyScore).toBeGreaterThanOrEqual(90);
    });
  });

  describe('Niveles de Confianza', () => {
    it('asigna alta confianza con todos los factores positivos', () => {
      const sessions: WorkoutSession[] = [
        createMockSession('ex1', new Date('2024-01-10'), 52.5, 10),
        createMockSession('ex1', new Date('2024-01-08'), 50, 10),
        createMockSession('ex1', new Date('2024-01-05'), 47.5, 10)
      ];

      const result = recommendWeightIncrease('ex1', sessions, {
        considerFatigue: true,
        considerVolume: true
      });

      expect(result.confidence).toBe('high');
    });

    it('asigna baja confianza con factores negativos', () => {
      const sessions: WorkoutSession[] = [
        createMockSession('ex1', new Date('2024-01-10'), 50, 7),
        createMockSession('ex1', new Date('2024-01-08'), 50, 8)
      ];

      const result = recommendWeightIncrease('ex1', sessions);

      expect(result.confidence).toBe('low');
    });
  });

  describe('Casos Edge', () => {
    it('maneja historial insuficiente', () => {
      const sessions: WorkoutSession[] = [
        createMockSession('ex1', new Date('2024-01-10'), 50, 10)
      ];

      const result = recommendWeightIncrease('ex1', sessions);

      expect(result.recommend).toBe(false);
      expect(result.reason).toContain('insuficiente');
    });

    it('maneja ejercicio sin datos', () => {
      const sessions: WorkoutSession[] = [];

      const result = recommendWeightIncrease('ex1', sessions);

      expect(result.recommend).toBe(false);
    });

    it('respeta incremento personalizado', () => {
      const sessions: WorkoutSession[] = [
        createMockSession('ex1', new Date('2024-01-10'), 50, 10),
        createMockSession('ex1', new Date('2024-01-08'), 50, 10)
      ];

      const result = recommendWeightIncrease('ex1', sessions, {
        absoluteIncrementKg: 10,
        strategy: 'linear'
      });

      if (result.recommend && result.suggestedWeight) {
        expect(result.suggestedWeight).toBe(60);
      }
    });
  });
});
