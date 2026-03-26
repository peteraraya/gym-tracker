# Mobile Weight Selector Integration

## Cambio Realizado

Se integró el componente `WeightSelector` en las tarjetas móviles de la tabla de series, reemplazando el input simple de peso.

## Beneficios

### Para el Usuario
- ✅ Sugerencias de pesos recientes al hacer click
- ✅ Historial de pesos guardados automáticamente
- ✅ Acceso rápido a pesos usados anteriormente
- ✅ Misma experiencia que en desktop

### Consistencia
- ✅ Mismo selector en mobile y desktop
- ✅ Mismo historial de pesos por ejercicio
- ✅ Mismo comportamiento y UX

## Implementación

### Archivo Modificado
- `app/workout/[id]/components/SeriesTable.tsx`

### Cambios Específicos

En la sección de controles móviles (`.sm:hidden`), el selector de peso ahora:

1. **Usa WeightSelector cuando está en modo edición**
   ```tsx
   {editingField === 'weight' ? (
     <div className="w-14">
       <WeightSelector
         value={doneWeight || set.weight || 0}
         onChange={(weight) => {
           onEditWeight(idx, weight);
           setEditingField(null);
         }}
         exerciseId={exerciseId}
         className="text-xs py-0.5"
       />
     </div>
   ) : (
     // Botón para activar edición
   )}
   ```

2. **Mantiene el mismo flujo de edición**
   - Click en peso → Abre WeightSelector
   - Selecciona peso o escribe uno nuevo
   - Se guarda automáticamente en historial
   - Se cierra el selector

3. **Responsive**
   - Ancho limitado (`w-14`) para no romper el layout
   - Tamaño de texto pequeño (`text-xs`)
   - Padding reducido (`py-0.5`)

## Comportamiento

### Flujo de Usuario
1. Usuario ve tarjeta móvil con peso actual
2. Click en peso → Se abre WeightSelector
3. Puede:
   - Seleccionar de pesos recientes (dropdown)
   - Escribir un peso nuevo
4. Al seleccionar o escribir:
   - Se guarda en historial
   - Se cierra el selector
   - Se actualiza el valor en la tarjeta

### Historial
- Se guarda en `localStorage` con clave `weight-history-{exerciseId}`
- Máximo 10 pesos guardados
- Ordenados de mayor a menor
- Duplicados eliminados automáticamente

## Verificación

- ✅ Sin errores de TypeScript
- ✅ Imports correctos
- ✅ Componente WeightSelector disponible
- ✅ Mismo comportamiento que desktop

## Próximos Pasos (Opcional)

1. **Reps Selector**: Aplicar el mismo patrón a reps si hay historial
2. **Rest Time Selector**: Crear un selector similar para tiempos de descanso
3. **Sincronización**: Sincronizar historial entre dispositivos (si hay backend)

---

**Fecha**: 27 de febrero de 2026  
**Cambios**: 1 archivo modificado  
**Líneas**: ~20 líneas modificadas
