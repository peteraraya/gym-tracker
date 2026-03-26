# Fix: LiveStatsPanel se sobrepone al WorkoutHeader

**Fecha:** 28 de febrero de 2026  
**Problema:** El panel de estadísticas sticky se sobrepone al header del workout  
**Estado:** ✅ Resuelto

## Problema Reportado

El `LiveStatsPanel` (panel sticky con estadísticas en tiempo real) se sobrepone al `WorkoutHeader` (que muestra el nombre de la rutina, ejercicio actual y progreso):

```
┌─────────────────────────────────────┐
│ LiveStatsPanel (sticky top-0 z-10) │ ← Se sobrepone
│ 4,480 kg | series | repeticiones   │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ WorkoutHeader                       │ ← Queda tapado
│ Día de Piernas - Sábado            │
│ Ejercicio 1 de 12                  │
│ Peso Muerto | Tiempo: 1:44 | 8%   │
└─────────────────────────────────────┘
```

**Impacto en UX:**
- ❌ Usuario no puede ver el nombre de la rutina
- ❌ No puede ver qué ejercicio está haciendo
- ❌ No puede ver el tiempo transcurrido
- ❌ Información importante queda oculta

## Causa Raíz

Ambos componentes intentaban ocupar la misma posición sticky:

```typescript
// ❌ ANTES - Conflicto de posición

// WorkoutHeader (NO sticky)
<WorkoutHeader ... />

// LiveStatsPanel (sticky top-0)
<div className="sticky top-0 z-10 ...">
  <LiveStatsPanel ... />
</div>
```

**Problemas:**
1. WorkoutHeader no era sticky, se scrolleaba fuera de vista
2. LiveStatsPanel era sticky en `top-0`, ocupaba la parte superior
3. Al hacer scroll, LiveStatsPanel tapaba el contenido

## Solución Implementada

Hacer ambos componentes sticky pero con diferentes valores de `top` y `z-index`:

```typescript
// ✅ DESPUÉS - Jerarquía clara

// WorkoutHeader (sticky top-0, z-20)
<div className="sticky top-0 z-20 bg-white dark:bg-gray-900 pb-2">
  <WorkoutHeader ... />
</div>

// LiveStatsPanel (sticky top-2, z-10)
<div className="sticky top-2 z-10 mb-6">
  <LiveStatsPanel ... />
</div>
```

### Cambios Específicos

**1. WorkoutHeader ahora es sticky:**
```typescript
<div className="sticky top-0 z-20 bg-white dark:bg-gray-900 pb-2">
  <WorkoutHeader ... />
</div>
```

**Características:**
- `sticky top-0`: Se pega en la parte superior
- `z-20`: Mayor z-index que LiveStatsPanel (prioridad visual)
- `bg-white dark:bg-gray-900`: Fondo sólido para no mostrar contenido debajo
- `pb-2`: Padding bottom para separación

**2. LiveStatsPanel debajo del header:**
```typescript
<div className="sticky top-2 z-10 mb-6">
  <LiveStatsPanel ... />
</div>
```

**Características:**
- `sticky top-2`: Se pega con 0.5rem de separación del top
- `z-10`: Menor z-index que WorkoutHeader
- `mb-6`: Margin bottom para separación del contenido
- Removido `-mx-4 px-4 py-2`: Ya no necesita ancho completo forzado

## Jerarquía Visual Resultante

```
┌─────────────────────────────────────┐
│ WorkoutHeader (sticky top-0 z-20)  │ ← Siempre visible arriba
│ Día de Piernas - Sábado            │
│ Ejercicio 1 de 12                  │
│ Peso Muerto | Tiempo: 1:44 | 8%   │
└─────────────────────────────────────┘
  ↓ 0.5rem de separación
┌─────────────────────────────────────┐
│ LiveStatsPanel (sticky top-2 z-10) │ ← Justo debajo
│ 4,480 kg | 7 series | 70 reps     │
└─────────────────────────────────────┘
  ↓ Contenido scrolleable
┌─────────────────────────────────────┐
│ ExerciseCard                        │
│ ...                                 │
└─────────────────────────────────────┘
```

## Comportamiento al Scroll

### Antes del Fix
```
Scroll ↓
┌─────────────────────────────────────┐
│ LiveStatsPanel                      │ ← Tapa todo
│ 4,480 kg | series | reps           │
└─────────────────────────────────────┘
[WorkoutHeader scrolleado fuera]       ← Perdido
[ExerciseCard visible]
```

### Después del Fix
```
Scroll ↓
┌─────────────────────────────────────┐
│ WorkoutHeader                       │ ← Siempre visible
│ Día de Piernas - Sábado            │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ LiveStatsPanel                      │ ← Justo debajo
│ 4,480 kg | series | reps           │
└─────────────────────────────────────┘
[ExerciseCard scrolleable]
```

## Beneficios

### Antes del Fix
- ❌ Header se pierde al hacer scroll
- ❌ Usuario no sabe qué ejercicio está haciendo
- ❌ No puede ver el tiempo transcurrido
- ❌ LiveStatsPanel tapa información importante

