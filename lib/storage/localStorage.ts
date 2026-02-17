/**
 * LocalStorage Service - Client-side storage operations
 * 
 * Provides localStorage-based storage when database is disabled.
 * Compatible interface with supabase/service.ts
 */

import type { Routine, WorkoutSession } from '@/types';

// Storage keys
const STORAGE_KEYS = {
    ROUTINES: 'gym_tracker_routines',
    SESSIONS: 'gym_tracker_sessions',
    PROFILE: 'gym_tracker_profile',
    WEEKLY_PLAN: 'weekly_routine_plan',
    MONTHLY_PLAN: 'monthly_routine_plan',
    ACTIVE_WORKOUT: 'gym-tracker-active-workout',
    RECOMMENDATIONS: 'gym_tracker_recommendations',
    LAST_WEIGHTS: 'gym_tracker_last_weights',
} as const;

// Helper to generate unique IDs
function generateId(): string {
    // Use crypto.randomUUID if available, otherwise fallback to timestamp
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper to safely parse JSON from localStorage
function getFromStorage<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;

    try {
        const item = localStorage.getItem(key);
        if (!item) return defaultValue;

        const parsed = JSON.parse(item);
        // Convert date strings back to Date objects for routines
        if (key === STORAGE_KEYS.ROUTINES && Array.isArray(parsed)) {
            return parsed.map(routine => ({
                ...routine,
                createdAt: new Date(routine.createdAt),
                updatedAt: new Date(routine.updatedAt),
            })) as T;
        }
        // Convert date strings back to Date objects for sessions
        if (key === STORAGE_KEYS.SESSIONS && Array.isArray(parsed)) {
            return parsed.map(session => ({
                ...session,
                date: new Date(session.date),
                startedAt: session.startedAt ? new Date(session.startedAt) : undefined,
                completedAt: session.completedAt ? new Date(session.completedAt) : undefined,
            })) as T;
        }
        return parsed;
    } catch (error) {
        console.error(`Error reading from localStorage key "${key}":`, error);
        return defaultValue;
    }
}

