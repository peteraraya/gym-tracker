'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Routine, WorkoutSession } from '@/types';
import { useAuth } from './AuthContext';
import * as storageService from '@/lib/storage/storage';
import { recommendForSession } from '@/lib/progression';
import { useRoutines as useRoutinesQuery } from '@/hooks/queries/useRoutines';
import { useSessions as useSessionsQuery } from '@/hooks/queries/useSessions';
import { achievementManager } from '@/lib/achievementManager'; // ✨ Importar el gestor de logros

interface RoutinesContextType {
  routines: Routine[];
  loading: boolean;
  addRoutine: (routine: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRoutine: (id: string, routine: Partial<Routine>) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  getRoutineById: (id: string) => Routine | undefined;
  refreshRoutines: () => Promise<void>;
}

interface SessionsContextType {
  sessions: WorkoutSession[];
  loading: boolean;
  addSession: (session: Omit<WorkoutSession, 'id'>) => Promise<void>;
  updateSession: (session: WorkoutSession) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  refreshSessions: () => Promise<void>;
}

interface GymContextType extends RoutinesContextType, SessionsContextType {}

const RoutinesContext = createContext<RoutinesContextType | undefined>(undefined);
const SessionsContext = createContext<SessionsContextType | undefined>(undefined);
const GymContext = createContext<GymContextType | undefined>(undefined);

export const GymProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const reactQueryRoutines = useRoutinesQuery();
  const reactQuerySessions = useSessionsQuery();
  const { user, loading: authLoading } = useAuth();

