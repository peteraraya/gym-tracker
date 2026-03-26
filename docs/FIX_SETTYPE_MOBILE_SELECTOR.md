# Fix: Selector de Tipo de Serie en Mobile

## Problema
En mobile, el selector de tipo de serie no era visible en la tabla de series.

## Solución
Agregué un selector de tipo clickeable directamente en la fila de la serie en mobile.

## Cambios Realizados

### SeriesTable.tsx
- **Ubicación**: `app/workout/[id]/components/SeriesTable.tsx`
- **Cambio**: Agregado botón de tipo de serie en la columna "Serie" para mobile
- **Comportamiento**:
  - En mobile: Muestra un botón con el tipo actual (🟦 Normal, 📉 Drop, etc.)
  - Al hacer click: Cicla entre todos los tipos disponibles
  - En desktop: Se mantiene el selector completo en la columna "Tipo"
  - Cuando está completado: Muestra el badge del tipo (no editable)

## Tipos Disponibles
- 🟦 Normal - Serie normal
- 🔥 Warmup - Serie de calentamiento
- 📉 Drop - Drop set
- 💪 Fallo - Serie al fallo
- ⚡ AMRAP - As Many Reps As Possible
- ⏸️ Rest-Pause - Rest-pause
- 🔗 Cluster - Cluster set

## UX Mejorada
- ✅ Selector visible en mobile
- ✅ Fácil de cambiar con un click
- ✅ Cicla entre tipos automáticamente
- ✅ No editable cuando la serie está completada
- ✅ Mantiene funcionalidad completa en desktop
