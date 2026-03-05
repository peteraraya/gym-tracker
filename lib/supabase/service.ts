/**
 * Supabase Service - Client-side database operations
 * 
 * Este servicio reemplaza las API routes para compatibilidad con build estático (móvil).
 * Usa Supabase directamente desde el cliente para:
 * - Routines
 * - Sessions
 * - Profile
 * 
 * Compatible con:
 * - Web (SSR)
 * - PWA
 * - Android/iOS (Capacitor)
 */

import { createClient } from '@/lib/supabase/client';
import type { Routine, WorkoutSession } from '@/types';

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
  // Campos opcionales presentes en la UI
  restBetweenSets?: number;
  useSmartRest?: boolean;
  technique?: string[];
  recommendedSets?: string;
  recommendedReps?: string;
  restTime?: string;
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
 * Get all routines for current user
 */
export async function getRoutines(): Promise<Routine[]> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data: routines, error } = await supabase
    .from('routines')
    .select(`
      *,
      exercises (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Error al obtener rutinas: ${error.message}`);

  // Transform to frontend format
  return routines?.map(routine => ({
    id: routine.id,
    name: routine.name,
    description: routine.description,
    image: routine.image_url,
    restBetweenSets: routine.rest_between_sets,
    restBetweenExercises: routine.rest_between_exercises,
    createdAt: new Date(routine.created_at),
    updatedAt: new Date(routine.updated_at),
    exercises: routine.exercises
      .sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index)
      .map((ex: any) => {
        let sets: SetData[];
        if (ex.sets_data) {
          sets = ex.sets_data;
        } else {
          sets = Array(ex.sets || 1).fill(null).map(() => ({
            reps: ex.reps || 10,
            weight: ex.weight || 0
          }));
        }
        return {
          id: ex.id,
          name: ex.name,
          sets,
          equipment: ex.equipment,
          notes: ex.notes,
          restBetweenSets: ex.rest_between_sets, // ✅ Cargar tiempo de descanso del ejercicio
          useSmartRest: ex.use_smart_rest // ✅ Cargar flag de descanso inteligente
        };
      })
  })) || [];
}

/**
 * Create a new routine
 */
export async function createRoutine(data: CreateRoutineData): Promise<Routine> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  // Insert routine
  const { data: routine, error: routineError } = await supabase
    .from('routines')
    .insert({
      user_id: user.id,
      name: data.name,
      description: data.description,
      image_url: data.image,
      rest_between_sets: data.restBetweenSets || 60,
      rest_between_exercises: data.restBetweenExercises || 120
    })
    .select()
    .single();

  if (routineError) throw new Error(`Error al crear rutina: ${routineError.message}`);

  // Insert exercises
  const exercisesWithOrder = data.exercises.map((ex, index) => ({
    routine_id: routine.id,
    name: ex.name,
    sets_data: ex.sets,
    equipment: ex.equipment,
    notes: ex.notes,
    order_index: index,
    rest_between_sets: ex.restBetweenSets, // ✅ Preservar tiempo de descanso del ejercicio
    use_smart_rest: ex.useSmartRest // ✅ Preservar flag de descanso inteligente
  }));

  const { error: exercisesError } = await supabase
    .from('exercises')
    .insert(exercisesWithOrder);

  if (exercisesError) {
    // Rollback: delete routine if exercises failed
    await supabase.from('routines').delete().eq('id', routine.id);
    throw new Error(`Error al crear ejercicios: ${exercisesError.message}`);
  }

  // Return created routine
  const routines = await getRoutines();
  const created = routines.find(r => r.id === routine.id);
  if (!created) throw new Error('Rutina creada pero no encontrada');

  return created;
}

/**
 * Update a routine
 * IMPROVED: Includes rollback if exercise insertion fails
 */
