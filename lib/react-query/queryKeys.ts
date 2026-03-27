export const queryKeys = {
  // Routines
  routines: {
    all: ['routines'] as const,
    lists: () => [...queryKeys.routines.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.routines.lists(), { filters }] as const,
    details: () => [...queryKeys.routines.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.routines.details(), id] as const,
  },
  
  // Sessions
  sessions: {
    all: ['sessions'] as const,
    lists: () => [...queryKeys.sessions.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.sessions.lists(), { filters }] as const,
    details: () => [...queryKeys.sessions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.sessions.details(), id] as const,
  },
  
  // Active Workout
  activeWorkout: {
    all: ['activeWorkout'] as const,
    detail: () => [...queryKeys.activeWorkout.all, 'detail'] as const,
  },
  
  // Profile
  profile: {
    all: ['profile'] as const,
    detail: () => [...queryKeys.profile.all, 'detail'] as const,
  },
  
  // Plans
  plans: {
    all: ['plans'] as const,
    weekly: () => [...queryKeys.plans.all, 'weekly'] as const,
    monthly: () => [...queryKeys.plans.all, 'monthly'] as const,
  },
  
  // Auth
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },
} as const;
