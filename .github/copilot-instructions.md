# Gym Tracker — Agent Instructions

Aplicación web/móvil PWA de seguimiento de entrenamientos.
**Stack:** Next.js 16 (App Router) · React 19 · TypeScript 5 · Tailwind CSS 4 · Supabase · next-intl 4 · Framer Motion 12 · Capacitor 6.

## Comandos esenciales

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build producción
npm run test         # Jest (watch)
npm run test:ci      # Jest + coverage (CI)
npm run test:e2e     # Playwright e2e
npm run lint         # ESLint
npm run build:mobile # Build para Capacitor Android
```

## Arquitectura

```
app/          → Páginas Next.js App Router (una carpeta = una ruta)
components/   → Componentes React reutilizables
  ui/         → Base UI (Button, Card, Modal, Input, BottomSheet, …)
context/      → 9 React Contexts (Auth, Gym, Workout, Locale, Toast, Confirm, Equipment, Theme, Onboarding)
hooks/        → Custom hooks + hooks/queries/ (React Query)
lib/          → Lógica de negocio (achievements, progression, personalRecords, dateUtils, storage, supabase)
stores/       → Estado de workout activo
config/       → app.config.ts (única fuente de verdad: colores musculares, etiquetas, paginación)
messages/     → es.json / en.json (i18n con next-intl)
types/        → Tipos TypeScript globales (types/index.ts)
```

Ver [README.md](../README.md) para descripción completa de funcionalidades.

## Convenciones de código

- **Componentes:** PascalCase, exportación nombrada (`export const Foo: React.FC<Props>`)
- **Hooks:** camelCase con prefijo `use` — siempre en `hooks/` o `hooks/queries/`
- **Páginas:** `app/<ruta>/page.tsx` (App Router)
- **Estilos:** Tailwind CSS 4 únicamente — sin CSS módulos ni styled-components
- **i18n obligatorio:** Nunca texto hardcodeado. Usar `useTranslations('namespace')` desde `LocaleContext`. Agregar claves en `messages/es.json` y `messages/en.json`
- **Íconos:** `lucide-react` o `phosphor-react` (no mezclar con otras librerías)
- **Constantes:** Centralizar en `config/app.config.ts`; nunca magic strings/numbers en componentes

## Estado global — reglas de uso

| Necesidad | Usar |
|-----------|------|
| CRUD rutinas/sesiones, datos de usuario | `GymContext` |
| Auth (login/signup/logout) | `AuthContext` |
| Workout activo en progreso | `WorkoutContext` |
| Idioma y traducciones | `LocaleContext` |
| Notificaciones toast | `ToastContext` |
| Confirmaciones destructivas | `ConfirmContext` |
| Datos en caché del servidor | React Query (hooks en `hooks/queries/`) |
| Estado local de UI | `useState` / `useReducer` local |

> ✅ React Query está completamente integrado en `GymContext`. Usa los hooks de `hooks/queries/` para nuevas features de datos.

## Patrones críticos

### Página nueva
```tsx
// app/mi-ruta/page.tsx
export default function MiRutaPage() {
  return (
    <ProtectedRoute>
      <PageLayout title={t('title')} /* usar i18n */>
        {/* contenido */}
      </PageLayout>
    </ProtectedRoute>
  );
}
```

### Componente con datos
```tsx
// Preferir React Query sobre Context para fetching
const { data, isLoading, error } = useRoutines();
if (isLoading) return <LoadingState />;
if (!data?.length) return <EmptyState />;
```

### Validación de formularios
- Preferir **Zod** para schemas nuevos (migración desde Yup en curso)
- Mover schemas a `lib/validation/` — nunca inline en componentes

## UX y compactación — directrices transversales

El objetivo es **compactar la UI sin perder funcionalidad**:

1. **Virtualizar listas largas** (+50 ítems): usar `@tanstack/react-virtual`; ya configurado en el proyecto
2. **Lazy load de secciones pesadas**: componentes en `app/dashboard/components.lazy.tsx` como modelo
3. **BottomSheet en móvil, Modal en desktop**: usar `components/ui/BottomSheet.tsx` para interacciones móviles
4. **Skeletons en toda carga**: no mostrar spinners, usar `LoadingState` o Skeleton por sección
5. **EmptyState con CTA**: toda lista vacía debe tener botón de acción primaria
6. **Componentes de un solo scroll**: no paginar innecesariamente — usar virtualización en su lugar
7. **Compactación visual**: `gap-2/gap-3` en lugar de `gap-6`; `p-3` en cards secundarias; usar `text-sm` para datos secundarios

## Errores frecuentes a evitar

- **No duplicar lógica de fechas**: usar helpers de `lib/utils/dateUtils.ts` (`normalizeToMidnight`, `calculateStreak`, `filterSessionsByMonth`)
- **No duplicar colores de grupos musculares**: usar `APP_CONFIG.muscleGroupColors` de `config/app.config.ts`
- **No texto sin traducción**: todo texto visible al usuario debe pasar por `useTranslations()`
- **SSR hydration**: envolver componentes que leen `localStorage` o dependen del cliente en `<ClientOnly>`
- **Theme en SSR**: el tema se determina en cliente; ver `ThemeContext.tsx` para el patrón correcto
- **Storage offline**: `lib/storage/storage.ts` hace fallback silencioso a localStorage — comunicar al usuario el estado offline vía `useConnectionStatus`

## Tests

- **Unit tests:** `__tests__/unit/` con Jest + React Testing Library
- **Integration:** `__tests__/integration/`
- **E2E:** `__tests__/e2e/` con Playwright
- Ver [docs/](../docs/) para guías de testing detalladas
