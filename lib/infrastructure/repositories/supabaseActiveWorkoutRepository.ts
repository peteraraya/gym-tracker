/**
 * Adaptador de Supabase para IActiveWorkoutRepository
 */

import { createClient } from '@/lib/infrastructure/supabase/client';
import type {
  IActiveWorkoutRepository,
  ActiveWorkoutData,
} from '@/lib/domain/repositories';

interface DbActiveWorkout {
  id: string;
  user_id: string;
  routine_id: string;
  routine_name: string;
  current_exercise_index: number;
  current_set: number;
  completed_sets: Record<string, number>;
  actual_reps: Record<string, number[]>;
  actual_weights: Record<string, number[]>;
  started_at: string;
  is_resting?: boolean;
  rest_timer_remaining?: number;
  rest_timer_started_at?: number;
  rest_timer_title?: string;
  rest_timer_next_exercise?: string;
  total_paused_time?: number;
  skipped_exercises?: string[];
  modified_routine_id?: string;
  updated_at: string;
}

function mapDbToDomain(db: DbActiveWorkout): ActiveWorkoutData {
  return {
    id: db.id,
    userId: db.user_id,
    routineId: db.routine_id,
    routineName: db.routine_name,
    currentExerciseIndex: db.current_exercise_index,
    currentSet: db.current_set,
    completedSets: db.completed_sets,
    actualReps: db.actual_reps,
    actualWeights: db.actual_weights,
    startedAt: new Date(db.started_at),
    isResting: db.is_resting,
    restTimerRemaining: db.rest_timer_remaining,
    restTimerStartedAt: db.rest_timer_started_at,
    restTimerTitle: db.rest_timer_title,
    restTimerNextExercise: db.rest_timer_next_exercise,
    totalPausedTime: db.total_paused_time,
    skippedExercises: db.skipped_exercises,
    modifiedRoutineId: db.modified_routine_id,
    updatedAt: new Date(db.updated_at),
  };
}

/**
 * Implementación de IActiveWorkoutRepository usando Supabase
 */
export class SupabaseActiveWorkoutRepository implements IActiveWorkoutRepository {
  async getByUserId(userId: string): Promise<ActiveWorkoutData | null> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('active_workouts')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error al obtener entrenamiento activo: ${error.message}`);
    }

    return mapDbToDomain(data as DbActiveWorkout);
  }

  async save(data: ActiveWorkoutData): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from('active_workouts')
      .upsert({
        id: data.id,
        user_id: data.userId,
        routine_id: data.routineId,
        routine_name: data.routineName,
        current_exercise_index: data.currentExerciseIndex,
        current_set: data.currentSet,
        completed_sets: data.completedSets,
        actual_reps: data.actualReps,
        actual_weights: data.actualWeights,
        started_at: data.startedAt.toISOString(),
        is_resting: data.isResting ?? false,
        rest_timer_remaining: data.restTimerRemaining ?? null,
        rest_timer_started_at: data.restTimerStartedAt ?? null,
        rest_timer_title: data.restTimerTitle ?? null,
        rest_timer_next_exercise: data.restTimerNextExercise ?? null,
        total_paused_time: data.totalPausedTime ?? null,
        skipped_exercises: data.skippedExercises ?? null,
        modified_routine_id: data.modifiedRoutineId ?? null,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw new Error(`Error al guardar entrenamiento activo: ${error.message}`);
    }
  }

  async delete(userId: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from('active_workouts')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Error al eliminar entrenamiento activo: ${error.message}`);
    }
  }
}