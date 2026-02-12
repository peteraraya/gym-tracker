'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Routine, WorkoutSession } from '@/types';
import { useAuth } from './AuthContext';
import * as storageService from '@/lib/storage/storage';
import { recommendForSession } from '@/lib/progression';

interface GymContextType {
  routines: Routine[];
  sessions: WorkoutSession[];
  loading: boolean;
  addRoutine: (routine: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRoutine: (id: string, routine: Partial<Routine>) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  addSession: (session: Omit<WorkoutSession, 'id'>) => Promise<void>;
  getRoutineById: (id: string) => Routine | undefined;
  refreshRoutines: () => Promise<void>;
  refreshSessions: () => Promise<void>;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

export const GymProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch routines from storage (localStorage or Supabase)
  const refreshRoutines = useCallback(async () => {
    try {
      const data = await storageService.getRoutines();
      setRoutines(data);
    } catch (error) {
      console.error('Error fetching routines:', error);
      setRoutines([]);
    }
  }, []);

  // Fetch sessions from storage (localStorage or Supabase)
  const refreshSessions = useCallback(async () => {
    try {
      const data = await storageService.getSessions();
      setSessions(data);

      // Calcular detalles útiles para depuración: completadas, en progreso, huérfanas
      try {
        // Obtener rutinas actuales para detectar sesiones huérfanas
        const currentRoutines = await storageService.getRoutines();
        const routineIds = new Set((currentRoutines || []).map(r => r.id));

        const isSessionCompleted = (s: import('@/types').WorkoutSession) => {
          if (s.completedAt) return true;
          if (s.totalDuration && s.totalDuration > 0) return true;
          if (s.exercises && Array.isArray(s.exercises)) {
            return s.exercises.some(ex => {
              const hasReps = Array.isArray(ex.actualReps) && ex.actualReps.some(r => typeof r === 'number' && r > 0);
              const hasWeight = Array.isArray(ex.actualWeight) && ex.actualWeight.some(w => typeof w === 'number' && w > 0);
              const hasSets = typeof ex.completedSets === 'number' && ex.completedSets > 0;
              return hasReps || hasWeight || hasSets;
            });
          }
          return false;
        };

        const total = Array.isArray(data) ? data.length : 0;
        const completed = (data || []).filter(isSessionCompleted).length;
        const inProgress = (data || []).filter(s => s.startedAt && !isSessionCompleted(s)).length;
        const orphanList = (data || []).filter(s => s.routineId && !routineIds.has(s.routineId));
        const orphan = orphanList.length;

        // Logs y exposición temporal en window para inspección
         
        console.log('[GymContext] refreshSessions -> sessions loaded:', total, { completed, inProgress, orphan });
        if (typeof window !== 'undefined') {
          // @ts-ignore - temporal
          window.__GYM_SESSIONS__ = data;
          // @ts-ignore - temporal
          window.__GYM_SESSIONS_DETAILS__ = { total, completed, inProgress, orphan, orphanIds: orphanList.map(s => s.id || null) };
        }
      } catch (e) {
         
        console.warn('[GymContext] refreshSessions - debug info error', e);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]);
    }
  }, []);