// Helper to safely save to localStorage
function saveToStorage<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving to localStorage key "${key}":`, error);
        throw new Error('Error al guardar en almacenamiento local');
    }
}

// ==================== ROUTINES ====================

export interface SetData {
    reps: number;
    weight?: number;
}

export interface RoutineExercise {
    id?: string;
    name: string;
    sets: SetData[];
    equipment?: string;
    notes?: string;
}

export interface CreateRoutineData {
    name: string;
    description?: string;
    image?: string;
    exercises: RoutineExercise[];
    restBetweenSets?: number;
    restBetweenExercises?: number;
}

/**
 * Get all routines from localStorage
 */
export async function getRoutines(): Promise<Routine[]> {
    const routines = getFromStorage<Routine[]>(STORAGE_KEYS.ROUTINES, []);
    return routines;
}

/**
 * Create a new routine in localStorage
 */
export async function createRoutine(data: CreateRoutineData): Promise<Routine> {
    const routines = await getRoutines();

    const newRoutine: Routine = {
        id: generateId(),
        name: data.name,
        description: data.description,
        image: data.image,
        exercises: data.exercises.map(ex => ({
            id: ex.id || generateId(),
            name: ex.name,
            sets: ex.sets,
            equipment: ex.equipment,
            notes: ex.notes,
        })),
        restBetweenSets: data.restBetweenSets || 60,
        restBetweenExercises: data.restBetweenExercises || 120,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    routines.push(newRoutine);
    saveToStorage(STORAGE_KEYS.ROUTINES, routines);

    return newRoutine;
}

/**
 * Update a routine in localStorage
 */
export async function updateRoutine(id: string, data: CreateRoutineData): Promise<Routine> {
    const routines = await getRoutines();
    const index = routines.findIndex(r => r.id === id);

    if (index === -1) {
        throw new Error('Rutina no encontrada');
    }

    const updatedRoutine: Routine = {
        ...routines[index],
        name: data.name,
        description: data.description,
        image: data.image,
        exercises: data.exercises.map(ex => ({
            id: ex.id || generateId(),
            name: ex.name,
            sets: ex.sets,
            equipment: ex.equipment,
            notes: ex.notes,
        })),
        restBetweenSets: data.restBetweenSets || 60,
        restBetweenExercises: data.restBetweenExercises || 120,
        updatedAt: new Date(),
    };

    routines[index] = updatedRoutine;
    saveToStorage(STORAGE_KEYS.ROUTINES, routines);

    return updatedRoutine;
}

/**
 * Delete a routine from localStorage
 */
export async function deleteRoutine(id: string): Promise<void> {
    const routines = await getRoutines();
    const filtered = routines.filter(r => r.id !== id);

    if (filtered.length === routines.length) {
        // No se encontró la rutina a eliminar. En lugar de lanzar, registramos una advertencia
        // y salimos silenciosamente para evitar romper la UI si hay desincronización de ids.
         
        console.warn(`deleteRoutine: rutina con id ${id} no encontrada en localStorage`);
        return;
    }

    saveToStorage(STORAGE_KEYS.ROUTINES, filtered);
}

/**
 * Delete all sessions associated with a routineId to avoid orphaned sessions
 */
export async function deleteSessionsByRoutine(routineId: string): Promise<void> {
    const sessions = await getSessions();
    const filtered = sessions.filter(s => s.routineId !== routineId);
    if (filtered.length === sessions.length) {
        // nothing to delete
        return;
    }
    saveToStorage(STORAGE_KEYS.SESSIONS, filtered);
}

// ==================== SESSIONS ====================

/**
 * Get all workout sessions from localStorage
 */
export async function getSessions(): Promise<WorkoutSession[]> {
    const sessions = getFromStorage<WorkoutSession[]>(STORAGE_KEYS.SESSIONS, []);
    // Sort by date descending
    return sessions.sort((a, b) => b.date.getTime() - a.date.getTime());
}

/**
 * Save a workout session to localStorage
 * IMPROVED: Now checks for duplicates and updates instead of creating duplicates
 */
export async function saveSession(session: WorkoutSession): Promise<void> {
    const sessions = await getSessions();

    const sessionId = session.id || generateId();

    // Verificar si ya existe una sesión con este ID
    const existingIndex = sessions.findIndex(s => s.id === sessionId);

    const newSession: WorkoutSession = {
        ...session,
        id: sessionId,
        date: session.date || new Date(),
    };

    if (existingIndex !== -1) {
        // Actualizar existente en lugar de duplicar
        sessions[existingIndex] = newSession;
    } else {
        sessions.push(newSession);
    }

    saveToStorage(STORAGE_KEYS.SESSIONS, sessions);

    // Marcador adicional para depuración: persistir un resumen ligero indicando
    // que el guardado local ocurrió y cuántas sesiones hay.
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            const marker = {
                savedAt: Date.now(),
                id: sessionId,
                totalSessions: sessions.length
            };
            localStorage.setItem('gym_tracker_last_saved_session_local', JSON.stringify(marker));
            // También log para consola del navegador
             
            // console.log('[localStorage.saveSession] saved session local marker', marker);
        }
    } catch (e) {
        // ignore marker failures
    }
}

/**
 * Reconstruir rutinas a partir de sesiones huérfanas.
 * Crea una rutina por cada `routineId` único encontrado en las sesiones
 * que no exista ya en las rutinas, usando `routineName` o un nombre generado.
 */
export async function rebuildRoutinesFromSessions(): Promise<Routine[]> {
    const sessions = await getSessions();
    const existingRoutines = await getRoutines();

    const existingIds = new Set(existingRoutines.map(r => r.id));

    // Agrupar sesiones por routineId (usar string 'no-id' para sesiones sin id)
    const groups: Record<string, WorkoutSession[]> = {};
    sessions.forEach(s => {
        const key = s.routineId || `no-id-${(s.date || new Date()).getTime()}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(s);
    });

    const created: Routine[] = [];

    for (const [key, group] of Object.entries(groups)) {
        // Si el key ya existe como rutina, saltar
        if (existingIds.has(key)) continue;

        // Determinar nombre
        const first = group[0];
        const name = first.routineName || `Rutina recuperada ${new Date(first.date).toLocaleDateString()}`;

        // Construir ejercicios agregando sets a partir de los datos de la sesión
        const exercises = (first.exercises || []).map(ex => ({
            id: ex.exerciseId || generateId(),
            name: ex.exerciseName || ex.exerciseId || 'Ejercicio recuperado',
            sets: (Array.isArray(ex.actualReps) ? ex.actualReps.map((r, idx) => ({ reps: typeof r === 'number' ? r : 0, weight: Array.isArray(ex.actualWeight) ? (ex.actualWeight[idx] || 0) : 0 })) : (typeof ex.completedSets === 'number' ? Array.from({ length: ex.completedSets }).map(() => ({ reps: 0 })) : [])),
        }));

        const newRoutine: Routine = {
            id: key.startsWith('no-id-') ? generateId() : key,
            name,
            description: 'Rutina reconstruida a partir de sesiones huérfanas',
            exercises,
            restBetweenSets: 60,
            restBetweenExercises: 120,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        existingRoutines.push(newRoutine);
        created.push(newRoutine);
    }

    if (created.length > 0) {
        saveToStorage(STORAGE_KEYS.ROUTINES, existingRoutines);
    }

    return created;
}