export async function updateRoutine(id: string, data: CreateRoutineData): Promise<Routine> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  // Backup old exercises for potential rollback
  const { data: oldExercises } = await supabase
    .from('exercises')
    .select('*')
    .eq('routine_id', id);

  // Update routine
  const { error: routineError } = await supabase
    .from('routines')
    .update({
      name: data.name,
      description: data.description,
      image_url: data.image,
      rest_between_sets: data.restBetweenSets || 60,
      rest_between_exercises: data.restBetweenExercises || 120
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (routineError) throw new Error(`Error al actualizar rutina: ${routineError.message}`);

  // Delete old exercises
  await supabase.from('exercises').delete().eq('routine_id', id);

  // Insert new exercises
  const exercisesWithOrder = data.exercises.map((ex, index) => ({
    routine_id: id,
    name: ex.name,
    sets_data: ex.sets,
    equipment: ex.equipment,
    notes: ex.notes,
    order_index: index,
    rest_between_sets: ex.restBetweenSets, // ✅ Preservar tiempo de descanso del ejercicio
    use_smart_rest: ex.useSmartRest // ✅ Preservar flag de descanso inteligente
  }));

  const { error: exercisesError } = await supabase
    .from('exercises')
    .insert(exercisesWithOrder);

  if (exercisesError) {
    // ROLLBACK: Restore old exercises if insert failed
    if (oldExercises && oldExercises.length > 0) {
      const { logger } = await import('@/lib/logger');
      logger.warn('Rolling back exercises after insert failure', { module: 'supabase-service', operation: 'updateRoutine' });
      await supabase.from('exercises').insert(oldExercises);
    }
    throw new Error(`Error al actualizar ejercicios: ${exercisesError.message}`);
  }

  // Return updated routine
  const routines = await getRoutines();
  const updated = routines.find(r => r.id === id);
  if (!updated) throw new Error('Rutina actualizada pero no encontrada');

  return updated;
}

/**
 * Delete a routine
 */
export async function deleteRoutine(id: string): Promise<void> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { error } = await supabase
    .from('routines')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw new Error(`Error al eliminar rutina: ${error.message}`);
}

/**
 * Delete all sessions (and their exercises) associated with a routine id
 */
export async function deleteSessionsByRoutine(routineId: string): Promise<void> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  // Obtener sesiones asociadas a la rutina
  const { data: sessions, error: fetchError } = await supabase
    .from('workout_sessions')
    .select('id')
    .eq('user_id', user.id)
    .eq('routine_id', routineId);

  if (fetchError) throw new Error(`Error al buscar sesiones para eliminar: ${fetchError.message}`);

  const sessionIds = (sessions || []).map(s => s.id).filter(Boolean);

  if (sessionIds.length === 0) return;

  // Eliminar ejercicios asociados
  const { error: exErr } = await supabase
    .from('session_exercises')
    .delete()
    .in('session_id', sessionIds);

  if (exErr) throw new Error(`Error al eliminar ejercicios de sesiones: ${exErr.message}`);

  // Eliminar sesiones
  const { error: sessErr } = await supabase
    .from('workout_sessions')
    .delete()
    .in('id', sessionIds)
    .eq('user_id', user.id);

  if (sessErr) throw new Error(`Error al eliminar sesiones: ${sessErr.message}`);
}

// ==================== SESSIONS ====================

/**
 * Get all workout sessions for current user
 */
export async function getSessions(): Promise<WorkoutSession[]> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data: sessions, error } = await supabase
    .from('workout_sessions')
    .select(`
      *,
      session_exercises (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Error al obtener sesiones: ${error.message}`);

  // Transform to frontend format
  return sessions?.map(session => ({
    id: session.id,
    routineId: session.routine_id,
    routineName: session.routine_name,
    date: new Date(session.created_at), // Usar created_at como fecha principal
    startedAt: new Date(session.created_at),
    completedAt: session.completed_at ? new Date(session.completed_at) : undefined,
    totalDuration: session.total_duration,
    totalPausedTime: session.total_paused_time,
    exercises: (session.session_exercises || []).map((ex: any) => ({
      exerciseId: ex.exercise_name || ex.id,
      exerciseName: ex.exercise_name,
      completedSets: ex.sets_completed ? (Array.isArray(ex.sets_completed) ? ex.sets_completed.length : 0) : 0,
      actualReps: ex.sets_completed ? ex.sets_completed.map((s: any) => s.reps) : [],
      actualWeight: ex.sets_completed ? ex.sets_completed.map((s: any) => s.weight || 0) : [],
      setDurations: ex.set_durations || [],
      pauseDurations: ex.pause_durations || [],
      notes: ex.notes
    }))
  })) || [];
}

