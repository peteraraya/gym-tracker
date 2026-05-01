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
import logger from '@/lib/logger';

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
    logger.warn('Supabase failed, using localStorage', { operation }, err instanceof Error ? err : undefined);
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
// CRITICAL_SUPABASE_ONLY: Rutinas son datos críticos, solo Supabase (sin fallback)

export async function getRoutines(): Promise<Routine[]> {
    if (!isDatabaseEnabled()) {
        // Usar localStorage cuando Supabase está desactivado
        logger.info('Database disabled, using localStorage for routines');
        const localStorageService = await getLocalStorageService();
        return localStorageService.getRoutines();
    }

    try {
        const supabaseModule = await import('@/lib/supabase/service');
        const supabaseService = supabaseModule as unknown as SupabaseServicePartial;
        
        if (!supabaseService.getRoutines) {
            throw new Error('Servicio de rutinas no disponible');
        }
        
        const result = await supabaseService.getRoutines();
        handleStorageSuccess();
        return result;
    } catch (err) {
        // NO FALLBACK - Lanzar error al usuario
        logger.error('Error al cargar rutinas desde Supabase', { critical: true }, err instanceof Error ? err : undefined);
        throw new Error('No se pudieron cargar las rutinas. Verifica tu conexión a internet e intenta de nuevo.');
    }
}

// Cache del módulo de Supabase para evitar imports dinámicos repetidos
let supabaseServiceCache: SupabaseServicePartial | null = null;
// Cache del módulo de localStorage para evitar imports dinámicos repetidos
let localStorageServiceCache: any | null = null;

async function getSupabaseService(): Promise<SupabaseServicePartial> {
    if (supabaseServiceCache) {
        return supabaseServiceCache;
    }
    
    const supabaseModule = await import('@/lib/supabase/service');
    supabaseServiceCache = supabaseModule as unknown as SupabaseServicePartial;
    return supabaseServiceCache;
}

async function getLocalStorageService(): Promise<any> {
    if (localStorageServiceCache) {
        return localStorageServiceCache;
    }
    
    localStorageServiceCache = await import('@/lib/storage/localStorage');
    return localStorageServiceCache;
}

export async function createRoutine(data: CreateRoutineData): Promise<Routine> {
    if (!isDatabaseEnabled()) {
        // Usar localStorage cuando Supabase está desactivado
        logger.info('Database disabled, using localStorage to create routine');
        const localStorageService = await getLocalStorageService();
        return localStorageService.createRoutine(data);
    }

    try {
        const supabaseService = await getSupabaseService();
        
        if (!supabaseService.createRoutine) {
            throw new Error('Servicio de creación de rutinas no disponible');
        }
        
        const result = await supabaseService.createRoutine(data);
        handleStorageSuccess();
        return result;
    } catch (err) {
        // NO FALLBACK - Lanzar error al usuario
        logger.error('Error al crear rutina en Supabase', { critical: true }, err instanceof Error ? err : undefined);
        
        // Guardar borrador en localStorage para no perder el trabajo
        try {
            const draftKey = `routine-draft-${Date.now()}`;
            localStorage.setItem(draftKey, JSON.stringify({ ...data, savedAt: Date.now() }));
            logger.info('Borrador guardado en localStorage', { draftKey });
        } catch (draftErr) {
            logger.warn('No se pudo guardar borrador', {}, draftErr instanceof Error ? draftErr : undefined);
        }
        
        throw new Error('No se pudo crear la rutina. Verifica tu conexión a internet. Se guardó un borrador local.');
    }
}

export async function updateRoutine(id: string, data: CreateRoutineData): Promise<Routine> {
    if (!isDatabaseEnabled()) {
        // Usar localStorage cuando Supabase está desactivado
        logger.info('Database disabled, using localStorage to update routine');
        const localStorageService = await getLocalStorageService();
        return localStorageService.updateRoutine(id, data);
    }

    try {
        const supabaseService = await getSupabaseService();
        
        if (!supabaseService.updateRoutine) {
            throw new Error('Servicio de actualización de rutinas no disponible');
        }
        
        const result = await supabaseService.updateRoutine(id, data);
        handleStorageSuccess();
        return result;
    } catch (err) {
        // NO FALLBACK - Lanzar error al usuario
        logger.error('Error al actualizar rutina en Supabase', { critical: true, routineId: id }, err instanceof Error ? err : undefined);
        
        // Guardar borrador en localStorage para no perder el trabajo
        try {
            const draftKey = `routine-draft-${id}`;
            localStorage.setItem(draftKey, JSON.stringify({ ...data, id, savedAt: Date.now() }));
            logger.info('Borrador de edición guardado en localStorage', { draftKey });
        } catch (draftErr) {
            logger.warn('No se pudo guardar borrador', {}, draftErr instanceof Error ? draftErr : undefined);
        }
        
        throw new Error('No se pudo actualizar la rutina. Verifica tu conexión a internet. Se guardó un borrador local.');
    }
}