// ==================== PROFILE ====================

// Import and re-export unified UserProfile type
import type { UserProfile } from '@/types/userProfile';
export type { UserProfile };

/**
 * Get user profile from localStorage
 */
export async function getProfile(): Promise<UserProfile> {
    const profile = getFromStorage<UserProfile | null>(STORAGE_KEYS.PROFILE, null);

    if (!profile) {
        // Return default profile
        return {
            name: 'Usuario',
            email: 'local@user.com',
        };
    }

    return profile;
}

/**
 * Update user profile in localStorage
 */
export async function updateProfile(data: Partial<UserProfile>): Promise<void> {
    const currentProfile = await getProfile();
    const updatedProfile = {
        ...currentProfile,
        ...data,
    };

    saveToStorage(STORAGE_KEYS.PROFILE, updatedProfile);
}

// ==================== RECOMMENDATIONS ====================

export interface ProgressRecommendation {
    exerciseId: string;
    recommend: boolean;
    suggestedWeight?: number;
    reason?: string;
    createdAt: string;
    lastWeights?: number[];
}

// Lightweight types for local-only structures
export type ActiveWorkout = Record<string, unknown>;
export type WeeklyPlan = Record<string, { routines: string[] }>;
export type MonthlyPlan = Record<string, unknown>;

export async function getRecommendations(): Promise<ProgressRecommendation[]> {
    const recs = getFromStorage<ProgressRecommendation[]>(STORAGE_KEYS.RECOMMENDATIONS, []);
    return Array.isArray(recs) ? recs : [];
}

export async function saveRecommendations(recommendations: ProgressRecommendation[]): Promise<void> {
    const current = await getRecommendations();
    const map = new Map<string, ProgressRecommendation>();
    current.forEach(r => map.set(r.exerciseId, r));
    recommendations.forEach(r => map.set(r.exerciseId, r));
    const merged = Array.from(map.values());
    saveToStorage(STORAGE_KEYS.RECOMMENDATIONS, merged);
}

// ==================== ACTIVE WORKOUT (Local fallback) ====================

/**
 * Get active workout from localStorage
 */
export async function getActiveWorkout(): Promise<ActiveWorkout | null> {
    console.log('[localStorage] getActiveWorkout llamado');
    if (typeof window === 'undefined') {
        console.log('[localStorage] window undefined, retornando null');
        return null;
    }
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT);
        console.log('[localStorage] Raw value from storage:', raw);
        if (!raw) {
            console.log('[localStorage] No hay active workout en storage');
            return null;
        }
        const parsed = JSON.parse(raw);
        console.log('[localStorage] Active workout parseado:', parsed);
        return parsed;
    } catch (e) {
        console.error('[localStorage] Error en getActiveWorkout:', e);
        try { localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT); } catch {};
        return null;
    }
}

/**
 * Save active workout to localStorage
 */
export async function saveActiveWorkout(payload: ActiveWorkout): Promise<void> {
    console.log('[localStorage] saveActiveWorkout llamado con:', payload);
    if (typeof window === 'undefined') {
        console.log('[localStorage] window undefined, no guardando');
        return;
    }
    try {
        const stringified = JSON.stringify(payload);
        console.log('[localStorage] Guardando en key:', STORAGE_KEYS.ACTIVE_WORKOUT);
        localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, stringified);
        console.log('[localStorage] Active workout guardado exitosamente');
        
        // Verificar que se guardó correctamente
        const verification = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT);
        console.log('[localStorage] Verificación - valor guardado:', verification ? 'presente' : 'null');
    } catch (e) {
        console.error('[localStorage] Error en saveActiveWorkout:', e);
        throw e;
    }
}

// ==================== LAST WEIGHTS ====================

/**
 * Get last weights stored locally
 */
export async function getLastWeights(): Promise<Record<string, number[]>> {
    if (typeof window === 'undefined') return {};
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.LAST_WEIGHTS);
        if (!raw) return {};
        return JSON.parse(raw);
    } catch (e) {
        console.warn('getLastWeights local error', e);
        try { localStorage.removeItem(STORAGE_KEYS.LAST_WEIGHTS); } catch {};
        return {};
    }
}

export async function saveLastWeights(weights: Record<string, number[]>): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEYS.LAST_WEIGHTS, JSON.stringify(weights));
    } catch (e) {
        console.warn('saveLastWeights local error', e);
        throw e;
    }
}

/**
 * Clear active workout from localStorage
 */
