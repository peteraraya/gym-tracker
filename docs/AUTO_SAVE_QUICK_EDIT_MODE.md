# Auto-guardado en QuickEditMode

## Problema
El modo de edición rápida (QuickEditMode) no tenía la misma funcionalidad de auto-guardado que el modo guiado (EditValueModal). Los usuarios tenían que presionar "Guardar" manualmente después de cada edición.

## Solución Implementada

### 1. Sistema de Auto-guardado Inteligente
Se implementó la misma lógica de auto-guardado que existe en EditValueModal:

- **Atajos rápidos**: Guardan y cierran INMEDIATAMENTE
  - Repeticiones comunes (8, 10, 12, 15, 20)
  - Pesos anteriores del ejercicio
  
- **Teclado numérico**: Auto-cierre después de 2 segundos de inactividad
  - Números del 1-9 y 0
  - Botón decimal (solo para peso)
  - Botón borrar
  
- **Incrementos de peso**: Temporizador de 2 segundos
  - +2.5kg, +5kg, +10kg, +20kg

- **Input manual**: Auto-cierre después de 2 segundos de inactividad
  - El usuario puede escribir directamente con el teclado del dispositivo

### 2. Función `updateValueWithAutoClose`
```typescript
const updateValueWithAutoClose = (newValue: string, immediate: boolean = false) => {
  setTempValue(newValue);

  // Limpiar timer anterior
  if (autoCloseTimerRef.current) {
    clearTimeout(autoCloseTimerRef.current);
  }

  if (!editingCell) return;

  // Si es inmediato (atajo rápido), guardar y cerrar ahora
  if (immediate) {
    const value = editingCell.field === 'reps' ? parseInt(newValue) : parseFloat(newValue);
    if (!isNaN(value) && value > 0) {
      if (editingCell.field === 'reps') {
        onEditReps(editingCell.exerciseId, editingCell.setIndex, value);
      } else {
        onEditWeight(editingCell.exerciseId, editingCell.setIndex, value);
      }
      setEditingCell(null);
      setTempValue('');
    }
    return;
  }

  // Si no es inmediato (teclado), programar auto-cierre en 2 segundos
  autoCloseTimerRef.current = setTimeout(() => {
    const value = editingCell.field === 'reps' ? parseInt(newValue) : parseFloat(newValue);
    if (!isNaN(value) && value > 0) {
      if (editingCell.field === 'reps') {
        onEditReps(editingCell.exerciseId, editingCell.setIndex, value);
      } else {
        onEditWeight(editingCell.exerciseId, editingCell.setIndex, value);
      }
      setEditingCell(null);
      setTempValue('');
    }
  }, 2000);
};
```

### 3. Cambios en los Botones

#### Atajos rápidos de repeticiones (línea ~745)
```typescript
// ANTES
onClick={() => setTempValue(String(num))}

// DESPUÉS
onClick={() => updateValueWithAutoClose(String(num), true)}
```

#### Pesos anteriores (línea ~765)
```typescript
// ANTES
onClick={() => setTempValue(String(weight))}

// DESPUÉS
onClick={() => updateValueWithAutoClose(String(weight), true)}
```

#### Incrementos de peso (línea ~785)
```typescript
// ANTES
onClick={() => {
  const current = parseFloat(tempValue) || 0;
  setTempValue(String(current + increment));
}}

// DESPUÉS
onClick={() => {
  const current = parseFloat(tempValue) || 0;
  updateValueWithAutoClose(String(current + increment), false);
}}
```

#### Teclado numérico (línea ~805)
```typescript
// ANTES
onClick={() => setTempValue(prev => prev === '0' ? String(num) : prev + num)}

// DESPUÉS
onClick={() => {
  const newValue = tempValue === '0' ? String(num) : tempValue + num;
  updateValueWithAutoClose(newValue, false);
}}
```

#### Botón decimal
```typescript
// ANTES
onClick={() => {
  if (!tempValue.includes('.')) {
    setTempValue(prev => (prev || '0') + '.');
  }
}}

// DESPUÉS
onClick={() => {
  if (!tempValue.includes('.')) {
    const newValue = (tempValue || '0') + '.';
    updateValueWithAutoClose(newValue, false);
  }
}}
```

