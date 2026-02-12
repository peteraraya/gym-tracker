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
