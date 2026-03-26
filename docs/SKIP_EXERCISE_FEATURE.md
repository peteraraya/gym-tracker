# Funcionalidad de Omitir Ejercicios Durante Entrenamiento

## Resumen
Implementada funcionalidad para omitir ejercicios temporalmente durante una sesión de entrenamiento sin eliminarlos de la rutina. Los ejercicios omitidos se excluyen del cálculo de progreso y no se consideran en la navegación automática.

## Cambios Realizados

### 1. WorkoutContext (`context/WorkoutContext.tsx`)

#### Interfaz WorkoutState
```typescript
interface WorkoutState {
  // ... campos existentes
  skippedExercises?: string[]; // Array de exerciseIds omitidos
}
```

#### Interfaz WorkoutContextType
```typescript
interface WorkoutContextType {
  // ... métodos existentes
  skipExercise: (exerciseId: string) => void;
  unskipExercise: (exerciseId: string) => void;
}
```

#### Nuevas Funciones

**skipExercise(exerciseId: string)**
- Agrega un ejercicio a la lista de omitidos
- Persiste el cambio en Supabase y localStorage
- No elimina el ejercicio, solo lo marca como omitido para esta sesión

**unskipExercise(exerciseId: string)**
- Remueve un ejercicio de la lista de omitidos
- Restaura el ejercicio para que vuelva a contarse en el progreso
- Persiste el cambio en Supabase y localStorage

#### Normalización de Datos
- Actualizada función `normalizeActiveWorkout` para incluir `skippedExercises`
- Maneja correctamente arrays vacíos y valores undefined

### 2. QuickEditMode (`app/workout/[id]/components/QuickEditMode.tsx`)

#### Props Actualizadas
```typescript
interface QuickEditModeProps {
  workoutData: {
    // ... campos existentes
    skippedExercises?: string[];
  };
  onSkipExercise?: (exerciseId: string) => void;
  onUnskipExercise?: (exerciseId: string) => void;
}
```

#### Botón de Omitir/Restaurar
- Ubicado en el header del ejercicio, junto al botón de editar descanso
- Dos estados visuales:
  - **Omitir**: Botón amarillo con icono de usuario tachado
  - **Restaurar**: Botón verde con icono de recarga
- Tooltip descriptivo para cada estado

#### Indicadores Visuales

**Ejercicio Omitido:**
- Opacidad reducida (40%)
- Ring amarillo alrededor del card
- Badge "OMITIDO" en amarillo en el header
- Los badges "ACTUAL" y "SIGUIENTE" no se muestran si está omitido

**Card del Ejercicio:**
```typescript
className={`overflow-hidden ${
  isSkipped
    ? 'opacity-40 ring-2 ring-yellow-400 dark:ring-yellow-600'
    : // ... otros estados
}`}
```

#### Cálculo de Progreso
- Ejercicios omitidos se excluyen del total de series
- Solo se cuentan series de ejercicios activos (no omitidos)
- Porcentaje de progreso se calcula solo sobre ejercicios activos

```typescript
const activeExercises = routine.exercises.filter(
  ex => !skippedExercises.includes(ex.id)
);
```

#### Navegación Automática
- Scroll automático salta ejercicios omitidos
- Búsqueda de siguiente serie incompleta ignora ejercicios omitidos
- Determinación de ejercicio "ACTUAL" y "SIGUIENTE" excluye omitidos

### 3. Autofocus en Siguiente Serie

#### Nueva Funcionalidad
Cuando se completa una serie, el foco se mueve automáticamente a la siguiente serie incompleta:

**findNextIncompleteSet()**
- Busca la siguiente serie incompleta en el ejercicio actual
- Si no hay más series, busca en ejercicios siguientes
- Salta ejercicios omitidos
- Determina si debe enfocar en reps o peso según valores existentes

**focusNextIncompleteSet()**
- Expande el ejercicio si está colapsado
- Hace scroll al ejercicio
- Abre automáticamente el modal de edición del campo correspondiente
- Usa refs para hacer click programático en el botón correcto

**Refs de Inputs:**
```typescript
const setInputRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

// En cada botón de reps/peso:
ref={(el) => {
  setInputRefs.current[`${exerciseId}-${setIdx}-reps`] = el;
}}
```

