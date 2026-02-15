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

      // Log para debugging
      console.log('[GymContext] refreshSessions -> sessions loaded:', data.length);

      // Si la base de datos está habilitada, verificar si hay sesiones locales que necesitan sincronización
      if (process.env.NEXT_PUBLIC_ENABLE_DATABASE === 'true') {
        try {
          const storageStatus = storageService.getStorageStatus();
          
          // Si estamos en modo localStorage por error, intentar sincronizar
          if (storageStatus.mode === 'localStorage' && storageStatus.hasError) {
            console.log('[GymContext] Detected localStorage fallback, attempting sync...');
            const syncResult = await storageService.syncLocalSessionsToDatabase();
            if (syncResult.synced > 0) {
              console.log(`[GymContext] Synced ${syncResult.synced} sessions to database`);
              // Refrescar de nuevo para obtener datos de la BD
              const freshData = await storageService.getSessions();
              setSessions(freshData);
            }
          }
        } catch (e) {
          console.warn('[GymContext] Sync check failed:', e);
        }
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
      
      // Primero, migrar sesiones antiguas de localStorage si existen
      try {
        const migrationResult = await storageService.migrateLegacySessions();
        if (migrationResult.migrated > 0) {
          console.log(`[GymContext] Migrated ${migrationResult.migrated} legacy sessions. Total: ${migrationResult.total}`);
        }
      } catch (e) {
        console.warn('[GymContext] Migration failed:', e);
      }
      
      // Luego cargar datos
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
      
      // Limpiar la rutina del planificador semanal
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
            console.log(`[GymContext] Removed routine ${id} from weekly planner`);
          }
        }
      } catch (planError) {
        console.warn('Error cleaning routine from weekly planner:', planError);
        // No lanzar error, la rutina ya fue eliminada
      }
      
      await refreshRoutines();
    } catch (error) {
      console.error('Error deleting routine:', error);
      throw error;
    }
  }, [refreshRoutines]);

  const addSession = useCallback(async (session: Omit<WorkoutSession, 'id'>) => {
    try {
      console.log('[GymContext] addSession called, session summary:', {
        routineId: session.routineId,
        date: session.date,
        exercises: session.exercises ? session.exercises.length : 0,
      });

      // Guardar sesión (intentará Supabase primero, luego localStorage como fallback)
      await storageService.saveSession(session as WorkoutSession);
      console.log('[GymContext] storageService.saveSession resolved');

      // Verificar el estado del storage para debugging
      const storageStatus = storageService.getStorageStatus();
      console.log('[GymContext] Storage status:', storageStatus);

      // Si hay error de storage (cayó a localStorage), intentar sincronizar
      if (storageStatus.hasError) {
        console.warn('[GymContext] Storage error detected, will attempt sync on next load');
      }

      // Refrescar sesiones para obtener la lista actualizada
      await refreshSessions();
      console.log('[GymContext] refreshSessions completed');

      // Generar recomendaciones de progresión (2-for-2) y persistir mediante storageService
      try {
        const allSessions = await storageService.getSessions();
        const recs = recommendForSession(session as WorkoutSession, allSessions, { repTarget: 8, compound: true });
        if (recs && recs.length > 0) {
          await storageService.saveRecommendations(recs);
          console.log('[GymContext] Saved progression recommendations', recs.length);
        }
      } catch (e) {
        console.warn('[GymContext] Failed to save recommendations:', e);
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
