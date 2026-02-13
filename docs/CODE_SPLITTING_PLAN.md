# Plan de Code Splitting de Datos de Ejercicios

## Fecha: 2025-02-13

## 🎯 Objetivo

Dividir `data/exercises.ts` (142 KB) y `data/warmupExercises.ts` (112 KB) en archivos más pequeños organizados por grupo muscular para reducir el bundle inicial en ~200 KB.

---

## 📊 Análisis del Problema

### Situación Actual
- **Archivo:** `data/exercises.ts`
- **Tamaño:** 142 KB (~4,452 líneas)
- **Contenido:** ~200+ ejercicios de 13 grupos musculares
- **Problema:** Se carga completo en todas las páginas, incluso cuando solo se necesitan algunos ejercicios

### Impacto
- Bundle inicial muy grande
- Tiempo de carga lento en móviles
- Datos innecesarios cargados en cada página

---

## 🏗️ Arquitectura Propuesta

### Estructura de Archivos

```
data/
  exercises/
    types.ts                    # ✅ Tipos compartidos (CREADO)
    index.ts                    # ✅ API de carga dinámica (CREADO)
    compat.ts                   # ✅ Compatibilidad con código existente (CREADO)
    groups/
      pecho.ts                  # ✅ 9 ejercicios (CREADO)
      espalda.ts                # ⏳ ~11 ejercicios (PENDIENTE)
      piernas.ts                # ⏳ ~16 ejercicios (PENDIENTE)
      gluteos.ts                # ⏳ ~11 ejercicios (PENDIENTE)
      hombros.ts                # ⏳ ~15 ejercicios (PENDIENTE)
      biceps.ts                 # ⏳ ~17 ejercicios (PENDIENTE)
      triceps.ts                # ⏳ ~16 ejercicios (PENDIENTE)
      antebrazos.ts             # ⏳ ~15 ejercicios (PENDIENTE)
      trapecio.ts               # ⏳ ~12 ejercicios (PENDIENTE)
      cuello.ts                 # ⏳ ~10 ejercicios (PENDIENTE)
      core.ts                   # ⏳ ~15 ejercicios (PENDIENTE)
      gemelos.ts                # ⏳ ~10 ejercicios (PENDIENTE)
      cardio.ts                 # ⏳ ~30 ejercicios (PENDIENTE)
  exercises.ts                  # Archivo original (mantener por ahora)
```

---

## 🔧 Implementación

### Fase 1: Infraestructura ✅ COMPLETADA

**Archivos creados:**

1. **`data/exercises/types.ts`** ✅
   - Tipos compartidos (MuscleGroup, ExerciseTemplate)
   - Constante URL_STORAGE
   - Array de grupos musculares

2. **`data/exercises/index.ts`** ✅
   - Función `getExercisesByMuscleGroup(group)` - Carga bajo demanda
   - Función `getAllExercises()` - Carga todos los grupos
   - Función `getExerciseById(id)` - Busca por ID
   - Función `searchExercises(query)` - Búsqueda por nombre
   - Cache para evitar cargas múltiples

3. **`data/exercises/compat.ts`** ✅
   - Re-exporta EXERCISE_DATABASE del archivo original
   - Mantiene compatibilidad con código existente
   - Exporta nuevas funciones para uso futuro

4. **`data/exercises/groups/pecho.ts`** ✅
   - Ejemplo con 9 ejercicios de pecho
   - Demuestra el patrón a seguir

---

### Fase 2: División de Ejercicios ⏳ PENDIENTE

**Proceso manual recomendado:**

1. **Abrir `data/exercises.ts`**
2. **Buscar cada sección de grupo muscular** (ej: `// ESPALDA`)
3. **Copiar ejercicios del grupo**
4. **Crear archivo en `data/exercises/groups/[grupo].ts`**
5. **Usar el patrón de `pecho.ts` como plantilla**

**Plantilla para cada archivo:**

