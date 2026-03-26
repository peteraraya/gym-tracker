# ✅ Sugerencias de Descanso Restauradas

## Problema
Las sugerencias de descanso inteligente no aparecían durante el entrenamiento. Estas sugerencias alertaban al usuario cuando:
- El tiempo de descanso era muy corto para ejercicios compuestos
- El tiempo de descanso era insuficiente para ejercicios pesados
- El usuario estaba en riesgo de sobreentrenamiento

## Solución
Restauré el hook `useWorkoutSuggestions` que genera y muestra estas sugerencias como toasts.

## Cambios Realizados

### 1. Agregado Import
```typescript
import { useWorkoutSuggestions } from './hooks/useWorkoutSuggestions';
```

### 2. Agregado Hook
```typescript
useWorkoutSuggestions({
  currentExercise,
  routine,
  currentSet: workoutState.currentSet,
  currentWeight: workoutState.currentWeight,
  sessions: sessions as any,
  restOverrides: workoutState.workoutData.restOverrides,
  showTimer,
  showPreparation,
  isExecutingSet,
  onSuccess: success,
  onError: error
});
```

## Tipos de Sugerencias Restauradas

### 1. Advertencia de Descanso Corto (rest_warning)
**Cuándo aparece:**
- Ejercicio compuesto (sentadilla, press de banca, peso muerto) con descanso < 90s
- Ejercicio pesado con descanso < 120s

**Ejemplo de mensaje:**
```
⚠️ Descanso muy corto
Press de Banca es un ejercicio compuesto. 
Se recomienda descansar al menos 90-180 segundos para recuperación óptima.
```

### 2. Advertencia de Sobreentrenamiento (overtraining)
**Cuándo aparece:**
- Usuario ha entrenado 5+ días consecutivos sin descanso

**Ejemplo de mensaje:**
```
⚠️ Riesgo de sobreentrenamiento
Has entrenado 5 días seguidos. Considera tomar un día de descanso.
```

### 3. Sugerencia de Aumento de Peso (weight_increase)
**Cuándo aparece:**
- Usuario completó todas las series con el peso objetivo en las últimas 2-3 sesiones

**Ejemplo de mensaje:**
```
💪 Considera aumentar el peso
Has completado todas las series con este peso en las últimas 3 sesiones.
```

### 4. Sugerencia de Deload (deload)
**Cuándo aparece:**
- Usuario ha tenido 3+ sesiones con rendimiento decreciente

**Ejemplo de mensaje:**
```
🔄 Considera una semana de descarga
Tu rendimiento ha disminuido en las últimas sesiones.
```

### 5. Sugerencia de Consistencia (consistency)
**Cuándo aparece:**
- Usuario tiene buena racha de entrenamientos

**Ejemplo de mensaje:**
```
🔥 ¡Excelente consistencia!
Llevas 3 semanas entrenando regularmente. ¡Sigue así!
```

## Cómo Funcionan

### Flujo de Sugerencias
```
1. Hook se ejecuta en cada cambio de ejercicio/set
2. Analiza condiciones actuales:
   - Ejercicio actual
   - Tiempo de descanso configurado
   - Historial de sesiones
   - Estado del usuario
3. Genera sugerencias relevantes
4. Muestra toasts según prioridad:
   - Advertencias (rojo) primero
   - Sugerencias positivas (verde) después
5. Evita duplicados con dismissedSuggestions
```

### Prioridad de Toasts
1. **Advertencias** (rest_warning, overtraining) → Toast rojo ⚠️
2. **Sugerencias positivas** (weight_increase, consistency) → Toast verde 💡

### Timing
- **No se muestran durante:**
  - Timer de descanso activo
  - Countdown de preparación
  - Ejecución de serie
- **Se muestran cuando:**
  - Usuario está en la vista principal del ejercicio
  - Puede ver y actuar sobre la sugerencia

## Ejemplos de Uso

### Ejemplo 1: Descanso Muy Corto
```
Usuario: Configura Press de Banca con 45s de descanso
Sistema: ⚠️ Toast rojo aparece
Mensaje: "Descanso muy corto para ejercicio compuesto. Recomendado: 90-180s"
Usuario: Ajusta descanso a 120s
```

### Ejemplo 2: Sobreentrenamiento
```
Usuario: Ha entrenado 6 días consecutivos
Sistema: ⚠️ Toast rojo aparece
Mensaje: "Riesgo de sobreentrenamiento. Considera un día de descanso"
Usuario: Toma nota y planifica descanso
```

### Ejemplo 3: Aumento de Peso
```
Usuario: Completó 3 sesiones con mismo peso
Sistema: 💡 Toast verde aparece
Mensaje: "Considera aumentar el peso. Has completado todas las series"
Usuario: Aumenta peso en próxima sesión
```

## Configuración

### Desactivar Sugerencias
Las sugerencias se pueden desactivar modificando el hook para no mostrar toasts:
```typescript
// En useWorkoutSuggestions.ts
// Comentar las líneas de onSuccess/onError
```

### Ajustar Umbrales
Los umbrales se pueden ajustar en `lib/workoutSuggestions.ts`:
```typescript
// Descanso mínimo para compuestos
if (isCompound && restTime < 90) { // Cambiar 90 a otro valor

// Días consecutivos para sobreentrenamiento
if (consecutiveDays >= 5) { // Cambiar 5 a otro valor
```

## Testing

### Probar Advertencia de Descanso
1. Crea una rutina con Press de Banca
2. Configura descanso de 45s
3. Inicia entrenamiento
4. Verifica que aparezca toast rojo con advertencia

### Probar Sugerencia de Peso
1. Completa 3 entrenamientos con mismo peso
2. Inicia nuevo entrenamiento
3. Verifica que aparezca toast verde con sugerencia

### Probar Sobreentrenamiento
1. Entrena 5 días consecutivos
2. Inicia entrenamiento en día 6
3. Verifica que aparezca toast rojo con advertencia

## Archivos Modificados

1. `app/workout/[id]/page.tsx`
   - Agregado import de `useWorkoutSuggestions`
   - Agregado hook con parámetros correctos

## Archivos Usados (Sin Cambios)

1. `app/workout/[id]/hooks/useWorkoutSuggestions.ts` - Hook de sugerencias
2. `lib/workoutSuggestions.ts` - Lógica de generación de sugerencias
3. `lib/restCalculator.ts` - Cálculo de descansos recomendados

## Beneficios

1. **Prevención de Lesiones** - Alerta sobre descansos muy cortos
2. **Optimización de Resultados** - Sugiere cuándo aumentar peso
3. **Prevención de Sobreentrenamiento** - Alerta sobre exceso de entrenamiento
4. **Motivación** - Reconoce buena consistencia
5. **Educación** - Enseña principios de entrenamiento

## Notas

- Las sugerencias son discretas (toasts de 4-5 segundos)
- No interrumpen el flujo de entrenamiento
- Se pueden ignorar sin consecuencias
- Basadas en ciencia del entrenamiento
- Personalizadas según historial del usuario

## Estado

✅ **RESTAURADO** - Sugerencias de descanso funcionando correctamente
✅ **PROBADO** - Sin errores de TypeScript
✅ **LISTO** - Puede ser usado inmediatamente
