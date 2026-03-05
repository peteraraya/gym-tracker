# Mejoras de Descanso en Modo Edición Rápida

## Cambios Implementados

### 1. Indicador de Descanso en Header del Ejercicio

**Ubicación**: Header de cada ejercicio en QuickEditMode

**Características**:
- Muestra el tiempo de descanso actual del ejercicio
- Visible siempre, incluso cuando el ejercicio está colapsado
- Formato: "Descanso: XXs" o "Descanso: Xm" para tiempos mayores a 60s
- Icono de reloj para mejor identificación visual

**Código**:
```tsx
<div className="px-2.5 pb-2 flex items-center justify-between gap-2">
  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span className="font-medium">
      Descanso: {restTime}s
    </span>
  </div>
</div>
```

---

### 2. Botón "Editar" para Modificar Descanso

**Ubicación**: Al lado del indicador de descanso en el header

**Características**:
- Botón pequeño con icono de lápiz
- Color azul para indicar acción de edición
- Abre modal de edición al hacer click
- Solo visible si `onEditRestTime` está disponible

**Funcionalidad**:
- Obtiene el tiempo de descanso actual (override o default)
- Abre modal con el valor actual pre-cargado
- Permite edición rápida sin salir del flujo

---

### 3. Modal de Edición de Tiempo de Descanso

**Características**:
- BottomSheet con título del ejercicio
- Input grande (text-5xl) para escribir directamente
- Auto-focus y selección automática del valor
- Validación: solo números enteros

**Atajos rápidos**:
- 30s, 60s, 90s, 120s (2m)
- 180s (3m), 240s (4m), 300s (5m), 360s (6m)
- Botones con formato legible (segundos o minutos)

**Teclado numérico**:
- Grid 3x3 con números 1-9
- Botón 0 en la parte inferior
- Botón borrar (⌫) para eliminar dígitos
- Diseño táctil optimizado para móvil

**Botones de acción**:
- Cancelar: Cierra sin guardar
- Guardar: Aplica el cambio y muestra toast de confirmación

---

### 4. Botón "Aplicar Descanso Inteligente"

**Ubicación**: Debajo del botón "Agregar Serie"

**Características**:
- Solo visible si `onApplySmartRest` está disponible
- Solo visible si el ejercicio tiene `useSmartRest !== false`
- Color púrpura para diferenciarlo de otros botones
- Icono de rayo (⚡) para indicar "inteligente"
- Borde punteado para indicar acción opcional

**Funcionalidad**:
- Calcula el descanso inteligente basado en el tipo de ejercicio
- Aplica el tiempo calculado a todas las series del ejercicio
- Muestra toast con el tiempo aplicado

**Código**:
```tsx
{onApplySmartRest && exercise.useSmartRest !== false && (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onApplySmartRest(exerciseId);
    }}
    className="w-full py-2 px-3 bg-white dark:bg-gray-800 border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-lg text-purple-600 dark:text-purple-400 hover:border-purple-500 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all font-medium text-xs flex items-center justify-center gap-1.5"
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
    Aplicar Descanso Inteligente
  </button>
)}
```

---

## Nuevas Props en QuickEditMode

### `onEditRestTime?: (exerciseId: string, restTime: number) => void`

Callback para guardar el tiempo de descanso editado.

**Implementación en workout page**:
```tsx
onEditRestTime={(exerciseId, restTime) => {
  workoutState.updateRestOverride(exerciseId, restTime);
  success(`⏱️ Descanso actualizado a ${restTime}s`, 2000);
}}
```

---

### `onApplySmartRest?: (exerciseId: string) => void`

Callback para aplicar descanso inteligente al ejercicio.

**Implementación en workout page**:
```tsx
onApplySmartRest={(exerciseId) => {
  const exercise = routine.exercises.find((ex: Exercise) => ex.id === exerciseId);
  if (exercise && smartRestTime) {
    workoutState.updateRestOverride(exerciseId, smartRestTime);
    success(`⚡ Descanso inteligente aplicado: ${smartRestTime}s`, 2000);
  }
}}
```

---

## Actualización de workoutData

Agregado soporte para `restOverrides` y `perSetRestOverrides`:

```tsx
workoutData: {
  completedSets: { [key: string]: number };
  actualReps: { [key: string]: number[] };
  actualWeights: { [key: string]: number[] };
  setTypes: { [key: string]: string[] };
  restOverrides?: { [key: string]: number };        // ✅ NUEVO
  perSetRestOverrides?: { [key: string]: number[] }; // ✅ NUEVO
}
```

---

## Estado Interno del Componente

### Nuevo estado para edición de descanso:

```tsx
const [editingRestTime, setEditingRestTime] = useState<{
  exerciseId: string;
  exerciseName: string;
  currentRestTime: number;
} | null>(null);

const [tempRestTime, setTempRestTime] = useState<string>('');
const restInputRef = useRef<HTMLInputElement>(null);
```

### Nuevas funciones:

1. **startEditingRestTime**: Abre el modal con el valor actual
2. **saveRestTime**: Guarda el tiempo editado y cierra el modal
3. **cancelRestEdit**: Cierra el modal sin guardar

---

## UX Mejorada

### Feedback Visual:
- Toast de confirmación al guardar: "⏱️ Descanso actualizado a XXs"
- Toast al aplicar descanso inteligente: "⚡ Descanso inteligente aplicado: XXs"
- Colores distintivos (azul para editar, púrpura para inteligente)

### Accesibilidad:
- Auto-focus en inputs
- Selección automática del valor actual
- Botones grandes (min-height: 44px) para táctil
- Teclado numérico optimizado para móvil

### Consistencia:
- Mismo diseño que el modal de edición de reps/peso
- Mismos patrones de interacción
- Misma estructura de BottomSheet

---

## Archivos Modificados

1. **app/workout/[id]/components/QuickEditMode.tsx**:
   - Agregadas props `onEditRestTime` y `onApplySmartRest`
   - Agregado indicador de descanso en header
   - Agregado botón "Editar" en header
   - Agregado botón "Aplicar Descanso Inteligente"
   - Agregado modal de edición de descanso
   - Agregado estado y funciones para manejar edición

2. **app/workout/[id]/page.tsx**:
   - Agregadas implementaciones de `onEditRestTime` y `onApplySmartRest`
   - Conectado con `workoutState.updateRestOverride`
   - Agregados toasts de confirmación

---

## Resultado Final

El modo de edición rápida ahora permite:

✅ Ver el tiempo de descanso actual de cada ejercicio
✅ Editar el tiempo de descanso con un modal intuitivo
✅ Aplicar descanso inteligente con un solo click
✅ Atajos rápidos para tiempos comunes (30s, 60s, 90s, etc.)
✅ Teclado numérico táctil para edición rápida
✅ Feedback visual con toasts de confirmación

**La experiencia es consistente con el resto de la app y optimizada para uso móvil.**