/**
 * Save a workout session
 */
export async function saveSession(session: WorkoutSession): Promise<void> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  // Insert session
  const { data: dbSession, error: sessionError } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: user.id,
      routine_id: session.routineId,
      routine_name: session.routineName,
      completed_at: session.completedAt || session.date,
      total_duration: session.totalDuration,
      total_paused_time: session.totalPausedTime
    })
    .select()
    .single();

  if (sessionError) throw new Error(`Error al guardar sesión: ${sessionError.message}`);

  // Insert exercises - transformar el formato
  if (!session.exercises || !Array.isArray(session.exercises) || session.exercises.length === 0) {
    throw new Error('La sesión debe contener al menos un ejercicio');
  }

    const exercisesData = session.exercises.map(ex => {
      const reps = Array.isArray(ex.actualReps) ? ex.actualReps : [];
      const weights = Array.isArray(ex.actualWeight) ? ex.actualWeight : [];

      // Convertir arrays paralelos a un array de objetos por serie
      const sets_completed = reps.map((r, idx) => ({
        reps: typeof r === 'number' ? r : 0,
        weight: typeof weights[idx] === 'number' ? weights[idx] : 0
      }));

      return {
        session_id: dbSession.id,
        exercise_name: (ex.exerciseName as any) || (ex.exerciseId as any) || null,
        sets_completed,
        set_durations: ex.setDurations || [],
        pause_durations: ex.pauseDurations || [],
        notes: ex.notes
      };
    });

  const { error: exercisesError } = await supabase
    .from('session_exercises')
    .insert(exercisesData);

  if (exercisesError) {
    // Rollback
    await supabase.from('workout_sessions').delete().eq('id', dbSession.id);
    throw new Error(`Error al guardar ejercicios: ${exercisesError.message}`);
  }
}

/**
 * Update an existing workout session
 */
export async function updateSession(session: WorkoutSession): Promise<void> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  if (!session.id) throw new Error('Session ID is required for update');

  // Update session
  const { error: sessionError } = await supabase
    .from('workout_sessions')
    .update({
      total_duration: session.totalDuration,
      total_paused_time: session.totalPausedTime,
      notes: session.notes
    })
    .eq('id', session.id)
    .eq('user_id', user.id);

  if (sessionError) throw new Error(`Error al actualizar sesión: ${sessionError.message}`);

  // Delete existing exercises
  const { error: deleteError } = await supabase
    .from('session_exercises')
    .delete()
    .eq('session_id', session.id);

  if (deleteError) throw new Error(`Error al eliminar ejercicios antiguos: ${deleteError.message}`);

  // Insert updated exercises
  if (!session.exercises || !Array.isArray(session.exercises) || session.exercises.length === 0) {
    throw new Error('La sesión debe contener al menos un ejercicio');
  }

  const exercisesData = session.exercises.map(ex => {
    const reps = Array.isArray(ex.actualReps) ? ex.actualReps : [];
    const weights = Array.isArray(ex.actualWeight) ? ex.actualWeight : [];

    const sets_completed = reps.map((r, idx) => ({
      reps: typeof r === 'number' ? r : 0,
      weight: typeof weights[idx] === 'number' ? weights[idx] : 0
    }));

    return {
      session_id: session.id,
      exercise_name: (ex.exerciseName as any) || (ex.exerciseId as any) || null,
      sets_completed,
      set_durations: ex.setDurations || [],
      pause_durations: ex.pauseDurations || [],
      notes: ex.notes
    };
  });

  const { error: exercisesError } = await supabase
    .from('session_exercises')
    .insert(exercisesData);

  if (exercisesError) {
    throw new Error(`Error al guardar ejercicios actualizados: ${exercisesError.message}`);
  }
}

// ==================== PROFILE ====================

// Import unified UserProfile type
import type { UserProfile } from '@/types/userProfile';
export type { UserProfile };

/**
 * Get user profile
 */
export async function getProfile(): Promise<UserProfile> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
    throw new Error(`Error al obtener perfil: ${error.message}`);
  }

  return {
    name: profile?.name || user.email?.split('@')[0] || 'Usuario',
    email: user.email || '',
    avatarUrl: profile?.avatar_url,
    currentWeight: profile?.current_weight,
    targetWeight: profile?.target_weight,
    height: profile?.height
  };
}

