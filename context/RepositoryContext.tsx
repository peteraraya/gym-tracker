'use client';

/**
 * RepositoryContext - Inyección de dependencias para repositorios de dominio
 *
 * Proporciona las implementaciones de los repositorios (IRoutineRepository,
 * ISessionRepository, IProfileRepository, IActiveWorkoutRepository) a través
 * de React Context. Los hooks de aplicación dependen de las interfaces en lugar
 * de implementaciones concretas (storage.service.ts), permitiendo cambiar el
 * backend (Supabase, localStorage, IndexedDB) sin modificar la lógica de negocio.
 *
 * Uso:
 *   const { routines, sessions } = useRepositories();
 *   // o usar los hooks específicos que ya inyectan el repositorio
 */

import React, { createContext, useContext, useMemo } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  SupabaseRoutineRepository,
  SupabaseSessionRepository,
  SupabaseProfileRepository,
  SupabaseActiveWorkoutRepository,
} from '@/lib/infrastructure/repositories';
import type {
  IRoutineRepository,
  ISessionRepository,
  IProfileRepository,
  IActiveWorkoutRepository,
} from '@/lib/domain/repositories';
import { hasSupabaseConfig } from '@/lib/infrastructure/supabase/config';

interface RepositoryContextType {
  routines: IRoutineRepository;
  sessions: ISessionRepository;
  profiles: IProfileRepository;
  activeWorkout: IActiveWorkoutRepository;
  user: User | null;
  isDatabaseEnabled: boolean;
}

const RepositoryContext = createContext<RepositoryContextType | null | undefined>(undefined);

export function RepositoryProvider({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User | null;
}) {
  const isDatabaseEnabled = process.env.NEXT_PUBLIC_ENABLE_DATABASE === 'true';
  const isConfigured = isDatabaseEnabled && hasSupabaseConfig();

  const repositories = useMemo<RepositoryContextType | null>(() => {
    if (!isConfigured) return null;

    return {
      routines: new SupabaseRoutineRepository(),
      sessions: new SupabaseSessionRepository(),
      profiles: new SupabaseProfileRepository(),
      activeWorkout: new SupabaseActiveWorkoutRepository(),
      user,
      isDatabaseEnabled: true,
    };
  }, [isConfigured, user]);

  // Si base de datos no está habilitada, proporcionar repositorios vacíos (modo offline)
  if (!isConfigured) {
    const emptyContext: RepositoryContextType = {
      routines: {
        getByUserId: async () => ({ routines: [], total: 0 }),
        getById: async () => null,
        create: async () => {
          throw new Error('Base de datos deshabilitada');
        },
        update: async () => {
          throw new Error('Base de datos deshabilitada');
        },
        delete: async () => {
          throw new Error('Base de datos deshabilitada');
        },
        exists: async () => false,
      },
      sessions: {
        getByUserId: async () => ({ sessions: [], total: 0 }),
        getById: async () => null,
        create: async () => {
          throw new Error('Base de datos deshabilitada');
        },
        update: async () => {
          throw new Error('Base de datos deshabilitada');
        },
        delete: async () => {
          throw new Error('Base de datos deshabilitada');
        },
      },
      profiles: {
        getByUserId: async () => null,
        create: async () => {
          throw new Error('Base de datos deshabilitada');
        },
        update: async () => {
          throw new Error('Base de datos deshabilitada');
        },
        delete: async () => {
          throw new Error('Base de datos deshabilitada');
        },
      },
      activeWorkout: {
        getByUserId: async () => null,
        save: async () => {
          throw new Error('Base de datos deshabilitada');
        },
        delete: async () => {
          throw new Error('Base de datos deshabilitada');
        },
      },
      user: null,
      isDatabaseEnabled: false,
    };

    return (
      <RepositoryContext.Provider value={emptyContext}>
        {children}
      </RepositoryContext.Provider>
    );
  }

  return (
    <RepositoryContext.Provider value={repositories}>
      {children}
    </RepositoryContext.Provider>
  );
}

export function useRepositories() {
  const context = useContext(RepositoryContext);
  if (!context) {
    throw new Error(
      'useRepositories must be used within a RepositoryProvider',
    );
  }
  return context;
}