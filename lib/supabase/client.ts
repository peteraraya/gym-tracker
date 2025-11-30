import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Return a dummy client if not configured
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your-project-url' || !supabaseUrl.startsWith('http')) {
    console.warn('⚠️ Supabase not configured');
    // Return a mock client that won't crash
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder-key'
    );
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}
