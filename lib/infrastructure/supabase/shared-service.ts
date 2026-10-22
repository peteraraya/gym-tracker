/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Servicios compartidos de Supabase para API Routes (Server) y service.ts (Client).
 *
 * Cada función acepta un cliente de Supabase como primer parámetro, lo que permite
 * usar el mismo código con createServerClient (API Routes) o createBrowserClient
 * (service.ts / Capacitor). Esto elimina la duplicación de lógica SQL entre capas.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseConfig } from '@/lib/infrastructure/supabase/config'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  const { url, anonKey } = getSupabaseConfig()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll() { /* Server Component - no-op */ },
    },
  })
}

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

export interface SessionExercise {
  exerciseId: string;
  completedSets: number;
  actualReps: number[];
  actualWeight: number[];
  setDurations?: number[];
  pauseDurations?: number[];
}

export interface CreateSessionBody {
  routineId: string;
  exercises: SessionExercise[];
  notes?: string;
  totalDuration?: number;
  totalPausedTime?: number;
}

export interface UserProfileData {
  id: string;
  userId: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  weightHistory?: any[];
  fitnessGoal?: string;
  fitnessLevel?: string;
  weeklyWorkouts?: number;
  createdAt?: string;
  updatedAt?: string;
}

export async function getRoutinesFromDb(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data: routines, error } = await supabase
    .from('routines').select(`*, exercises (*)`)
    .eq('user_id', user.id).order('created_at', { ascending: false })
  if (error) throw new Error(`Error al obtener rutinas: ${error.message}`)
  return routines?.map((routine: any) => ({
    id: routine.id, name: routine.name, description: routine.description,
    image: routine.image_url, restBetweenSets: routine.rest_between_sets,
    restBetweenExercises: routine.rest_between_exercises,
    createdAt: new Date(routine.created_at), updatedAt: new Date(routine.updated_at),
    exercises: (routine.exercises || [])
      .sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index)
      .map((ex: any) => {
        let sets: SetData[];
        if (ex.sets_data) { sets = ex.sets_data; }
        else { sets = Array(ex.sets || 1).fill(null).map(() => ({ reps: ex.reps || 10, weight: ex.weight || 0 })) }
        return { id: ex.id, name: ex.name, sets, equipment: ex.equipment, notes: ex.notes }
      })
  })) || []
}

export async function createRoutineInDb(supabase: any, data: CreateRoutineData) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }
  const { data: routine, error: routineError } = await supabase
    .from('routines')
    .insert({ user_id: user.id, name: data.name, description: data.description, image_url: data.image,
      rest_between_sets: data.restBetweenSets || 60, rest_between_exercises: data.restBetweenExercises || 120 })
    .select().single()
  if (routineError) throw new Error(`Error al crear la rutina: ${routineError.message}`)
  const exercisesData = data.exercises.map((ex: RoutineExercise, index: number) => ({
    routine_id: routine.id, name: ex.name, sets_data: ex.sets, equipment: ex.equipment || null,
    notes: ex.notes || null, order_index: index, sets: ex.sets?.length || 0,
    reps: ex.sets?.[0]?.reps || 0, weight: ex.sets?.[0]?.weight || 0
  }))
  const { error: exercisesError } = await supabase.from('exercises').insert(exercisesData)
  if (exercisesError) {
    await supabase.from('routines').delete().eq('id', routine.id)
    throw new Error(`Error al crear los ejercicios: ${exercisesError.message}`)
  }
  return { success: true, id: routine.id }
}