#### Botón borrar
```typescript
// ANTES
onClick={() => setTempValue(prev => prev.length > 1 ? prev.slice(0, -1) : '')}

// DESPUÉS
onClick={() => {
  const newValue = tempValue.length > 1 ? tempValue.slice(0, -1) : '';
  updateValueWithAutoClose(newValue, false);
}}
```

#### Input manual
```typescript
// ANTES
onChange={(e) => {
  const value = e.target.value;
  if (editingCell.field === 'weight') {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setTempValue(value);
    }
  } else {
    if (value === '' || /^\d+$/.test(value)) {
      setTempValue(value);
    }
  }
}}

// DESPUÉS
onChange={(e) => {
  const value = e.target.value;
  if (editingCell.field === 'weight') {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      updateValueWithAutoClose(value, false);
    }
  } else {
    if (value === '' || /^\d+$/.test(value)) {
      updateValueWithAutoClose(value, false);
    }
  }
}}
```

### 4. Mensaje Informativo
Se actualizó el mensaje de ayuda para que sea consistente con EditValueModal:

```typescript
// ANTES
<p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">Teclado numérico</p>

// DESPUÉS
<p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">Atajos: cierre inmediato • Teclado: 2s</p>
```

### 5. Limpieza del Timer
La función `cancelEdit` ahora limpia el timer de auto-cierre:

```typescript
const cancelEdit = () => {
  // Limpiar timer de auto-cierre
  if (autoCloseTimerRef.current) {
    clearTimeout(autoCloseTimerRef.current);
  }
  
  // Si hay un valor válido, guardarlo antes de cerrar
  if (editingCell && tempValue) {
    const value = editingCell.field === 'reps' ? parseInt(tempValue) : parseFloat(tempValue);
    
    if (!isNaN(value) && value >= 0) {
      if (editingCell.field === 'reps') {
        onEditReps(editingCell.exerciseId, editingCell.setIndex, value);
      } else {
        onEditWeight(editingCell.exerciseId, editingCell.setIndex, value);
      }
    }
  }
  
  setEditingCell(null);
  setTempValue('');
};
```

## Comportamiento Esperado

### Atajos Rápidos (Cierre Inmediato)
1. Usuario hace clic en un atajo rápido (ej: "12" reps o peso anterior)
2. El valor se guarda INMEDIATAMENTE
3. El modal se cierra INMEDIATAMENTE
4. No hay espera ni necesidad de presionar "Guardar"

### Teclado Numérico (Auto-cierre en 2s)
1. Usuario presiona números en el teclado numérico
2. Cada tecla reinicia el temporizador de 2 segundos
3. Después de 2 segundos sin actividad, el valor se guarda automáticamente
4. El modal se cierra automáticamente

### Input Manual (Auto-cierre en 2s)
1. Usuario escribe directamente con el teclado del dispositivo
2. Cada tecla reinicia el temporizador de 2 segundos
3. Después de 2 segundos sin actividad, el valor se guarda automáticamente
4. El modal se cierra automáticamente

## Archivos Modificados
- `app/workout/[id]/components/QuickEditMode.tsx`

## Consistencia con Modo Guiado
Ahora ambos modos (guiado y edición rápida) tienen exactamente la misma experiencia de usuario:
- ✅ Atajos rápidos guardan y cierran inmediatamente
- ✅ Teclado numérico auto-cierra en 2 segundos
- ✅ Input manual auto-cierra en 2 segundos
- ✅ Mensaje informativo consistente
- ✅ Limpieza correcta de timers

## Testing
Probar en dispositivo móvil/PWA:
1. Modo edición rápida → Editar reps con atajo rápido → Debe cerrar inmediatamente
2. Modo edición rápida → Editar peso con peso anterior → Debe cerrar inmediatamente
3. Modo edición rápida → Editar reps con teclado numérico → Debe cerrar en 2s
4. Modo edición rápida → Editar peso con teclado del dispositivo → Debe cerrar en 2s
5. Modo edición rápida → Editar peso con incrementos → Debe cerrar en 2s
6. Verificar que el timer se reinicia correctamente con cada tecla
7. Verificar que cerrar manualmente el modal limpia el timer
