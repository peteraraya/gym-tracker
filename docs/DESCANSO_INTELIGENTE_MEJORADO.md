# ✅ Descanso Inteligente - Aplicar a Todas las Series

## Problema Resuelto

Antes, aunque activaras el descanso inteligente, los dropdowns de cada serie seguían mostrando 60s y tenías que cambiarlos uno por uno.

## Solución Implementada

### Botón "Aplicar a Todas las Series"

Cuando el descanso inteligente está activado, ahora aparece un botón que aplica el tiempo recomendado a TODAS las series del ejercicio actual de una sola vez.

## Interfaz

### Antes
```
┌─────────────────────────────────────┐
│ 🧠 Descanso inteligente      [ON]   │
│                                     │
│ 4min 48s                            │
│ Descanso largo para recuperación... │
│ Rango: 3min - 5min                  │
└─────────────────────────────────────┘

Serie 1: Descanso [60s ▼]  ← Sigue en 60s
Serie 2: Descanso [60s ▼]  ← Sigue en 60s
Serie 3: Descanso [60s ▼]  ← Sigue en 60s
```

### Ahora
```
┌─────────────────────────────────────┐
│ 🧠 Descanso inteligente      [ON]   │
│                                     │
│ 4min 48s                            │
│ Descanso largo para recuperación... │
│ Rango: 3min - 5min                  │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ⚡ Aplicar 4min 48s a todas     │ │
│ │    las series                   │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

Serie 1: Descanso [288s ▼]  ← Aplicado!
Serie 2: Descanso [288s ▼]  ← Aplicado!
Serie 3: Descanso [288s ▼]  ← Aplicado!
```

## Cómo Funciona

### 1. Activar Descanso Inteligente
```
1. Toggle "Descanso inteligente" → ON
2. Aparece el tiempo recomendado (ej: 4min 48s)
3. Aparece el botón "⚡ Aplicar X a todas las series"
```

### 2. Aplicar a Todas
```
1. Click en "⚡ Aplicar 4min 48s a todas las series"
2. TODAS las series del ejercicio actual se actualizan
3. Los dropdowns muestran el nuevo valor (288s)
```

### 3. Editar Individual (Opcional)
```
1. Después de aplicar a todas
2. Puedes cambiar series individuales
3. Ej: Serie 1 → 240s (4min)
4. Las demás siguen con 288s
```

## Casos de Uso

### Caso 1: Aplicar Descanso Inteligente
```
Ejercicio: Sentadillas (5 series)
Descanso inteligente: 4min 48s

Acción:
1. Activa descanso inteligente
2. Click en "Aplicar a todas"
3. Todas las series → 288s

Resultado:
✅ 5 series con 4min 48s de descanso
✅ Un solo click
```

### Caso 2: Aplicar y Personalizar
```
Ejercicio: Press Banca (4 series)
Descanso inteligente: 3min

Acción:
1. Activa descanso inteligente
2. Click en "Aplicar a todas"
3. Serie 1 (calentamiento) → Cambias a 1min
4. Series 2-4 → Quedan en 3min

Resultado:
✅ Serie 1: 1min (personalizado)
✅ Series 2-4: 3min (inteligente)
```

### Caso 3: Cambiar Todas Manualmente
```
Ejercicio: Curl Bíceps (3 series)
Quieres: 90s para todas

Acción:
1. Descanso inteligente OFF
2. Serie 1 → Cambias a 90s
3. Serie 2 → Cambias a 90s
4. Serie 3 → Cambias a 90s

Resultado:
✅ 3 series con 90s
❌ 3 clicks (más lento)
```

## Ventajas

### ✅ Rapidez
- Un solo click para aplicar a todas
- No necesitas cambiar serie por serie
- Ahorra tiempo en entrenamientos

### ✅ Flexibilidad
- Aplicas a todas Y puedes personalizar después
- No pierdes control individual
- Mejor de ambos mundos

### ✅ Claridad
- Ves el tiempo recomendado claramente
- Botón obvio y fácil de usar
- No hay confusión

## Comportamiento Técnico

### Función `handleEditRestOverride`
```typescript
const handleEditRestOverride = (exerciseId: string, value: number) => {
  setRestOverrides(prev => {
    const copy = { ...prev, [exerciseId]: value };
    return copy;
  });
};
```

### Cuando Aplicas a Todas
```typescript
onClick={() => {
  // Aplica el descanso inteligente a TODAS las series
  handleEditRestOverride(currentExercise.id, restRecommendation.recommended);
}}
```

### Resultado
- Se guarda en `restOverrides[exerciseId]`
- Todos los dropdowns de ese ejercicio usan ese valor
- Puedes cambiar individuales después (override del override)

## Prioridad de Descanso

### Orden de Aplicación
```
1. Override individual (dropdown de cada serie)
2. Override del ejercicio (botón "Aplicar a todas")
3. Descanso del ejercicio (configurado en rutina)
4. Descanso global de la rutina
5. Descanso inteligente (si está activado)
6. Fallback: 60s
```

### Ejemplo
```
Rutina: 90s global
Ejercicio: Sin configurar
Inteligente: 4min 48s (288s)
Override ejercicio: No aplicado

Resultado: 90s (usa el de la rutina)

Después de "Aplicar a todas":
Override ejercicio: 288s

Resultado: 288s (usa el override)
```

## Archivo Modificado

- ✅ `app/workout/[id]/page.tsx`

## Documentación Relacionada

- `docs/SMART_REST_SYSTEM.md` - Sistema de descanso inteligente
- `lib/restCalculator.ts` - Cálculos de descanso

## Estado

🎉 **COMPLETADO** - Botón "Aplicar a todas" implementado

---

**Fecha**: 26 de febrero de 2026  
**Mejora**: UX de descanso inteligente  
**Estado**: ✅ IMPLEMENTADO
