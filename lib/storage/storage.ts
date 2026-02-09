/**
 * Unified Storage Service
 * 
 * Delegates to either localStorage or Supabase based on NEXT_PUBLIC_ENABLE_DATABASE
 * Provides a consistent interface regardless of storage backend
 * 
 * IMPROVED: Includes connection state tracking to prevent silent backend switches
 */

import type { Routine, WorkoutSession } from '@/types';
import type { CreateRoutineData, UserProfile } from '@/lib/storage/localStorage';

// Re-export types for convenience
export type { SetData, RoutineExercise, CreateRoutineData, UserProfile } from '@/lib/storage/localStorage';

// Check if database is enabled
const isDatabaseEnabled = (): boolean => {
    return process.env.NEXT_PUBLIC_ENABLE_DATABASE === 'true';
};

// Estado de storage para evitar switch silenciosos entre backends
let storageMode: 'supabase' | 'localStorage' | null = null;
let lastStorageError: Date | null = null;

// Helper para determinar si debemos reintentar Supabase después de un error
function shouldRetrySupabase(): boolean {
    if (!lastStorageError) return true;
    // Reintentar después de 30 segundos
    return Date.now() - lastStorageError.getTime() > 30000;
}

// Helper para marcar error y actualizar modo
function handleStorageError(err: unknown, operation: string): void {
    lastStorageError = new Date();
    storageMode = 'localStorage';
    console.warn(`${operation}: Supabase failed, using localStorage:`, err);
}

// Helper para marcar éxito de Supabase
function handleStorageSuccess(): void {
    storageMode = 'supabase';
    lastStorageError = null;
}

/**
 * Obtener el estado actual del storage
 * Útil para debugging y mostrar al usuario
 */
export function getStorageStatus(): { mode: string; hasError: boolean; lastError: Date | null } {
    return {
        mode: storageMode || (isDatabaseEnabled() ? 'supabase' : 'localStorage'),
        hasError: lastStorageError !== null,
        lastError: lastStorageError
    };
}

// ==================== ROUTINES ====================

export async function getRoutines(): Promise<Routine[]> {
    if (isDatabaseEnabled()) {
        // Si estamos en modo localStorage por error previo, verificar si reintentar
        if (storageMode === 'localStorage' && !shouldRetrySupabase()) {
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.getRoutines();
        }

        try {
            const supabaseService = await import('@/lib/supabase/service');
            const result = await supabaseService.getRoutines();
            handleStorageSuccess();
            return result;
        } catch (err) {
            handleStorageError(err, 'getRoutines');
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.getRoutines();
        }
    } else {
        const localStorageService = await import('@/lib/storage/localStorage');
        return localStorageService.getRoutines();
    }
}

export async function createRoutine(data: CreateRoutineData): Promise<Routine> {
    if (isDatabaseEnabled()) {
        if (storageMode === 'localStorage' && !shouldRetrySupabase()) {
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.createRoutine(data);
        }

        try {
            const supabaseService = await import('@/lib/supabase/service');
            const result = await supabaseService.createRoutine(data);
            handleStorageSuccess();
            return result;
        } catch (err) {
            handleStorageError(err, 'createRoutine');
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.createRoutine(data);
        }
    } else {
        const localStorageService = await import('@/lib/storage/localStorage');
        return localStorageService.createRoutine(data);
    }
}

export async function updateRoutine(id: string, data: CreateRoutineData): Promise<Routine> {
    if (isDatabaseEnabled()) {
        if (storageMode === 'localStorage' && !shouldRetrySupabase()) {
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.updateRoutine(id, data);
        }

        try {
            const supabaseService = await import('@/lib/supabase/service');
            const result = await supabaseService.updateRoutine(id, data);
            handleStorageSuccess();
            return result;
        } catch (err) {
            handleStorageError(err, 'updateRoutine');
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.updateRoutine(id, data);
        }
    } else {
        const localStorageService = await import('@/lib/storage/localStorage');
        return localStorageService.updateRoutine(id, data);
    }
}

export async function deleteRoutine(id: string): Promise<void> {
    if (isDatabaseEnabled()) {
        if (storageMode === 'localStorage' && !shouldRetrySupabase()) {
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.deleteRoutine(id);
        }

        try {
            const supabaseService = await import('@/lib/supabase/service');
            await supabaseService.deleteRoutine(id);
            handleStorageSuccess();
        } catch (err) {
            handleStorageError(err, 'deleteRoutine');
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.deleteRoutine(id);
        }
    } else {
        const localStorageService = await import('@/lib/storage/localStorage');
        return localStorageService.deleteRoutine(id);
    }
}

// ==================== SESSIONS ====================

export async function getSessions(): Promise<WorkoutSession[]> {
    if (isDatabaseEnabled()) {
        if (storageMode === 'localStorage' && !shouldRetrySupabase()) {
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.getSessions();
        }

        try {
            const supabaseService = await import('@/lib/supabase/service');
            const result = await supabaseService.getSessions();
            handleStorageSuccess();
            return result;
        } catch (err) {
            handleStorageError(err, 'getSessions');
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.getSessions();
        }
    } else {
        const localStorageService = await import('@/lib/storage/localStorage');
        return localStorageService.getSessions();
    }
}

export async function saveSession(session: WorkoutSession): Promise<void> {
    if (isDatabaseEnabled()) {
        if (storageMode === 'localStorage' && !shouldRetrySupabase()) {
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.saveSession(session);
        }

        try {
            const supabaseService = await import('@/lib/supabase/service');
            await supabaseService.saveSession(session);
            handleStorageSuccess();
        } catch (err) {
            handleStorageError(err, 'saveSession');
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.saveSession(session);
        }
    } else {
        const localStorageService = await import('@/lib/storage/localStorage');
        return localStorageService.saveSession(session);
    }
}

// ==================== PROFILE ====================

export async function getProfile(): Promise<UserProfile> {
    if (isDatabaseEnabled()) {
        if (storageMode === 'localStorage' && !shouldRetrySupabase()) {
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.getProfile();
        }

        try {
            const supabaseService = await import('@/lib/supabase/service');
            const result = await supabaseService.getProfile();
            handleStorageSuccess();
            return result;
        } catch (err) {
            handleStorageError(err, 'getProfile');
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.getProfile();
        }
    } else {
        const localStorageService = await import('@/lib/storage/localStorage');
        return localStorageService.getProfile();
    }
}

export async function updateProfile(data: Partial<UserProfile>): Promise<void> {
    if (isDatabaseEnabled()) {
        if (storageMode === 'localStorage' && !shouldRetrySupabase()) {
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.updateProfile(data);
        }

        try {
            const supabaseService = await import('@/lib/supabase/service');
            await supabaseService.updateProfile(data);
            handleStorageSuccess();
        } catch (err) {
            handleStorageError(err, 'updateProfile');
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.updateProfile(data);
        }
    } else {
        const localStorageService = await import('@/lib/storage/localStorage');
        return localStorageService.updateProfile(data);
    }
}
