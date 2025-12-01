'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Routine, WorkoutSession } from '@/types';
import { useAuth } from './AuthContext';
import * as supabaseService from '@/lib/supabase/service';

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

  // Fetch routines from Supabase directly
  const refreshRoutines = async () => {
    if (!user) {
      setRoutines([]);
      return;
    }

    try {
      const data = await supabaseService.getRoutines();
      setRoutines(data);
    } catch (error) {
      console.error('Error fetching routines:', error);
    }
  };

  // Fetch sessions from Supabase directly
  const refreshSessions = async () => {
    if (!user) {
      setSessions([]);
      return;
    }

    try {
      const data = await supabaseService.getSessions();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  // Load data when user changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([refreshRoutines(), refreshSessions()]);
      setLoading(false);
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const addRoutine = async (routine: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await supabaseService.createRoutine(routine as supabaseService.CreateRoutineData);
      await refreshRoutines();
    } catch (error) {
      console.error('Error adding routine:', error);
      throw error;
    }
  };

  const updateRoutine = async (id: string, updatedData: Partial<Routine>) => {
    try {
      const routine = routines.find(r => r.id === id);
      if (!routine) throw new Error('Rutina no encontrada');

      await supabaseService.updateRoutine(id, {
        ...routine,
        ...updatedData,
      } as supabaseService.CreateRoutineData);
      
      await refreshRoutines();
    } catch (error) {
      console.error('Error updating routine:', error);
      throw error;
    }
  };

  const deleteRoutine = async (id: string) => {
    try {
      await supabaseService.deleteRoutine(id);
      await refreshRoutines();
    } catch (error) {
      console.error('Error deleting routine:', error);
      throw error;
    }
  };

  const addSession = async (session: Omit<WorkoutSession, 'id'>) => {
    try {
      await supabaseService.saveSession(session as WorkoutSession);
      await refreshSessions();
    } catch (error) {
      console.error('Error adding session:', error);
      throw error;
    }
  };

  const getRoutineById = (id: string) => {
    return routines.find(routine => routine.id === id);
  };

  return (
    <GymContext.Provider
      value={{
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
      }}
    >
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
