/**
 * Unified Storage Service
 * 
 * Delegates to either localStorage or Supabase based on NEXT_PUBLIC_ENABLE_DATABASE
 * Provides a consistent interface regardless of storage backend
 * 
 * IMPROVED: Includes connection state tracking to prevent silent backend switches
 */

import type { Routine, WorkoutSession } from '@/types';
import type { CreateRoutineData, UserProfile, ProgressRecommendation, WeeklyPlan, MonthlyPlan, ActiveWorkout } from '@/lib/storage/localStorage';

// Re-export types for convenience
export type { SetData, RoutineExercise, CreateRoutineData, UserProfile, ProgressRecommendation, WeeklyPlan, MonthlyPlan, ActiveWorkout } from '@/lib/storage/localStorage';

// Partial interface describing optional supabase storage helpers we may call
type SupabaseServicePartial = Partial<{
    // Core routines CRUD
    getRoutines(): Promise<Routine[]>;
    createRoutine(data: CreateRoutineData): Promise<Routine>;
    updateRoutine(id: string, data: CreateRoutineData): Promise<Routine>;
    deleteRoutine(id: string): Promise<void>;
    deleteSessionsByRoutine?(id: string): Promise<void>;

    // Sessions
    getSessions(): Promise<WorkoutSession[]>;
    saveSession(session: WorkoutSession): Promise<void>;

    // Profile
    getProfile(): Promise<UserProfile>;
    updateProfile(data: Partial<UserProfile>): Promise<void>;

    // Plans
    getWeeklyPlan(): Promise<WeeklyPlan>;
    saveWeeklyPlan(plan: WeeklyPlan): Promise<void>;
    getMonthlyPlan(): Promise<MonthlyPlan>;
    saveMonthlyPlan(plan: MonthlyPlan): Promise<void>;

    // Recommendations & weights
    getRecommendations(): Promise<ProgressRecommendation[]>;
    saveRecommendations(recs: ProgressRecommendation[]): Promise<void>;
    getLastWeights(): Promise<Record<string, number[]>>;
    saveLastWeights(w: Record<string, number[]>): Promise<void>;

    // Active workout
    getActiveWorkout(): Promise<ActiveWorkout | null>;
    saveActiveWorkout(payload: ActiveWorkout): Promise<void>;
    clearActiveWorkout(): Promise<void>;

    // Utilities
    rebuildRoutinesFromSessions(): Promise<Routine[]>;
}>;

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
            const supabaseModule = await import('@/lib/supabase/service');
            const supabaseService = supabaseModule as unknown as SupabaseServicePartial;
            if (supabaseService.getRoutines) {
                const result = await supabaseService.getRoutines();
                handleStorageSuccess();
                return result;
            }
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.getRoutines();
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
            const supabaseModule = await import('@/lib/supabase/service');
            const supabaseService = supabaseModule as unknown as SupabaseServicePartial;
            if (supabaseService.createRoutine) {
                const result = await supabaseService.createRoutine(data);
                handleStorageSuccess();
                return result;
            }
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.createRoutine(data);
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
            const supabaseModule = await import('@/lib/supabase/service');
            const supabaseService = supabaseModule as unknown as SupabaseServicePartial;
            if (supabaseService.updateRoutine) {
                const result = await supabaseService.updateRoutine(id, data);
                handleStorageSuccess();
                return result;
            }
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.updateRoutine(id, data);
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
            const supabaseModule = await import('@/lib/supabase/service');
            const supabaseService = supabaseModule as unknown as SupabaseServicePartial;
            const result = await (supabaseService.getSessions ? supabaseService.getSessions() : Promise.resolve([] as WorkoutSession[]));
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
            const supabaseModule = await import('@/lib/supabase/service');
            const supabaseService = supabaseModule as unknown as SupabaseServicePartial & { saveSession?: (s: WorkoutSession) => Promise<void> };
            if (supabaseService.saveSession) await supabaseService.saveSession(session);
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
            const supabaseModule = await import('@/lib/supabase/service');
            const supabaseService = supabaseModule as unknown as SupabaseServicePartial & { getProfile?: () => Promise<UserProfile> };
            const result = supabaseService.getProfile ? await supabaseService.getProfile() : (null as unknown as UserProfile);
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
            const supabaseModule = await import('@/lib/supabase/service');
            const supabaseService = supabaseModule as unknown as SupabaseServicePartial & { updateProfile?: (d: Partial<UserProfile>) => Promise<void> };
            if (supabaseService.updateProfile) await supabaseService.updateProfile(data);
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

