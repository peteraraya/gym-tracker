import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Guard: retornar error si la base de datos está deshabilitada
function dbDisabledResponse() {
  if (process.env.NEXT_PUBLIC_ENABLE_DATABASE !== 'true') {
    return NextResponse.json(
      { error: 'Base de datos deshabilitada. Usa almacenamiento local.' },
      { status: 503 }
    );
  }
  return null;
}

// Tipos para mejor validación
interface SessionExercise {
  exerciseId: string;
  completedSets: number;
  actualReps: number[];
  actualWeight: number[];
  setDurations?: number[];
  pauseDurations?: number[];
}

interface CreateSessionBody {
  routineId: string;
  exercises: SessionExercise[];
  notes?: string;
  totalDuration?: number;
  totalPausedTime?: number;
}

export async function GET() {
  const guard = dbDisabledResponse();
  if (guard) return guard;
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('[Sessions API] Auth error:', userError.message)
      return NextResponse.json(
        { error: 'Error de autenticación', details: userError.message }, 
        { status: 401 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado. Por favor, inicia sesión.' }, 
        { status: 401 }
      )
    }

    // console.log('[Sessions API] Fetching sessions for user:', user.id)

    // Get sessions with routine info
    const { data: sessions, error } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        routines (name),
        session_exercises (
          *,
          exercises (name)
        )
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (error) {
      console.error('[Sessions API] Database error:', error.message)
      return NextResponse.json(
        { error: 'Error al obtener sesiones', details: error.message }, 
        { status: 500 }
      )
    }

    // console.log(`[Sessions API] Found ${sessions?.length || 0} sessions`)

    // Transform to match frontend format
    const formattedSessions = sessions?.map(session => ({
      id: session.id,
      routineId: session.routine_id,
      routineName: session.routines?.name,
      date: new Date(session.date),
      notes: session.notes,
      totalDuration: session.total_duration,
      totalPausedTime: session.total_paused_time,
      exercises: session.session_exercises.map((se: {
        exercise_id: string;
        exercises?: { name: string };
        completed_sets: number;
        actual_reps: number[];
        actual_weight: number[];
        set_durations?: number[];
        pause_durations?: number[];
      }) => ({
        exerciseId: se.exercise_id,
        exerciseName: se.exercises?.name,
        completedSets: se.completed_sets,
        actualReps: se.actual_reps,
        actualWeight: se.actual_weight,
        setDurations: se.set_durations,
        pauseDurations: se.pause_durations
      }))
    }))

    return NextResponse.json(formattedSessions)
  } catch (error) {
    console.error('[Sessions API] Unexpected error in GET:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const guard = dbDisabledResponse();
  if (guard) return guard;
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('[Sessions API] Auth error:', userError.message)
      return NextResponse.json(
        { error: 'Error de autenticación', details: userError.message }, 
        { status: 401 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado. Por favor, inicia sesión.' }, 
        { status: 401 }
      )
    }

    const body: CreateSessionBody = await request.json()
    const { routineId, exercises, notes, totalDuration, totalPausedTime } = body

    // Validación de datos
    if (!routineId) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: 'routineId es requerido' }, 
        { status: 400 }
      )
    }

    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: 'Se requiere al menos un ejercicio' }, 
        { status: 400 }
      )
    }

    // console.log(`[Sessions API] Creating session for routine ${routineId} with ${exercises.length} exercises`)

    // Create session
    const { data: session, error: sessionError } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: user.id,
        routine_id: routineId,
        notes: notes || null,
        total_duration: totalDuration || null,
        total_paused_time: totalPausedTime || null
      })
      .select()
      .single()

    if (sessionError) {
      console.error('[Sessions API] Error creating session:', sessionError.message)
      return NextResponse.json(
        { error: 'Error al crear la sesión', details: sessionError.message }, 
        { status: 500 }
      )
    }

    // console.log('[Sessions API] Session created:', session.id)

    // Create session exercises
    const sessionExercisesData = exercises.map((ex: SessionExercise) => ({
      session_id: session.id,
      exercise_id: ex.exerciseId,
      completed_sets: ex.completedSets,
      actual_reps: ex.actualReps,
      actual_weight: ex.actualWeight,
      set_durations: ex.setDurations || null,
      pause_durations: ex.pauseDurations || null
    }))

    const { error: exercisesError } = await supabase
      .from('session_exercises')
      .insert(sessionExercisesData)

    if (exercisesError) {
      console.error('[Sessions API] Error creating session exercises:', exercisesError.message)
      // Rollback: delete the session
      // console.log('[Sessions API] Rolling back session:', session.id)
      await supabase.from('workout_sessions').delete().eq('id', session.id)
      return NextResponse.json(
        { error: 'Error al guardar los ejercicios', details: exercisesError.message }, 
        { status: 500 }
      )
    }

    // console.log('[Sessions API] Session exercises created successfully')

    return NextResponse.json({ success: true, id: session.id }, { status: 201 })
  } catch (error) {
    console.error('[Sessions API] Unexpected error in POST:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    )
  }
}