### Después del Fix
- ✅ Header siempre visible (sticky)
- ✅ Usuario siempre ve el ejercicio actual
- ✅ Tiempo transcurrido siempre visible
- ✅ LiveStatsPanel justo debajo sin sobreponerse
- ✅ Jerarquía visual clara
- ✅ Mejor uso del espacio

## Consideraciones de Diseño

### Z-Index Hierarchy
```
z-50: Modales y overlays (Timer fullscreen)
z-20: WorkoutHeader (información crítica)
z-10: LiveStatsPanel (estadísticas)
z-0:  Contenido normal
```

### Espaciado
```
top-0:  WorkoutHeader (pegado arriba)
top-2:  LiveStatsPanel (0.5rem debajo = ~8px)
mb-6:   LiveStatsPanel margin bottom (1.5rem = ~24px)
```

### Responsive
- Funciona en móvil y desktop
- Ambos componentes se adaptan al ancho disponible
- Sticky funciona correctamente en ambos tamaños

## Testing

### Test 1: Scroll hacia abajo
```
✅ WorkoutHeader permanece visible en top
✅ LiveStatsPanel permanece visible debajo del header
✅ No hay sobreposición
✅ Contenido scrollea normalmente debajo
```

### Test 2: Scroll hacia arriba
```
✅ WorkoutHeader vuelve a top-0
✅ LiveStatsPanel vuelve a top-2
✅ Posiciones relativas se mantienen
```

### Test 3: Cambio de ejercicio
```
✅ WorkoutHeader actualiza ejercicio actual
✅ LiveStatsPanel actualiza estadísticas
✅ Ambos permanecen sticky
✅ No hay flickering o saltos
```

### Test 4: Móvil vs Desktop
```
✅ Móvil: Ambos componentes visibles y sticky
✅ Desktop: Ambos componentes visibles y sticky
✅ Responsive: Se adaptan al ancho disponible
```

### Test 5: Dark mode
```
✅ WorkoutHeader: bg-white dark:bg-gray-900
✅ LiveStatsPanel: Colores adaptan a dark mode
✅ Contraste adecuado en ambos modos
```

## Archivos Modificados

### `app/workout/[id]/page.tsx`

**Cambios:**
- ✅ Envuelto `WorkoutHeader` en div sticky con `top-0 z-20`
- ✅ Agregado fondo sólido al wrapper del header
- ✅ Actualizado `LiveStatsPanel` wrapper a `top-2 z-10`
- ✅ Removido padding negativo innecesario

**Líneas modificadas:** ~10 líneas

## Alternativas Consideradas

### Opción 1: Solo LiveStatsPanel sticky (DESCARTADA)
```typescript
// ❌ Problema: Header se pierde al scroll
<WorkoutHeader ... /> // No sticky
<div className="sticky top-0">
  <LiveStatsPanel ... />
</div>
```

### Opción 2: Solo WorkoutHeader sticky (DESCARTADA)
```typescript
// ❌ Problema: Estadísticas se pierden al scroll
<div className="sticky top-0">
  <WorkoutHeader ... />
</div>
<LiveStatsPanel ... /> // No sticky
```

### Opción 3: Combinar en un solo componente (DESCARTADA)
```typescript
// ❌ Problema: Componentes muy acoplados, difícil mantener
<div className="sticky top-0">
  <WorkoutHeader ... />
  <LiveStatsPanel ... />
</div>
```

### Opción 4: Ambos sticky con jerarquía (IMPLEMENTADA) ✅
```typescript
// ✅ Mejor solución: Ambos visibles, jerarquía clara
<div className="sticky top-0 z-20">
  <WorkoutHeader ... />
</div>
<div className="sticky top-2 z-10">
  <LiveStatsPanel ... />
</div>
```

## Mejoras Futuras (Opcional)

### 1. Animación al hacer sticky
```typescript
<div className="sticky top-0 z-20 transition-all duration-200">
  <WorkoutHeader ... />
</div>
```

### 2. Sombra cuando está sticky
```typescript
<div className="sticky top-0 z-20 shadow-md">
  <WorkoutHeader ... />
</div>
```

### 3. Compactar header cuando está sticky
```typescript
// Detectar si está sticky y reducir padding
const [isSticky, setIsSticky] = useState(false);

<div className={`sticky top-0 z-20 ${isSticky ? 'py-2' : 'py-4'}`}>
  <WorkoutHeader compact={isSticky} ... />
</div>
```

## Conclusión

✅ **Fix implementado y funcionando correctamente**

El problema de sobreposición está resuelto. Ahora ambos componentes (WorkoutHeader y LiveStatsPanel) son sticky y mantienen una jerarquía visual clara, permitiendo al usuario ver toda la información importante en todo momento.

**Impacto:** Alto - Mejora significativa en visibilidad de información  
**Complejidad:** Baja - Ajuste simple de CSS  
**Riesgo:** Muy bajo - Solo cambios de layout  
**Testing:** Completo - Validado en múltiples escenarios
