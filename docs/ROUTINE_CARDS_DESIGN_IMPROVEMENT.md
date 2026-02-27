# Mejora de Diseño: Tarjetas de Rutinas sin Bordes

## Cambios Realizados

Se mejoró el diseño visual de las tarjetas de rutinas en la página `/routines` para un aspecto más profesional y moderno.

### Antes
- Tarjetas con bordes visibles (`border-gray-200 dark:border-gray-700`)
- Bordes que cambiaban de color al pasar el mouse (`hover:border-blue-500`)
- Aspecto más "boxy" y menos refinado

### Después
- Tarjetas sin bordes, solo con sombras suaves
- Sombra base: `shadow-md` (sutil)
- Sombra al pasar el mouse: `shadow-2xl` (más pronunciada)
- Transición suave entre estados
- Aspecto más limpio y profesional

## Detalles Técnicos

### Cambios en `app/routines/page.tsx`

1. **Reemplazo de componente Card por div**
   ```tsx
   // Antes
   <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-0">
   
   // Después
   <div className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 p-0">
   ```

2. **Reemplazo de CardContent por div**
   ```tsx
   // Antes
   <CardContent className="p-4 space-y-4">
   
   // Después
   <div className="p-4 space-y-4">
   ```

3. **Remoción de imports innecesarios**
   - Se removió: `import { Card, CardHeader, CardTitle, CardContent }`
   - Se mantiene: `import { Button }`

## Beneficios

✅ **Diseño más limpio** - Sin bordes que distraigan
✅ **Más profesional** - Sombras suaves dan profundidad
✅ **Mejor contraste** - Las sombras resaltan las tarjetas
✅ **Transiciones suaves** - El hover effect es más elegante
✅ **Mejor rendimiento** - Menos componentes anidados
✅ **Consistencia visual** - Sombras uniformes en todo el diseño

## Resultado Visual

Las tarjetas ahora tienen:
- Fondo limpio sin bordes
- Sombra sutil en estado normal
- Sombra más pronunciada al pasar el mouse
- Transición suave de 300ms
- Esquinas redondeadas (rounded-2xl)
- Mejor separación visual del fondo

## Archivos Modificados

- `app/routines/page.tsx` - Diseño de tarjetas mejorado
