/**
 * Unified Storage Service
 * 
 * Delegates to either localStorage or Supabase based on NEXT_PUBLIC_ENABLE_DATABASE
 * Provides a consistent interface regardless of storage backend
 */

import type { Routine, WorkoutSession } from '@/types';

// Check if database is enabled
const isDatabaseEnabled = (): boolean => {
    return process.env.NEXT_PUBLIC_ENABLE_DATABASE === 'true';
};

// Types (re-exported for convenience)
export type {
    SetData,
    RoutineExercise,
    CreateRoutineData,
    UserProfile,
} from '@/lib/storage/localStorage';

// ==================== ROUTINES ====================

export async function getRoutines(): Promise<Routine[]> {
    if (isDatabaseEnabled()) {
        const supabaseService = await import('@/lib/supabase/service');
        return supabaseService.getRoutines();
    } else {
        const localStorageService = await import('@/lib/storage/localStorage');
        return localStorageService.getRoutines();
    }
}

export async function createRoutine(data: any): Promise<Routine> {
    if (isDatabaseEnabled()) {
        const supabaseService = await import('@/lib/supabase/service');
        return supabaseService.createRoutine(data);
    } else {
        const localStorageService = await import('@/lib/storage/localStorage');
        return localStorageService.createRoutine(data);
    }
}

export async function updateRoutine(id: string, data: any): Promise<Routine> {
    if (isDatabaseEnabled()) {
        const supabaseService = await import('@/lib/supabase/service');
        return supabaseService.updateRoutine(id, data);
    } else {
        const localStorageService = await import('@/lib/storage/localStorage');
        return localStorageService.updateRoutine(id, data);
    }
}

export async function deleteRoutine(id: string): Promise<void> {
    if (isDatabaseEnabled()) {
        const supabaseService = await import('@/lib/supabase/service');
        return supabaseService.deleteRoutine(id);
    } else {
        const localStorageService = await import('@/lib/storage/localStorage');
        return localStorageService.deleteRoutine(id);
    }
}

// ==================== SESSIONS ====================

export async function getSessions(): Promise<WorkoutSession[]> {
    if (isDatabaseEnabled()) {
        const supabaseService = await import('@/lib/supabase/service');
        return supabaseService.getSessions();
    } else {
        const localStorageService = await import('@/lib/storage/localStorage');
        return localStorageService.getSessions();
    }
}

export async function saveSession(session: WorkoutSession): Promise<void> {
    if (isDatabaseEnabled()) {
        const supabaseService = await import('@/lib/supabase/service');
        return supabaseService.saveSession(session);
    } else {
        const localStorageService = await import('@/lib/storage/localStorage');
        return localStorageService.saveSession(session);
    }
}

// ==================== PROFILE ====================

export async function getProfile(): Promise<any> {
    if (isDatabaseEnabled()) {
        const supabaseService = await import('@/lib/supabase/service');
        return supabaseService.getProfile();
    } else {
        const localStorageService = await import('@/lib/storage/localStorage');
        return localStorageService.getProfile();
    }
}

export async function updateProfile(data: any): Promise<void> {
    if (isDatabaseEnabled()) {
        const supabaseService = await import('@/lib/supabase/service');
        return supabaseService.updateProfile(data);
    } else {
        const localStorageService = await import('@/lib/storage/localStorage');
        return localStorageService.updateProfile(data);
    }
}
