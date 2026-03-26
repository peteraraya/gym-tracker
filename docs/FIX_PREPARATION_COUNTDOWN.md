# Fix: Contador de Preparación no Aparece en Modo Guiado

## Problema Reportado
El usuario reporta que el contador de preparación (3, 2, 1, ¡YA!) ya no aparece en modo guiado de entrenamiento al presionar el botón "Iniciar Serie".

## Análisis Realizado

### Componentes Involucrados
1. **PreparationCountdown** (`components/PreparationCountdown.tsx`): Componente que muestra el countdown
2. **useSetExecution** (`app/workout/[id]/hooks/useSetExecution.ts`): Hook que maneja el estado de ejecución de series
3. **WorkoutPage** (`app/workout/[id]/page.tsx`): Página principal del entrenamiento

### Flujo Esperado
1. Usuario presiona botón "Iniciar Serie" → llama a `setExecution.startSet()`
2. `startSet()` establece `showPreparation = true`
3. Renderizado condicional detecta `setExecution.showPreparation === true`
4. Se renderiza `PreparationCountdown` en pantalla completa
5. Después de 3 segundos, se llama a `onComplete()`
6. `completePreparation()` establece `showPreparation = false` e inicia la serie

### Código Verificado

#### Botón Iniciar Serie (línea ~1589)
```tsx
<Button
  variant="primary"
  onClick={setExecution.startSet}
  className="..."
>
  Iniciar Serie {workoutState.currentSet}
</Button>
```
✅ El botón existe y llama correctamente a `startSet()`

#### Hook useSetExecution
```tsx
const startSet = useCallback(() => {
  setShowPreparation(true);
}, []);
```
✅ El método `startSet()` establece el estado correctamente

#### Renderizado Condicional (línea ~1456)
```tsx
if (setExecution.showPreparation) {
  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
      <PreparationCountdown
        exerciseName={currentExercise.name}
        setNumber={workoutState.currentSet}
        onComplete={() => {
          const useExecutionModal = typeof window !== 'undefined' 
            ? localStorage.getItem('useExecutionModal') === 'true'
            : false;
          setExecution.completePreparation(useExecutionModal, success);
        }}
      />
    </div>
  );
}
```
✅ El renderizado condicional está correctamente implementado

## Cambios Realizados para Debugging

### 1. Logging en useSetExecution.ts
```tsx
const startSet = useCallback(() => {
  console.log('[SetExecution] startSet called - setting showPreparation to true');
  setShowPreparation(true);
}, []);
```

### 2. Logging en el Botón Iniciar Serie
```tsx
onClick={() => {
  console.log('[Workout] Iniciar Serie button clicked');
  setExecution.startSet();
}}
```

### 3. Logging en Renderizado Condicional
```tsx
if (setExecution.showPreparation) {
  console.log('[Workout] Rendering PreparationCountdown - showPreparation:', setExecution.showPreparation);
  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
      <PreparationCountdown ... />
    </div>
  );
}
```

### 4. useEffect para Monitorear Estado
```tsx
useEffect(() => {
  console.log('[Workout] setExecution state:', {
    showPreparation: setExecution.showPreparation,
    showSetExecution: setExecution.showSetExecution,
    isExecutingSet: setExecution.isExecutingSet
  });
}, [setExecution.showPreparation, setExecution.showSetExecution, setExecution.isExecutingSet]);
```

## Próximos Pasos

1. **Probar en el navegador**: El usuario debe probar presionando "Iniciar Serie" y revisar la consola
2. **Verificar logs**: Los logs mostrarán exactamente dónde falla el flujo:
   - Si no aparece `[Workout] Iniciar Serie button clicked` → El botón no se está renderizando o no responde
   - Si aparece el log del botón pero no `[SetExecution] startSet called` → Problema con la referencia al método
   - Si aparece `startSet called` pero el estado no cambia → Problema con el hook
   - Si el estado cambia pero no se renderiza → Problema con el renderizado condicional

3. **Posibles Causas**:
   - El botón podría estar oculto por z-index
   - Podría haber un early return antes del renderizado condicional
   - El estado podría estar siendo reseteado inmediatamente
   - Podría haber un problema con el orden de renderizado (timer vs preparation)

## Archivos Modificados
- `app/workout/[id]/hooks/useSetExecution.ts`
- `app/workout/[id]/page.tsx`

## Testing
Para probar:
1. Iniciar un entrenamiento en modo guiado
2. Presionar el botón "Iniciar Serie"
3. Verificar que aparece el contador 3, 2, 1, ¡YA!
4. Revisar la consola del navegador para ver los logs
