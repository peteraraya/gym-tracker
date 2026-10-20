import { NextResponse } from 'next/server'
import {
  createSupabaseServerClient,
  getSessionsFromDb,
  createSessionInDb,
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
interface SessionExercise {
  exerciseId: string
  completedSets: number
  actualReps: number[]
  actualWeight: number[]
  setDurations?: number[]
  pauseDurations?: number[]
}

interface CreateSessionBody {
  routineId: string
  exercises: SessionExercise[]
  notes?: string
  totalDuration?: number
  totalPausedTime?: number
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
    const body: CreateSessionBody = await request.json()

    // Validación de datos
    if (!body.routineId) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: 'routineId es requerido' },
        { status: 400 },
      )
    }

    if (!body.exercises || !Array.isArray(body.exercises) || body.exercises.length === 0) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: 'Se requiere al menos un ejercicio' },
        { status: 400 },
      )
    }

    const result = await createSessionInDb(supabase, {
      routineId: body.routineId,
      exercises: body.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        completedSets: ex.completedSets,
        actualReps: ex.actualReps,
        actualWeight: ex.actualWeight,
        setDurations: ex.setDurations,
        pauseDurations: ex.pauseDurations,
      })),
      notes: body.notes,
      totalDuration: body.totalDuration,
      totalPausedTime: body.totalPausedTime,
    })

    return NextResponse.json({ success: true, id: result.id }, { status: 201 })
  } catch (error) {
    console.error('[Sessions API] Unexpected error in POST:', error)
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
