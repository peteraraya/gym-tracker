'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Routine, WorkoutSession } from '@/types';
import { useAuth } from './AuthContext';
import * as storageService from '@/lib/storage/storage';

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
      const routine = routines.find(r => r.id === id);
      if (!routine) throw new Error('Rutina no encontrada');

      await storageService.updateRoutine(id, {
        ...routine,
        ...updatedData,
      } as storageService.CreateRoutineData);

      await refreshRoutines();
    } catch (error) {
      console.error('Error updating routine:', error);
      throw error;
    }
  }, [routines, refreshRoutines]);

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
      await storageService.saveSession(session as WorkoutSession);
      await refreshSessions();
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