```typescript
/**
 * Ejercicios de [GRUPO]
 */

import type { ExerciseTemplate } from '../types';
import { URL_STORAGE } from '../types';

export const exercises: ExerciseTemplate[] = [
  // Copiar ejercicios aquí
];
```

**Grupos a crear (12 archivos):**
- ⏳ espalda.ts (~11 ejercicios)
- ⏳ piernas.ts (~16 ejercicios)
- ⏳ gluteos.ts (~11 ejercicios)
- ⏳ hombros.ts (~15 ejercicios)
- ⏳ biceps.ts (~17 ejercicios)
- ⏳ triceps.ts (~16 ejercicios)
- ⏳ antebrazos.ts (~15 ejercicios)
- ⏳ trapecio.ts (~12 ejercicios)
- ⏳ cuello.ts (~10 ejercicios)
- ⏳ core.ts (~15 ejercicios)
- ⏳ gemelos.ts (~10 ejercicios)
- ⏳ cardio.ts (~30 ejercicios)

**Tiempo estimado:** 3-4 horas (copiar y pegar con cuidado)

---

### Fase 3: Actualizar Código Existente ⏳ PENDIENTE

**Archivos que usan EXERCISE_DATABASE:**

1. **`app/exercises/page.tsx`**
   - Cambiar a carga por grupo cuando se filtra
   - Usar `getAllExercises()` para vista completa

2. **`components/ExerciseSelector.tsx`**
   - Cargar solo el grupo muscular seleccionado
   - Usar `getExercisesByMuscleGroup()`

3. **`app/workout/[id]/page.tsx`**
   - Mantener carga completa o cargar grupos necesarios
   - Usar `getAllExercises()` o cargar selectivamente

4. **`app/workout/free/page.tsx`**
   - Similar a workout/[id]/page.tsx

5. **`components/MuscleGroupStats.tsx`**
   - Mantener carga completa
   - Usar `getAllExercises()`

6. **Otros componentes**
   - Buscar con: `grep -r "EXERCISE_DATABASE" --include="*.tsx" --include="*.ts"`
   - Actualizar según necesidad

**Patrón de migración:**

```typescript
// Antes
import { EXERCISE_DATABASE } from '@/data/exercises';
const exercises = EXERCISE_DATABASE.filter(ex => ex.muscleGroup === 'pecho');

// Después (carga selectiva)
import { getExercisesByMuscleGroup } from '@/data/exercises';
const [exercises, setExercises] = useState([]);

useEffect(() => {
  getExercisesByMuscleGroup('pecho').then(setExercises);
}, []);

// O (carga completa cuando se necesita)
import { getAllExercises } from '@/data/exercises';
const [exercises, setExercises] = useState([]);

useEffect(() => {
  getAllExercises().then(setExercises);
}, []);
```

**Tiempo estimado:** 2-3 horas

---

### Fase 4: Warmup Exercises ⏳ PENDIENTE

**Aplicar el mismo proceso a `data/warmupExercises.ts`:**

1. Crear `data/warmup/types.ts`
2. Crear `data/warmup/index.ts`
3. Crear `data/warmup/groups/[grupo].ts` para cada grupo
4. Actualizar código que usa warmup exercises

**Tiempo estimado:** 2-3 horas

---

## 📈 Beneficios Esperados

### Reducción de Bundle
- **Antes:** 142 KB (exercises) + 112 KB (warmup) = 254 KB cargados siempre
- **Después:** ~10-20 KB iniciales + carga bajo demanda
- **Ahorro:** ~200-240 KB en bundle inicial

### Performance
- Carga inicial más rápida
- Mejor experiencia en móviles
- Menor uso de memoria

### Mantenibilidad
- Archivos más pequeños y manejables
- Más fácil encontrar y editar ejercicios
- Mejor organización del código

---

## 🚧 Consideraciones

### Compatibilidad
- ✅ Archivo `compat.ts` mantiene API existente
- ✅ Código actual sigue funcionando sin cambios
- ✅ Migración gradual posible

