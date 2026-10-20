import { NextResponse } from 'next/server'
import {
  createSupabaseServerClient,
  getRoutinesFromDb,
  createRoutineInDb,
} from '@/lib/supabase/shared-service'

// ⚠️ DEPRECATED: Esta API Route usa lib/supabase/shared-service.ts internamente.
// Se mantiene para compatibilidad con SSR. Nuevos clientes deben usar service.ts
// (cliente) para evitar duplicación de código.

function dbDisabledResponse() {
  if (process.env.NEXT_PUBLIC_ENABLE_DATABASE !== 'true') {
    return NextResponse.json(
      { error: 'Base de datos deshabilitada. Usa almacenamiento local.' },
      { status: 503 },
    )
  }
  return null
}

// Tipos para mejor validación
interface SetData {
  reps: number
  weight?: number
}

interface RoutineExercise {
  id?: string
  name: string
  sets: SetData[]
  equipment?: string
  notes?: string
}

interface CreateRoutineBody {
  name: string
  description?: string
  image?: string
  exercises: RoutineExercise[]
  restBetweenSets?: number
  restBetweenExercises?: number
}

export async function GET() {
  const guard = dbDisabledResponse()
  if (guard) return guard
  try {
    const supabase = await createSupabaseServerClient()
    const routines = await getRoutinesFromDb(supabase)
    return NextResponse.json(routines)
  } catch (error) {
    console.error('[Routines API] Unexpected error in GET:', error)
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const guard = dbDisabledResponse()
  if (guard) return guard
  try {
    const supabase = await createSupabaseServerClient()
    const body: CreateRoutineBody = await request.json()

    // Validación de datos
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: 'El nombre de la rutina es requerido' },
        { status: 400 },
      )
    }

    if (!body.exercises || !Array.isArray(body.exercises) || body.exercises.length === 0) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: 'Se requiere al menos un ejercicio' },
        { status: 400 },
      )
    }

    // Validar que cada ejercicio tenga los datos necesarios
    for (let i = 0; i < body.exercises.length; i++) {
      const ex = body.exercises[i]
      if (!ex.name || !ex.sets || !Array.isArray(ex.sets) || ex.sets.length === 0) {
        return NextResponse.json(
          {
            error: 'Datos inválidos',
            details: `Ejercicio ${i + 1}: nombre y series son requeridos`,
          },
          { status: 400 },
        )
      }
      // Validar cada serie
      for (let j = 0; j < ex.sets.length; j++) {
        const set = ex.sets[j]
        if (!set.reps || set.reps <= 0) {
          return NextResponse.json(
            {
              error: 'Datos inválidos',
              details: `Ejercicio ${i + 1}, Serie ${j + 1}: repeticiones son requeridas`,
            },
            { status: 400 },
          )
        }
      }
    }

    const result = await createRoutineInDb(supabase, {
      name: body.name.trim(),
      description: body.description?.trim() || undefined,
      image: body.image || undefined,
      exercises: body.exercises.map((ex) => ({
        name: ex.name.trim(),
        sets: ex.sets.map((s) => ({
          reps: s.reps,
          weight: s.weight,
        })),
        equipment: ex.equipment?.trim() || undefined,
        notes: ex.notes?.trim() || undefined,
      })),
      restBetweenSets: body.restBetweenSets,
      restBetweenExercises: body.restBetweenExercises,
    })

    return NextResponse.json({ success: true, id: result.id }, { status: 201 })
  } catch (error) {
    console.error('[Routines API] Unexpected error in POST:', error)
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
