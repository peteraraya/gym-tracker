"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Routine, WorkoutSession } from "@/types";
import { useAuth } from "./AuthContext";
import * as storageService from "@/lib/storage/storage";
import { recommendForSession } from "@/lib/workout/progression";
import { useRoutines as useRoutinesQuery } from "@/hooks/queries/useRoutines";
import { useSessions as useSessionsQuery } from "@/hooks/queries/useSessions";
import { achievementManager } from "@/lib/achievements/achievementManager"; // ✨ Importar el gestor de logros
import logger from "@/lib/logger";

interface RoutinesContextType {
  routines: Routine[];
  loading: boolean;
  addRoutine: (
    routine: Omit<Routine, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateRoutine: (id: string, routine: Partial<Routine>) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  getRoutineById: (id: string) => Routine | undefined;
  refreshRoutines: () => Promise<void>;
}

interface SessionsContextType {
  sessions: WorkoutSession[];
  loading: boolean;
  addSession: (session: Omit<WorkoutSession, "id">) => Promise<void>;
  updateSession: (session: WorkoutSession) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  refreshSessions: () => Promise<void>;
}

interface GymContextType extends RoutinesContextType, SessionsContextType {}

const RoutinesContext = createContext<RoutinesContextType | undefined>(
  undefined,
);
const SessionsContext = createContext<SessionsContextType | undefined>(
  undefined,
);
const GymContext = createContext<GymContextType | undefined>(undefined);

export const GymProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const reactQueryRoutines = useRoutinesQuery();
  const reactQuerySessions = useSessionsQuery();
  const { user, loading: authLoading } = useAuth();

  const [isMigrating, setIsMigrating] = useState(true);

  // ─── Propiedades atómicas extraídas ────────────────────────────────────────
  // Extraemos cada propiedad/función individualmente para que los hooks de React
  // solo se re-ejecuten cuando cambie exactamente la dependencia que usan,
  // no cuando cambie cualquier otra propiedad del objeto del query hook.

  // Rutinas
  const routinesList = reactQueryRoutines.routines;
  const routinesIsLoading = reactQueryRoutines.isLoading;
  const refetchRoutines = reactQueryRoutines.refetch;
  const createRoutineFn = reactQueryRoutines.createRoutine;
  const updateRoutineFn = reactQueryRoutines.updateRoutine;
  const deleteRoutineFn = reactQueryRoutines.deleteRoutine;

  // Sesiones
  const sessionsList = reactQuerySessions.sessions;
  const sessionsIsLoading = reactQuerySessions.isLoading;
  const refetchSessions = reactQuerySessions.refetch;
  const addSessionFn = reactQuerySessions.addSession;
  const updateSessionFn = reactQuerySessions.updateSession;
  const deleteSessionFn = reactQuerySessions.deleteSession;

