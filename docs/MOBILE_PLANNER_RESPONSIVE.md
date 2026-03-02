# Mejoras Responsive en Planificador Semanal (Móvil)

## Problema

El modal del planificador semanal tenía problemas de diseño en dispositivos móviles:
- Modal muy ancho, ocupaba casi toda la pantalla
- Botones "Eliminar" y "Agregar" muy juntos y difíciles de presionar
- Texto cortado y sin espacio suficiente
- Elementos apilados sin separación adecuada
- Títulos y textos muy grandes para pantallas pequeñas

## Soluciones Implementadas

### 1. Modal Base (`components/ui/Modal.tsx`)

#### Padding Responsive
```typescript
// Antes: p-4 (fijo)
// Ahora: p-2 sm:p-4 (2 en móvil, 4 en desktop)
<div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
```

#### Altura Máxima Ajustada
```typescript
// Antes: max-h-[90vh]
// Ahora: max-h-[95vh] sm:max-h-[90vh] (más alto en móvil para aprovechar espacio)
<div className="... max-h-[95vh] sm:max-h-[90vh] ...">
```

#### Header Responsive
```typescript
// Padding: px-4 sm:px-6 py-3 sm:py-4
// Título: text-lg sm:text-2xl (más pequeño en móvil)
// Botón cerrar: text-3xl sm:text-2xl w-8 h-8 (más grande y con área de toque)
<div className="... px-4 sm:px-6 py-3 sm:py-4 ...">
  <h2 className="text-lg sm:text-2xl font-bold ... pr-2">{title}</h2>
  <button className="... text-3xl sm:text-2xl ... w-8 h-8 flex items-center justify-center">
    ×
  </button>
</div>
```

#### Contenido con Padding Responsive
```typescript
// Antes: p-6 (fijo)
// Ahora: p-4 sm:p-6 (menos padding en móvil)
<div className="p-4 sm:p-6">{children}</div>
```

### 2. DayPlanModal (`components/DayPlanModal.tsx`)

#### Espaciado General
```typescript
// Antes: space-y-6 (fijo)
// Ahora: space-y-4 sm:space-y-6 (menos espacio en móvil)
<div className="space-y-4 sm:space-y-6">
```

#### Estado del Día - Layout Flexible
```typescript
// Cambio de flex horizontal a vertical en móvil
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 ...">
  <div className="flex-1">
    <div className="... text-sm sm:text-base">...</div>
    <div className="text-xs sm:text-sm ... mt-1">...</div>
  </div>
  <Button className="w-full sm:w-auto">...</Button>
</div>
```

**Beneficios**:
- En móvil: Botón ocupa todo el ancho (fácil de presionar)
- En desktop: Botón al lado derecho (compacto)

#### Rutinas Asignadas - Cards Responsive
```typescript
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 p-3 ...">
  <div className="flex-1 min-w-0">
    <div className="... text-sm sm:text-base truncate">{routine.name}</div>
    <div className="text-xs ... mt-1">
      {routine.exercises.length} ejercicios
      {/* Descripción solo en desktop */}
      <span className="hidden sm:inline">
        {` • ${routine.description...}`}
      </span>
    </div>
  </div>
  <Button className="w-full sm:w-auto">Eliminar</Button>
</div>
```

**Beneficios**:
- En móvil: Información y botón apilados verticalmente
- Botón "Eliminar" ocupa todo el ancho (fácil de presionar)
- Descripción oculta en móvil (ahorra espacio)
- En desktop: Layout horizontal compacto

#### Agregar Rutina - Form Responsive
```typescript
<div className="flex flex-col gap-2">
  <select className="w-full ... text-sm">...</select>
  <Button block>Agregar</Button>
</div>
```

**Cambios**:
- Removido `sm:flex-row` - ahora siempre es vertical (más claro)
- Select con `w-full` explícito
- Botón usa prop `block` para ancho completo
- Simplificado: siempre apilado verticalmente

**Beneficios**:
- En móvil: Layout vertical claro, botón visible y fácil de presionar
- En desktop: Mismo layout (consistente y predecible)
- Botón "Agregar" siempre visible y accesible

#### Títulos y Textos Responsive
```typescript
// Títulos de sección
<h4 className="... mb-2 sm:mb-3 text-sm sm:text-base">

// Textarea
<textarea className="... text-sm" />

// Botón cerrar
<Button className="w-full sm:w-auto">Cerrar</Button>
```

#### Empty State Responsive
```typescript
<div className="... py-6 sm:py-8 ...">
  <div className="text-3xl sm:text-4xl mb-2">📋</div>
  ...
</div>
```

## Breakpoints Utilizados

- **sm**: 640px (tablets y desktop)
- **Móvil**: < 640px (por defecto)

## Mejoras de UX

### Móvil (< 640px)
1. **Padding reducido**: Más espacio para contenido
2. **Textos más pequeños**: Mejor legibilidad en pantallas pequeñas
3. **Botones ancho completo**: Más fáciles de presionar
4. **Layout vertical**: Elementos apilados para mejor flujo
5. **Información condensada**: Descripción oculta, solo lo esencial
6. **Modal más alto**: Aprovecha mejor el espacio vertical

### Desktop (≥ 640px)
1. **Layout horizontal**: Más compacto y eficiente
2. **Textos más grandes**: Mejor legibilidad en pantallas grandes
3. **Botones tamaño automático**: Más compactos
4. **Información completa**: Muestra descripciones
5. **Espaciado generoso**: Más aire entre elementos

## Testing

### Móvil
1. Abrir planificador en móvil
2. Hacer clic en un día
3. Verificar que:
   - Modal no ocupa toda la pantalla
   - Botones son fáciles de presionar
   - Texto no se corta
   - Hay espacio suficiente entre elementos
   - Se puede scrollear fácilmente

### Tablet
1. Probar en orientación portrait y landscape
2. Verificar transición de layouts

### Desktop
1. Verificar que el diseño se mantiene compacto
2. Confirmar que toda la información es visible

## Compatibilidad

- ✅ iPhone (Safari iOS)
- ✅ Android (Chrome)
- ✅ iPad (Safari)
- ✅ Tablets Android
- ✅ Desktop (todos los navegadores)

## Archivos Modificados

1. `components/ui/Modal.tsx`: Modal base responsive
2. `components/DayPlanModal.tsx`: Contenido del modal responsive

## Clases Tailwind Clave

- `flex-col sm:flex-row`: Layout vertical en móvil, horizontal en desktop
- `w-full sm:w-auto`: Ancho completo en móvil, automático en desktop
- `text-sm sm:text-base`: Texto pequeño en móvil, normal en desktop
- `p-4 sm:p-6`: Padding reducido en móvil
- `gap-2 sm:gap-3`: Espaciado menor en móvil
- `hidden sm:inline`: Ocultar en móvil, mostrar en desktop
- `min-w-0`: Permite que flex items se encojan correctamente
- `truncate`: Corta texto largo con ellipsis

## Notas Técnicas

- Se usa `min-w-0` en flex items para permitir que `truncate` funcione correctamente
- Los botones tienen `w-full sm:w-auto` para mejor UX táctil en móvil
- El modal usa `max-h-[95vh]` en móvil para aprovechar más espacio vertical
- Se mantiene consistencia con el resto de la app usando los mismos breakpoints
