import { NextResponse } from 'next/server'
import {
  createSupabaseServerClient,
  getProfileFromDb,
  saveProfileInDb,
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

export async function GET() {
  const guard = dbDisabledResponse()
  if (guard) return guard
  try {
    const supabase = await createSupabaseServerClient()
    const profile = await getProfileFromDb(supabase)
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const guard = dbDisabledResponse()
  if (guard) return guard
  try {
    const supabase = await createSupabaseServerClient()
    const body = await request.json()

    const result = await saveProfileInDb(supabase, body)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error saving profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
