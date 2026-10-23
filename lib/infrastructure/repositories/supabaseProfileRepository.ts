/**
 * Adaptador de Supabase para IProfileRepository
 */

import { createClient } from '@/lib/infrastructure/supabase/client';
import type { UserProfile } from '@/types';
import type {
  IProfileRepository,
  CreateProfileInput,
  UpdateProfileInput,
} from '@/lib/domain/repositories';

function mapDbProfileToDomain(db: any, userId: string, userEmail?: string): UserProfile {
  return {
    id: db.id,
    userId: userId,
    name: db.name ?? userEmail?.split('@')[0] ?? 'Usuario',
    email: userEmail ?? db.email ?? '',
    age: db.age ?? undefined,
    gender: db.gender ?? undefined,
    height: db.height ?? undefined,
    weight: db.weight ?? undefined,
    fitnessGoal: db.fitness_goal ?? undefined,
    fitnessLevel: db.fitness_level ?? undefined,
    weeklyWorkouts: db.weekly_workouts ?? undefined,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}

/**
 * Implementación de IProfileRepository usando Supabase
 */
export class SupabaseProfileRepository implements IProfileRepository {
  async getByUserId(userId: string): Promise<UserProfile | null> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    const userEmail = user?.email ?? undefined;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error al obtener perfil: ${error.message}`);
    }

    return mapDbProfileToDomain(data, userId, userEmail);
  }

  async create(input: CreateProfileInput): Promise<UserProfile> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    const userEmail = user?.email ?? undefined;

    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: input.userId,
        user_id: input.userId,
        name: input.userId, // Se actualizará con nombre real después
        email: userEmail ?? '',
        age: input.age ?? null,
        gender: input.gender ?? null,
        height: input.height ?? null,
        weight: input.weight ?? null,
        fitness_goal: input.fitnessGoal ?? null,
        fitness_level: input.fitnessLevel ?? null,
        weekly_workouts: input.weeklyWorkouts ?? null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear perfil: ${error.message}`);
    }

    return mapDbProfileToDomain(data, input.userId, userEmail);
  }

  async update(
    userId: string,
    input: UpdateProfileInput,
  ): Promise<UserProfile> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    const userEmail = user?.email ?? undefined;

    const dbInput: Record<string, unknown> = {};

    if (input.age !== undefined) dbInput.age = input.age;
    if (input.gender !== undefined) dbInput.gender = input.gender;
    if (input.height !== undefined) dbInput.height = input.height;
    if (input.weight !== undefined) dbInput.weight = input.weight;
    if (input.fitnessGoal !== undefined) dbInput.fitness_goal = input.fitnessGoal;
    if (input.fitnessLevel !== undefined) dbInput.fitness_level = input.fitnessLevel;
    if (input.weeklyWorkouts !== undefined)
      dbInput.weekly_workouts = input.weeklyWorkouts;
    dbInput.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('user_profiles')
      .update(dbInput)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar perfil: ${error.message}`);
    }

    return mapDbProfileToDomain(data, userId, userEmail);
  }

  async delete(userId: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Error al eliminar perfil: ${error.message}`);
    }
  }
}