**Trigger en Checkbox:**
```typescript
onClick={() => {
  const newIsCompleted = !isCompleted;
  onToggleSetComplete(exerciseId, setIdx, newIsCompleted);
  
  if (newIsCompleted) {
    setTimeout(() => {
      focusNextIncompleteSet(exerciseId, setIdx);
    }, 100);
  }
}}
```

## Flujo de Usuario

### Omitir un Ejercicio
1. Usuario abre modo de edición rápida o modo guiado
2. Hace click en botón "Omitir" en el header del ejercicio
3. El ejercicio se marca visualmente como omitido (opacidad, ring amarillo, badge)
4. El progreso se recalcula excluyendo ese ejercicio
5. La navegación automática salta ese ejercicio

### Restaurar un Ejercicio
1. Usuario hace click en botón "Restaurar" en ejercicio omitido
2. El ejercicio vuelve a su estado normal
3. Se incluye nuevamente en el cálculo de progreso
4. Vuelve a considerarse en la navegación automática

### Completar Serie con Autofocus
1. Usuario completa una serie (marca checkbox)
2. Sistema busca la siguiente serie incompleta (saltando omitidos)
3. Si existe, expande el ejercicio y hace scroll
4. Abre automáticamente el modal de edición del campo apropiado
5. Usuario puede continuar editando sin interrupciones

## Casos Edge Manejados

### Ejercicios Omitidos
- ✅ Ejercicio omitido no cuenta para progreso
- ✅ No se considera "ACTUAL" o "SIGUIENTE"
- ✅ Scroll automático lo salta
- ✅ Autofocus de siguiente serie lo salta
- ✅ Se puede restaurar en cualquier momento
- ✅ Estado persiste en recarga (F5)

### Autofocus
- ✅ Si no hay siguiente serie en ejercicio actual, busca en siguientes
- ✅ Si siguiente ejercicio está colapsado, lo expande
- ✅ Si siguiente ejercicio está fuera de vista, hace scroll
- ✅ Determina correctamente si enfocar reps o peso
- ✅ No crashea si no hay más series incompletas

### Progreso
- ✅ 100% se alcanza cuando se completan todas las series de ejercicios activos
- ✅ Omitir ejercicio recalcula progreso inmediatamente
- ✅ Restaurar ejercicio recalcula progreso inmediatamente
- ✅ Progreso nunca excede 100%

## Persistencia

### Supabase
- Estado de ejercicios omitidos se guarda en `activeWorkout.skippedExercises`
- Se persiste en cada cambio (skip/unskip)
- Se restaura correctamente al recargar la página

### localStorage
- Backup local del estado de ejercicios omitidos
- Sincronizado con Supabase
- Usado como fallback si Supabase falla

## Beneficios

### Para el Usuario
- ✅ Flexibilidad para adaptar rutina durante entrenamiento
- ✅ No pierde progreso de ejercicios completados
- ✅ Puede omitir ejercicios por lesión, falta de equipo, etc.
- ✅ Fácil restaurar si cambia de opinión
- ✅ Flujo más rápido con autofocus automático

### Para el Sistema
- ✅ No modifica la rutina original
- ✅ Estado temporal solo para la sesión
- ✅ Cálculos de progreso más precisos
- ✅ Navegación automática más inteligente
- ✅ Mejor experiencia móvil con autofocus

## Mejoras Futuras Posibles

1. **Razón de Omisión**: Permitir al usuario indicar por qué omite (lesión, equipo, tiempo)
2. **Estadísticas**: Mostrar qué ejercicios se omiten más frecuentemente
3. **Sugerencias**: Sugerir alternativas cuando se omite un ejercicio
4. **Historial**: Ver historial de ejercicios omitidos en sesiones pasadas
5. **Modo Guiado**: Implementar la misma funcionalidad en modo guiado
6. **Confirmación**: Pedir confirmación antes de omitir ejercicio con series completadas

## Testing Recomendado

- [ ] Omitir ejercicio sin series completadas
- [ ] Omitir ejercicio con algunas series completadas
- [ ] Restaurar ejercicio omitido
- [ ] Verificar cálculo de progreso con ejercicios omitidos
- [ ] Verificar navegación automática salta omitidos
- [ ] Verificar autofocus salta ejercicios omitidos
- [ ] Recargar página (F5) y verificar estado persiste
- [ ] Omitir todos los ejercicios excepto uno
- [ ] Completar entrenamiento con ejercicios omitidos
- [ ] Verificar en modo oscuro
- [ ] Verificar en móvil
