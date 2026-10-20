# ADR-001: Doble Capa de Datos (service.ts + API Routes)

## Estado

Aceptado

## Contexto

GymLogiX es una aplicación que se despliega tanto como web (Next.js en Vercel) como móvil nativo (Capacitor/Android). La aplicación necesita acceso a Supabase desde ambos contextos, pero con restricciones diferentes:

- **Web (SSR):** Puede usar API Routes de Next.js que se ejecutan en el servidor con `createServerClient` de `@supabase/ssr`.
- **Móvil (Capacitor):** La aplicación web se carga desde una URL remota y no puede depender de API Routes de Next.js en el mismo origen. Necesita llamar a Supabase directamente desde el cliente con `createBrowserClient`.

Además, el build móvil de Next.js usa `output: 'export'` (estático), lo que elimina las API Routes del bundle desplegado.

## Decisión

Implementar una **doble capa de datos**:

1. **`lib/supabase/service.ts`** — Capa de acceso a datos desde el cliente. Usa `createBrowserClient` y funciona tanto en web (SSR con `createServerClient` vía wrappers) como en móvil (Capacitor).

2. **`app/api/*/route.ts`** — API Routes de Next.js para el servidor web. Duplican la lógica de `service.ts` pero se ejecutan en el servidor con `createServerClient`.

3. **`lib/supabase/shared-service.ts`** — Lógica pura de acceso a datos compartida entre ambas capas. Acepta un cliente de Supabase como parámetro, permitiendo reutilizar el mismo código SQL con `createServerClient` (API Routes) o `createBrowserClient` (service.ts).

## Consecuencias

### Positivas

- **Compatibilidad móvil:** La app Capacitor puede funcionar sin depender de API Routes de Next.js.
- **Código compartido:** `shared-service.ts` evita duplicación completa de lógica SQL.
- **Flexibilidad:** Cada capa puede optimizarse para su contexto (SSR vs cliente).

### Negativas

- **Duplicación parcial:** Las API Routes todavía contienen lógica duplicada de `service.ts`. Se han marcado como deprecadas con comentarios.
- **Mayor superficie de prueba:** Hay que probar ambas capas por separado.

### Mitigaciones

- Las API Routes están marcadas con comentarios de `DEPRECATED` indicando que deben migrar a `shared-service.ts`.
- Se creó `shared-service.ts` como punto único de verdad para la lógica SQL compartida.
- El plan a medio plazo es eliminar las API Routes y usar únicamente `service.ts` con wrappers de servidor.

## Alternativas Consideradas

| Alternativa | Ventajas | Desventajas |
|-------------|----------|-------------|
| Solo API Routes | Simple, una sola capa | No funciona en móvil (Capacitor) |
| Solo service.ts (cliente) | Funciona en ambos contextos | Pierde beneficios de SSR (SEO, carga inicial más lenta) |
| Edge Functions | Ejecución en el borde, cerca de Supabase | Mayor complejidad, costo adicional |

## Fecha

2026-10-20
