import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Tipos para mejor validación
interface RoutineExercise {
  id?: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  notes?: string;
}

interface CreateRoutineBody {
  name: string;
  description?: string;
  image?: string;
  exercises: RoutineExercise[];
  restBetweenSets?: number;
  restBetweenExercises?: number;
}

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('[Routines API] Auth error:', userError.message)
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

    console.log('[Routines API] Fetching routines for user:', user.id)

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
      console.error('[Routines API] Database error:', error.message)
      return NextResponse.json(
        { error: 'Error al obtener rutinas', details: error.message }, 
        { status: 500 }
      )
    }

    console.log(`[Routines API] Found ${routines?.length || 0} routines`)

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
    console.error('[Routines API] Unexpected error in GET:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('[Routines API] Auth error:', userError.message)
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

    const body: CreateRoutineBody = await request.json()
    const { name, description, image, exercises, restBetweenSets, restBetweenExercises } = body

    // Validación de datos
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: 'El nombre de la rutina es requerido' }, 
        { status: 400 }
      )
    }

    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: 'Se requiere al menos un ejercicio' }, 
        { status: 400 }
      )
    }

    // Validar que cada ejercicio tenga los datos necesarios
    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      if (!ex.name || ex.sets <= 0 || ex.reps <= 0) {
        return NextResponse.json(
          { error: 'Datos inválidos', details: `Ejercicio ${i + 1}: nombre, series y repeticiones son requeridos` }, 
          { status: 400 }
        )
      }
    }

    console.log(`[Routines API] Creating routine "${name}" with ${exercises.length} exercises`)

    // Create routine
    const { data: routine, error: routineError } = await supabase
      .from('routines')
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        image_url: image || null,
        rest_between_sets: restBetweenSets || 60,
        rest_between_exercises: restBetweenExercises || 120
      })
      .select()
      .single()

    if (routineError) {
      console.error('[Routines API] Error creating routine:', routineError.message)
      return NextResponse.json(
        { error: 'Error al crear la rutina', details: routineError.message }, 
        { status: 500 }
      )
    }

    console.log('[Routines API] Routine created:', routine.id)

    // Create exercises
    const exercisesData = exercises.map((ex: RoutineExercise, index: number) => ({
      routine_id: routine.id,
      name: ex.name.trim(),
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight || null,
      notes: ex.notes?.trim() || null,
      order_index: index
    }))

    const { error: exercisesError } = await supabase
      .from('exercises')
      .insert(exercisesData)

    if (exercisesError) {
      console.error('[Routines API] Error creating exercises:', exercisesError.message)
      // Rollback: delete the routine
      console.log('[Routines API] Rolling back routine:', routine.id)
      await supabase.from('routines').delete().eq('id', routine.id)
      return NextResponse.json(
        { error: 'Error al crear los ejercicios', details: exercisesError.message }, 
        { status: 500 }
      )
    }

    console.log('[Routines API] Exercises created successfully')

    return NextResponse.json({ success: true, id: routine.id }, { status: 201 })
  } catch (error) {
    console.error('[Routines API] Unexpected error in POST:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    )
  }
}

