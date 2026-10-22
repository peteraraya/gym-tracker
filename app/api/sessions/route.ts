import { NextResponse } from 'next/server'
import {
  createSupabaseServerClient,
  getSessionsFromDb,
  createSessionInDb,
} from '@/lib/infrastructure/supabase/shared-service'
import {
  ApiCreateSessionBodySchema,
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
    const sessions = await getSessionsFromDb(supabase)
    return NextResponse.json(sessions)
  } catch (error) {
    console.error('[Sessions API] Unexpected error in GET:', error)
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

    const validation = validateApiBody(ApiCreateSessionBodySchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error },
        { status: 400 },
      )
    }

    const data = validation.data

    const result = await createSessionInDb(supabase, {
      routineId: data.routineId,
      exercises: data.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        completedSets: ex.completedSets,
        actualReps: ex.actualReps,
        actualWeight: ex.actualWeight,
        setDurations: ex.setDurations,
        pauseDurations: ex.pauseDurations,
      })),
      notes: data.notes,
      totalDuration: data.totalDuration,
      totalPausedTime: data.totalPausedTime,
    })

    return NextResponse.json({ success: true, id: result.id }, { status: 201 })
  } catch (error) {
    console.error('[Sessions API] Unexpected error in POST:', error)
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
      },
      { status: 500 },
    )
  }
}
