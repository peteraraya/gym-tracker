import { describe, it, expect, jest } from '@jest/globals';
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

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine, {}));

    expect(result.current.workoutData.completedSets).toBeDefined();
    expect(result.current.workoutData.actualReps).toBeDefined();
    expect(result.current.workoutData.actualWeights).toBeDefined();
    expect(result.current.currentExerciseIndex).toBe(0);
    expect(result.current.currentSet).toBe(1);
  });

  it('should update current exercise index', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine, {}));

    act(() => {
      result.current.setCurrentExerciseIndex(1);
    });

    expect(result.current.currentExerciseIndex).toBe(1);
  });

  it('should update current set', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine, {}));

    act(() => {
      result.current.setCurrentSet(2);
    });

    expect(result.current.currentSet).toBe(2);
  });

  it('should update completed sets', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine, {}));

    act(() => {
      result.current.updateCompletedSets('ex-1', 1);
    });

    expect(result.current.workoutData.completedSets['ex-1']).toBe(1);
  });

  it('should update actual reps', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine, {}));

    act(() => {
      result.current.updateActualReps('ex-1', [10, 8]);
    });

    expect(result.current.workoutData.actualReps['ex-1']).toEqual([10, 8]);
  });

  it('should update actual weights', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine, {}));

    act(() => {
      result.current.updateActualWeights('ex-1', [60, 70]);
    });

    expect(result.current.workoutData.actualWeights['ex-1']).toEqual([60, 70]);
  });

  it('should complete a set', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine, {}));

    act(() => {
      result.current.completeSet('ex-1', 10, 60);
    });

    expect(result.current.workoutData.actualReps['ex-1'][0]).toBe(10);
    expect(result.current.workoutData.actualWeights['ex-1'][0]).toBe(60);
    expect(result.current.workoutData.completedSets['ex-1']).toBe(1);
  });

  it('should get exercise data', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine, {}));

    const data = result.current.getExerciseData('ex-1');

    expect(data).toBeDefined();
    expect(data?.completedSets).toBe(0);
    expect(data?.actualReps).toEqual([]);
    expect(data?.actualWeights).toEqual([]);
  });

  it('should reset all data', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine, {}));

    act(() => {
      result.current.updateCompletedSets('ex-1', 2);
      result.current.reset();
    });

    expect(result.current.workoutData.completedSets['ex-1']).toBeUndefined();
  });

  it('should restore data', () => {
    const { result } = renderHook(() => useWorkoutState(mockRoutine, {}));

    act(() => {
      result.current.restoreData({
        completedSets: { 'ex-1': 1 },
        actualReps: { 'ex-1': [10] },
        actualWeights: { 'ex-1': [60] },
        setTypes: {},
        lastWeights: {}
      });
    });

    expect(result.current.workoutData.completedSets['ex-1']).toBe(1);
    expect(result.current.workoutData.actualReps['ex-1']).toEqual([10]);
    expect(result.current.workoutData.actualWeights['ex-1']).toEqual([60]);
  });

  it('should return memoized object', () => {
    const { result, rerender } = renderHook(
      (props) => useWorkoutState(props.routine, {}),
      { initialProps: { routine: mockRoutine } }
    );

    const firstResult = result.current;

    rerender({ routine: mockRoutine });

    // The object should be memoized - same reference if deps haven't changed
    expect(result.current).toBe(firstResult);
  });
});
