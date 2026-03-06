# Sistema de Récords Personales (PR)

## Descripción
Sistema completo para detectar, celebrar y mostrar récords personales de peso por ejercicio durante los entrenamientos.

## Fecha de Implementación
6 de marzo de 2026

## Problema Resuelto
El usuario solicitó que cuando aumente el peso en un ejercicio, se marque como récord logrado y se celebre visualmente para mantener la motivación.

## Implementación

### 1. Librería de Récords (`lib/personalRecords.ts`)

Funciones principales:

#### `getPersonalRecord(exerciseId, sessions)`
- Obtiene el récord actual para un ejercicio específico
- Busca en todas las sesiones históricas el peso máximo levantado
- Retorna: `{ exerciseId, exerciseName, maxWeight, reps, date, sessionId }`

#### `compareWithRecord(exerciseId, weight, sessions)`
- Compara un peso con el récord actual
- Detecta si es un nuevo récord
- Calcula mejora absoluta y porcentual
- Retorna: `{ isNewRecord, previousRecord, improvement, improvementPercentage }`

#### `getAllPersonalRecords(sessions)`
- Obtiene todos los récords del usuario
- Útil para pantallas de estadísticas

#### `getRecordHistory(exerciseId, sessions)`
- Historial cronológico de récords para un ejercicio
- Solo incluye pesos que superaron el récord anterior

#### `getProgressionStats(exerciseId, sessions)`
- Estadísticas de progresión completas
- Incluye: total de récords, mejora total, días transcurridos, promedio de mejora

#### `calculateExerciseProgress(sessions, exerciseName)`
- Calcula el progreso entre las últimas 2 sesiones
- Determina tendencia: 'up', 'down', 'stable'
- Usado en el dashboard de progreso

### 2. Integración en Workout Page

#### Estado Agregado
```typescript
const [newRecord, setNewRecord] = useState<{
  exerciseId: string, 
  exerciseName: string, 
  weight: number, 
  previousRecord: number
} | null>(null);
const [showRecordCelebration, setShowRecordCelebration] = useState(false);
```

#### Récord Actual del Ejercicio
```typescript
const currentExerciseRecord = useMemo(() => {
  if (!currentExercise || sessions.length === 0) return null;
  return getPersonalRecord(currentExercise.id, sessions);
}, [currentExercise?.id, sessions]);
```

#### Función de Detección y Celebración
```typescript
const checkAndCelebrateRecord = useCallback((exerciseId, exerciseName, weight) => {
  if (weight <= 0) return;
  
  const comparison = compareWithRecord(exerciseId, weight, sessions);
  
  if (comparison.isNewRecord) {
    // Haptic feedback especial
    haptic.achievement();
    
    // Guardar datos del récord
    setNewRecord({ exerciseId, exerciseName, weight, previousRecord });
    setShowRecordCelebration(true);
    
    // Ocultar después de 4 segundos
    setTimeout(() => setShowRecordCelebration(false), 4000);
    
    // Toast motivacional
    if (comparison.previousRecord) {
      success(`🏆 ¡NUEVO RÉCORD! ${weight}kg (+${improvement}kg, +${percent}%)`);
    } else {
      success(`🏆 ¡PRIMER RÉCORD! ${weight}kg en ${exerciseName}`);
    }
  }
}, [sessions, haptic, success]);
```

#### Puntos de Detección

1. **Al completar serie** (`handleCompleteSet`):
   ```typescript
   workoutState.completeSet(exerciseId, repsValue, weightValue);
   checkAndCelebrateRecord(exerciseId, currentExercise.name, weightValue);
   ```

2. **Al editar peso en modo guiado** (`handleEditWeight`):
   ```typescript
   workoutState.updateActualWeights(exerciseId, newWeights);
   checkAndCelebrateRecord(exerciseId, currentExercise.name, weight);
   ```

3. **Al editar peso en modo rápido** (`handleQuickEditWeight`):
   ```typescript
   workoutState.updateActualWeights(exerciseId, newWeights);
   checkAndCelebrateRecord(exerciseId, exercise.name, weight);
   ```

### 3. Componente de Celebración Visual

Ubicación: Inline en `app/workout/[id]/page.tsx`

Características:
- Overlay fullscreen con fondo semi-transparente
- Tarjeta con gradiente dorado-naranja-rojo
- Trofeo animado (🏆) con pulse
- Título "¡NUEVO RÉCORD!"
- Nombre del ejercicio
- Peso actual destacado
- Comparación con récord anterior
- Mensaje motivacional
- Animación de entrada: `bounce-in` (escala + rotación)
- Duración: 4 segundos
- No bloquea interacción (pointer-events-none en overlay)

### 4. Indicador de Récord en ExerciseCard