  // Load data when user changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([refreshRoutines(), refreshSessions()]);
      setLoading(false);
    };

    loadData();
  }, [user, refreshRoutines, refreshSessions]);

  const addRoutine = useCallback(async (routine: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await storageService.createRoutine(routine as storageService.CreateRoutineData);
      await refreshRoutines();
    } catch (error) {
      console.error('Error adding routine:', error);
      throw error;
    }
  }, [refreshRoutines]);

  const updateRoutine = useCallback(async (id: string, updatedData: Partial<Routine>) => {
    try {
      // Preferir obtener la rutina desde el storage para evitar overwrites
      // pero si por alguna razón el storage no devuelve la rutina (p. ej. modo DB/no autenticado),
      // hacer fallback al estado en memoria (`routines`). Esto evita errores cuando el backend
      // responde diferente temporalmente.
      let currentRoutines = await storageService.getRoutines();
      let routine = currentRoutines.find(r => r.id === id);

      if (!routine) {
        // Fallback al estado local como última opción
        routine = routines.find(r => r.id === id);
        if (routine) {
          console.warn('[GymContext] updateRoutine: rutina encontrada en estado local pero no en storage, usando estado local como base');
        }
      }

      if (!routine) {
        // Log detallado para depuración remota
        try {
          console.error('[GymContext] updateRoutine - rutina no encontrada. storageIds=', (currentRoutines || []).map(r => r.id), 'stateIds=', routines.map(r => r.id));
        } catch (e) {}
        throw new Error('Rutina no encontrada');
      }

      await storageService.updateRoutine(id, {
        ...routine,
        ...updatedData,
      } as storageService.CreateRoutineData);

      await refreshRoutines();
    } catch (error) {
      console.error('Error updating routine:', error);
      throw error;
    }
  }, [refreshRoutines, routines]);

  const deleteRoutine = useCallback(async (id: string) => {
    try {
      await storageService.deleteRoutine(id);
      await refreshRoutines();
    } catch (error) {
      console.error('Error deleting routine:', error);
      throw error;
    }
  }, [refreshRoutines]);

  const addSession = useCallback(async (session: Omit<WorkoutSession, 'id'>) => {
    try {
      // TEMP LOG: depuración - eliminar en producción
      try {
        // Mostrar resumen ligero para evitar volcar objetos grandes
        // Evitar fallos si localStorage no está disponible
        if (typeof window !== 'undefined') {
          // Mostrar keys locales relevantes
           
          console.log('[GymContext] addSession called, session summary:', {
            routineId: session.routineId,
            date: session.date,
            exercises: session.exercises ? session.exercises.length : 0,
          });
          try {
            // Mostrar localStorage keys que podrían contener sesiones
             
            console.log('[GymContext] localStorage workoutSessions length:', (localStorage.getItem('workoutSessions') || '').length);
             
            console.log('[GymContext] localStorage gym_tracker_sessions length:', (localStorage.getItem('gym_tracker_sessions') || '').length);
          } catch (e) {
            // ignore localStorage read errors
          }
        }
      } catch (e) {
        // ignore logging errors
      }

      await storageService.saveSession(session as WorkoutSession);

      // TEMP LOG: confirmar que saveSession resolvió
       
      console.log('[GymContext] storageService.saveSession resolved');

      await refreshSessions();

      // TEMP LOG: confirmar refresh
       
      console.log('[GymContext] refreshSessions called (sessions state should update)');

      // Generar recomendaciones de progresión (2-for-2) y persistir mediante storageService
      try {
        const allSessions = await storageService.getSessions();
        const recs = recommendForSession(session as WorkoutSession, allSessions, { repTarget: 8, compound: true });
        if (recs && recs.length > 0) {
          try {
            await storageService.saveRecommendations(recs);
             
            console.log('[GymContext] Saved progression recommendations via storageService', recs);
          } catch (e) {
             
            console.warn('[GymContext] Failed to save recommendations via storageService, falling back to localStorage', e);
          }
        }
      } catch (e) {
        // ignore recommendation errors
      }
    } catch (error) {
      console.error('Error adding session:', error);
      throw error;
    }
  }, [refreshSessions]);

  const getRoutineById = useCallback((id: string) => {
    return routines.find(routine => routine.id === id);
  }, [routines]);

  const value = useMemo(() => ({
    routines,
    sessions,
    loading,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    addSession,
    getRoutineById,
    refreshRoutines,
    refreshSessions,
  }), [routines, sessions, loading, addRoutine, updateRoutine, deleteRoutine, addSession, getRoutineById, refreshRoutines, refreshSessions]);

  // Exponer helper temporal para reconstruir rutinas desde sesiones (invocar desde consola)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.__rebuildRoutinesFromSessions = async () => {
        try {
           
          console.log('[GymContext] Rebuilding routines from sessions...');
          const created = await storageService.rebuildRoutinesFromSessions();
          await refreshRoutines();
          await refreshSessions();
           
          console.log('[GymContext] Rebuild finished, created:', created?.length || 0);
          return created;
        } catch (e) {
           
          console.error('[GymContext] rebuild failed', e);
          throw e;
        }
      };
    }
    // cleanup not necessary for temporary debug helper
  }, [refreshRoutines, refreshSessions]);

  return (
    <GymContext.Provider value={value}>
      {children}
    </GymContext.Provider>
  );
};

export const useGym = () => {
  const context = useContext(GymContext);
  if (context === undefined) {
    throw new Error('useGym must be used within a GymProvider');
  }
  return context;
};
