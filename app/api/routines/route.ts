import { NextResponse } from 'next/server'
import {
  createSupabaseServerClient,
  getRoutinesFromDb,
  createRoutineInDb,
} from '@/lib/infrastructure/supabase/shared-service'
import {
  ApiCreateRoutineBodySchema,
  validateApiBody,
} from '@/lib/shared/validation/api'

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
    const body = await request.json()

    const validation = validateApiBody(ApiCreateRoutineBodySchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error },
        { status: 400 },
      )
    }

    const data = validation.data

    const result = await createRoutineInDb(supabase, {
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      image: data.image || undefined,
      exercises: data.exercises.map((ex) => ({
        name: ex.name.trim(),
        sets: ex.sets.map((s) => ({
          reps: s.reps,
          weight: s.weight,
        })),
        equipment: ex.equipment?.trim() || undefined,
        notes: ex.notes?.trim() || undefined,
      })),
      restBetweenSets: data.restBetweenSets,
      restBetweenExercises: data.restBetweenExercises,
    })

    return NextResponse.json({ success: true, id: result.id }, { status: 201 })
  } catch (error) {
    console.error('[Routines API] Unexpected error in POST:', error)
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
      },
      { status: 500 },
    )
  }
}