Ubicación: `app/workout/[id]/components/ExerciseCard.tsx`

Características:
- Badge dorado con gradiente
- Icono de trofeo 🏆
- Muestra el peso del récord actual
- Ubicado junto al número de serie
- Visible en todo momento durante el ejercicio

Prop agregado:
```typescript
personalRecord?: { maxWeight: number; reps: number; date: Date } | null;
```

Render:
```tsx
{personalRecord && personalRecord.maxWeight > 0 && (
  <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-bold rounded-full shadow-sm flex items-center gap-1">
    🏆 {personalRecord.maxWeight}kg
  </span>
)}
```

### 5. Animación CSS

Ubicación: `app/globals.css`

```css
@keyframes bounce-in {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(10deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.animate-bounce-in {
  animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

## Flujo de Usuario

### Escenario 1: Nuevo Récord al Completar Serie
1. Usuario completa serie con peso mayor al récord
2. Sistema detecta récord automáticamente
3. Vibración especial (haptic feedback)
4. Aparece celebración visual con animación
5. Toast con detalles de mejora
6. Badge de récord se actualiza en el header

### Escenario 2: Nuevo Récord al Editar Peso
1. Usuario edita peso de una serie completada
2. Si el nuevo peso supera el récord, se detecta
3. Misma celebración visual y feedback
4. Útil para correcciones o ajustes posteriores

### Escenario 3: Primer Récord
1. Primera vez que se registra peso para un ejercicio
2. Cualquier peso > 0 es considerado récord
3. Mensaje especial: "¡PRIMER RÉCORD!"
4. No muestra comparación (no hay récord anterior)

## Características Técnicas

### Optimizaciones
- `useMemo` para récord actual (evita recálculos)
- Detección solo cuando peso > 0
- Timeout automático de celebración (4s)
- No bloquea UI durante celebración

### Feedback Múltiple
1. **Visual**: Overlay con animación
2. **Háptico**: Vibración especial (`haptic.achievement()`)
3. **Toast**: Mensaje con detalles numéricos
4. **Badge**: Indicador permanente en UI

### Persistencia
- Récords se calculan desde sesiones guardadas
- No requiere almacenamiento adicional
- Historial completo disponible
- Funciona offline (PWA)

## Beneficios

### Para el Usuario
- Motivación inmediata al lograr récords
- Visualización clara de progreso
- Feedback positivo constante
- Gamificación del entrenamiento

### Para la App
- Engagement aumentado
- Retención mejorada
- Experiencia más satisfactoria
- Diferenciador competitivo

## Casos de Uso Adicionales

### Dashboard de Récords (Futuro)
```typescript
const allRecords = getAllPersonalRecords(sessions);
// Mostrar tabla de récords por ejercicio
```

### Historial de Progresión (Futuro)
```typescript
const history = getRecordHistory(exerciseId, sessions);
// Gráfico de evolución de récords
```

### Estadísticas Avanzadas (Futuro)
```typescript
const stats = getProgressionStats(exerciseId, sessions);
// Análisis de mejora promedio, tiempo entre récords, etc.
```

## Testing

### Casos a Probar
1. ✅ Primer récord en ejercicio nuevo
2. ✅ Superar récord existente
3. ✅ Peso igual al récord (no celebra)
4. ✅ Peso menor al récord (no celebra)
5. ✅ Editar peso después de completar
6. ✅ Múltiples récords en misma sesión
7. ✅ Récord en modo guiado
8. ✅ Récord en modo edición rápida

### Validaciones
- Peso 0 no genera récord
- Comparación correcta con sesiones anteriores
- Animación se oculta automáticamente
- Badge muestra récord correcto
- Toast muestra cálculos precisos

## Archivos Modificados

1. `lib/personalRecords.ts` - Creado (lógica completa)
2. `app/workout/[id]/page.tsx` - Integración y detección
3. `app/workout/[id]/components/ExerciseCard.tsx` - Badge de récord
4. `app/globals.css` - Animación bounce-in
5. `components/ProgressDashboard.tsx` - Usa calculateExerciseProgress

## Próximos Pasos (Opcional)

1. **Página de Récords**: Vista dedicada con todos los récords
2. **Gráficos de Progresión**: Visualización de evolución
3. **Comparación Social**: Récords vs otros usuarios (si hay backend)
4. **Logros por Récords**: Badges especiales por hitos
5. **Notificaciones Push**: Recordatorios de récords antiguos
6. **Exportar Récords**: Compartir en redes sociales

## Notas de Implementación

- Sistema completamente funcional y probado
- No requiere cambios en base de datos
- Compatible con modo offline
- Rendimiento optimizado con memoización
- Feedback inmediato y satisfactorio
- Código limpio y bien documentado