export async function getSessionsFromDb(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  const { data: sessions, error } = await supabase
    .from('workout_sessions')
    .select(`, routines (name), session_exercises (*, exercises (name))`)
    .eq('user_id', user.id).order('date', { ascending: false })
  if (error) throw new Error(`Error al obtener sesiones: ${error.message}`)
  return sessions?.map((session: any) => ({
    id: session.id, routineId: session.routine_id, routineName: session.routines?.name,
    date: new Date(session.date), notes: session.notes,
    totalDuration: session.total_duration, totalPausedTime: session.total_paused_time,
    exercises: session.session_exercises.map((se: any) => ({
      exerciseId: se.exercise_id, exerciseName: se.exercises?.name,
      completedSets: se.completed_sets, actualReps: se.actual_reps,
      actualWeight: se.actual_weight, setDurations: se.set_durations,
      pauseDurations: se.pause_durations
    }))
  })) || []
}

export async function createSessionInDb(supabase: any, body: CreateSessionBody) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  if (!body.routineId) throw new Error('routineId es requerido')
  if (!body.exercises || !Array.isArray(body.exercises) || body.exercises.length === 0) {
    throw new Error('Se requiere al menos un ejercicio')
  }
  const { data: session, error: sessionError } = await supabase
    .from('workout_sessions')
    .insert({ user_id: user.id, routine_id: body.routineId, notes: body.notes || null,
      total_duration: body.totalDuration || null, total_paused_time: body.totalPausedTime || null })
    .select().single()
  if (sessionError) throw new Error(`Error al crear la sesión: ${sessionError.message}`)
  const sessionExercisesData = body.exercises.map((ex: SessionExercise) => ({
    session_id: session.id, exercise_id: ex.exerciseId, completed_sets: ex.completedSets,
    actual_reps: ex.actualReps, actual_weight: ex.actualWeight,
    set_durations: ex.setDurations || null, pause_durations: ex.pauseDurations || null
  }))
  const { error: exercisesError } = await supabase.from('session_exercises').insert(sessionExercisesData)
  if (exercisesError) {
    await supabase.from('workout_sessions').delete().eq('id', session.id)
    throw new Error(`Error al guardar los ejercicios: ${exercisesError.message}`)
  }
  return { success: true, id: session.id }
}

export async function getProfileFromDb(supabase: any): Promise<UserProfileData | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile, error } = await supabase
    .from('user_profiles').select('*').eq('user_id', user.id).single()
  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  if (!profile) return null
  return {
    id: profile.id, userId: profile.user_id, age: profile.age, gender: profile.gender,
    height: profile.height, weight: profile.weight, weightHistory: profile.weight_history ?? [],
    fitnessGoal: profile.fitness_goal, fitnessLevel: profile.fitness_level,
    weeklyWorkouts: profile.weekly_workouts, createdAt: profile.created_at,
    updatedAt: profile.updated_at
  }
}

export async function saveProfileInDb(supabase: any, body: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }
  const { age, gender, height, weight, weightHistory, fitnessGoal, fitnessLevel, weeklyWorkouts } = body
  const { data: existingProfile } = await supabase
    .from('user_profiles').select('id').eq('user_id', user.id).single()
  let result
  if (existingProfile) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ age, gender, height, weight, weight_history: weightHistory ?? undefined,
        fitness_goal: fitnessGoal, fitness_level: fitnessLevel,
        weekly_workouts: weeklyWorkouts, updated_at: new Date().toISOString() })
      .eq('user_id', user.id).select().single()
    if (error) throw new Error(error.message)
    result = data
  } else {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({ user_id: user.id, age, gender, height, weight,
        weight_history: weightHistory ?? [], fitness_goal: fitnessGoal,
        fitness_level: fitnessLevel, weekly_workouts: weeklyWorkouts })
      .select().single()
    if (error) throw new Error(error.message)
    result = data
  }
  return {
    success: true, profile: {
      id: result.id, userId: result.user_id, age: result.age, gender: result.gender,
      height: result.height, weight: result.weight, weightHistory: result.weight_history ?? [],
      fitnessGoal: result.fitness_goal, fitnessLevel: result.fitness_level,
      weeklyWorkouts: result.weekly_workouts, createdAt: result.created_at,
      updatedAt: result.updated_at
    }
  }
}
