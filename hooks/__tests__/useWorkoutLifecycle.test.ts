import { act, renderHook } from "@testing-library/react";
import * as storageService from "@/lib/infrastructure/storage/storage";
import { saveQueue } from "@/lib/shared/utils/saveQueue";
import { useWorkoutLifecycle } from "../useWorkoutLifecycle";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

jest.mock("@/hooks/useAppLifecycle", () => ({
  useAppLifecycle: jest.fn(),
}));

jest.mock("@/lib/infrastructure/storage/storage", () => ({
  getActiveWorkout: jest.fn(),
  clearActiveWorkout: jest.fn(),
}));

jest.mock("@/lib/shared/utils/saveQueue", () => ({
  saveQueue: {
    save: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("@/lib/shared/validation", () => ({
  WorkoutStateSchema: {},
  validateDataWithLogging: jest.fn((_schema, data) => ({
    success: true,
    data,
  })),
}));

jest.mock("@/lib/shared/utils/workoutBackup", () => ({
  saveBackup: jest.fn(),
  attemptPartialRecovery: jest.fn(() => null),
}));

jest.mock("@/lib/application/workout/normalizeWorkoutState", () => ({
  normalizeWorkoutState: jest.fn((workout) => workout),
}));

const activeWorkout = {
  routineId: "routine-1",
  routineName: "Full body",
  currentExerciseIndex: 1,
  currentSet: 2,
  completedSets: { "exercise-1": 1 },
  actualReps: { "exercise-1": [10] },
  actualWeights: { "exercise-1": [20] },
  startedAt: new Date().toISOString(),
};

async function flushLifecycleEffects() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

describe("useWorkoutLifecycle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
    jest.mocked(storageService.getActiveWorkout).mockResolvedValue(activeWorkout);
    jest.mocked(storageService.clearActiveWorkout).mockResolvedValue();
  });

  it("clears a recently cancelled workout instead of restoring it after reload", async () => {
    localStorage.setItem("workout_cancelled_persistent", Date.now().toString());

    const { result } = renderHook(() => useWorkoutLifecycle());
    await flushLifecycleEffects();

    expect(result.current.isLoadingActiveWorkout).toBe(false);
    expect(storageService.getActiveWorkout).not.toHaveBeenCalled();
    expect(saveQueue.clear).toHaveBeenCalledTimes(1);
    expect(result.current.activeWorkout).toBeNull();
    expect(localStorage.getItem("workout_cancelled_persistent")).toBeNull();
  });

  it("restores an active workout when no finish or cancellation marker exists", async () => {
    const { result } = renderHook(() => useWorkoutLifecycle());
    await flushLifecycleEffects();

    expect(result.current.isLoadingActiveWorkout).toBe(false);
    expect(storageService.getActiveWorkout).toHaveBeenCalledTimes(1);
    expect(result.current.activeWorkout).toEqual(activeWorkout);
  });

  it("writes the cancellation marker before the workout is cleared", () => {
    const { result } = renderHook(() => useWorkoutLifecycle());

    act(() => {
      result.current.markCancelled();
    });

    expect(localStorage.getItem("workout_cancelled_persistent")).toBeTruthy();
  });
});
