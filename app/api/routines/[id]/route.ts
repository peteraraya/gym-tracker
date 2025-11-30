import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, image, exercises, restBetweenSets, restBetweenExercises } = body

    // Update routine
    const { error: routineError } = await supabase
      .from('routines')
      .update({
        name,
        description,
        image_url: image,
        rest_between_sets: restBetweenSets || 60,
        rest_between_exercises: restBetweenExercises || 120
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (routineError) {
      return NextResponse.json({ error: routineError.message }, { status: 500 })
    }

    // Delete existing exercises
    await supabase.from('exercises').delete().eq('routine_id', id)

    // Create new exercises
    if (exercises && exercises.length > 0) {
      const exercisesData = exercises.map((ex: any, index: number) => ({
        routine_id: id,
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
        return NextResponse.json({ error: exercisesError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating routine:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('routines')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting routine:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
