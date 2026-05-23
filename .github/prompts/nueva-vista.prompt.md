---
name: nueva-vista
description: >
  Crea una nueva página/vista completa en Gym Tracker siguiendo todas las convenciones
  del proyecto. Usar cuando: agregar una ruta nueva; crear una vista desde cero;
  necesitar el scaffold completo de una página con datos, i18n, loading y empty states.
---

# Prompt: Nueva Vista

Crea una nueva página en `app/$NOMBRE_RUTA/page.tsx` siguiendo el checklist completo:

## Scaffold base

```tsx
// app/$NOMBRE_RUTA/page.tsx
'use client';

import { useTranslations } from '@/context/LocaleContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PageLayout } from '@/components/PageLayout';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';

export default function $NombreVista() {
  const t = useTranslations('$namespace');
  // const { data, isLoading, error } = useHookData();

  return (
    <ProtectedRoute>
      <PageLayout title={t('title')}>
        {/* contenido */}
      </PageLayout>
    </ProtectedRoute>
  );
}
```

## Checklist de nueva vista

1. **Ruta:** `app/$nombre/page.tsx` (lowercase, kebab-case)
2. **i18n:** Agregar namespace en `messages/es.json` y `messages/en.json`
3. **Datos:** Usar React Query (`hooks/queries/`) si hay fetching
4. **Loading:** `if (isLoading) return <LoadingState />;`
5. **Empty:** `if (!data?.length) return <EmptyState action={...} />;`
6. **Compactación:** `gap-3`, `p-3/4` en cards, `text-sm` en secundarios
7. **Virtualización:** si la lista puede superar 50 ítems, usar `@tanstack/react-virtual`
8. **Navbar:** la ruta aparece automáticamente si se agrega al array de links en `Navbar.tsx`

## Claves i18n mínimas a agregar

```json
// messages/es.json  (agregar en el namespace correspondiente)
"$namespace": {
  "title": "...",
  "emptyTitle": "No hay ...",
  "emptyDescription": "...",
  "createFirst": "Crear ..."
}
```
