import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWorkoutState } from '../useWorkoutState';
import type { Routine } from '@/types';

describe('useWorkoutState', () => {
  const mockRoutine: Routine = {
    id: 'routine-1',
    name: 'Push Day',
    exercises: [
      {
        id: 'ex-1',
        name: 'Bench Press',
        sets: [
          { reps: 10, weight: 60 },
          { reps: 8, weight: 70 }
        ]
      },
      {
        id: 'ex-2',
        name: 'Incline Press',
        sets: [
          { reps: 8, weight: 50 }
        ]
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  it('debe inicializar con estado vacío', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine));

    expect(result.current.currentExerciseIndex).toBe(0);
    expect(result.current.currentSet).toBe(1);
    expect(result.current.currentReps).toBe('');
    expect(result.current.currentWeight).toBe('');
    expect(result.current.sessionNotes).toBe('');
  });

  it('debe inicializar workoutData vacío', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine));

    expect(result.current.workoutData.completedSets).toEqual({});
    expect(result.current.workoutData.actualReps).toEqual({});
    expect(result.current.workoutData.actualWeights).toEqual({});
    expect(result.current.workoutData.setTypes).toEqual({});
  });

  it('debe actualizar currentReps', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine));

    act(() => {
      result.current.setCurrentReps(10);
    });

    expect(result.current.currentReps).toBe(10);
  });

  it('debe actualizar currentWeight', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine));

    act(() => {
      result.current.setCurrentWeight(60);
    });

    expect(result.current.currentWeight).toBe(60);
  });

  it('debe actualizar currentExerciseIndex', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine));

    act(() => {
      result.current.setCurrentExerciseIndex(1);
    });

    expect(result.current.currentExerciseIndex).toBe(1);
  });

  it('debe actualizar currentSet', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine));

    act(() => {
      result.current.setCurrentSet(2);
    });

    expect(result.current.currentSet).toBe(2);
  });

  it('debe actualizar sessionNotes', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine));

    act(() => {
      result.current.setSessionNotes('Great workout!');
    });

    expect(result.current.sessionNotes).toBe('Great workout!');
  });

  it('debe completar una serie', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine));

    act(() => {
      result.current.completeSet('ex-1', 10, 60);
    });

    expect(result.current.workoutData.completedSets['ex-1']).toBe(1);
    expect(result.current.workoutData.actualReps['ex-1']).toEqual([10]);
    expect(result.current.workoutData.actualWeights['ex-1']).toEqual([60]);
  });

  it('debe completar múltiples series', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine));

    act(() => {
      result.current.completeSet('ex-1', 10, 60);
      result.current.completeSet('ex-1', 8, 70);
    });

    expect(result.current.workoutData.completedSets['ex-1']).toBe(2);
    expect(result.current.workoutData.actualReps['ex-1']).toEqual([10, 8]);
    expect(result.current.workoutData.actualWeights['ex-1']).toEqual([60, 70]);
  });

  it('debe actualizar series completadas', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine));

    act(() => {
      result.current.updateCompletedSets('ex-1', 2);
    });

    expect(result.current.workoutData.completedSets['ex-1']).toBe(2);
  });

  it('debe actualizar reps reales', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine));

    act(() => {
      result.current.updateActualReps('ex-1', [10, 8]);
    });

    expect(result.current.workoutData.actualReps['ex-1']).toEqual([10, 8]);
  });

  it('debe actualizar pesos reales', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine));

    act(() => {
      result.current.updateActualWeights('ex-1', [60, 70]);
    });

    expect(result.current.workoutData.actualWeights['ex-1']).toEqual([60, 70]);
  });

  it('debe actualizar tipo de serie', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine));

    act(() => {
      result.current.updateSetType('ex-1', 0, 'warmup');
    });

    expect(result.current.workoutData.setTypes['ex-1'][0]).toBe('warmup');
  });

  it('debe actualizar múltiples tipos de serie', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine));

    act(() => {
      result.current.updateSetType('ex-1', 0, 'warmup');
      result.current.updateSetType('ex-1', 1, 'normal');
    });

    expect(result.current.workoutData.setTypes['ex-1']).toEqual(['warmup', 'normal']);
  });

  it('debe actualizar descanso global', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine));

    act(() => {
      result.current.updateRestOverride('ex-1', 120);
    });

    expect(result.current.workoutData.restOverrides['ex-1']).toBe(120);
  });

  it('debe actualizar descanso por serie', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine));

    act(() => {
      result.current.updatePerSetRestOverride('ex-1', 0, 90);
      result.current.updatePerSetRestOverride('ex-1', 1, 120);
    });

    expect(result.current.workoutData.perSetRestOverrides['ex-1']).toEqual([90, 120]);
  });

  it('debe actualizar duración de serie', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine));

    act(() => {
      result.current.updateSetDuration('ex-1', 0, 45);
    });

    expect(result.current.workoutData.actualSetDurations['ex-1'][0]).toBe(45);
  });

  it('debe actualizar duración de pausa', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine));

    act(() => {
      result.current.updatePauseDuration('ex-1', 0, 10);
    });

    expect(result.current.workoutData.actualPauseDurations['ex-1'][0]).toBe(10);
  });

  it('debe actualizar tiempo de descanso real', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine));

    act(() => {
      result.current.updateRestTime('ex-1', 0, 95);
    });

    expect(result.current.workoutData.actualRestTimes['ex-1'][0]).toBe(95);
  });

  it('debe resetear el estado', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine));

    act(() => {
      result.current.setCurrentReps(10);
      result.current.setCurrentWeight(60);
      result.current.setCurrentExerciseIndex(1);
      result.current.setCurrentSet(2);
      result.current.setSessionNotes('Test');
      result.current.completeSet('ex-1', 10, 60);
    });

    expect(result.current.currentReps).toBe(10);
    expect(result.current.workoutData.completedSets['ex-1']).toBe(1);

    act(() => {
      result.current.reset();
    });

    expect(result.current.currentReps).toBe('');
    expect(result.current.currentWeight).toBe('');
    expect(result.current.currentExerciseIndex).toBe(0);
    expect(result.current.currentSet).toBe(1);
    expect(result.current.sessionNotes).toBe('');
    expect(result.current.workoutData.completedSets).toEqual({});
  });

  it('debe obtener datos de ejercicio', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine));

    act(() => {
      result.current.completeSet('ex-1', 10, 60);
      result.current.updateSetType('ex-1', 0, 'normal');
    });

    const exerciseData = result.current.getExerciseData('ex-1');

    expect(exerciseData.completedSets).toBe(1);
    expect(exerciseData.actualReps).toEqual([10]);
    expect(exerciseData.actualWeights).toEqual([60]);
    expect(exerciseData.setTypes).toEqual(['normal']);
  });

  it('debe retornar datos vacíos para ejercicio sin datos', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine));

    const exerciseData = result.current.getExerciseData('ex-1');

    expect(exerciseData.completedSets).toBe(0);
    expect(exerciseData.actualReps).toEqual([]);
    expect(exerciseData.actualWeights).toEqual([]);
    expect(exerciseData.setTypes).toEqual([]);
  });

  it('debe manejar múltiples ejercicios independientemente', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine));

    act(() => {
      result.current.completeSet('ex-1', 10, 60);
      result.current.completeSet('ex-2', 8, 50);
    });

    expect(result.current.workoutData.completedSets['ex-1']).toBe(1);
    expect(result.current.workoutData.completedSets['ex-2']).toBe(1);
    expect(result.current.workoutData.actualReps['ex-1']).toEqual([10]);
    expect(result.current.workoutData.actualReps['ex-2']).toEqual([8]);
  });

  it('debe permitir actualizar reps vacío', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine));

    act(() => {
      result.current.setCurrentReps('');
    });

    expect(result.current.currentReps).toBe('');
  });

  it('debe permitir actualizar weight vacío', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine));

    act(() => {
      result.current.setCurrentWeight('');
    });

    expect(result.current.currentWeight).toBe('');
  });

  it('debe mantener estado consistente con múltiples actualizaciones', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine));

    act(() => {
      result.current.setCurrentReps(10);
      result.current.setCurrentWeight(60);
      result.current.setCurrentExerciseIndex(0);
      result.current.setCurrentSet(1);
      result.current.completeSet('ex-1', 10, 60);
      result.current.updateSetType('ex-1', 0, 'normal');
      result.current.updateRestOverride('ex-1', 90);
    });

    expect(result.current.currentReps).toBe(10);
    expect(result.current.currentWeight).toBe(60);
    expect(result.current.workoutData.completedSets['ex-1']).toBe(1);
    expect(result.current.workoutData.setTypes['ex-1'][0]).toBe('normal');
    expect(result.current.workoutData.restOverrides['ex-1']).toBe(90);
  });

  it('debe manejar null routine', () => {
    const { result } = renderHook(() => useWorkoutState(null));

    expect(result.current.currentExerciseIndex).toBe(0);
    expect(result.current.currentSet).toBe(1);
    expect(result.current.workoutData.completedSets).toEqual({});
  });

  it('debe actualizar correctamente después de reset', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine));

    act(() => {
      result.current.completeSet('ex-1', 10, 60);
      result.current.reset();
      result.current.completeSet('ex-1', 8, 50);
    });

    expect(result.current.workoutData.completedSets['ex-1']).toBe(1);
    expect(result.current.workoutData.actualReps['ex-1']).toEqual([8]);
    expect(result.current.workoutData.actualWeights['ex-1']).toEqual([50]);
  });
});