export async function deleteRoutine(id: string): Promise<void> {
    if (!isDatabaseEnabled()) {
        // Usar localStorage cuando Supabase está desactivado
        logger.info('Database disabled, using localStorage to delete routine');
        const localStorageService = await getLocalStorageService();
        
        // Eliminar sesiones asociadas primero
        await localStorageService.deleteSessionsByRoutine(id);
        
        // Eliminar rutina
        await localStorageService.deleteRoutine(id);
        return;
    }

    try {
        const supabaseService = await import('@/lib/supabase/service');
        
        // Eliminar sesiones asociadas primero
        if (supabaseService.deleteSessionsByRoutine) {
            await supabaseService.deleteSessionsByRoutine(id);
        }
        
        // Eliminar rutina
        await supabaseService.deleteRoutine(id);
        handleStorageSuccess();
    } catch (err) {
        // NO FALLBACK - Lanzar error al usuario
        logger.error('Error al eliminar rutina en Supabase', { critical: true, routineId: id }, err instanceof Error ? err : undefined);
        throw new Error('No se pudo eliminar la rutina. Verifica tu conexión a internet e intenta de nuevo.');
    }
}

// ==================== SESSIONS ====================
// CRITICAL_SUPABASE_ONLY: Sesiones son datos críticos, solo Supabase (sin fallback)

export async function getSessions(): Promise<WorkoutSession[]> {
    if (!isDatabaseEnabled()) {
        // Usar localStorage cuando Supabase está desactivado
        logger.info('Database disabled, using localStorage for sessions');
        const localStorageService = await getLocalStorageService();
        return localStorageService.getSessions();
    }

    try {
        const supabaseModule = await import('@/lib/supabase/service');
        const supabaseService = supabaseModule as unknown as SupabaseServicePartial;
        
        if (!supabaseService.getSessions) {
            throw new Error('Servicio de sesiones no disponible');
        }
        
        const result = await supabaseService.getSessions();
        handleStorageSuccess();
        return result;
    } catch (err) {
        // NO FALLBACK - Lanzar error al usuario
        logger.error('Error al cargar sesiones desde Supabase', { critical: true }, err instanceof Error ? err : undefined);
        throw new Error('No se pudieron cargar las sesiones de entrenamiento. Verifica tu conexión a internet.');
    }
}

export async function saveSession(session: WorkoutSession): Promise<void> {
    if (!isDatabaseEnabled()) {
        // Usar localStorage cuando Supabase está desactivado
        logger.info('Database disabled, using localStorage to save session');
        const localStorageService = await getLocalStorageService();
        await localStorageService.saveSession(session);
        return;
    }

    try {
        const supabaseModule = await import('@/lib/supabase/service');
        const supabaseService = supabaseModule as unknown as SupabaseServicePartial & { saveSession?: (s: WorkoutSession) => Promise<void> };
        
        if (!supabaseService.saveSession) {
            throw new Error('Servicio de guardado de sesiones no disponible');
        }
        
        await supabaseService.saveSession(session);
        handleStorageSuccess();
        
        // Guardar marker de debug
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
        // NO FALLBACK - Lanzar error al usuario
        logger.error('Error al guardar sesión en Supabase', { critical: true, sessionId: session.id }, err instanceof Error ? err : undefined);
        
        // Guardar borrador de sesión en localStorage para no perder datos
        try {
            const draftKey = `session-draft-${session.id || Date.now()}`;
            localStorage.setItem(draftKey, JSON.stringify({ ...session, savedAt: Date.now() }));
            logger.info('Borrador de sesión guardado en localStorage', { draftKey });
        } catch (draftErr) {
            logger.warn('No se pudo guardar borrador de sesión', {}, draftErr instanceof Error ? draftErr : undefined);
        }
        
        throw new Error('No se pudo guardar la sesión de entrenamiento. Verifica tu conexión. Se guardó un borrador local.');
    }
}

