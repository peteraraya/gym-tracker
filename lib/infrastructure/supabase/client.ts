import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseConfig } from '@/lib/infrastructure/supabase/config'

export function createClient() {
  const { url, anonKey } = getSupabaseConfig()
  return createBrowserClient(url, anonKey)
}
