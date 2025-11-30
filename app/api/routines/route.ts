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

    // Get routines with exercises
    const { data: routines, error } = await supabase
      .from('routines')
      .select(`
        *,
        exercises (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform to match frontend format
    const formattedRoutines = routines?.map(routine => ({
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
        .map((ex: {
          id: string;
          name: string;
          sets: number;
          reps: number;
          weight?: number;
          notes?: string;
        }) => ({
          id: ex.id,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          notes: ex.notes
        }))
    }))

    return NextResponse.json(formattedRoutines)
  } catch (error) {
    console.error('Error fetching routines:', error)
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
    const { name, description, image, exercises, restBetweenSets, restBetweenExercises } = body

    // Create routine
    const { data: routine, error: routineError } = await supabase
      .from('routines')
      .insert({
        user_id: user.id,
        name,
        description,
        image_url: image,
        rest_between_sets: restBetweenSets || 60,
        rest_between_exercises: restBetweenExercises || 120
      })
      .select()
      .single()

    if (routineError) {
      return NextResponse.json({ error: routineError.message }, { status: 500 })
    }

    // Create exercises
    if (exercises && exercises.length > 0) {
      const exercisesData = exercises.map((ex: any, index: number) => ({
        routine_id: routine.id,
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        notes: ex.notes,
        order_index: index
      }))

      const { error: exercisesError } = await supabase
        .from('exercises')
        .insert(exercisesData)

      if (exercisesError) {
        // Rollback: delete the routine
        await supabase.from('routines').delete().eq('id', routine.id)
        return NextResponse.json({ error: exercisesError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, id: routine.id })
  } catch (error) {
    console.error('Error creating routine:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