export async function updateSession(session: WorkoutSession): Promise<void> {
    if (!isDatabaseEnabled()) {
        // Usar localStorage cuando Supabase está desactivado
        logger.info('Database disabled, using localStorage to update session');
        const localStorageService = await getLocalStorageService();
        // localStorage usa saveSession para crear y actualizar
        await localStorageService.saveSession(session);
        return;
    }

    try {
        const supabaseModule = await import('@/lib/supabase/service');
        const supabaseService = supabaseModule as unknown as SupabaseServicePartial & { updateSession?: (s: WorkoutSession) => Promise<void> };
        
        if (!supabaseService.updateSession) {
            throw new Error('Servicio de actualización de sesiones no disponible');
        }
        
        await supabaseService.updateSession(session);
        handleStorageSuccess();
        
        logger.info('Sesión actualizada exitosamente', { sessionId: session.id });
    } catch (err) {
        logger.error('Error al actualizar sesión en Supabase', { critical: true, sessionId: session.id }, err instanceof Error ? err : undefined);
        throw new Error('No se pudo actualizar la sesión de entrenamiento. Verifica tu conexión.');
    }
}

export async function deleteSession(sessionId: string): Promise<void> {
    if (!isDatabaseEnabled()) {
        // Usar localStorage cuando Supabase está desactivado
        logger.info('Database disabled, using localStorage to delete session');
        const localStorageService = await getLocalStorageService();
        
        // Implementar eliminación en localStorage
        const sessions = await localStorageService.getSessions();
        const filtered = sessions.filter((s: WorkoutSession) => s.id !== sessionId);
        
        // Guardar sesiones filtradas
        if (typeof window !== 'undefined') {
            localStorage.setItem('gym_tracker_sessions', JSON.stringify(filtered));
        }
        return;
    }

    try {
        const supabaseModule = await import('@/lib/supabase/service');
        const supabaseService = supabaseModule as unknown as SupabaseServicePartial & { deleteSession?: (id: string) => Promise<void> };
        
        if (!supabaseService.deleteSession) {
            throw new Error('Servicio de eliminación de sesiones no disponible');
        }
        
        await supabaseService.deleteSession(sessionId);
        handleStorageSuccess();
        
        logger.info('Sesión eliminada exitosamente', { sessionId });
    } catch (err) {
        logger.error('Error al eliminar sesión en Supabase', { critical: true, sessionId }, err instanceof Error ? err : undefined);
        throw new Error('No se pudo eliminar la sesión de entrenamiento. Verifica tu conexión.');
    }
}

// ==================== PROFILE ====================
// CRITICAL_SUPABASE_ONLY: Perfil es dato crítico, solo Supabase (sin fallback)

export async function getProfile(): Promise<UserProfile> {
    if (!isDatabaseEnabled()) {
        // Usar localStorage cuando Supabase está desactivado
        logger.info('Database disabled, using localStorage for profile');
        const localStorageService = await getLocalStorageService();
        return localStorageService.getProfile();
    }

    try {
        const supabaseModule = await import('@/lib/supabase/service');
        const supabaseService = supabaseModule as unknown as SupabaseServicePartial & { getProfile?: () => Promise<UserProfile> };
        
        if (!supabaseService.getProfile) {
            throw new Error('Servicio de perfil no disponible');
        }
        
        const result = await supabaseService.getProfile();
        handleStorageSuccess();
        return result;
    } catch (err) {
        // NO FALLBACK - Lanzar error al usuario
        logger.error('Error al cargar perfil desde Supabase', { critical: true }, err instanceof Error ? err : undefined);
        throw new Error('No se pudo cargar tu perfil. Verifica tu conexión a internet.');
    }
}

