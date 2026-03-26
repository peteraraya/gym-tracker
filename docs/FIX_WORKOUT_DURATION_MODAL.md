# Fix: Duración del Entrenamiento en Modal de Finalizar

## Problema Identificado

Al finalizar un entrenamiento, no se muestra un modal con la duración calculada automáticamente. El usuario debería poder ver y ajustar la duración antes de guardar la sesión.

## Análisis del Código Actual

### Hook `useWorkoutCompletion` Existe Pero No Se Usa

El archivo `app/workout/[id]/hooks/useWorkoutCompletion.ts` ya tiene la lógica implementada:

```typescript
const openCompletionModal = useCallback((duration?: number) => {
  const calculatedDuration = duration || Math.floor((Date.now() - workoutStartTime - totalPausedTime) / 1000);
  // Redondear a intervalos de 5 segundos
  const roundedDuration = Math.round(calculatedDuration / 5) * 5;
  setProposedDuration(Math.max(roundedDuration, 60));
  setShowNotesModal(true);
}, [workoutStartTime, totalPausedTime]);
```

**Características del hook:**
- ✅ Calcula duración automáticamente: `Date.now() - workoutStartTime - totalPausedTime`
- ✅ Redondea a intervalos de 5 segundos
- ✅ Duración mínima de 60 segundos
- ✅ Permite override manual de duración
- ✅ Maneja notas de sesión
- ✅ Calcula volumen total
- ✅ Detecta logros desbloqueados

### Problema

El hook `useWorkoutCompletion` NO se está usando en `app/workout/[id]/page.tsx`. La página actual no tiene:
- ❌ Import del hook
- ❌ Llamada a `useWorkoutCompletion`
- ❌ Modal de finalizar con duración
- ❌ Input para notas de sesión

## Solución Requerida

### 1. Integrar el Hook en la Página Principal

Agregar en `app/workout/[id]/page.tsx`:

```typescript
import { useWorkoutCompletion } from './hooks/useWorkoutCompletion';

// Dentro del componente:
const {
  showNotesModal,
  setShowNotesModal,
  proposedDuration,
  setProposedDuration,
  sessionNotes,
  setSessionNotes,
  openCompletionModal,
  finishWorkout: finishWorkoutWithData
} = useWorkoutCompletion({
  routine,
  workoutStartTime,
  totalPausedTime,
  sessions,
  addSession,
  finishWorkoutContext,
  onSuccess: success,
  onError: error,
  router,
  onWorkoutComplete: triggerSuccess,
  onAchievementUnlocked: triggerMedium
});
```

### 2. Crear Modal de Finalizar

Crear componente `app/workout/[id]/components/FinishWorkoutModal.tsx`:

```typescript
interface FinishWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposedDuration: number;
  onDurationChange: (duration: number) => void;
  sessionNotes: string;
  onNotesChange: (notes: string) => void;
  onFinish: () => void;
  isSaving: boolean;
}

export function FinishWorkoutModal({
  isOpen,
  onClose,
  proposedDuration,
  onDurationChange,
  sessionNotes,
  onNotesChange,
  onFinish,
  isSaving
}: FinishWorkoutModalProps) {
  const hours = Math.floor(proposedDuration / 3600);
  const minutes = Math.floor((proposedDuration % 3600) / 60);
  const seconds = proposedDuration % 60;

  const updateDuration = (h: number, m: number, s: number) => {
    const total = h * 3600 + m * 60 + s;
    onDurationChange(Math.max(total, 60)); // Mínimo 1 minuto
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Finalizar Entrenamiento">
      <div className="space-y-6 p-4">
        {/* Duración */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Duración del Entrenamiento
          </label>
          <div className="grid grid-cols-3 gap-3">
            {/* Horas */}
            <div>
              <label className="text-xs text-gray-500 block mb-1">Horas</label>
              <input
                type="number"
                min="0"
                max="23"
                value={hours}
                onChange={(e) => {
                  const h = Math.max(0, Math.min(23, parseInt(e.target.value) || 0));
                  updateDuration(h, minutes, seconds);
                }}
                className="w-full p-2 text-center text-lg font-bold border-2 rounded-lg"
              />
            </div>
            
            {/* Minutos */}
            <div>
              <label className="text-xs text-gray-500 block mb-1">Minutos</label>
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => {
                  const m = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                  updateDuration(hours, m, seconds);
                }}
                className="w-full p-2 text-center text-lg font-bold border-2 rounded-lg"
              />
            </div>
            
            {/* Segundos */}
            <div>
              <label className="text-xs text-gray-500 block mb-1">Segundos</label>
              <input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => {
                  const s = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                  updateDuration(hours, minutes, s);
                }}
                className="w-full p-2 text-center text-lg font-bold border-2 rounded-lg"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Duración calculada automáticamente. Puedes ajustarla si es necesario.
          </p>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Notas de la Sesión (Opcional)
          </label>
          <textarea
            value={sessionNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="¿Cómo te sentiste? ¿Alguna observación?"
            rows={4}
            className="w-full p-3 border-2 rounded-lg resize-none"
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="secondary"
            disabled={isSaving}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={onFinish}
            disabled={isSaving}
            className="flex-1"
          >
            {isSaving ? 'Guardando...' : 'Guardar Sesión'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
```

