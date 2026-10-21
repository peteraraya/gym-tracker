/// <reference types="jest" />
import { initializeWorkout, type InitWorkoutParams } from "../workoutInitService";
import * as storageService from "@/lib/infrastructure/storage/storage";

jest.mock("@/lib/infrastructure/storage/storage", () => ({
  getActiveWorkout: jest.fn(),
}));

describe("workoutInitService", () => {
  type MockParams = Omit<
    InitWorkoutParams,
    | "getRoutineById"
    | "startWorkout"
    | "workoutState"
    | "timerHandlers"
    | "setWorkoutStartTime"
    | "setShowStartSplash"
    | "setRoutine"
    | "setOriginalRoutine"
    | "setIsInitialized"
    | "routerPush"
    | "shouldContinue"
  > & {
    getRoutineById: jest.Mock;
    startWorkout: jest.Mock;
    workoutState: { [K in keyof InitWorkoutParams["workoutState"]]: jest.Mock };
    timerHandlers: { startTimer: jest.Mock };
    setWorkoutStartTime: jest.Mock;
    setShowStartSplash: jest.Mock;
    setRoutine: jest.Mock;
    setOriginalRoutine: jest.Mock;
    setIsInitialized: jest.Mock;
    routerPush: jest.Mock;
    shouldContinue: jest.Mock;
  };
  let mockParams: MockParams;

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
      routerPush: jest.fn(),
      shouldContinue: jest.fn(() => true),
    };
    jest.clearAllMocks();
    sessionStorage.clear();
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

  it("should show the start splash only after the workout is initialized", async () => {
    const mockRoutine = {
      id: "routine-1",
      exercises: [{ id: "ex-1", sets: [{ reps: 10, weight: 50 }] }],
    };
    mockParams.getRoutineById.mockReturnValue(mockRoutine);
    (storageService.getActiveWorkout as jest.Mock).mockResolvedValue(null);
    sessionStorage.setItem("workout_splash_ts", Date.now().toString());

    await initializeWorkout(mockParams);

    expect(mockParams.setIsInitialized.mock.invocationCallOrder[0]).toBeLessThan(
      mockParams.setShowStartSplash.mock.invocationCallOrder[0],
    );
    expect(mockParams.setShowStartSplash).toHaveBeenCalledWith(true);
    expect(sessionStorage.getItem("workout_splash_ts")).toBeNull();
  });

  it("should not create a session if initialization was cancelled", async () => {
    const mockRoutine = {
      id: "routine-1",
      exercises: [{ id: "ex-1", sets: [{ reps: 10, weight: 50 }] }],
    };
    mockParams.getRoutineById.mockReturnValue(mockRoutine);
    (storageService.getActiveWorkout as jest.Mock).mockResolvedValue(null);
    mockParams.shouldContinue.mockReturnValue(false);

    await initializeWorkout(mockParams);

    expect(mockParams.setRoutine).not.toHaveBeenCalled();
    expect(mockParams.startWorkout).not.toHaveBeenCalled();
    expect(mockParams.setIsInitialized).not.toHaveBeenCalled();
  });

  it("should prefer the in-memory session when storage has not persisted it yet", async () => {
    const mockRoutine = {
      id: "routine-1",
      exercises: [{ id: "ex-1", sets: [{ reps: 10, weight: 50 }] }],
    };
    mockParams.getRoutineById.mockReturnValue(mockRoutine);
    mockParams.activeWorkout = {
      routineId: "routine-1",
      startedAt: new Date().toISOString(),
      currentExerciseIndex: 0,
      currentSet: 1,
      completedSets: { "ex-1": 1 },
    };
    (storageService.getActiveWorkout as jest.Mock).mockResolvedValue(null);

    await initializeWorkout(mockParams);

    expect(mockParams.startWorkout).not.toHaveBeenCalled();
    expect(mockParams.workoutState.restoreData).toHaveBeenCalledWith(
      expect.objectContaining({ completedSets: { "ex-1": 1 } }),
    );
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
