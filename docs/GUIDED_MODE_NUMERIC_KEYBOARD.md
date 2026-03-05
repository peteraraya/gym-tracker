# Teclado Numérico en Modo Guiado

## Cambios Implementados

### Problema Original
En el modo guiado, los inputs de repeticiones y peso eran campos inline simples que requerían usar el teclado del sistema operativo, lo cual no era óptimo para móvil.

### Solución
Replicar el sistema de modal con teclado numérico del modo de edición rápida en el modo guiado.

---

## Nuevo Componente: EditValueModal

**Ubicación**: `app/workout/[id]/components/EditValueModal.tsx`

### Características:
- Modal reutilizable para editar reps o peso
- Teclado numérico táctil optimizado para móvil
- Auto-focus y selección automática del valor
- Atajos rápidos contextuales
- Validación de entrada según el tipo de campo

### Props:
```typescript
interface EditValueModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  field: 'reps' | 'weight';
  currentValue: number | '';
  onSave: (value: number) => void;
  historicalWeights?: number[];
}
```

### Funcionalidades:

#### Para Repeticiones:
- Input grande (text-5xl) con auto-focus
- Atajos rápidos: 8, 10, 12, 15, 20
- Teclado numérico 3x3
- Solo acepta números enteros

#### Para Peso:
- Input grande (text-5xl) con auto-focus
- Pesos anteriores (hasta 4 valores únicos)
- Incrementos rápidos: +2.5kg, +5kg, +10kg, +20kg
- Teclado numérico con botón decimal (.)
- Acepta números decimales

#### Teclado Numérico:
- Grid 3x3 con números 1-9
- Botón 0 en la parte inferior
- Botón decimal (.) solo para peso
- Botón borrar (⌫) para eliminar dígitos
- Botones grandes (h-16) optimizados para táctil
- Feedback visual con active:scale-95

---

## Cambios en ExerciseCard

**Archivo**: `app/workout/[id]/components/ExerciseCard.tsx`

### Imports Actualizados:
```typescript
// Removidos:
- import { WeightSelector } from '@/components/WeightSelector';
- import { Input } from '@/components/ui/Input';

// Agregados:
+ import { EditValueModal } from './EditValueModal';
```

### Nuevo Estado:
```typescript
const [editingField, setEditingField] = useState<'reps' | 'weight' | null>(null);
```

### Inputs Reemplazados por Botones:

**Antes** (Inputs inline):
```tsx
<Input
  type="number"
  value={currentReps}
  onChange={(e) => onRepsChange(...)}
  className="text-center text-xl font-bold h-14"
/>
```

**Después** (Botones que abren modal):
```tsx
<button
  onClick={() => setEditingField('reps')}
  className="w-full min-h-[56px] px-3 py-2 rounded-lg transition-colors font-bold text-xl border-2 ..."
>
  {currentReps === '' || currentReps === 0 ? '-' : currentReps}
</button>
```

### Modales Agregados:
```tsx
{/* Modal de edición de repeticiones */}
<EditValueModal
  isOpen={editingField === 'reps'}
  onClose={() => setEditingField(null)}
  title={`${exercise.name} - Serie ${currentSet}`}
  field="reps"
  currentValue={currentReps}
  onSave={(value) => onRepsChange(value)}
/>

{/* Modal de edición de peso */}
<EditValueModal
  isOpen={editingField === 'weight'}
  onClose={() => setEditingField(null)}
  title={`${exercise.name} - Serie ${currentSet}`}
  field="weight"
  currentValue={currentWeight}
  onSave={(value) => onWeightChange(value)}
  historicalWeights={...}
/>
```

---

## Beneficios

### UX Mejorada:
1. **Consistencia**: Mismo sistema en modo guiado y modo edición rápida
2. **Táctil**: Botones grandes optimizados para móvil (min 44px)
3. **Rápido**: Atajos para valores comunes
4. **Intuitivo**: Teclado numérico familiar
5. **Visual**: Feedback claro con estados hover/active

