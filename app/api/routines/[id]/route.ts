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

    // Update exercises (diff-based)
    // 1. Obtener los ejercicios actuales
    const { data: existingExercises, error: fetchError } = await supabase
      .from('exercises')
      .select('id')
      .eq('routine_id', id)

    if (fetchError) {
      console.error('[Routines API] PUT - Fetch existing exercises error:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const existingIds = existingExercises.map(ex => ex.id)
    const incomingExercises = exercises || []
    const incomingIds = incomingExercises.map((ex: Record<string, unknown>) => ex.id).filter(Boolean)

    // 2. Eliminar los ejercicios que ya no están
    const idsToDelete = existingIds.filter(existingId => !incomingIds.includes(existingId))
    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('exercises')
        .delete()
        .in('id', idsToDelete)
        
      if (deleteError) {
        console.error('[Routines API] PUT - Delete exercises error:', deleteError)
        return NextResponse.json({ error: deleteError.message }, { status: 500 })
      }
    }

    // 3. Upsert de los ejercicios entrantes (crear nuevos y actualizar existentes)
    if (incomingExercises.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const exercisesData = incomingExercises.map((ex: any, index: number) => {
        const payload: Record<string, unknown> = {
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
        }
        
        // Solo incluimos el ID si es un UUID válido.
        // Si es un ID temporal generado por el cliente (ej: "exercise_12345"),
        // lo ignoramos para que Supabase genere un nuevo UUID válido al insertar.
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ex.id || '');
        if (ex.id && isUUID) {
          payload.id = ex.id
        }
        
        return payload
      })

      const { error: exercisesError } = await supabase
        .from('exercises')
        .upsert(exercisesData, { onConflict: 'id' })

      if (exercisesError) {
        console.error('[Routines API] PUT - Exercises upsert error:', exercisesError)
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