/**
 * Update user profile
 */
export async function updateProfile(data: Partial<UserProfile>): Promise<void> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      name: data.name,
      avatar_url: data.avatarUrl,
      current_weight: data.currentWeight,
      target_weight: data.targetWeight,
      height: data.height,
      updated_at: new Date().toISOString()
    });

  if (error) throw new Error(`Error al actualizar perfil: ${error.message}`);
}

// ==================== ACTIVE WORKOUT ====================

/**
 * Obtener el entrenamiento activo del usuario (data JSONB)
 */
export async function getActiveWorkout(): Promise<any | null> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  try {
    const { data, error } = await supabase
      .from('active_workouts')
      .select('data')
      .eq('user_id', user.id)
      .single();

    // Si la tabla no existe o no hay datos, retornar null (el sistema usará localStorage)
    if (error) {
      if (error.code === 'PGRST116' || 
          error.code === '42P01' || 
          error.message.includes('Could not find') ||
          error.message.includes('does not exist')) {
        return null;
      }
      return null;
    }

    return data?.data || null;
  } catch (error: any) {
    const { logger } = await import('@/lib/logger');
    logger.warn('Failed to get active workout', { module: 'supabase-service', errorMessage: error.message });
    return null;
  }
}

/**
 * Guardar o actualizar el entrenamiento activo para el usuario
 */
export async function saveActiveWorkout(payload: any): Promise<void> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  try {
    const { error } = await supabase
      .from('active_workouts')
      .upsert({ user_id: user.id, data: payload, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

    // Si la tabla no existe, no es un error crítico - el sistema usará localStorage
    if (error) {
      if (error.code === '42P01' || 
          error.message.includes('Could not find') ||
          error.message.includes('does not exist')) {
        return;
      }
      const { logger } = await import('@/lib/logger');
      logger.warn('Error saving active workout', { module: 'supabase-service', errorMessage: error.message });
    }
  } catch (error: any) {
    const { logger } = await import('@/lib/logger');
    logger.warn('Failed to save active workout', { module: 'supabase-service', errorMessage: error.message });
  }
}

/**
 * Eliminar el entrenamiento activo (cuando se finaliza o cancela)
 */
export async function clearActiveWorkout(): Promise<void> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  try {
    const { error } = await supabase
      .from('active_workouts')
      .delete()
      .eq('user_id', user.id);

    // Si la tabla no existe, no es un error crítico - el sistema usará localStorage
    if (error) {
      if (error.code === '42P01' || 
          error.message.includes('Could not find') ||
          error.message.includes('does not exist')) {
        return;
      }
      const { logger } = await import('@/lib/logger');
      logger.warn('Error clearing active workout', { module: 'supabase-service', errorMessage: error.message });
    }
  } catch (error: any) {
    const { logger } = await import('@/lib/logger');
    logger.warn('Failed to clear active workout', { module: 'supabase-service', errorMessage: error.message });
  }
}

/**
 * Obtener el plan semanal asociado al perfil del usuario
 */
export async function getWeeklyPlan(): Promise<any> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('weekly_plan')
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Error al obtener plan semanal: ${error.message}`);
  }

  return profile?.weekly_plan || null;
}

/**
 * Guardar el plan semanal en el perfil del usuario
 */
export async function saveWeeklyPlan(plan: any): Promise<void> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, weekly_plan: plan, updated_at: new Date().toISOString() });

  if (error) throw new Error(`Error al guardar plan semanal: ${error.message}`);
}

// ==================== LAST WEIGHTS ====================

/**
 * Obtener los últimos pesos guardados en el perfil del usuario
 */
export async function getLastWeights(): Promise<Record<string, number[]>> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};

  const { data, error } = await supabase
    .from('profiles')
    .select('last_weights')
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Error al obtener last_weights: ${error.message}`);
  }

  return data?.last_weights || {};
}

/**
 * Guardar los últimos pesos en el perfil del usuario
 */
export async function saveLastWeights(weights: Record<string, number[]>): Promise<void> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, last_weights: weights, updated_at: new Date().toISOString() });

  if (error) throw new Error(`Error al guardar last_weights: ${error.message}`);
}