export async function getWeeklyPlan(): Promise<WeeklyPlan> {
    if (isDatabaseEnabled()) {
        if (storageMode === 'localStorage' && !shouldRetrySupabase()) {
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.getWeeklyPlan();
        }

        try {
            const supabaseModule = await import('@/lib/supabase/service');
            const supabaseService = supabaseModule as unknown as SupabaseServicePartial;
            if (supabaseService.getWeeklyPlan) {
                const res = await supabaseService.getWeeklyPlan();
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

export async function saveWeeklyPlan(plan: WeeklyPlan): Promise<void> {
    if (isDatabaseEnabled()) {
        if (storageMode === 'localStorage' && !shouldRetrySupabase()) {
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.saveWeeklyPlan(plan);
        }

        try {
            const supabaseModule = await import('@/lib/supabase/service');
            const supabaseService = supabaseModule as unknown as SupabaseServicePartial;
            if (supabaseService.saveWeeklyPlan) {
                await supabaseService.saveWeeklyPlan(plan);
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

// ==================== MONTHLY PLAN ====================

export async function getMonthlyPlan(): Promise<MonthlyPlan> {
    if (isDatabaseEnabled()) {
        if (storageMode === 'localStorage' && !shouldRetrySupabase()) {
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.getMonthlyPlan();
        }

        try {
            const supabaseModule = await import('@/lib/supabase/service');
            const supabaseService = supabaseModule as unknown as SupabaseServicePartial;
            if (supabaseService.getMonthlyPlan) {
                const res = await supabaseService.getMonthlyPlan();
                handleStorageSuccess();
                return res;
            }
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.getMonthlyPlan();
        } catch (err) {
            handleStorageError(err, 'getMonthlyPlan');
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.getMonthlyPlan();
        }
    } else {
        const localStorageService = await import('@/lib/storage/localStorage');
        return localStorageService.getMonthlyPlan();
    }
}

export async function saveMonthlyPlan(plan: MonthlyPlan): Promise<void> {
    if (isDatabaseEnabled()) {
        if (storageMode === 'localStorage' && !shouldRetrySupabase()) {
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.saveMonthlyPlan(plan);
        }

        try {
            const supabaseModule = await import('@/lib/supabase/service');
            const supabaseService = supabaseModule as unknown as SupabaseServicePartial;
            if (supabaseService.saveMonthlyPlan) {
                await supabaseService.saveMonthlyPlan(plan);
                handleStorageSuccess();
                return;
            }
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.saveMonthlyPlan(plan);
        } catch (err) {
            handleStorageError(err, 'saveMonthlyPlan');
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.saveMonthlyPlan(plan);
        }
    } else {
        const localStorageService = await import('@/lib/storage/localStorage');
        return localStorageService.saveMonthlyPlan(plan);
    }
}

// ==================== UTILITIES ====================

export async function rebuildRoutinesFromSessions(): Promise<Routine[]> {
    // Prefer database if enabled, otherwise use localStorage implementation
    if (isDatabaseEnabled()) {
        if (storageMode === 'localStorage' && !shouldRetrySupabase()) {
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.rebuildRoutinesFromSessions();
        }

        try {
            // Supabase backend doesn't implement a rebuild helper; fallback to local
            const supabaseModule = await import('@/lib/supabase/service');
            const supabaseService = supabaseModule as unknown as SupabaseServicePartial;
            if (supabaseService.rebuildRoutinesFromSessions) {
                const res = await supabaseService.rebuildRoutinesFromSessions();
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

export async function getActiveWorkout(): Promise<ActiveWorkout | null> {
    if (isDatabaseEnabled()) {
        if (storageMode === 'localStorage' && !shouldRetrySupabase()) {
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.getActiveWorkout();
        }

        try {
            const supabaseModule = await import('@/lib/supabase/service');
            const supabaseService = supabaseModule as unknown as SupabaseServicePartial;
            if (supabaseService.getActiveWorkout) {
                const res = await supabaseService.getActiveWorkout();
                
                // Si Supabase retorna null, intentar con localStorage como fallback
                if (res === null) {
                    const localStorageService = await import('@/lib/storage/localStorage');
                    const localRes = await localStorageService.getActiveWorkout();
                    return localRes;
                }
                
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

export async function saveActiveWorkout(payload: ActiveWorkout): Promise<void> {
    // SIEMPRE guardar en localStorage como backup
    const localStorageService = await import('@/lib/storage/localStorage');
    await localStorageService.saveActiveWorkout(payload);
    
    if (isDatabaseEnabled()) {
        if (storageMode === 'localStorage' && !shouldRetrySupabase()) {
            return;
        }

        try {
            const supabaseModule = await import('@/lib/supabase/service');
            const supabaseService = supabaseModule as unknown as SupabaseServicePartial;
            if (supabaseService.saveActiveWorkout) {
                await supabaseService.saveActiveWorkout(payload);
                handleStorageSuccess();
            }
        } catch (err) {
            handleStorageError(err, 'saveActiveWorkout');
        }
    }
}

// ==================== LAST WEIGHTS ====================

export async function getLastWeights(): Promise<Record<string, number[]>> {
    if (isDatabaseEnabled()) {
        if (storageMode === 'localStorage' && !shouldRetrySupabase()) {
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.getLastWeights();
        }

        try {
            const supabaseModule = await import('@/lib/supabase/service');
            const supabaseService = supabaseModule as unknown as SupabaseServicePartial & { getLastWeights?: () => Promise<Record<string, number[]>> };
            if (supabaseService.getLastWeights) {
                const res = await supabaseService.getLastWeights();
                handleStorageSuccess();
                return res;
            }
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.getLastWeights();
        } catch (err) {
            handleStorageError(err, 'getLastWeights');
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.getLastWeights();
        }
    } else {
        const localStorageService = await import('@/lib/storage/localStorage');
        return localStorageService.getLastWeights();
    }
}

export async function saveLastWeights(weights: Record<string, number[]>): Promise<void> {
    if (isDatabaseEnabled()) {
        if (storageMode === 'localStorage' && !shouldRetrySupabase()) {
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.saveLastWeights(weights);
        }

        try {
            const supabaseModule = await import('@/lib/supabase/service');
            const supabaseService = supabaseModule as unknown as SupabaseServicePartial & { saveLastWeights?: (w: Record<string, number[]>) => Promise<void> };
            if (supabaseService.saveLastWeights) {
                await supabaseService.saveLastWeights(weights);
                handleStorageSuccess();
                return;
            }
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.saveLastWeights(weights);
        } catch (err) {
            handleStorageError(err, 'saveLastWeights');
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.saveLastWeights(weights);
        }
    } else {
        const localStorageService = await import('@/lib/storage/localStorage');
        return localStorageService.saveLastWeights(weights);
    }
}

export async function clearActiveWorkout(): Promise<void> {
    if (isDatabaseEnabled()) {
        if (storageMode === 'localStorage' && !shouldRetrySupabase()) {
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.clearActiveWorkout();
        }

        try {
            const supabaseModule = await import('@/lib/supabase/service');
            const supabaseService = supabaseModule as unknown as SupabaseServicePartial & { clearActiveWorkout?: () => Promise<void> };
            if (supabaseService.clearActiveWorkout) {
                await supabaseService.clearActiveWorkout();
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

export async function getRecommendations(): Promise<ProgressRecommendation[]> {
    if (isDatabaseEnabled()) {
        if (storageMode === 'localStorage' && !shouldRetrySupabase()) {
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.getRecommendations();
        }

        try {
            const supabaseModule = await import('@/lib/supabase/service');
            const supabaseService = supabaseModule as unknown as SupabaseServicePartial;
            if (supabaseService.getRecommendations) {
                const result = await supabaseService.getRecommendations();
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

export async function saveRecommendations(recommendations: ProgressRecommendation[]): Promise<void> {
    if (isDatabaseEnabled()) {
        if (storageMode === 'localStorage' && !shouldRetrySupabase()) {
            const localStorageService = await import('@/lib/storage/localStorage');
            return localStorageService.saveRecommendations(recommendations);
        }

        try {
            const supabaseModule = await import('@/lib/supabase/service');
            const supabaseService = supabaseModule as unknown as SupabaseServicePartial;
            if (supabaseService.saveRecommendations) {
                await supabaseService.saveRecommendations(recommendations);
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

// ==================== MIGRATION ====================

/**
 * Migrar sesiones de claves antiguas a la clave actual
 * Útil para consolidar datos después de cambios en el esquema de storage
 */
export async function migrateLegacySessions(): Promise<{ migrated: number; total: number }> {
    // Solo aplica a localStorage, no a Supabase
    const localStorageService = await import('@/lib/storage/localStorage');
    return localStorageService.migrateLegacySessions();
}

/**
 * Sincronizar sesiones de localStorage a Supabase
 * Útil cuando hay sesiones guardadas localmente que no están en la BD
 */
export async function syncLocalSessionsToDatabase(): Promise<{ synced: number; errors: number }> {
    if (!isDatabaseEnabled()) {
        return { synced: 0, errors: 0 };
    }

    try {
        // Obtener sesiones de localStorage
        const localStorageService = await import('@/lib/storage/localStorage');
        const localSessions = await localStorageService.getSessions();

        // Obtener sesiones de Supabase
        const supabaseModule = await import('@/lib/supabase/service');
        const supabaseService = supabaseModule as unknown as SupabaseServicePartial & { getSessions?: () => Promise<WorkoutSession[]>; saveSession?: (s: WorkoutSession) => Promise<void> };
        let dbSessions: WorkoutSession[] = [];
        try {
            dbSessions = supabaseService.getSessions ? await supabaseService.getSessions() : [];
        } catch (e) {
            console.warn('[syncLocalSessionsToDatabase] Could not fetch DB sessions:', e);
            return { synced: 0, errors: 0 };
        }

        const dbSessionIds = new Set(dbSessions.map(s => s.id));
        let synced = 0;
        let errors = 0;

        // Sincronizar sesiones que no están en la BD
        for (const session of localSessions) {
            if (!dbSessionIds.has(session.id)) {
                try {
                    if (supabaseService.saveSession) await supabaseService.saveSession(session);
                    synced++;
                    // console.log(`[syncLocalSessionsToDatabase] Synced session ${session.id} to database`);
                } catch (e) {
                    errors++;
                    console.error(`[syncLocalSessionsToDatabase] Error syncing session ${session.id}:`, e);
                }
            }
        }

        if (synced > 0) {
            // console.log(`[syncLocalSessionsToDatabase] Synced ${synced} sessions to database (${errors} errors)`);
        }

        return { synced, errors };
    } catch (error) {
        console.error('[syncLocalSessionsToDatabase] Error:', error);
        return { synced: 0, errors: 0 };
    }
}
