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
            // Also remove local sessions associated with this routine to avoid orphans
            if (localStorageService.deleteSessionsByRoutine) {
                await localStorageService.deleteSessionsByRoutine(id);
            }
            return localStorageService.deleteRoutine(id);
        }

        try {
            const supabaseService = await import('@/lib/supabase/service');
            // Attempt to delete sessions associated with the routine first
            if (supabaseService.deleteSessionsByRoutine) {
                await supabaseService.deleteSessionsByRoutine(id);
            }
            await supabaseService.deleteRoutine(id);
            handleStorageSuccess();
        } catch (err) {
            handleStorageError(err, 'deleteRoutine');
            const localStorageService = await import('@/lib/storage/localStorage');
            // Ensure local sessions are cleaned up as fallback
            if (localStorageService.deleteSessionsByRoutine) {
                await localStorageService.deleteSessionsByRoutine(id);
            }
            return localStorageService.deleteRoutine(id);
        }
    } else {
        const localStorageService = await import('@/lib/storage/localStorage');
        // Also remove local sessions associated with this routine to avoid orphans
        if (localStorageService.deleteSessionsByRoutine) {
            await localStorageService.deleteSessionsByRoutine(id);
        }
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
            // Persist a lightweight debug marker so developers can inspect post-save
            try {
                if (typeof window !== 'undefined' && window.localStorage) {
                    const marker = {
                        savedAt: Date.now(),
                        id: session.id || null,
                        routineId: session.routineId || null,
                    };
                    localStorage.setItem('gym_tracker_last_saved_session', JSON.stringify(marker));
                }
            } catch (e) {
                // ignore storage debug failures
            }
        } catch (err) {
            handleStorageError(err, 'saveSession');
            const localStorageService = await import('@/lib/storage/localStorage');
            const result = await localStorageService.saveSession(session);
            // also write debug marker when falling back to localStorage
            try {
                if (typeof window !== 'undefined' && window.localStorage) {
                    const marker = {
                        savedAt: Date.now(),
                        id: session.id || null,
                        routineId: session.routineId || null,
                        fallback: true
                    };
                    localStorage.setItem('gym_tracker_last_saved_session', JSON.stringify(marker));
                }
            } catch (e) {
                // ignore
            }
            return result;
        }
    } else {
        const localStorageService = await import('@/lib/storage/localStorage');
        const result = await localStorageService.saveSession(session);
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const marker = {
                    savedAt: Date.now(),
                    id: session.id || null,
                    routineId: session.routineId || null,
                    fallback: 'local'
                };
                localStorage.setItem('gym_tracker_last_saved_session', JSON.stringify(marker));
            }
        } catch (e) {
            // ignore
        }
        return result;
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

// ==================== WEEKLY PLAN ====================

export async function getWeeklyPlan(): Promise<any> {
    if (isDatabaseEnabled()) {
        if (storageMode === 'localStorage' && !shouldRetrySupabase()) {
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.getWeeklyPlan();
        }

        try {
            const supabaseService = await import('@/lib/supabase/service');
            if ((supabaseService as any).getWeeklyPlan) {
                const res = await (supabaseService as any).getWeeklyPlan();
                handleStorageSuccess();
                return res;
            }
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.getWeeklyPlan();
        } catch (err) {
            handleStorageError(err, 'getWeeklyPlan');
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.getWeeklyPlan();
        }
    } else {
        const localStorageService = await import('@/lib/storage/localStorage');
        return localStorageService.getWeeklyPlan();
    }
}

export async function saveWeeklyPlan(plan: any): Promise<void> {
    if (isDatabaseEnabled()) {
        if (storageMode === 'localStorage' && !shouldRetrySupabase()) {
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.saveWeeklyPlan(plan);
        }

        try {
            const supabaseService = await import('@/lib/supabase/service');
            if ((supabaseService as any).saveWeeklyPlan) {
                await (supabaseService as any).saveWeeklyPlan(plan);
                handleStorageSuccess();
                return;
            }
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.saveWeeklyPlan(plan);
        } catch (err) {
            handleStorageError(err, 'saveWeeklyPlan');
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.saveWeeklyPlan(plan);
        }
    } else {
        const localStorageService = await import('@/lib/storage/localStorage');
        return localStorageService.saveWeeklyPlan(plan);
    }
}

// ==================== UTILITIES ====================

