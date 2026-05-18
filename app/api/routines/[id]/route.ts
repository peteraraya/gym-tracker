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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = dbDisabledResponse();
  if (guard) return guard;
  try {
    const supabase = await createClient()
    const { id } = await params
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('[Routines API] PUT - Auth error:', userError?.message)
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
      console.error('[Routines API] PUT - Routine update error:', routineError)
      return NextResponse.json({ error: routineError.message }, { status: 500 })
    }

    // Delete existing exercises
    const { error: deleteError } = await supabase.from('exercises').delete().eq('routine_id', id)
    
    if (deleteError) {
      console.error('[Routines API] PUT - Delete exercises error:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // Create new exercises
    if (exercises && exercises.length > 0) {
      const exercisesData = exercises.map((ex: any, index: number) => ({
        routine_id: id,
        name: ex.name,
        sets_data: ex.sets, // Array de objetos {reps, weight}
        equipment: ex.equipment,
        notes: ex.notes,
        order_index: index,
        // Valores por defecto para compatibilidad con columnas antiguas
        sets: ex.sets?.length || 0,
        reps: ex.sets?.[0]?.reps || 0,
        weight: ex.sets?.[0]?.weight || 0
      }))

      // console.log('[Routines API] PUT - Inserting exercises:', JSON.stringify(exercisesData[0], null, 2))

      const { error: exercisesError } = await supabase
        .from('exercises')
        .insert(exercisesData)

      if (exercisesError) {
        console.error('[Routines API] PUT - Exercises insert error:', exercisesError)
        return NextResponse.json({ error: exercisesError.message }, { status: 500 })
      }
    }

    // console.log('[Routines API] PUT - Update successful')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Routines API] PUT - Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = dbDisabledResponse();
  if (guard) return guard;
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
