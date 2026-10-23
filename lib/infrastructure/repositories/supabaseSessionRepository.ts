/**
 * Adaptador de Supabase para ISessionRepository
 */

import { createClient } from '@/lib/infrastructure/supabase/client';
import type { WorkoutSession } from '@/types';
import type {
  ISessionRepository,
  CreateSessionInput,
  UpdateSessionInput,
  SessionFilters,
  SessionListResult,
} from '@/lib/domain/repositories';

interface DbSessionExercise {
  id: string;
  session_id: string;
  exercise_id: string;
  exercises: { name: string | null } | null;
  completed_sets: number;
  actual_reps: number[];
  actual_weight: number[];
  set_durations: number[] | null;
  pause_durations: number[] | null;
}

interface DbSession {
  id: string;
  routine_id: string;
  routines: { name: string | null } | null;
  date: string;
  notes: string | null;
  total_duration: number | null;
  total_paused_time: number | null;
  session_exercises: DbSessionExercise[] | null;
}

function mapDbSessionToDomain(db: DbSession): WorkoutSession {
  return {
    id: db.id,
    routineId: db.routine_id,
    routineName: db.routines?.name ?? undefined,
    date: new Date(db.date),
    notes: db.notes ?? undefined,
    totalDuration: db.total_duration ?? undefined,
    totalPausedTime: db.total_paused_time ?? undefined,
    exercises: (db.session_exercises ?? []).map((se: DbSessionExercise) => ({
      exerciseId: se.exercise_id,
      exerciseName: se.exercises?.name ?? undefined,
      completedSets: se.completed_sets,
      actualReps: se.actual_reps,
      actualWeight: se.actual_weight,
      setDurations: se.set_durations ?? undefined,
      pauseDurations: se.pause_durations ?? undefined,
    })),
  };
}

/**
 * Implementación de ISessionRepository usando Supabase
 */
export class SupabaseSessionRepository implements ISessionRepository {
  async getByUserId(
    userId: string,
    filters?: SessionFilters,
  ): Promise<SessionListResult> {
    const supabase = createClient();

    let query = supabase
      .from('workout_sessions')
      .select(`
        *,
        routines (name),
        session_exercises (*)
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (filters?.routineId) {
      query = query.eq('routine_id', filters.routineId);
    }

    if (filters?.fromDate) {
      query = query.gte('date', filters.fromDate.toISOString());
    }

    if (filters?.toDate) {
      query = query.lte('date', filters.toDate.toISOString());
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit ?? 10) - 1,
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error al obtener sesiones: ${error.message}`);
    }

    const sessions = (data ?? []).map(mapDbSessionToDomain);

    return {
      sessions,
      total: sessions.length,
    };
  }

  async getById(id: string): Promise<WorkoutSession | null> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        routines (name),
        session_exercises (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error al obtener sesión: ${error.message}`);
    }

    return mapDbSessionToDomain(data as DbSession);
  }

  async create(input: CreateSessionInput): Promise<WorkoutSession> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('No autenticado');
    }

    const { data: session, error: sessionError } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: user.id,
        routine_id: input.routineId,
        notes: input.notes ?? null,
        total_duration: input.totalDuration ?? null,
        total_paused_time: input.totalPausedTime ?? null,
      })
      .select()
      .single();

    if (sessionError || !session) {
      throw new Error(
        `Error al crear sesión: ${sessionError?.message ?? 'Sin respuesta'}`,
      );
    }

    const sessionExercisesData = input.exercises.map((ex) => ({
      session_id: session.id,
      exercise_id: ex.exerciseId,
      completed_sets: ex.completedSets,
      actual_reps: ex.actualReps,
      actual_weight: ex.actualWeight,
      set_durations: ex.setDurations ?? null,
      pause_durations: ex.pauseDurations ?? null,
    }));

    const { error: exercisesError } = await supabase
      .from('session_exercises')
      .insert(sessionExercisesData);

    if (exercisesError) {
      await supabase.from('workout_sessions').delete().eq('id', session.id);
      throw new Error(`Error al guardar ejercicios: ${exercisesError.message}`);
    }

    return this.getById(session.id).then((s) => {
      if (!s) throw new Error('Sesión no encontrada después de crear');
      return s;
    });
  }

  async update(id: string, input: UpdateSessionInput): Promise<WorkoutSession> {
    const supabase = createClient();

    const dbInput: Record<string, unknown> = {};

    if (input.notes !== undefined) dbInput.notes = input.notes;
    if (input.totalDuration !== undefined)
      dbInput.total_duration = input.totalDuration;
    if (input.totalPausedTime !== undefined)
      dbInput.total_paused_time = input.totalPausedTime;

    const { error } = await supabase
      .from('workout_sessions')
      .update(dbInput)
      .eq('id', id);

    if (error) {
      throw new Error(`Error al actualizar sesión: ${error.message}`);
    }

    if (input.exercises !== undefined) {
      const { error: delError } = await supabase
        .from('session_exercises')
        .delete()
        .eq('session_id', id);

      if (delError) {
        throw new Error(`Error al actualizar ejercicios: ${delError.message}`);
      }

      const { error: insError } = await supabase
        .from('session_exercises')
        .insert(
          input.exercises.map((ex) => ({
            session_id: id,
            exercise_id: ex.exerciseId,
            completed_sets: ex.completedSets,
            actual_reps: ex.actualReps,
            actual_weight: ex.actualWeight,
            set_durations: ex.setDurations ?? null,
            pause_durations: ex.pauseDurations ?? null,
          })),
        );

      if (insError) {
        throw new Error(`Error al insertar ejercicios: ${insError.message}`);
      }
    }

    return this.getById(id).then((s) => {
      if (!s) throw new Error('Sesión no encontrada después de actualizar');
      return s;
    });
  }

  async delete(id: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase.from('workout_sessions').delete().eq('id', id);

    if (error) {
      throw new Error(`Error al eliminar sesión: ${error.message}`);
    }
  }
}
