# Fix: Botón "Iniciar Serie" Fijo - Posición y Fondo Mejorados

## Problema
El botón "Iniciar Serie" tenía dos problemas:
1. **Fondo mal**: No tenía fondo degradado, se veía mal sobre el contenido
2. **A veces quedaba abajo**: Sin padding bottom, quedaba tapado por el navbar inferior
3. **Espacio extra**: El fondo degradado creaba un espacio vacío abajo

## Solución Implementada

### Cambios en `app/workout/[id]/page.tsx`

```tsx
// ANTES
<div className="fixed bottom-0 left-0 right-0 z-30 px-4">
  <Button ... />
</div>

// DESPUÉS
<>
  {/* Fondo degradado detrás del botón */}
  <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-gray-900 dark:via-gray-900/95 dark:to-transparent pointer-events-none z-20" />
  
  {/* Botón flotante */}
  <div className="fixed bottom-20 left-0 right-0 z-30 px-4">
    <Button ... />
  </div>
</>
```

### Mejoras Aplicadas

1. **Fondo degradado separado**:
   - Capa independiente con `h-32` (128px de altura)
   - `bg-gradient-to-t from-white via-white/95 to-transparent`
   - Modo oscuro: `dark:from-gray-900 dark:via-gray-900/95 dark:to-transparent`
   - `pointer-events-none` - No interfiere con clics
   - `z-20` - Detrás del botón pero sobre el contenido

2. **Botón en posición fija**:
   - `bottom-20` (80px desde abajo) - Por encima del navbar inferior
   - `z-30` - Por encima del fondo degradado
   - Sin padding extra que cree espacios

3. **Sin espacio extra**:
   - El fondo degradado usa `fixed` con altura fija
   - No crea espacio en el flujo del documento
   - El botón está posicionado independientemente

## Resultado

- ✅ Botón siempre visible por encima del navbar inferior
- ✅ Fondo degradado que se ve bien sobre cualquier contenido
- ✅ Sin espacio vacío extra abajo
- ✅ No bloquea interacciones con el contenido
- ✅ Diseño llamativo y profesional
- ✅ Funciona en modo claro y oscuro

## Archivos Modificados

- `app/workout/[id]/page.tsx` - Botón fijo con fondo degradado separado
