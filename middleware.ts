import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseConfig } from '@/lib/infrastructure/supabase/config';

/**
 * Rutas públicas que no requieren autenticación.
 * El middleware permite el acceso sin sesión a estas rutas.
 */
const PUBLIC_ROUTES = [
  '/auth',
  '/auth/forgot-password',
  '/api',
];

/**
 * Prefijos de rutas públicas (ej. /api/routines, /api/sessions).
 * Se permiten sin validación de sesión en el middleware;
 * la validación granular se hace dentro de cada API Route.
 */
const PUBLIC_PREFIXES = ['/api'];

/**
 * Rutas que requieren autenticación obligatoria.
 * Si el usuario no tiene sesión válida, se redirige a /auth.
 */
const PROTECTED_ROUTES = [
  '/dashboard',
  '/routines',
  '/workout',
  '/profile',
  '/settings',
  '/setup',
  '/sessions',
  '/progress',
  '/achievements',
  '/ai-assistant',
  '/calculators',
  '/data',
  '/exercises',
  '/equipment',
  '/glossary',
  '/recommended',
  '/planning',
  '/workout-share',
];

export async function middleware(request: NextRequest) {
  try {
    const { url, anonKey } = getSupabaseConfig();
  } catch {
    // Si Supabase no está configurado, no protegemos rutas;
    // la aplicación funciona en modo localStorage offline.
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Permitir rutas públicas y prefijos públicos sin validación de sesión
  if (PUBLIC_ROUTES.includes(pathname) || PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          // Next.js respuesta se modifica fuera de este bloque; las cookies
          // se adjuntan en la respuesta devuelta por el servidor.
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si no hay usuario autenticado y la ruta es protegida -> redirigir a login
  if (!user && PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    const redirectUrl = new URL('/auth', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Si hay usuario autenticado y intenta acceder a /auth -> redirigir al dashboard
  if (user && pathname === '/auth') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico, robots.txt, sitemap.xml
     * - archivos internos de API y otros que no necesitan middleware
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*$).*)',
  ],
};