### Funcionalidad:
1. **Auto-focus**: El input se enfoca automáticamente
2. **Selección**: El valor actual se selecciona para reemplazo rápido
3. **Validación**: Solo acepta valores válidos según el tipo
4. **Histórico**: Muestra pesos anteriores para referencia
5. **Incrementos**: Botones para ajustes rápidos de peso

### Rendimiento:
1. **Lazy**: Modal solo se renderiza cuando está abierto
2. **Ligero**: Componente reutilizable sin dependencias pesadas
3. **Eficiente**: Estado local mínimo

---

## Flujo de Usuario

### Editar Repeticiones:
1. Usuario hace click en el botón de repeticiones
2. Se abre modal con el valor actual seleccionado
3. Usuario puede:
   - Escribir directamente con el teclado del sistema
   - Usar atajos rápidos (8, 10, 12, 15, 20)
   - Usar teclado numérico táctil
4. Usuario presiona "Guardar"
5. Modal se cierra y el valor se actualiza

### Editar Peso:
1. Usuario hace click en el botón de peso
2. Se abre modal con el valor actual seleccionado
3. Usuario puede:
   - Escribir directamente con el teclado del sistema
   - Seleccionar un peso anterior
   - Usar incrementos rápidos (+2.5, +5, +10, +20)
   - Usar teclado numérico con decimal
4. Usuario presiona "Guardar"
5. Modal se cierra y el valor se actualiza

---

## Comparación: Antes vs Después

### Antes:
```
┌─────────────────────────────┐
│ Repeticiones                │
│ ┌─────────────────────────┐ │
│ │ [10]                    │ │ ← Input inline
│ └─────────────────────────┘ │
│                             │
│ Peso (kg)                   │
│ ┌─────────────────────────┐ │
│ │ [36.3] ▼                │ │ ← Dropdown
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### Después:
```
┌─────────────────────────────┐
│ Repeticiones                │
│ ┌─────────────────────────┐ │
│ │      10                 │ │ ← Botón clickeable
│ └─────────────────────────┘ │
│                             │
│ Peso (kg)                   │
│ ┌─────────────────────────┐ │
│ │    36.3 kg              │ │ ← Botón clickeable
│ └─────────────────────────┘ │
└─────────────────────────────┘

Al hacer click ↓

┌─────────────────────────────┐
│ Press de Banca - Serie 1    │
├─────────────────────────────┤
│                             │
│ Repeticiones                │
│                             │
│      [10]                   │ ← Input grande
│ ════════════════════════    │
│                             │
│ Atajos rápidos              │
│ [8] [10] [12] [15] [20]     │
│                             │
│ Teclado numérico            │
│ [1] [2] [3]                 │
│ [4] [5] [6]                 │
│ [7] [8] [9]                 │
│ [ ] [0] [⌫]                 │
│                             │
│ [Cancelar]  [Guardar]       │
└─────────────────────────────┘
```

---

## Archivos Modificados

1. **app/workout/[id]/components/EditValueModal.tsx** (NUEVO)
   - Componente reutilizable para edición con teclado numérico
   - 250+ líneas de código
   - Totalmente tipado con TypeScript

2. **app/workout/[id]/components/ExerciseCard.tsx** (MODIFICADO)
   - Removidos imports de Input y WeightSelector
   - Agregado import de EditValueModal
   - Agregado estado `editingField`
   - Reemplazados inputs por botones
   - Agregados dos instancias de EditValueModal

---

## Resultado Final

El modo guiado ahora tiene la misma experiencia de edición que el modo de edición rápida:

✅ Teclado numérico táctil optimizado para móvil
✅ Atajos rápidos para valores comunes
✅ Pesos anteriores para referencia
✅ Incrementos rápidos de peso
✅ Auto-focus y selección automática
✅ Validación de entrada
✅ Feedback visual claro
✅ Consistencia entre modos

**La experiencia de usuario es ahora uniforme y optimizada para dispositivos móviles en ambos modos de entrenamiento.**
