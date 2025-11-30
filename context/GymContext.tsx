'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Routine, WorkoutSession } from '@/types';
import { useAuth } from './AuthContext';

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

  // Fetch routines from API
  const refreshRoutines = async () => {
    if (!user) {
      setRoutines([]);
      return;
    }

    try {
      const response = await fetch('/api/routines');
      if (response.ok) {
        const data = await response.json();
        setRoutines(data.map((r: any) => ({
          ...r,
          createdAt: new Date(r.createdAt),
          updatedAt: new Date(r.updatedAt)
        })));
      }
    } catch (error) {
      console.error('Error fetching routines:', error);
    }
  };

  // Fetch sessions from API
  const refreshSessions = async () => {
    if (!user) {
      setSessions([]);
      return;
    }

    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.map((s: any) => ({
          ...s,
          date: new Date(s.date)
        })));
      }
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
      const response = await fetch('/api/routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routine),
      });

      if (response.ok) {
        await refreshRoutines();
      } else {
        throw new Error('Failed to create routine');
      }
    } catch (error) {
      console.error('Error adding routine:', error);
      throw error;
    }
  };

  const updateRoutine = async (id: string, updatedData: Partial<Routine>) => {
    try {
      const routine = routines.find(r => r.id === id);
      if (!routine) return;

      const response = await fetch(`/api/routines/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...routine,
          ...updatedData,
        }),
      });

      if (response.ok) {
        await refreshRoutines();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.error || 'Failed to update routine');
      }
    } catch (error) {
      console.error('Error updating routine:', error);
      throw error;
    }
  };

  const deleteRoutine = async (id: string) => {
    try {
      const response = await fetch(`/api/routines/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await refreshRoutines();
      } else {
        throw new Error('Failed to delete routine');
      }
    } catch (error) {
      console.error('Error deleting routine:', error);
      throw error;
    }
  };

  const addSession = async (session: Omit<WorkoutSession, 'id'>) => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      });

      if (response.ok) {
        await refreshSessions();
      } else {
        throw new Error('Failed to create session');
      }
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
