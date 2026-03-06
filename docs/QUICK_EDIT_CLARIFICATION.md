# Aclaración: Edición de Series en Modo Edición Rápida

## Problema Reportado
Usuario reporta: "en edicion rapida al colocar editar no me deja editar series ya completadas"

## Análisis

### Botón "Editar" Visible
El botón "Editar" azul que aparece al lado del tiempo de descanso (ej: "Descanso: 3m [Editar]") es SOLO para editar el tiempo de descanso del ejercicio, NO para editar las series individuales.

### Cómo Editar Series
Para editar repeticiones o peso de cualquier serie (completada o no):
1. Hacer clic directamente en el número de repeticiones o peso en la tabla
2. Se abrirá un modal con teclado numérico
3. Editar el valor y guardar

### Funcionalidad Actual
El código ya permite editar series completadas:
- Los botones de reps y peso NO tienen condición `disabled`
- La función `startEditing` se llama sin importar si la serie está completada
- El modal se abre correctamente para cualquier serie

## Posibles Causas del Problema

### 1. Confusión de UI
El usuario puede estar presionando el botón "Editar" del descanso pensando que edita las series.

**Solución**: Hacer más claro que los valores de reps/peso son clickeables.

### 2. Modal No Se Abre
Si el modal no se abre al hacer clic en reps/peso, puede ser:
- Problema con el estado `editingCell`
- Problema con el componente `BottomSheet`
- Conflicto de z-index

**Solución**: Logs agregados para debuggear.

### 3. Ejercicios Colapsados
Los ejercicios completados se colapsan automáticamente, ocultando las series.

**Solución**: El usuario debe expandir el ejercicio haciendo clic en el header.

## Cambios Realizados

### 1. Logging para Debug
Agregado log en `startEditing`:
```tsx
const startEditing = (...) => {
  console.log('[QuickEdit] startEditing called:', { exerciseId, setIndex, field, currentValue, exerciseName });
  // ...
}
```

Esto mostrará en consola cuando se hace clic en un valor para editar.

### 2. Importación de EditValueModal
Agregada importación del componente `EditValueModal` (aunque actualmente se usa BottomSheet personalizado).

## Instrucciones para el Usuario

### Para Editar Series Completadas:

1. **Expandir el ejercicio** (si está colapsado):
   - Hacer clic en el header del ejercicio
   - El icono de flecha cambiará de horizontal a vertical

2. **Hacer clic en el valor a editar**:
   - Clic en el número de repeticiones (ej: "12")
   - O clic en el peso (ej: "15.8 kg")
   - NO hacer clic en el botón "Editar" del descanso

3. **Editar en el modal**:
   - Se abrirá un modal con teclado numérico
   - Escribir el nuevo valor
   - Presionar "Guardar"

### Verificar en Consola:
Si el modal no se abre, revisar la consola del navegador:
- Debe aparecer: `[QuickEdit] startEditing called: {...}`
- Si no aparece, el clic no está llegando al botón
- Si aparece pero no se abre el modal, hay un problema con el BottomSheet

## Mejoras Futuras Sugeridas

### 1. Indicador Visual Más Claro
Agregar un icono de lápiz o cambiar el cursor a pointer en los valores editables:
```tsx
className="... cursor-pointer hover:ring-2 hover:ring-blue-400"
```

### 2. Tooltip Explicativo
Agregar tooltip que diga "Clic para editar":
```tsx
title="Clic para editar"
```

### 3. Renombrar Botón de Descanso
Cambiar "Editar" a "Cambiar descanso" para evitar confusión.

### 4. Botón de Edición Rápida por Ejercicio
Agregar un botón "Editar todas las series" en el header del ejercicio que permita editar todas las series de ese ejercicio en secuencia.

## Archivos Modificados
- `app/workout/[id]/components/QuickEditMode.tsx` (logging agregado)

## Testing
Para verificar que funciona:
1. Abrir modo edición rápida
2. Completar una serie
3. Hacer clic directamente en el número de reps o peso de esa serie
4. Verificar que se abre el modal
5. Editar el valor y guardar
6. Verificar que el valor se actualiza
