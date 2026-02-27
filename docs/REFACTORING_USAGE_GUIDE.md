# Guía de Uso - Componentes y Hooks de Refactorización

## 📦 Componentes Disponibles

### 1. PageLayout
Wrapper para la estructura común de todas las páginas.

```tsx
import { PageLayout } from '@/components/PageLayout';

export default function MyPage() {
  return (
    <PageLayout
      title="Mi Página"
      description="Descripción opcional"
      icon={<MyIcon />}
      actions={<Button>Acción</Button>}
      maxWidth="6xl"
    >
      {/* Contenido */}
    </PageLayout>
  );
}
```

**Props:**
- `title` (string, required) - Título de la página
- `description` (string, optional) - Descripción bajo el título
- `icon` (ReactNode, optional) - Icono a la izquierda del título
- `actions` (ReactNode, optional) - Botones/acciones a la derecha
- `children` (ReactNode, required) - Contenido principal
- `maxWidth` ('sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl', default: '6xl')

---

### 2. StatsGrid + StatCard
Sistema para mostrar estadísticas en grid responsive.

```tsx
import { StatsGrid, StatCard } from '@/components/StatsGrid';
import { Dumbbell, TrendingUp } from '@/components/icons/lucide';

export default function Dashboard() {
  return (
    <StatsGrid columns={4}>
      <StatCard
        title="Total Volumen"
        value="5,234 kg"
        icon={<Dumbbell />}
        color="blue"
        trend={+12}
        loading={false}
      />
      <StatCard
        title="Sesiones"
        value={24}
        icon={<TrendingUp />}
        color="green"
      />
    </StatsGrid>
  );
}
```

**StatCard Props:**
- `title` (string, required) - Título de la estadística
- `value` (string | number, required) - Valor a mostrar
- `icon` (ReactNode, optional) - Icono
- `trend` (number, optional) - Porcentaje de cambio (positivo/negativo)
- `color` ('blue' | 'green' | 'purple' | 'orange' | 'red' | 'pink', default: 'blue')
- `loading` (boolean, default: false) - Mostrar estado de carga

**StatsGrid Props:**
- `children` (ReactNode, required) - StatCards
- `columns` (1 | 2 | 3 | 4, default: 4) - Número de columnas

---

### 3. EmptyState
Componente para mostrar cuando no hay datos.

```tsx
import { EmptyState } from '@/components/EmptyState';

export default function MyPage() {
  if (items.length === 0) {
    return (
      <EmptyState
        icon="📭"
        title="No hay datos"
        description="Intenta crear uno nuevo"
        action={<Button>Crear</Button>}
      />
    );
  }
}
```

**Props:**
- `icon` (ReactNode, optional) - Emoji o icono
- `title` (string, required) - Título
- `description` (string, optional) - Descripción
- `action` (ReactNode, optional) - Botón de acción

---

### 4. LoadingState
Componente para mostrar estado de carga.

```tsx
import { LoadingState } from '@/components/LoadingState';

export default function MyPage() {
  if (loading) {
    return (
      <LoadingState
        message="Cargando datos..."
        description="Por favor espera"
      />
    );
  }
}
```

**Props:**
- `message` (string, default: 'Cargando...') - Mensaje principal
- `description` (string, optional) - Descripción

---

### 5. FilterPanel + FilterButton
Sistema modular para filtros.

```tsx
import { FilterPanel, FilterButton } from '@/components/FilterPanel';

export default function MyPage() {
  const [filter, setFilter] = useState('all');

  return (
    <FilterPanel>
      <FilterButton
        active={filter === 'all'}
        onClick={() => setFilter('all')}
        count={10}
      >
        Todos
      </FilterButton>
      <FilterButton
        active={filter === 'active'}
        onClick={() => setFilter('active')}
        count={5}
      >
        Activos
      </FilterButton>
    </FilterPanel>
  );
}
```

**FilterButton Props:**
- `active` (boolean, required) - Si está activo
- `onClick` (function, required) - Callback al hacer click
- `children` (ReactNode, required) - Etiqueta
- `count` (number, optional) - Número a mostrar entre paréntesis

**FilterPanel Props:**
- `children` (ReactNode, required) - FilterButtons
- `className` (string, optional) - Clases adicionales

---

## 🪝 Hooks Disponibles

### 1. useFilteredData
Hook genérico para filtrado y paginación.

```tsx
import { useFilteredData } from '@/hooks/useFilteredData';

export default function MyPage() {
  const items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
  ];

  const [searchTerm, setSearchTerm] = useState('');

  const {
    data,           // Items paginados
    total,          // Total de items filtrados
    currentPage,    // Página actual
    setCurrentPage, // Función para cambiar página
    totalPages,     // Total de páginas
    hasNextPage,    // ¿Hay siguiente página?
    hasPrevPage     // ¿Hay página anterior?
  } = useFilteredData(
    items,
    searchTerm,
    (item, search) => item.name.toLowerCase().includes(search),
    { itemsPerPage: 10 }
  );

  return (
    <>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar..."
      />
      
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}

      <button
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={!hasPrevPage}
      >
        Anterior
      </button>
      <span>{currentPage} de {totalPages}</span>
      <button
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={!hasNextPage}
      >
        Siguiente
      </button>
    </>
  );
}
```

**Parámetros:**
- `items` (T[], required) - Array de items a filtrar
- `searchTerm` (string, required) - Término de búsqueda
- `filterFn` ((item: T, search: string) => boolean, required) - Función de filtrado
- `options` (object, optional)
  - `itemsPerPage` (number, default: 10) - Items por página

