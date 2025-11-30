import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform to match frontend format
    const formattedSessions = sessions?.map(session => ({
      id: session.id,
      routineId: session.routine_id,
      routineName: session.routines?.name,
      date: new Date(session.date),
      exercises: session.session_exercises.map(se => ({
        exerciseId: se.exercise_id,
        exerciseName: se.exercises?.name,
        completedSets: se.completed_sets,
        actualReps: se.actual_reps,
        actualWeight: se.actual_weight
      }))
    }))

    return NextResponse.json(formattedSessions)
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { routineId, exercises } = body

    // Create session
    const { data: session, error: sessionError } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: user.id,
        routine_id: routineId
      })
      .select()
      .single()

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 500 })
    }

    // Create session exercises
    if (exercises && exercises.length > 0) {
      const sessionExercisesData = exercises.map((ex: any) => ({
        session_id: session.id,
        exercise_id: ex.exerciseId,
        completed_sets: ex.completedSets,
        actual_reps: ex.actualReps,
        actual_weight: ex.actualWeight
      }))

      const { error: exercisesError } = await supabase
        .from('session_exercises')
        .insert(sessionExercisesData)

      if (exercisesError) {
        // Rollback: delete the session
        await supabase.from('workout_sessions').delete().eq('id', session.id)
        return NextResponse.json({ error: exercisesError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, id: session.id })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