export async function clearActiveWorkout(): Promise<void> {
    console.log('[localStorage] clearActiveWorkout llamado');
    if (typeof window === 'undefined') {
        console.log('[localStorage] window undefined, no limpiando');
        return;
    }
    try { 
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
        console.log('[localStorage] Active workout eliminado del storage');
    } catch (e) { 
        console.error('[localStorage] Error limpiando active workout:', e);
    }
}

export async function saveRecommendation(recommendation: ProgressRecommendation): Promise<void> {
    const current = await getRecommendations();
    const idx = current.findIndex(r => r.exerciseId === recommendation.exerciseId);
    if (idx >= 0) current[idx] = recommendation;
    else current.push(recommendation);
    saveToStorage(STORAGE_KEYS.RECOMMENDATIONS, current);
}

// ==================== WEEKLY PLAN ====================

/**
 * Get weekly plan from localStorage
 */
export async function getWeeklyPlan(): Promise<WeeklyPlan> {
    const raw = getFromStorage<WeeklyPlan | null>(STORAGE_KEYS.WEEKLY_PLAN, null);
    if (!raw) {
        // Default empty plan structure
        const defaultPlan = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
            .reduce((acc: any, d: string) => ({ ...acc, [d]: { routines: [] } }), {});
        return defaultPlan;
    }
    return raw;
}

/**
 * Save weekly plan to localStorage
 */
export async function saveWeeklyPlan(plan: WeeklyPlan): Promise<void> {
    try {
        saveToStorage(STORAGE_KEYS.WEEKLY_PLAN, plan);
    } catch (e) {
        throw new Error('Error saving weekly plan locally');
    }
}

/**
 * Get monthly plan from localStorage
 */
export async function getMonthlyPlan(): Promise<MonthlyPlan> {
    const raw = getFromStorage<MonthlyPlan | null>(STORAGE_KEYS.MONTHLY_PLAN, null);
    if (!raw) {
        return {};
    }
    return raw;
}

/**
 * Save monthly plan to localStorage
 */
export async function saveMonthlyPlan(plan: MonthlyPlan): Promise<void> {
    try {
        saveToStorage(STORAGE_KEYS.MONTHLY_PLAN, plan);
    } catch (e) {
        throw new Error('Error saving monthly plan locally');
    }
}

// ==================== MIGRATION ====================

/**
 * Migrar sesiones de la clave antigua 'workoutSessions' a la nueva 'gym_tracker_sessions'
 * Esta función consolida sesiones que puedan estar en claves antiguas
 */
export async function migrateLegacySessions(): Promise<{ migrated: number; total: number }> {
    if (typeof window === 'undefined') {
        return { migrated: 0, total: 0 };
    }

    try {
        // Claves antiguas que pueden contener sesiones
        const legacyKeys = ['workoutSessions', 'sessions'];
        
        // Obtener sesiones actuales
        const currentSessions = await getSessions();
        const currentSessionIds = new Set(currentSessions.map(s => s.id));
        
        let migratedCount = 0;
        const allSessions = [...currentSessions];

        // Revisar cada clave antigua
        for (const legacyKey of legacyKeys) {
            try {
                const legacyData = localStorage.getItem(legacyKey);
                if (!legacyData) continue;

                const legacySessions = JSON.parse(legacyData);
                if (!Array.isArray(legacySessions)) continue;

                // Procesar cada sesión antigua
                for (const session of legacySessions) {
                    // Convertir fechas
                    const processedSession: WorkoutSession = {
                        ...session,
                        id: session.id || generateId(),
                        date: new Date(session.date),
                        startedAt: session.startedAt ? new Date(session.startedAt) : undefined,
                        completedAt: session.completedAt ? new Date(session.completedAt) : undefined,
                    };

                    // Solo agregar si no existe ya
                    if (!currentSessionIds.has(processedSession.id)) {
                        allSessions.push(processedSession);
                        currentSessionIds.add(processedSession.id);
                        migratedCount++;
                    }
                }

                // Eliminar la clave antigua después de migrar
                localStorage.removeItem(legacyKey);
                // console.log(`[Migration] Removed legacy key: ${legacyKey}`);
            } catch (e) {
                console.warn(`[Migration] Error processing legacy key ${legacyKey}:`, e);
            }
        }

        // Guardar todas las sesiones consolidadas si hubo migración
        if (migratedCount > 0) {
            saveToStorage(STORAGE_KEYS.SESSIONS, allSessions);
            // console.log(`[Migration] Migrated ${migratedCount} sessions. Total: ${allSessions.length}`);
        }

        return { migrated: migratedCount, total: allSessions.length };
    } catch (error) {
        console.error('[Migration] Error migrating legacy sessions:', error);
        return { migrated: 0, total: 0 };
    }
}