  const [isMigrating, setIsMigrating] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const migrationResult = await storageService.migrateLegacySessions();
        if (migrationResult.migrated > 0 && mounted) {
          await reactQuerySessions.refetch();
        }
      } catch (e) {
        console.warn('[GymContext] Migration failed:', e);
      } finally {
        if (mounted) setIsMigrating(false);
      }
    })();
    return () => { mounted = false };
  }, [reactQuerySessions]);

  // ✨ Inicializar el sistema de logros cuando las sesiones estén cargadas
  useEffect(() => {
    if (!reactQuerySessions.isLoading && reactQuerySessions.sessions) {
      console.log('[GymContext] Initializing achievement manager with', reactQuerySessions.sessions.length, 'sessions');
      achievementManager.initialize(reactQuerySessions.sessions);
    }
  }, [reactQuerySessions.isLoading, reactQuerySessions.sessions]);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_DATABASE === 'true') {
      if (authLoading) return;
      if (!user) {
        reactQueryRoutines.refetch();
        reactQuerySessions.refetch();
      }
    }
  }, [user, authLoading, reactQueryRoutines, reactQuerySessions]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (process.env.NEXT_PUBLIC_ENABLE_DATABASE === 'true') {
        try {
          const storageStatus = storageService.getStorageStatus();
          if (storageStatus.mode === 'localStorage' && storageStatus.hasError) {
            const syncResult = await storageService.syncLocalSessionsToDatabase();
            if (syncResult.synced > 0 && mounted) {
              await reactQuerySessions.refetch();
            }
          }
        } catch (e) {
          console.warn('[GymContext] Sync check failed:', e);
        }
      }
    })();
    return () => { mounted = false };
  }, [reactQuerySessions]);

  const addRoutine = useCallback(async (routine: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>) => {
    await reactQueryRoutines.createRoutine(routine as storageService.CreateRoutineData);
  }, [reactQueryRoutines]);

  const updateRoutine = useCallback(async (id: string, updatedData: Partial<Routine>) => {
    const currentRoutines = reactQueryRoutines.routines;
    const routine = currentRoutines.find(r => r.id === id);
    if (!routine) throw new Error('Rutina no encontrada');

    const updatedRoutine = { ...routine, ...updatedData } as storageService.CreateRoutineData;
    await reactQueryRoutines.updateRoutine(id, updatedRoutine);
  }, [reactQueryRoutines]);

  const deleteRoutine = useCallback(async (id: string) => {
    await reactQueryRoutines.deleteRoutine(id);

    try {
      const { getWeeklyPlan, saveWeeklyPlan } = await import('@/lib/storage/storage');
      const weeklyPlan = await getWeeklyPlan();

      if (weeklyPlan) {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
        let planModified = false;
        const updatedPlan = { ...weeklyPlan };

        for (const day of days) {
          if (updatedPlan[day]?.routines) {
            const originalLength = updatedPlan[day].routines.length;
            updatedPlan[day].routines = updatedPlan[day].routines.filter((rid: string) => rid !== id);
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
      console.warn('Error cleaning routine from weekly planner:', planError);
    }
  }, [reactQueryRoutines]);

  const addSession = useCallback(async (session: Omit<WorkoutSession, 'id'>) => {
    await reactQuerySessions.addSession(session);

    try {
      const allSessions = reactQuerySessions.sessions;
      const recs = recommendForSession(session as WorkoutSession, allSessions, { repTarget: 8, compound: true });
      if (recs && recs.length > 0) {
        await storageService.saveRecommendations(recs);
      }
    } catch (e) {
      console.warn('[GymContext] Failed to save recommendations:', e);
    }
  }, [reactQuerySessions]);

  const updateSession = useCallback(async (updatedSession: WorkoutSession) => {
    await reactQuerySessions.updateSession(updatedSession);
  }, [reactQuerySessions]);

  const deleteSession = useCallback(async (sessionId: string) => {
    await reactQuerySessions.deleteSession(sessionId);
  }, [reactQuerySessions]);

  const getRoutineById = useCallback((id: string) => {
    return reactQueryRoutines.routines.find(r => r.id === id);
  }, [reactQueryRoutines]);

  const routinesValue = useMemo<RoutinesContextType>(() => ({
    routines: reactQueryRoutines.routines,
    loading: reactQueryRoutines.isLoading || isMigrating,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    getRoutineById,
    refreshRoutines: async () => { reactQueryRoutines.refetch(); },
  }), [reactQueryRoutines, isMigrating, addRoutine, updateRoutine, deleteRoutine, getRoutineById]);

  const sessionsValue = useMemo<SessionsContextType>(() => ({
    sessions: reactQuerySessions.sessions,
    loading: reactQuerySessions.isLoading || isMigrating,
    addSession,
    updateSession,
    deleteSession,
    refreshSessions: async () => { reactQuerySessions.refetch(); },
  }), [reactQuerySessions, isMigrating, addSession, updateSession, deleteSession]);

  const value = useMemo<GymContextType>(() => ({
    ...routinesValue,
    ...sessionsValue,
  }), [routinesValue, sessionsValue]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-expect-error Temporary debug helper
      window.__rebuildRoutinesFromSessions = async () => {
        try {
          const created = await storageService.rebuildRoutinesFromSessions();
          await reactQueryRoutines.refetch();
          await reactQuerySessions.refetch();
          return created;
        } catch (e) {
          console.error('[GymContext] rebuild failed', e);
          throw e;
        }
      };
    }
  }, [reactQueryRoutines, reactQuerySessions]);

  return (
    <RoutinesContext.Provider value={routinesValue}>
      <SessionsContext.Provider value={sessionsValue}>
        <GymContext.Provider value={value}>
          {children}
        </GymContext.Provider>
      </SessionsContext.Provider>
    </RoutinesContext.Provider>
  );
};

export const useGym = () => {
  const context = useContext(GymContext);
  if (context === undefined) {
    throw new Error('useGym must be used within a GymProvider');
  }
  return context;
};

export const useRoutines = () => {
  const ctx = useContext(RoutinesContext);
  if (ctx === undefined) throw new Error('useRoutines must be used within a GymProvider');
  return ctx;
};

export const useSessions = () => {
  const ctx = useContext(SessionsContext);
  if (ctx === undefined) throw new Error('useSessions must be used within a GymProvider');
  return ctx;
};
