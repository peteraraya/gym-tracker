/**
 * Rate limiter en memoria basado en ventanas deslizantes.
 * Protege las API Routes mutativas contra abusos y ataques DoS básicos.
 * Nota: Para producción con múltiples instancias del servidor, se recomienda
 * migrar a Upstash Redis o similar.
 */

interface RateLimitWindow {
  count: number;
  resetTime: number;
}

interface RateLimiterOptions {
  windowMs: number;     // Tamaño de la ventana en ms (default: 60 segundos)
  maxRequests: number;  // Máximo de peticiones por ventana (default: 60)
}

const DEFAULT_OPTIONS: RateLimiterOptions = {
  windowMs: 60 * 1000,   // 1 minuto
  maxRequests: 60,       // 60 peticiones por minuto
};

// Almacenamiento en memoria: key -> ventana actual
const rateLimitStore = new Map<string, RateLimitWindow>();

/**
 * Limpia ventanas expiradas periódicamente para evitar fugas de memoria.
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, window] of rateLimitStore.entries()) {
    if (now > window.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000);

/**
 * Verifica si una petición está dentro del límite de rate.
 * Retorna { success: true, remaining, resetTime } o { success: false, resetTime }.
 */
export function rateLimit(
  identifier: string,
  options: Partial<RateLimiterOptions> = {},
): { success: boolean; remaining: number; resetTime: number } {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const now = Date.now();

  const existing = rateLimitStore.get(identifier);

  if (!existing || now > existing.resetTime) {
    // Nueva ventana
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }

  // Ventana activa
  if (existing.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: existing.resetTime,
    };
  }

  existing.count += 1;
  return {
    success: true,
    remaining: config.maxRequests - existing.count,
    resetTime: existing.resetTime,
  };
}

/**
 * Middleware helper para Next.js API Routes.
 * Retorna una respuesta NextResponse con status 429 si se excede el límite,
 * o null si la petición puede continuar.
 */
export function rateLimitMiddleware(
  identifier: string,
  options: Partial<RateLimiterOptions> = {},
): { success: false; response: Response } | { success: true; remaining: number; resetTime: number } | null {
  const result = rateLimit(identifier, options);

  if (!result.success) {
    return {
      success: false,
      response: new Response(
        JSON.stringify({
          error: 'Demasiadas peticiones',
          details: 'Límite de velocidad excedido. Intenta de nuevo más tarde.',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil((result.resetTime - Date.now()) / 1000)),
            'RateLimit-Limit': String(options.maxRequests ?? DEFAULT_OPTIONS.maxRequests),
            'RateLimit-Remaining': '0',
            'RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
          },
        },
      ),
    };
  }

  return {
    success: true,
    remaining: result.remaining,
    resetTime: result.resetTime,
  };
}