export async function updateProfile(data: Partial<UserProfile>): Promise<void> {
    if (!isDatabaseEnabled()) {
        // Usar localStorage cuando Supabase está desactivado
        logger.info('Database disabled, using localStorage to update profile');
        const localStorageService = await getLocalStorageService();
        await localStorageService.updateProfile(data);
        return;
    }

    try {
        const supabaseModule = await import('@/lib/supabase/service');
        const supabaseService = supabaseModule as unknown as SupabaseServicePartial & { updateProfile?: (d: Partial<UserProfile>) => Promise<void> };
        
        if (!supabaseService.updateProfile) {
            throw new Error('Servicio de actualización de perfil no disponible');
        }
        
        await supabaseService.updateProfile(data);
        handleStorageSuccess();
    } catch (err) {
        // NO FALLBACK - Lanzar error al usuario
        logger.error('Error al actualizar perfil en Supabase', { critical: true }, err instanceof Error ? err : undefined);
        
        // Guardar borrador de cambios de perfil
        try {
            const draftKey = `profile-draft-${Date.now()}`;
            localStorage.setItem(draftKey, JSON.stringify({ ...data, savedAt: Date.now() }));
            logger.info('Borrador de perfil guardado en localStorage', { draftKey });
        } catch (draftErr) {
            logger.warn('No se pudo guardar borrador de perfil', {}, draftErr instanceof Error ? draftErr : undefined);
        }
        
        throw new Error('No se pudo actualizar tu perfil. Verifica tu conexión. Se guardó un borrador local.');
    }
}

// ==================== WEEKLY PLAN ====================
// CRITICAL_SUPABASE_ONLY: Plan semanal es dato crítico, solo Supabase (sin fallback)

export async function getWeeklyPlan(): Promise<WeeklyPlan> {
    if (!isDatabaseEnabled()) {
        // Usar localStorage cuando Supabase está desactivado
        logger.info('Database disabled, using localStorage for weekly plan');
        const localStorageService = await getLocalStorageService();
        return localStorageService.getWeeklyPlan();
    }

    try {
        const supabaseModule = await import('@/lib/supabase/service');
        const supabaseService = supabaseModule as unknown as SupabaseServicePartial;
        
        if (!supabaseService.getWeeklyPlan) {
            throw new Error('Servicio de plan semanal no disponible');
        }
        
        const res = await supabaseService.getWeeklyPlan();
        handleStorageSuccess();
        return res;
    } catch (err) {
        // NO FALLBACK - Lanzar error al usuario
        logger.error('Error al cargar plan semanal desde Supabase', { critical: true }, err instanceof Error ? err : undefined);
        throw new Error('No se pudo cargar tu plan semanal. Verifica tu conexión a internet.');
    }
}

export async function saveWeeklyPlan(plan: WeeklyPlan): Promise<void> {
    if (!isDatabaseEnabled()) {
        // Usar localStorage cuando Supabase está desactivado
        logger.info('Database disabled, using localStorage to save weekly plan');
        const localStorageService = await getLocalStorageService();
        await localStorageService.saveWeeklyPlan(plan);
        return;
    }

    try {
        const supabaseModule = await import('@/lib/supabase/service');
        const supabaseService = supabaseModule as unknown as SupabaseServicePartial;
        
        if (!supabaseService.saveWeeklyPlan) {
            throw new Error('Servicio de guardado de plan semanal no disponible');
        }
        
        await supabaseService.saveWeeklyPlan(plan);
        handleStorageSuccess();
    } catch (err) {
        // NO FALLBACK - Lanzar error al usuario
        logger.error('Error al guardar plan semanal en Supabase', { critical: true }, err instanceof Error ? err : undefined);
        
        // Guardar borrador del plan
        try {
            const draftKey = `weekly-plan-draft-${Date.now()}`;
            localStorage.setItem(draftKey, JSON.stringify({ ...plan, savedAt: Date.now() }));
            logger.info('Borrador de plan semanal guardado en localStorage', { draftKey });
        } catch (draftErr) {
            logger.warn('No se pudo guardar borrador de plan semanal', {}, draftErr instanceof Error ? draftErr : undefined);
        }
        
        throw new Error('No se pudo guardar tu plan semanal. Verifica tu conexión. Se guardó un borrador local.');
    }
}

// ==================== MONTHLY PLAN ====================

export async function getMonthlyPlan(): Promise<MonthlyPlan> {
    if (isDatabaseEnabled()) {
        if (storageMode === 'localStorage' && !shouldRetrySupabase()) {
            const localStorageService = await getLocalStorageService();
            return localStorageService.getMonthlyPlan();
        }

        try {
            const supabaseService = await getSupabaseService();
            if (supabaseService.getMonthlyPlan) {
                const res = await supabaseService.getMonthlyPlan();
                handleStorageSuccess();
                return res;
            }
            const localStorageService = await getLocalStorageService();
            return localStorageService.getMonthlyPlan();
        } catch (err) {
            handleStorageError(err, 'getMonthlyPlan');
            const localStorageService = await getLocalStorageService();
            return localStorageService.getMonthlyPlan();
        }
    } else {
        const localStorageService = await getLocalStorageService();
        return localStorageService.getMonthlyPlan();
    }
}