  // Aliases semánticos usados en los useEffect previos
  const sessionsForAchievements = sessionsList;
  const sessionsLoading = sessionsIsLoading;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const migrationResult = await storageService.migrateLegacySessions();
        if (migrationResult.migrated > 0 && mounted) {
          await refetchSessions();
        }
      } catch (e) {
        logger.warn("[GymContext] Migration failed:", e);
      } finally {
        if (mounted) setIsMigrating(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [refetchSessions]);

  // ✨ Inicializar el sistema de logros cuando las sesiones estén cargadas
  useEffect(() => {
    if (!sessionsLoading && sessionsForAchievements) {
      logger.log(
        "[GymContext] Initializing achievement manager with",
        sessionsForAchievements.length,
        "sessions",
      );
      achievementManager.initialize(sessionsForAchievements);
    }
  }, [sessionsLoading, sessionsForAchievements]);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_DATABASE === "true") {
      if (authLoading) return;
      if (!user) {
        refetchRoutines();
        refetchSessions();
      } else {
        void refetchRoutines();
        void refetchSessions();
      }
    }
  }, [user, authLoading, refetchRoutines, refetchSessions]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (process.env.NEXT_PUBLIC_ENABLE_DATABASE === "true") {
        try {
          const storageStatus = storageService.getStorageStatus();
          if (storageStatus.mode === "localStorage" && storageStatus.hasError) {
            const sessionSyncResult =
              await storageService.syncLocalSessionsToDatabase();
            if (sessionSyncResult.synced > 0 && mounted) {
              await refetchSessions();
            }
            const routineSyncResult =
              await storageService.syncLocalRoutinesToDatabase();
            if (routineSyncResult.synced > 0 && mounted) {
              await refetchRoutines();
            }
          }
        } catch (e) {
          logger.warn("[GymContext] Sync check failed:", e);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [refetchRoutines, refetchSessions]);

  const addRoutine = useCallback(
    async (routine: Omit<Routine, "id" | "createdAt" | "updatedAt">) => {
      await createRoutineFn(routine as storageService.CreateRoutineData);
    },
    [createRoutineFn],
  );

  const updateRoutine = useCallback(
    async (id: string, updatedData: Partial<Routine>) => {
      const routine = routinesList.find((r) => r.id === id);
      if (!routine) throw new Error("Rutina no encontrada");
      const updatedRoutine = {
        ...routine,
        ...updatedData,
      } as storageService.CreateRoutineData;
      await updateRoutineFn(id, updatedRoutine);
    },
    [routinesList, updateRoutineFn],
  );

  const deleteRoutine = useCallback(
    async (id: string) => {
      await deleteRoutineFn(id);

      try {
        const { getWeeklyPlan, saveWeeklyPlan } =
          await import("@/lib/storage/storage");
        const weeklyPlan = await getWeeklyPlan();

        if (weeklyPlan) {
          const days = [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ] as const;
          let planModified = false;
          const updatedPlan = { ...weeklyPlan };

          for (const day of days) {
            if (updatedPlan[day]?.routines) {
              const originalLength = updatedPlan[day].routines.length;
              updatedPlan[day].routines = updatedPlan[day].routines.filter(
                (rid: string) => rid !== id,
              );
              if (updatedPlan[day].routines.length !== originalLength) {
                planModified = true;
              }
            }
          }

          if (planModified) {
            await saveWeeklyPlan(updatedPlan);
          }
        }
      } catch (planError) {
        logger.warn("Error cleaning routine from weekly planner:", planError);
      }
    },
    [deleteRoutineFn],
  );

  const addSession = useCallback(
    async (session: Omit<WorkoutSession, "id">) => {
      await addSessionFn(session);

      try {
        const recs = recommendForSession(
          session as WorkoutSession,
          sessionsList,
          { repTarget: 8, compound: true },
        );
        if (recs && recs.length > 0) {
          await storageService.saveRecommendations(recs);
        }
      } catch (e) {
        logger.warn("[GymContext] Failed to save recommendations:", e);
      }
    },
    [addSessionFn, sessionsList],
  );

  const updateSession = useCallback(
    async (updatedSession: WorkoutSession) => {
      await updateSessionFn(updatedSession);
    },
    [updateSessionFn],
  );

  const deleteSession = useCallback(
    async (sessionId: string) => {
      await deleteSessionFn(sessionId);
    },
    [deleteSessionFn],
  );

  const getRoutineById = useCallback(
    (id: string) => routinesList.find((r) => r.id === id),
    [routinesList],
  );

  const routinesValue = useMemo<RoutinesContextType>(
    () => ({
      routines: routinesList,
      loading: routinesIsLoading || isMigrating,
      addRoutine,
      updateRoutine,
      deleteRoutine,
      getRoutineById,
      refreshRoutines: async () => {
        refetchRoutines();
      },
    }),
    // Solo se recalcula cuando cambian los datos o funciones que realmente usa
    [
      routinesList,
      routinesIsLoading,
      isMigrating,
      refetchRoutines,
      addRoutine,
      updateRoutine,
      deleteRoutine,
      getRoutineById,
    ],
  );

  const sessionsValue = useMemo<SessionsContextType>(
    () => ({
      sessions: sessionsList,
      loading: sessionsIsLoading || isMigrating,
      addSession,
      updateSession,
      deleteSession,
      refreshSessions: async () => {
        refetchSessions();
      },
    }),
    // Solo se recalcula cuando cambian los datos o funciones que realmente usa
    [
      sessionsList,
      sessionsIsLoading,
      isMigrating,
      refetchSessions,
      addSession,
      updateSession,
      deleteSession,
    ],
  );

  const value = useMemo<GymContextType>(
    () => ({
      ...routinesValue,
      ...sessionsValue,
    }),
    [routinesValue, sessionsValue],
  );

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      // @ts-expect-error Temporary debug helper
      window.__rebuildRoutinesFromSessions = async () => {
        try {
          const created = await storageService.rebuildRoutinesFromSessions();
          await refetchRoutines();
          await refetchSessions();
          return created;
        } catch (e) {
          logger.error("[GymContext] rebuild failed", e);
          throw e;
        }
      };
    }
  }, [refetchRoutines, refetchSessions]);

  return (
    <RoutinesContext.Provider value={routinesValue}>
      <SessionsContext.Provider value={sessionsValue}>
        <GymContext.Provider value={value}>{children}</GymContext.Provider>
      </SessionsContext.Provider>
    </RoutinesContext.Provider>
  );
};

export const useGym = () => {
  const context = useContext(GymContext);
  if (context === undefined) {
    throw new Error("useGym must be used within a GymProvider");
  }
  return context;
};

export const useRoutines = () => {
  const ctx = useContext(RoutinesContext);
  if (ctx === undefined)
    throw new Error("useRoutines must be used within a GymProvider");
  return ctx;
};

export const useSessions = () => {
  const ctx = useContext(SessionsContext);
  if (ctx === undefined)
    throw new Error("useSessions must be used within a GymProvider");
  return ctx;
};
