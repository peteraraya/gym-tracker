export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    throw new Error(
      'Supabase is enabled but NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.',
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid HTTP(S) URL.');
  }

  if (
    !['http:', 'https:'].includes(parsedUrl.protocol) ||
    /placeholder|your-project-url|example\.com/i.test(url) ||
    /placeholder|your-anon-key/i.test(anonKey)
  ) {
    throw new Error('Supabase configuration contains an invalid or placeholder value.');
  }

  return { url, anonKey };
}

export function hasSupabaseConfig(): boolean {
  try {
    getSupabaseConfig();
    return true;
  } catch {
    return false;
  }
}