export async function saveMonthlyPlan(plan: MonthlyPlan): Promise<void> {
    if (isDatabaseEnabled()) {
        if (storageMode === 'localStorage' && !shouldRetrySupabase()) {
            const localStorageService = await getLocalStorageService();
            return localStorageService.saveMonthlyPlan(plan);
        }

        try {
            const supabaseService = await getSupabaseService();
            if (supabaseService.saveMonthlyPlan) {
                await supabaseService.saveMonthlyPlan(plan);
                handleStorageSuccess();
                return;
            }
            const localStorageService = await getLocalStorageService();
            return localStorageService.saveMonthlyPlan(plan);
        } catch (err) {
            handleStorageError(err, 'saveMonthlyPlan');
            const localStorageService = await getLocalStorageService();
            return localStorageService.saveMonthlyPlan(plan);
        }
    } else {
        const localStorageService = await getLocalStorageService();
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
// DUAL_WRITE: ActiveWorkout es semi-crítico, guardar en ambos lugares simultáneamente

export async function getActiveWorkout(): Promise<ActiveWorkout | null> {
    // Intentar Supabase primero si está habilitado
    if (isDatabaseEnabled()) {
        try {
            const supabaseService = await getSupabaseService();
            
            if (supabaseService.getActiveWorkout) {
                const supabaseResult = await supabaseService.getActiveWorkout();
                
                // Si Supabase tiene datos, usarlos
                if (supabaseResult !== null) {
                    handleStorageSuccess();
                    return supabaseResult;
                }
            }
        } catch (err) {
            logger.warn('Supabase failed for active workout, trying localStorage', { operation: 'DUAL_READ' }, err instanceof Error ? err : undefined);
            // No lanzar error, intentar localStorage como backup
        }
    }
    
    // Fallback a localStorage (siempre disponible)
    try {
        const localStorageService = await getLocalStorageService();
        const localResult = await localStorageService.getActiveWorkout();
        if (localResult) {
            logger.debug('Active workout loaded from localStorage', { operation: 'DUAL_READ' });
        }
        return localResult;
    } catch (err) {
        logger.error('Both Supabase and localStorage failed for active workout', { operation: 'DUAL_READ' }, err instanceof Error ? err : undefined);
        return null;
    }
}

export async function saveActiveWorkout(payload: ActiveWorkout): Promise<void> {
    // DUAL WRITE: Guardar en localStorage primero (crítico para el workout)
    const localStorageService = await getLocalStorageService();
    await localStorageService.saveActiveWorkout(payload);
    logger.debug('Active workout saved to localStorage', { operation: 'DUAL_WRITE' });
    
    // Intentar guardar en Supabase también (best effort)
    if (isDatabaseEnabled()) {
        try {
            const supabaseService = await getSupabaseService();
            
            if (supabaseService.saveActiveWorkout) {
                await supabaseService.saveActiveWorkout(payload);
                handleStorageSuccess();
                logger.debug('Active workout saved to Supabase', { operation: 'DUAL_WRITE' });
            }
        } catch (err) {
            // No lanzar error - localStorage ya tiene los datos
            logger.warn('Supabase save failed, but localStorage succeeded', { operation: 'DUAL_WRITE' }, err instanceof Error ? err : undefined);
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
    // DUAL CLEAR: Limpiar de ambos lugares
    
    // Limpiar localStorage primero (siempre disponible)
    const localStorageService = await import('@/lib/storage/localStorage');
    await localStorageService.clearActiveWorkout();
    logger.debug('Active workout cleared from localStorage', { operation: 'DUAL_CLEAR' });

    // Intentar limpiar de Supabase también
    if (isDatabaseEnabled()) {
        try {
            const supabaseModule = await import('@/lib/supabase/service');
            const supabaseService = supabaseModule as unknown as SupabaseServicePartial & { clearActiveWorkout?: () => Promise<void> };
            
            if (supabaseService.clearActiveWorkout) {
                await supabaseService.clearActiveWorkout();
                handleStorageSuccess();
                logger.debug('Active workout cleared from Supabase', { operation: 'DUAL_CLEAR' });
            }
        } catch (err) {
            // No importa si Supabase falla, ya limpiamos localStorage
            logger.warn('Supabase clear failed, but localStorage succeeded', { operation: 'DUAL_CLEAR' }, err instanceof Error ? err : undefined);
        }
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
            logger.warn('Could not fetch DB sessions', { operation: 'syncLocalSessionsToDatabase' }, e instanceof Error ? e : undefined);
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
                } catch (e) {
                    errors++;
                    logger.error('Error syncing session', { operation: 'syncLocalSessionsToDatabase', sessionId: session.id }, e instanceof Error ? e : undefined);
                }
            }
        }

        if (synced > 0) {
            logger.info('Sessions synced to database', { operation: 'syncLocalSessionsToDatabase', synced, errors });
        }

        return { synced, errors };
    } catch (error) {
        logger.error('Error syncing sessions', { operation: 'syncLocalSessionsToDatabase' }, error instanceof Error ? error : undefined);
        return { synced: 0, errors: 0 };
    }
}


// ==================== DEVELOPMENT UTILITIES ====================
// ⚠️ SOLO PARA DESARROLLO - NO USAR EN PRODUCCIÓN

/**
 * Verifica si las funciones de desarrollo están habilitadas
 * Solo disponibles cuando NEXT_PUBLIC_ENABLE_DEV_TOOLS=true
 */
export function isDevToolsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === 'true';
}

