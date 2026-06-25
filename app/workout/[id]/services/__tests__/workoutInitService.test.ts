/// <reference types="jest" />
import { initializeWorkout } from "../workoutInitService";
import * as storageService from "@/lib/storage/storage";

jest.mock("@/lib/storage/storage", () => ({
  getActiveWorkout: jest.fn(),
}));

describe("workoutInitService", () => {
  let mockParams: any;

  beforeEach(() => {
    mockParams = {
      id: "routine-1",
      activeWorkout: null,
      getRoutineById: jest.fn(),
      startWorkout: jest.fn(),
      workoutState: {
        setCurrentExerciseIndex: jest.fn(),
        setCurrentSet: jest.fn(),
        restoreData: jest.fn(),
        setCurrentReps: jest.fn(),
        setCurrentWeight: jest.fn(),
      },
      timerHandlers: {
        startTimer: jest.fn(),
      },
      setWorkoutStartTime: jest.fn(),
      setShowStartSplash: jest.fn(),
      setRoutine: jest.fn(),
      setOriginalRoutine: jest.fn(),
      setIsInitialized: jest.fn(),
      setInitState: jest.fn(),
      routerPush: jest.fn(),
      initState: { hasLoadedModified: false, lastRoutineId: null },
    };
    jest.clearAllMocks();
  });

  it("should redirect if routine is not found", async () => {
    mockParams.getRoutineById.mockReturnValue(null);

    await initializeWorkout(mockParams);

    expect(mockParams.routerPush).toHaveBeenCalledWith("/routines");
    expect(mockParams.setRoutine).not.toHaveBeenCalled();
  });

  it("should initialize a new workout if no stored workout exists", async () => {
    const mockRoutine = {
      id: "routine-1",
      exercises: [
        { id: "ex-1", sets: [{ reps: 10, weight: 50 }] },
      ],
    };
    mockParams.getRoutineById.mockReturnValue(mockRoutine);
    (storageService.getActiveWorkout as jest.Mock).mockResolvedValue(null);

    await initializeWorkout(mockParams);

    expect(mockParams.setRoutine).toHaveBeenCalled();
    expect(mockParams.startWorkout).toHaveBeenCalled();
    expect(mockParams.workoutState.setCurrentReps).toHaveBeenCalledWith(10);
    expect(mockParams.workoutState.setCurrentWeight).toHaveBeenCalledWith(50);
    expect(mockParams.setIsInitialized).toHaveBeenCalledWith(true);
  });

  it("should restore a workout from storage if it exists", async () => {
    const mockRoutine = {
      id: "routine-1",
      exercises: [
        { id: "ex-1", sets: [{ reps: 10, weight: 50 }, { reps: 10, weight: 55 }] },
      ],
    };
    mockParams.getRoutineById.mockReturnValue(mockRoutine);

    const mockStoredWorkout = {
      routineId: "routine-1",
      startedAt: new Date().toISOString(),
      currentExerciseIndex: 0,
      currentSet: 2,
      completedSets: { "ex-1": 1 },
      actualReps: { "ex-1": [10] },
      actualWeights: { "ex-1": [50] },
      isResting: true,
      restTimerDuration: 60,
      restTimerStartedAt: Date.now() - 30000,
    };
    (storageService.getActiveWorkout as jest.Mock).mockResolvedValue(mockStoredWorkout);

    await initializeWorkout(mockParams);

    expect(mockParams.workoutState.restoreData).toHaveBeenCalledWith(expect.objectContaining({
      completedSets: { "ex-1": 1 },
      actualReps: { "ex-1": [10] },
    }));
    expect(mockParams.workoutState.setCurrentExerciseIndex).toHaveBeenCalledWith(0);
    expect(mockParams.workoutState.setCurrentSet).toHaveBeenCalledWith(2);
    expect(mockParams.timerHandlers.startTimer).toHaveBeenCalled();
  });
});