### Cache
- ✅ Implementado en `index.ts`
- ✅ Evita cargas múltiples del mismo grupo
- ✅ Mejora performance después de primera carga

### Testing
- ⚠️ Probar cada grupo después de crearlo
- ⚠️ Verificar que todos los ejercicios estén presentes
- ⚠️ Comprobar que IDs sean únicos

---

## 📝 Checklist de Implementación

### Infraestructura ✅
- [x] Crear `data/exercises/types.ts`
- [x] Crear `data/exercises/index.ts`
- [x] Crear `data/exercises/compat.ts`
- [x] Crear `data/exercises/groups/pecho.ts` (ejemplo)

### División de Ejercicios ⏳
- [ ] Crear espalda.ts
- [ ] Crear piernas.ts
- [ ] Crear gluteos.ts
- [ ] Crear hombros.ts
- [ ] Crear biceps.ts
- [ ] Crear triceps.ts
- [ ] Crear antebrazos.ts
- [ ] Crear trapecio.ts
- [ ] Crear cuello.ts
- [ ] Crear core.ts
- [ ] Crear gemelos.ts
- [ ] Crear cardio.ts

### Actualización de Código ⏳
- [ ] Actualizar app/exercises/page.tsx
- [ ] Actualizar components/ExerciseSelector.tsx
- [ ] Actualizar app/workout/[id]/page.tsx
- [ ] Actualizar app/workout/free/page.tsx
- [ ] Actualizar components/MuscleGroupStats.tsx
- [ ] Buscar y actualizar otros archivos

### Warmup Exercises ⏳
- [ ] Crear estructura data/warmup/
- [ ] Dividir warmupExercises.ts
- [ ] Actualizar código que usa warmup

### Testing ⏳
- [ ] Verificar que todos los ejercicios estén presentes
- [ ] Probar carga por grupo
- [ ] Probar carga completa
- [ ] Verificar performance en dev tools
- [ ] Medir bundle size con analyzer

---

## 🎯 Estado Actual

### Completado (25%)
- ✅ Infraestructura de code splitting
- ✅ API de carga dinámica
- ✅ Sistema de cache
- ✅ Archivo de ejemplo (pecho.ts)
- ✅ Compatibilidad con código existente

### Pendiente (75%)
- ⏳ Dividir 12 grupos musculares restantes (3-4 horas)
- ⏳ Actualizar código existente (2-3 horas)
- ⏳ Aplicar a warmup exercises (2-3 horas)
- ⏳ Testing y verificación (1 hora)

### Tiempo Total Estimado
- **Completado:** 1 hora
- **Pendiente:** 8-11 horas
- **Total:** 9-12 horas

---

## 💡 Recomendación

### Opción 1: Implementación Completa (8-11 horas)
- Mayor impacto en bundle size (~200 KB)
- Requiere tiempo significativo
- Mejor para largo plazo

### Opción 2: Implementación Parcial (2-3 horas)
- Dividir solo los grupos más grandes (piernas, cardio, biceps, triceps)
- Impacto medio (~100 KB)
- Más rápido de implementar

### Opción 3: Posponer y Continuar con Otras Optimizaciones
- Lazy loading de calculadoras (2 horas, ~20 KB)
- Otras optimizaciones más rápidas
- Volver a code splitting cuando haya más tiempo

---

## ✅ Conclusión

La infraestructura para code splitting está lista y funcionando. El trabajo restante es principalmente manual (copiar y pegar ejercicios en archivos separados) pero tiene el mayor impacto en reducción de bundle size.

**Próxima decisión:** ¿Continuar con la división manual de ejercicios o pasar a otras optimizaciones más rápidas?

---

**Fecha de creación:** 2025-02-13  
**Tiempo invertido:** 1 hora  
**Progreso:** 25% completado  
**Impacto potencial:** ~200 KB de reducción
