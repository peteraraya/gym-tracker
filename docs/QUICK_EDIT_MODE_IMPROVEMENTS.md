# Mejoras al Modo de Edición Rápida

## Resumen
Se implementaron 3 funcionalidades prioritarias para mejorar la experiencia del usuario en el modo de edición rápida (tabla):

1. ✅ **Botón Copiar Serie Anterior** - Ahorra tiempo al copiar reps y peso
2. ✅ **Indicadores de Progreso** - Muestra mejoras vs última sesión
3. ✅ **Temporizador Flotante** - Mini temporizador visible al completar series

---

## 1. Botón Copiar Serie Anterior ⭐⭐⭐

### Descripción
Botón circular con icono de "↻" que permite copiar las repeticiones y peso de la serie anterior con un solo clic.

### Ubicación
- Nueva columna en la tabla de series (entre "Tipo" y "✓")
- Solo visible si existe una serie anterior con datos

### Funcionalidad
- Copia automáticamente reps y peso de la serie anterior (setIdx - 1)
- Tooltip muestra los valores que se copiarán
- Botón deshabilitado en la primera serie (no hay anterior)

### Código
```typescript
// Calcular si se puede copiar
const canCopyPrevious = setIdx > 0;
const previousReps = canCopyPrevious ? (actualReps[setIdx - 1] || exercise.sets[setIdx - 1]?.reps) : null;
const previousWeight = canCopyPrevious ? (actualWeights[setIdx - 1] || exercise.sets[setIdx - 1]?.weight) : null;

// Botón de copiar
<button
  onClick={() => {
    onEditReps(exerciseId, setIdx, previousReps);
    onEditWeight(exerciseId, setIdx, previousWeight);
  }}
  title={`Copiar serie anterior (${previousReps} reps × ${previousWeight}kg)`}
>
  ↻
</button>
```

---

## 2. Indicadores de Progreso ⭐⭐⭐

### Descripción
Badges visuales que muestran si mejoraste o empeoraste comparado con la última sesión del mismo ejercicio.

### Ubicación
- Esquina superior derecha de cada celda de reps/peso
- Solo visible cuando hay datos de sesión anterior

### Funcionalidad
- Compara reps y peso actuales con la última sesión
- Badge verde con "↗" para mejoras (+X reps, +Xkg)
- Badge naranja con "↘" para disminuciones (-X reps, -Xkg)
- No se muestra si no hay cambios o no hay sesión anterior

### Código
```typescript
// Buscar última sesión con este ejercicio
const lastSession = sessions
  .filter(s => s.exercises.some(e => e.exerciseName === exercise.name))
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

const lastExerciseData = lastSession?.exercises.find(e => e.exerciseName === exercise.name);
const lastReps = lastExerciseData?.actualReps?.[setIdx];
const lastWeight = lastExerciseData?.actualWeight?.[setIdx];

// Calcular diferencias
const repsDiff = (displayReps && lastReps) ? displayReps - lastReps : null;
const weightDiff = (displayWeight && lastWeight) ? displayWeight - lastWeight : null;

// Mostrar badge
{hasRepsProgress && (
  <div className={repsDiff > 0 ? 'bg-green-500' : 'bg-orange-500'}>
    {repsDiff > 0 ? '↗' : '↘'}{Math.abs(repsDiff)}
  </div>
)}
```

---

## 3. Temporizador Flotante ⭐⭐

### Descripción
Mini temporizador que aparece en la esquina superior derecha al completar una serie, mostrando el tiempo de descanso restante.

### Ubicación
- Esquina superior derecha (fixed top-20 right-4)
- No intrusivo, se puede cerrar con X

### Funcionalidad
- Se activa automáticamente al marcar una serie como completada (✓)
- Respeta la configuración de "Omitir descansos"
- Muestra tiempo en formato MM:SS
- Barra de progreso visual
- Mensaje motivacional cuando quedan ≤10 segundos
- Notificación cuando termina el tiempo
- Se puede cerrar manualmente

### Componente
Nuevo archivo: `app/workout/[id]/components/FloatingRestTimer.tsx`

```typescript
<FloatingRestTimer
  duration={restTime}
  onComplete={() => setShowFloatingTimer(false)}
  onDismiss={() => setShowFloatingTimer(false)}
/>
```

### Características visuales
- Gradiente azul-púrpura
- Animación slide-in-right
- Sombra 2xl para destacar
- Barra de progreso animada
- Icono de reloj
- Botón de cerrar (X)

---

## Archivos Modificados

1. **app/workout/[id]/components/QuickEditMode.tsx**
   - Agregado prop `sessions` para comparar progreso
   - Nueva columna "↻" en tabla de series
   - Lógica de cálculo de progreso
   - Badges de indicadores en celdas
   - Estado y lógica del temporizador flotante
   - Import del componente FloatingRestTimer

2. **app/workout/[id]/page.tsx**
   - Agregado prop `sessions={sessions}` al componente QuickEditMode

3. **app/workout/[id]/components/FloatingRestTimer.tsx** (NUEVO)
   - Componente independiente para el temporizador
   - Countdown con formato MM:SS
   - Barra de progreso
   - Callbacks onComplete y onDismiss

---

## Beneficios

### Botón Copiar Serie Anterior
- ⏱️ Ahorra ~5-10 segundos por serie
- 🎯 Reduce errores de transcripción
- 💪 Facilita mantener consistencia en el entrenamiento

### Indicadores de Progreso
- 📈 Motivación instantánea al ver mejoras
- 🎯 Feedback visual inmediato
- 📊 Ayuda a identificar ejercicios donde hay regresión

### Temporizador Flotante
- ⏰ Siempre visible sin ocupar toda la pantalla
- 🎯 No interrumpe el flujo de trabajo
- 💪 Ayuda a mantener descansos consistentes
- ✨ Mensajes motivacionales para mantener energía

---

## Próximas Mejoras Sugeridas

1. **Historial de Series** - Ver últimas 3 sesiones en tooltip
2. **Sugerencias Inteligentes** - Recomendar peso basado en progresión 2-for-2
3. **Gráficos de Progreso** - Mini gráfico de tendencia por ejercicio
4. **Notas Rápidas** - Agregar nota a una serie específica
5. **Comparación de Volumen** - Mostrar volumen total (reps × peso) vs última sesión