/**
 * Limpia TODAS las sesiones de entrenamiento del usuario actual
 * ⚠️ PELIGROSO: Esta acción es irreversible
 * Solo disponible en modo desarrollo
 */
export async function devClearAllSessions(): Promise<{ deleted: number; error?: string }> {
  if (!isDevToolsEnabled()) {
    throw new Error('Dev tools are not enabled. Set NEXT_PUBLIC_ENABLE_DEV_TOOLS=true');
  }

  try {
    if (isDatabaseEnabled()) {
      const supabaseService = await getSupabaseService();
      
      if (!supabaseService.getSessions) {
        throw new Error('getSessions not available');
      }
      
      const sessions = await supabaseService.getSessions();
      
      // Eliminar todas las sesiones
      for (const session of sessions) {
        // Nota: deleteSession puede no estar disponible en el tipo parcial
        // Usar método alternativo si es necesario
        if (typeof (supabaseService as any).deleteSession === 'function') {
          await (supabaseService as any).deleteSession(session.id);
        }
      }
      
      logger.info('[DEV] Cleared all sessions from Supabase', { count: sessions.length });
      return { deleted: sessions.length };
    } else {
      const localStorageService = await getLocalStorageService();
      const sessions = await localStorageService.getSessions();
      
      // Limpiar localStorage
      localStorage.removeItem('gym-tracker-sessions');
      
      logger.info('[DEV] Cleared all sessions from localStorage', { count: sessions.length });
      return { deleted: sessions.length };
    }
  } catch (error) {
    logger.error('[DEV] Error clearing sessions', {}, error instanceof Error ? error : undefined);
    return { deleted: 0, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Limpia TODAS las rutinas del usuario actual
 * ⚠️ PELIGROSO: Esta acción es irreversible
 * Solo disponible en modo desarrollo
 */
export async function devClearAllRoutines(): Promise<{ deleted: number; error?: string }> {
  if (!isDevToolsEnabled()) {
    throw new Error('Dev tools are not enabled. Set NEXT_PUBLIC_ENABLE_DEV_TOOLS=true');
  }

  try {
    if (isDatabaseEnabled()) {
      const supabaseService = await getSupabaseService();
      
      if (!supabaseService.getRoutines) {
        throw new Error('getRoutines not available');
      }
      
      const routines = await supabaseService.getRoutines();
      
      // Eliminar todas las rutinas
      if (supabaseService.deleteRoutine) {
        for (const routine of routines) {
          await supabaseService.deleteRoutine(routine.id);
        }
      }
      
      logger.info('[DEV] Cleared all routines from Supabase', { count: routines.length });
      return { deleted: routines.length };
    } else {
      const localStorageService = await getLocalStorageService();
      const routines = await localStorageService.getRoutines();
      
      // Limpiar localStorage
      localStorage.removeItem('gym-tracker-routines');
      
      logger.info('[DEV] Cleared all routines from localStorage', { count: routines.length });
      return { deleted: routines.length };
    }
  } catch (error) {
    logger.error('[DEV] Error clearing routines', {}, error instanceof Error ? error : undefined);
    return { deleted: 0, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Limpia el perfil del usuario
 * ⚠️ PELIGROSO: Esta acción es irreversible
 * Solo disponible en modo desarrollo
 */
export async function devClearProfile(): Promise<{ success: boolean; error?: string }> {
  if (!isDevToolsEnabled()) {
    throw new Error('Dev tools are not enabled. Set NEXT_PUBLIC_ENABLE_DEV_TOOLS=true');
  }

  try {
    if (isDatabaseEnabled()) {
      const supabaseService = await getSupabaseService();
      
      if (!supabaseService.updateProfile) {
        throw new Error('updateProfile not available');
      }
      
      // Resetear perfil a valores por defecto
      await supabaseService.updateProfile({
        age: undefined,
        gender: undefined,
        height: undefined,
        weight: undefined,
        fitnessGoal: undefined,
        fitnessLevel: undefined,
        weeklyWorkouts: undefined
      });
      
      logger.info('[DEV] Cleared profile from Supabase');
      return { success: true };
    } else {
      // Limpiar localStorage
      localStorage.removeItem('gym-tracker-profile');
      
      logger.info('[DEV] Cleared profile from localStorage');
      return { success: true };
    }
  } catch (error) {
    logger.error('[DEV] Error clearing profile', {}, error instanceof Error ? error : undefined);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Limpia planes semanales y mensuales
 * ⚠️ PELIGROSO: Esta acción es irreversible
 * Solo disponible en modo desarrollo
 */
export async function devClearPlans(): Promise<{ success: boolean; error?: string }> {
  if (!isDevToolsEnabled()) {
    throw new Error('Dev tools are not enabled. Set NEXT_PUBLIC_ENABLE_DEV_TOOLS=true');
  }

  try {
    if (isDatabaseEnabled()) {
      const supabaseService = await getSupabaseService();
      
      if (!supabaseService.saveWeeklyPlan || !supabaseService.saveMonthlyPlan) {
        throw new Error('Plan functions not available');
      }
      
      // Limpiar planes
      await supabaseService.saveWeeklyPlan({
        monday: { routines: [] },
        tuesday: { routines: [] },
        wednesday: { routines: [] },
        thursday: { routines: [] },
        friday: { routines: [] },
        saturday: { routines: [] },
        sunday: { routines: [] }
      });
      
      await supabaseService.saveMonthlyPlan({});
      
      logger.info('[DEV] Cleared plans from Supabase');
      return { success: true };
    } else {
      // Limpiar localStorage
      localStorage.removeItem('gym-tracker-weekly-plan');
      localStorage.removeItem('gym-tracker-monthly-plan');
      
      logger.info('[DEV] Cleared plans from localStorage');
      return { success: true };
    }
  } catch (error) {
    logger.error('[DEV] Error clearing plans', {}, error instanceof Error ? error : undefined);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Limpia recomendaciones de progresión
 * Solo disponible en modo desarrollo
 */
export async function devClearRecommendations(): Promise<{ success: boolean; error?: string }> {
  if (!isDevToolsEnabled()) {
    throw new Error('Dev tools are not enabled. Set NEXT_PUBLIC_ENABLE_DEV_TOOLS=true');
  }

  try {
    if (isDatabaseEnabled()) {
      const supabaseService = await getSupabaseService();
      
      if (!supabaseService.saveRecommendations) {
        throw new Error('saveRecommendations not available');
      }
      
      await supabaseService.saveRecommendations([]);
      
      logger.info('[DEV] Cleared recommendations from Supabase');
      return { success: true };
    } else {
      localStorage.removeItem('gym-tracker-recommendations');
      
      logger.info('[DEV] Cleared recommendations from localStorage');
      return { success: true };
    }
  } catch (error) {
    logger.error('[DEV] Error clearing recommendations', {}, error instanceof Error ? error : undefined);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Limpia TODOS los datos del usuario
 * ⚠️ MUY PELIGROSO: Esta acción es irreversible y elimina TODO
 * Solo disponible en modo desarrollo
 */
export async function devClearAllData(): Promise<{
  sessions: number;
  routines: number;
  profile: boolean;
  plans: boolean;
  recommendations: boolean;
  errors: string[];
}> {
  if (!isDevToolsEnabled()) {
    throw new Error('Dev tools are not enabled. Set NEXT_PUBLIC_ENABLE_DEV_TOOLS=true');
  }

  const errors: string[] = [];
  let sessionsDeleted = 0;
  let routinesDeleted = 0;
  let profileCleared = false;
  let plansCleared = false;
  let recommendationsCleared = false;

  // Limpiar sesiones
  try {
    const result = await devClearAllSessions();
    sessionsDeleted = result.deleted;
    if (result.error) errors.push(`Sessions: ${result.error}`);
  } catch (error) {
    errors.push(`Sessions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Limpiar rutinas
  try {
    const result = await devClearAllRoutines();
    routinesDeleted = result.deleted;
    if (result.error) errors.push(`Routines: ${result.error}`);
  } catch (error) {
    errors.push(`Routines: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Limpiar perfil
  try {
    const result = await devClearProfile();
    profileCleared = result.success;
    if (result.error) errors.push(`Profile: ${result.error}`);
  } catch (error) {
    errors.push(`Profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Limpiar planes
  try {
    const result = await devClearPlans();
    plansCleared = result.success;
    if (result.error) errors.push(`Plans: ${result.error}`);
  } catch (error) {
    errors.push(`Plans: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Limpiar recomendaciones
  try {
    const result = await devClearRecommendations();
    recommendationsCleared = result.success;
    if (result.error) errors.push(`Recommendations: ${result.error}`);
  } catch (error) {
    errors.push(`Recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Limpiar active workout
  try {
    await clearActiveWorkout();
  } catch (error) {
    errors.push(`Active workout: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  logger.warn('[DEV] Cleared all user data', {
    sessionsDeleted,
    routinesDeleted,
    profileCleared,
    plansCleared,
    recommendationsCleared,
    errors
  });

  return {
    sessions: sessionsDeleted,
    routines: routinesDeleted,
    profile: profileCleared,
    plans: plansCleared,
    recommendations: recommendationsCleared,
    errors
  };
}

/**
 * Genera datos de prueba para desarrollo
 * Solo disponible en modo desarrollo
 */
export async function devGenerateTestData(): Promise<{ success: boolean; error?: string }> {
  if (!isDevToolsEnabled()) {
    throw new Error('Dev tools are not enabled. Set NEXT_PUBLIC_ENABLE_DEV_TOOLS=true');
  }

  try {
    // Crear rutina de prueba
    const testRoutine = await createRoutine({
      name: 'Rutina de Prueba',
      description: 'Generada automáticamente para desarrollo',
      exercises: [
        {
          id: 'test-exercise-1',
          name: 'Press Banca',
          sets: [
            { reps: 10, weight: 50 },
            { reps: 10, weight: 55 },
            { reps: 8, weight: 60 }
          ]
        },
        {
          id: 'test-exercise-2',
          name: 'Sentadillas',
          sets: [
            { reps: 12, weight: 80 },
            { reps: 10, weight: 90 },
            { reps: 8, weight: 100 }
          ]
        }
      ],
      restBetweenSets: 90,
      restBetweenExercises: 120
    });

    // Crear sesión de prueba
    const testSession: WorkoutSession = {
      id: `test-session-${Date.now()}`,
      routineId: testRoutine.id,
      routineName: testRoutine.name,
      date: new Date(),
      startedAt: new Date(Date.now() - 3600000), // 1 hora atrás
      completedAt: new Date(),
      exercises: [
        {
          exerciseId: 'test-exercise-1',
          exerciseName: 'Press Banca',
          completedSets: 3,
          actualReps: [10, 10, 8],
          actualWeight: [50, 55, 60]
        },
        {
          exerciseId: 'test-exercise-2',
          exerciseName: 'Sentadillas',
          completedSets: 3,
          actualReps: [12, 10, 8],
          actualWeight: [80, 90, 100]
        }
      ],
      totalDuration: 3600,
      notes: 'Sesión de prueba generada automáticamente'
    };

    await saveSession(testSession);

    logger.info('[DEV] Generated test data', { routineId: testRoutine.id, sessionId: testSession.id });
    return { success: true };
  } catch (error) {
    logger.error('[DEV] Error generating test data', {}, error instanceof Error ? error : undefined);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