**Retorna:**
- `data` - Items paginados
- `total` - Total de items filtrados
- `currentPage` - Página actual
- `setCurrentPage` - Cambiar página
- `totalPages` - Total de páginas
- `hasNextPage` - ¿Hay siguiente?
- `hasPrevPage` - ¿Hay anterior?

---

### 2. usePageData
Hook genérico para patrón loading + error + data.

```tsx
import { usePageData } from '@/hooks/usePageData';

export default function MyPage() {
  const { data, loading, error, refetch } = usePageData(
    async () => {
      const res = await fetch('/api/data');
      return res.json();
    },
    { dependencies: [] }
  );

  if (loading) return <LoadingState />;
  if (error) return <EmptyState title="Error" description={error} />;

  return (
    <div>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      <button onClick={refetch}>Recargar</button>
    </div>
  );
}
```

**Parámetros:**
- `fetchFn` (async () => T, required) - Función de fetch
- `options` (object, optional)
  - `dependencies` (any[], default: []) - Dependencias para re-fetch

**Retorna:**
- `data` - Datos obtenidos
- `loading` - ¿Está cargando?
- `error` - Mensaje de error (null si no hay)
- `refetch` - Función para recargar

---

## 📊 Utilidades

### volumeCalculations.ts
Funciones centralizadas para cálculos de volumen.

```tsx
import {
  calculateSessionVolume,
  calculateTotalVolume,
  calculateVolumeByMuscleGroup,
  calculateExerciseVolume,
  calculateVolumeByPeriod,
  calculateAverageVolumePerSession,
  calculateMaxSessionVolume,
  calculateMinSessionVolume
} from '@/lib/utils/volumeCalculations';

// Volumen de una sesión
const sessionVol = calculateSessionVolume(session);

// Volumen total de múltiples sesiones
const totalVol = calculateTotalVolume(sessions);

// Volumen por grupo muscular
const chestVol = calculateVolumeByMuscleGroup(sessions, 'pecho');

// Volumen por período (semana/mes)
const volumeByWeek = calculateVolumeByPeriod(sessions, 'week');

// Promedio por sesión
const avgVol = calculateAverageVolumePerSession(sessions);

// Máximo y mínimo
const maxVol = calculateMaxSessionVolume(sessions);
const minVol = calculateMinSessionVolume(sessions);
```

---

## 🎯 Ejemplos Prácticos

### Ejemplo 1: Página Simple con Estadísticas

```tsx
'use client';

import { PageLayout } from '@/components/PageLayout';
import { StatsGrid, StatCard } from '@/components/StatsGrid';
import { Dumbbell, TrendingUp, Calendar } from '@/components/icons/lucide';

export default function StatsPage() {
  return (
    <PageLayout
      title="Mis Estadísticas"
      description="Resumen de tu progreso"
      icon={<TrendingUp className="w-8 h-8 text-blue-500" />}
    >
      <StatsGrid columns={3}>
        <StatCard
          title="Total Volumen"
          value="5,234 kg"
          icon={<Dumbbell />}
          color="blue"
          trend={+12}
        />
        <StatCard
          title="Sesiones"
          value={24}
          icon={<Calendar />}
          color="green"
        />
        <StatCard
          title="Promedio"
          value="218 kg"
          icon={<TrendingUp />}
          color="purple"
        />
      </StatsGrid>
    </PageLayout>
  );
}
```

### Ejemplo 2: Página con Filtrado y Paginación

```tsx
'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { useFilteredData } from '@/hooks/useFilteredData';
import { FilterPanel, FilterButton } from '@/components/FilterPanel';
import { EmptyState } from '@/components/EmptyState';

export default function ItemsPage() {
  const items = [/* ... */];
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const { data, total, currentPage, setCurrentPage, totalPages } = useFilteredData(
    items,
    searchTerm,
    (item, search) => item.name.toLowerCase().includes(search)
  );

  return (
    <PageLayout title="Items">
      <FilterPanel>
        <FilterButton
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          count={items.length}
        >
          Todos
        </FilterButton>
      </FilterPanel>

      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar..."
      />

      {data.length === 0 ? (
        <EmptyState
          icon="📭"
          title="No hay items"
          description="Intenta con otro término"
        />
      ) : (
        <>
          {data.map(item => (
            <div key={item.id}>{item.name}</div>
          ))}
          
          <div>
            Página {currentPage} de {totalPages}
          </div>
        </>
      )}
    </PageLayout>
  );
}
```

---

## ✅ Checklist de Refactorización

- [ ] Importar componentes necesarios
- [ ] Reemplazar estructura de página con `PageLayout`
- [ ] Reemplazar grillas de stats con `StatsGrid` + `StatCard`
- [ ] Reemplazar estados vacíos con `EmptyState`
- [ ] Reemplazar estados de carga con `LoadingState`
- [ ] Reemplazar filtrado manual con `useFilteredData`
- [ ] Reemplazar fetch manual con `usePageData`
- [ ] Usar `volumeCalculations` para cálculos de volumen
- [ ] Probar en desktop y mobile
- [ ] Verificar dark mode
- [ ] Verificar accesibilidad

---

## 🐛 Troubleshooting

### El componente no se renderiza
- Verifica que esté dentro de `<ProtectedRoute>`
- Verifica que los imports sean correctos
- Revisa la consola para errores

### El filtrado no funciona
- Verifica que `filterFn` retorne boolean
- Verifica que `searchTerm` se actualice correctamente
- Usa `console.log` para debuggear

### El paginado se reinicia
- Verifica que `dependencies` en `usePageData` sea correcto
- Verifica que `itemsPerPage` sea el correcto

---

## 📚 Referencias

- [Tailwind CSS](https://tailwindcss.com/)
- [React Hooks](https://react.dev/reference/react)
- [Next.js App Router](https://nextjs.org/docs/app)