### 3. Conectar el Botón de Finalizar

En los componentes que tienen el botón de finalizar (QuickEditMode, GuidedMode, etc.):

```typescript
// En lugar de llamar directamente a finishWorkout:
<button onClick={() => openCompletionModal()}>
  Finalizar Entrenamiento
</button>

// Renderizar el modal:
<FinishWorkoutModal
  isOpen={showNotesModal}
  onClose={() => setShowNotesModal(false)}
  proposedDuration={proposedDuration}
  onDurationChange={setProposedDuration}
  sessionNotes={sessionNotes}
  onNotesChange={setSessionNotes}
  onFinish={() => finishWorkoutWithData(workoutState)}
  isSaving={false}
/>
```

## Beneficios de la Solución

### Para el Usuario
- ✅ Ve la duración real del entrenamiento calculada automáticamente
- ✅ Puede ajustar la duración si pausó el cronómetro manualmente
- ✅ Puede agregar notas sobre cómo se sintió
- ✅ Confirmación visual antes de guardar
- ✅ Duración redondeada a intervalos de 5 segundos (más limpio)

### Para el Sistema
- ✅ Usa código ya existente y probado
- ✅ Calcula correctamente: tiempo total - tiempo pausado
- ✅ Maneja logros desbloqueados
- ✅ Feedback háptico en móviles
- ✅ Validación de duración mínima (60 segundos)

## Cálculo de Duración

### Fórmula Actual
```typescript
const totalDuration = Math.floor((Date.now() - workoutStartTime - totalPausedTime) / 1000);
```

**Componentes:**
- `Date.now()`: Timestamp actual en milisegundos
- `workoutStartTime`: Timestamp cuando inició el entrenamiento
- `totalPausedTime`: Tiempo total pausado en milisegundos
- `/1000`: Convertir a segundos

**Redondeo:**
```typescript
const roundedDuration = Math.round(calculatedDuration / 5) * 5;
```
- Redondea a múltiplos de 5 segundos
- Ejemplo: 127s → 125s, 133s → 135s

**Validación:**
```typescript
setProposedDuration(Math.max(roundedDuration, 60));
```
- Duración mínima: 60 segundos (1 minuto)

## Estado Actual vs Esperado

### Estado Actual ❌
1. Usuario hace click en "Finalizar Entrenamiento"
2. Se guarda inmediatamente sin confirmación
3. No se muestra la duración
4. No se pueden agregar notas
5. Redirige a /sessions

### Estado Esperado ✅
1. Usuario hace click en "Finalizar Entrenamiento"
2. Se abre modal con:
   - Duración calculada (editable)
   - Campo de notas (opcional)
   - Botones Cancelar/Guardar
3. Usuario revisa/ajusta duración
4. Usuario agrega notas si quiere
5. Usuario confirma guardado
6. Se guardan logros desbloqueados
7. Feedback háptico
8. Redirige a /sessions

## Archivos a Modificar

1. ✅ `app/workout/[id]/hooks/useWorkoutCompletion.ts` - Ya existe, no modificar
2. ⚠️ `app/workout/[id]/page.tsx` - Agregar uso del hook
3. 📝 `app/workout/[id]/components/FinishWorkoutModal.tsx` - Crear nuevo
4. ⚠️ `app/workout/[id]/components/QuickEditMode.tsx` - Conectar modal
5. ⚠️ `app/workout/[id]/components/GuidedMode.tsx` - Conectar modal (si existe)

## Prioridad

🔴 **ALTA** - Funcionalidad crítica para UX. El usuario debe poder ver y confirmar la duración antes de guardar.

## Testing Recomendado

- [ ] Duración se calcula correctamente
- [ ] Duración se redondea a múltiplos de 5 segundos
- [ ] Duración mínima es 60 segundos
- [ ] Usuario puede editar duración manualmente
- [ ] Usuario puede agregar notas
- [ ] Modal se puede cancelar sin guardar
- [ ] Sesión se guarda con duración correcta
- [ ] Logros se detectan y muestran
- [ ] Feedback háptico funciona en móvil
- [ ] Redirige a /sessions después de guardar
