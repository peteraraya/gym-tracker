/**
 * Adaptador de Supabase para IRoutineRepository
 *
 * Implementa el contrato de dominio usando Supabase como backend.
 */

import { createClient } from '@/lib/infrastructure/supabase/client';
import type { Routine } from '@/types';
import type {
  IRoutineRepository,
  CreateRoutineInput,
  UpdateRoutineInput,
  RoutineFilters,
  RoutineListResult,
} from '@/lib/domain/repositories';

interface DbRoutineExercise {
  id: string;
  name: string;
  sets_data: unknown;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  equipment: string | null;
  notes: string | null;
  order_index: number;
  rest_between_sets?: number;
  use_smart_rest?: boolean;
}

interface DbRoutine {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  rest_between_sets: number;
  rest_between_exercises: number;
  created_at: string;
  updated_at: string;
  exercises: DbRoutineExercise[] | null;
}

function mapDbRoutineToDomain(db: DbRoutine): Routine {
  return {
    id: db.id,
    name: db.name,
    description: db.description ?? undefined,
    image: db.image_url ?? undefined,
    restBetweenSets: db.rest_between_sets,
    restBetweenExercises: db.rest_between_exercises,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
    exercises: (db.exercises || [])
      .sort((a: DbRoutineExercise, b: DbRoutineExercise) => a.order_index - b.order_index)
      .map((ex: DbRoutineExercise) => {
        let sets: { reps: number; weight?: number }[];
        if (ex.sets_data) {
          sets = ex.sets_data as { reps: number; weight?: number }[];
        } else {
          sets = Array(ex.sets || 1).fill(null).map(() => ({
            reps: ex.reps || 10,
            weight: ex.weight || 0,
          }));
        }
        return {
          id: ex.id,
          name: ex.name,
          sets,
          equipment: ex.equipment ?? undefined,
          notes: ex.notes ?? undefined,
          restBetweenSets: ex.rest_between_sets,
          useSmartRest: ex.use_smart_rest,
        };
      }),
  };
}

function mapDomainRoutineToDb(input: CreateRoutineInput, userId: string) {
  return {
    user_id: userId,
    name: input.name,
    description: input.description ?? null,
    image_url: input.image ?? null,
    rest_between_sets: input.restBetweenSets ?? 60,
    rest_between_exercises: input.restBetweenExercises ?? 120,
    exercises: input.exercises.map((ex, idx) => ({
      name: ex.name,
      sets: ex.sets.length,
      reps: ex.sets[0]?.reps ?? 10,
      weight: ex.sets[0]?.weight ?? null,
      equipment: ex.equipment ?? null,
      notes: ex.notes ?? null,
      order_index: idx,
      rest_between_sets: ex.restBetweenSets,
      use_smart_rest: ex.useSmartRest,
    })),
  };
}

/**
 * Implementación de IRoutineRepository usando Supabase
 */
export class SupabaseRoutineRepository implements IRoutineRepository {
  async getByUserId(
    userId: string,
    filters?: RoutineFilters,
  ): Promise<RoutineListResult> {
    const supabase = createClient();

    let query = supabase
      .from('routines')
      .select(`
        *,
        exercises (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (filters?.nameContains) {
      query = query.ilike('name', `%${filters.nameContains}%`);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit ?? 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error al obtener rutinas: ${error.message}`);
    }

    const routines = (data ?? []).map(mapDbRoutineToDomain);

    return {
      routines,
      total: routines.length,
    };
  }

  async getById(id: string): Promise<Routine | null> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('routines')
      .select(`
        *,
        exercises (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error al obtener rutina: ${error.message}`);
    }

    return mapDbRoutineToDomain(data as DbRoutine);
  }

  async create(input: CreateRoutineInput): Promise<Routine> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('No autenticado');
    }

    const dbInput = mapDomainRoutineToDb(input, user.id);

    const { data, error } = await supabase
      .from('routines')
      .insert(dbInput)
      .select(`
        *,
        exercises (*)
      `)
      .single();

    if (error) {
      throw new Error(`Error al crear rutina: ${error.message}`);
    }

    return mapDbRoutineToDomain(data as DbRoutine);
  }

  async update(id: string, input: UpdateRoutineInput): Promise<Routine> {
    const supabase = createClient();

    const dbInput: Record<string, unknown> = {};

    if (input.name !== undefined) dbInput.name = input.name;
    if (input.description !== undefined) dbInput.description = input.description;
    if (input.image !== undefined) dbInput.image_url = input.image;
    if (input.restBetweenSets !== undefined)
      dbInput.rest_between_sets = input.restBetweenSets;
    if (input.restBetweenExercises !== undefined)
      dbInput.rest_between_exercises = input.restBetweenExercises;

    const { error: updateError } = await supabase
      .from('routines')
      .update(dbInput)
      .eq('id', id);

    if (updateError) {
      throw new Error(`Error al actualizar rutina: ${updateError.message}`);
    }

    if (input.exercises !== undefined) {
      const { error: deleteExError } = await supabase
        .from('exercises')
        .delete()
        .eq('routine_id', id);

      if (deleteExError) {
        throw new Error(`Error al actualizar ejercicios: ${deleteExError.message}`);
      }

      const { data: insertedExercises, error: insertExError } = await supabase
        .from('exercises')
        .insert(
          input.exercises.map((ex, idx) => ({
            routine_id: id,
            name: ex.name,
            sets: ex.sets.length,
            reps: ex.sets[0]?.reps ?? 10,
            weight: ex.sets[0]?.weight ?? null,
            equipment: ex.equipment ?? null,
            notes: ex.notes ?? null,
            order_index: idx,
            rest_between_sets: ex.restBetweenSets,
            use_smart_rest: ex.useSmartRest,
          }))
        )
        .select();

      if (insertExError) {
        throw new Error(`Error al insertar ejercicios: ${insertExError.message}`);
      }

      return this.getById(id).then((r) => {
        if (!r) throw new Error('Rutina no encontrada después de actualizar');
        return r;
      });
    }

    return this.getById(id).then((r) => {
      if (!r) throw new Error('Rutina no encontrada después de actualizar');
      return r;
    });
  }

  async delete(id: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase.from('routines').delete().eq('id', id);

    if (error) {
      throw new Error(`Error al eliminar rutina: ${error.message}`);
    }
  }

  async exists(id: string, userId: string): Promise<boolean> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('routines')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return false;
      throw new Error(`Error al verificar existencia: ${error.message}`);
    }

    return !!data;
  }
}