export async function rebuildRoutinesFromSessions(): Promise<any> {
    // Prefer database if enabled, otherwise use localStorage implementation
    if (isDatabaseEnabled()) {
        if (storageMode === 'localStorage' && !shouldRetrySupabase()) {
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.rebuildRoutinesFromSessions();
        }

        try {
            // Supabase backend doesn't implement a rebuild helper; fallback to local
            const supabaseService = await import('@/lib/supabase/service');
            if ((supabaseService as any).rebuildRoutinesFromSessions) {
                const res = await (supabaseService as any).rebuildRoutinesFromSessions();
                handleStorageSuccess();
                return res;
            }
            // Fallback
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.rebuildRoutinesFromSessions();
        } catch (err) {
            handleStorageError(err, 'rebuildRoutinesFromSessions');
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.rebuildRoutinesFromSessions();
        }
    } else {
        const localStorageService = await import('@/lib/storage/localStorage');
        return localStorageService.rebuildRoutinesFromSessions();
    }
}

// ==================== ACTIVE WORKOUT ====================

export async function getActiveWorkout(): Promise<any | null> {
    if (isDatabaseEnabled()) {
        if (storageMode === 'localStorage' && !shouldRetrySupabase()) {
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.getActiveWorkout();
        }

        try {
            const supabaseService = await import('@/lib/supabase/service');
            if ((supabaseService as any).getActiveWorkout) {
                const res = await (supabaseService as any).getActiveWorkout();
                handleStorageSuccess();
                return res;
            }
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.getActiveWorkout();
        } catch (err) {
            handleStorageError(err, 'getActiveWorkout');
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.getActiveWorkout();
        }
    } else {
        const localStorageService = await import('@/lib/storage/localStorage');
        return localStorageService.getActiveWorkout();
    }
}

export async function saveActiveWorkout(payload: any): Promise<void> {
    if (isDatabaseEnabled()) {
        if (storageMode === 'localStorage' && !shouldRetrySupabase()) {
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.saveActiveWorkout(payload);
        }

        try {
            const supabaseService = await import('@/lib/supabase/service');
            if ((supabaseService as any).saveActiveWorkout) {
                await (supabaseService as any).saveActiveWorkout(payload);
                handleStorageSuccess();
                return;
            }
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.saveActiveWorkout(payload);
        } catch (err) {
            handleStorageError(err, 'saveActiveWorkout');
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.saveActiveWorkout(payload);
        }
    } else {
        const localStorageService = await import('@/lib/storage/localStorage');
        return localStorageService.saveActiveWorkout(payload);
    }
}

export async function clearActiveWorkout(): Promise<void> {
    if (isDatabaseEnabled()) {
        if (storageMode === 'localStorage' && !shouldRetrySupabase()) {
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.clearActiveWorkout();
        }

        try {
            const supabaseService = await import('@/lib/supabase/service');
            if ((supabaseService as any).clearActiveWorkout) {
                await (supabaseService as any).clearActiveWorkout();
                handleStorageSuccess();
                return;
            }
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.clearActiveWorkout();
        } catch (err) {
            handleStorageError(err, 'clearActiveWorkout');
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.clearActiveWorkout();
        }
    } else {
        const localStorageService = await import('@/lib/storage/localStorage');
        return localStorageService.clearActiveWorkout();
    }
}

// ==================== RECOMMENDATIONS ====================

export async function getRecommendations(): Promise<any[]> {
    if (isDatabaseEnabled()) {
        if (storageMode === 'localStorage' && !shouldRetrySupabase()) {
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.getRecommendations();
        }

        try {
            const supabaseService = await import('@/lib/supabase/service');
            if ((supabaseService as any).getRecommendations) {
                const result = await (supabaseService as any).getRecommendations();
                handleStorageSuccess();
                return result;
            }
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.getRecommendations();
        } catch (err) {
            handleStorageError(err, 'getRecommendations');
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.getRecommendations();
        }
    } else {
        const localStorageService = await import('@/lib/storage/localStorage');
        return localStorageService.getRecommendations();
    }
}

export async function saveRecommendations(recommendations: any[]): Promise<void> {
    if (isDatabaseEnabled()) {
        if (storageMode === 'localStorage' && !shouldRetrySupabase()) {
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.saveRecommendations(recommendations);
        }

        try {
            const supabaseService = await import('@/lib/supabase/service');
            if ((supabaseService as any).saveRecommendations) {
                await (supabaseService as any).saveRecommendations(recommendations);
                handleStorageSuccess();
                return;
            }
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.saveRecommendations(recommendations);
        } catch (err) {
            handleStorageError(err, 'saveRecommendations');
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.saveRecommendations(recommendations);
        }
    } else {
        const localStorageService = await import('@/lib/storage/localStorage');
        return localStorageService.saveRecommendations(recommendations);
    }
}
