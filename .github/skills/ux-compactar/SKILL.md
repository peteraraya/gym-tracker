---
name: ux-compactar
description: >
  Aplica mejoras transversales de UX y compactación visual en Gym Tracker.
  Usar cuando: compactar una vista o módulo; reducir espaciado excesivo; virtualizar
  listas largas; agregar skeleton/loading states; migrar Modal a BottomSheet en móvil;
  mejorar empty states; reducir bundle size de un componente grande.
---

# Skill: UX Compactar

Objetivo: **hacer la UI más compacta e intuitiva sin perder funcionalidad**.

## Checklist de mejoras por tipo

### 1. Compactación visual

| Antes | Después |
|-------|---------|
| `gap-6` entre cards | `gap-3` |
| `p-6` en cards secundarias | `p-3` o `p-4` |
| `text-base` en datos secundarios | `text-sm` |
| `mb-8` entre secciones | `mb-4` |
| Headers con `text-2xl` en listas | `text-xl` o `text-lg` |

```tsx
// Antes — demasiado espacio
<div className="grid gap-6 p-6">
  <Card className="p-6">...</Card>
</div>

// Después — compacto pero legible
<div className="grid gap-3 p-4">
  <Card className="p-3">...</Card>
</div>
```

### 2. Virtualización de listas largas (+50 ítems)

Usar `@tanstack/react-virtual` (ya instalado):

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

const parentRef = useRef<HTMLDivElement>(null);

const rowVirtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 72, // altura estimada de cada ítem en px
  overscan: 5,
});

return (
  <div ref={parentRef} className="overflow-y-auto max-h-[60vh]">
    <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
      {rowVirtualizer.getVirtualItems().map((virtualRow) => (
        <div
          key={virtualRow.index}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${virtualRow.start}px)`,
          }}
        >
          <ItemComponent item={items[virtualRow.index]} />
        </div>
      ))}
    </div>
  </div>
);
```

**Candidatos principales:** `ExerciseSelector.tsx` (180+ ejercicios), `sessions/page.tsx`, `glossary/page.tsx`.

### 3. Skeleton / Loading states

Siempre skeletons, nunca spinners. Usar el patrón:

```tsx
// En cualquier componente con datos async
const { data, isLoading } = useRoutines();

if (isLoading) return <LoadingState />;
if (!data?.length) return <EmptyState action={<Button>Crear rutina</Button>} />;
```

Para secciones grandes, skeleton estructurado:

```tsx
// Skeleton de card
<div className="animate-pulse">
  <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
  <div className="h-3 bg-white/10 rounded w-1/2" />
</div>
```

### 4. BottomSheet en móvil / Modal en desktop

Patrón responsive para acciones secundarias:

```tsx
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Modal } from '@/components/ui/Modal';
import { useMediaQuery } from '@/hooks/useMediaQuery'; // si existe

// Detectar móvil
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

// Renderizar según dispositivo
{isMobile ? (
  <BottomSheet isOpen={open} onClose={() => setOpen(false)}>
    {children}
  </BottomSheet>
) : (
  <Modal isOpen={open} onClose={() => setOpen(false)}>
    {children}
  </Modal>
)}
```

### 5. Lazy loading de secciones pesadas

Modelo: `app/dashboard/components.lazy.tsx`

```tsx
// components.lazy.tsx
import dynamic from 'next/dynamic';

export const HeavyChart = dynamic(
  () => import('@/components/ProgressCharts'),
  { loading: () => <LoadingState />, ssr: false }
);

export const ActivityHeatmap = dynamic(
  () => import('@/components/ActivityHeatmap'),
  { loading: () => <div className="h-32 animate-pulse bg-white/5 rounded-lg" />, ssr: false }
);
```

### 6. EmptyState con CTA obligatorio

Todo estado vacío debe guiar al usuario a la siguiente acción:

```tsx
<EmptyState
  icon={<Dumbbell className="h-10 w-10 text-muted-foreground" />}
  title={t('emptyTitle')}
  description={t('emptyDescription')}
  action={
    <Button onClick={() => router.push('/routines/create')}>
      {t('createFirst')}
    </Button>
  }
/>
```

### 7. Componentes grandes — cómo splitear

Cuando un componente supera ~200 líneas:

```
RoutineForm.tsx (>500 líneas) → splitear en:
├── RoutineFormBasicInfo.tsx   (nombre, descripción, frecuencia)
├── RoutineFormExerciseList.tsx (lista + drag/drop)
├── RoutineFormReview.tsx      (resumen antes de guardar)
└── useRoutineFormState.ts     (lógica centralizada en hook)
```

Regla: 1 componente = 1 responsabilidad. Extraer estado a hook custom si el componente tiene >3 `useState`.

## Checklist final antes de entregar

- [ ] No hay texto hardcodeado (todo pasa por `useTranslations()`)
- [ ] Listas >50 ítems están virtualizadas
- [ ] Estados de carga usan skeletons (no spinners raw)
- [ ] Estados vacíos tienen CTA
- [ ] Espaciado usa `gap-2/3`, `p-3/4` (no `gap-6`, `p-6` en cards secundarias)
- [ ] Acciones en móvil usan `BottomSheet`, en desktop `Modal`
- [ ] Sin colores hardcodeados — usar `APP_CONFIG.muscleGroupColors`
- [ ] Sin lógica de fechas duplicada — usar `lib/utils/dateUtils.ts`
