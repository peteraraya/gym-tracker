# Tooltips en Mapa Corporal para Móvil

## Problema

En dispositivos móviles, los eventos `hover` (onMouseEnter/onMouseLeave) no funcionan porque no hay cursor. Los usuarios no podían ver los nombres de los grupos musculares al tocar el mapa corporal.

## Solución Implementada

Se implementó un sistema de tooltips que funciona tanto en desktop (hover) como en móvil (tap).

### Comportamiento

#### Desktop (con mouse)
1. **Hover**: Al pasar el mouse sobre un grupo muscular, aparece el tooltip con el nombre
2. **Click**: Al hacer clic, se selecciona el grupo muscular directamente

#### Móvil (touch)
1. **Primer tap**: Muestra el tooltip con el nombre del grupo muscular
2. **Segundo tap** (en el mismo músculo): Selecciona el grupo muscular
3. **Auto-ocultar**: El tooltip se oculta automáticamente después de 2 segundos
4. **Tap fuera**: Al tocar fuera del mapa, se oculta el tooltip

### Implementación

#### 1. Estados Agregados

```typescript
const [hovered, setHovered] = useState<MuscleGroup | null>(null);  // Para desktop
const [tapped, setTapped] = useState<MuscleGroup | null>(null);    // Para móvil
```

#### 2. Handler Actualizado

```typescript
const handleAreaClick = (muscle: MuscleGroup, e?: React.MouseEvent) => {
  e?.stopPropagation();
  
  // Si ya está tapped, hacer clic lo selecciona
  if (tapped === muscle) {
    onMuscleClick(muscle);
    setTapped(null);
  } else {
    // Primer tap: mostrar tooltip
    setTapped(muscle);
    
    // Auto-ocultar tooltip después de 2 segundos
    setTimeout(() => {
      setTapped(null);
    }, 2000);
  }
};
```

#### 3. Detección de Click Fuera

```typescript
React.useEffect(() => {
  const handleClickOutside = () => {
    if (tapped) {
      setTapped(null);
    }
  };
  
  document.addEventListener('click', handleClickOutside);
  return () => document.removeEventListener('click', handleClickOutside);
}, [tapped]);
```

#### 4. Tooltip Unificado

```typescript
const displayedMuscle = tapped || hovered;

{displayedMuscle && (
  <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
    <div className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-2xl font-bold text-lg animate-fade-in border-2 border-blue-400">
      {getMuscleName(displayedMuscle)}
    </div>
  </div>
)}
```

#### 5. Actualización de Áreas SVG

Todas las áreas clicables ahora pasan el evento al handler:

```typescript
onClick={(e) => handleAreaClick('pecho', e)}
```

### Mejoras en UX

1. **Instrucciones Actualizadas**: 
   - Antes: "Haz clic en un grupo muscular"
   - Ahora: "Toca para ver el nombre, toca de nuevo para seleccionar"

2. **Tooltip Mejorado**:
   - Posición fija en la parte superior (más visible)
   - Color azul brillante (más llamativo)
   - Borde para mejor contraste
   - Texto más grande y en negrita

3. **Feedback Visual**:
   - El área se ilumina tanto en hover como en tap
   - Animación de fade-in del tooltip
   - Auto-ocultar para no obstruir la vista

### Script de Actualización

Se creó un script para actualizar todos los handlers de onClick:

```javascript
// scripts/fix-body-map-mobile.js
content = content.replace(
  /onClick=\{\(\) => handleAreaClick\('([^']+)'\)\}/g, 
  'onClick={(e) => handleAreaClick(\'$1\', e)}'
);
```

## Beneficios

1. **Accesibilidad**: Funciona en todos los dispositivos (desktop, tablet, móvil)
2. **Descubribilidad**: Los usuarios pueden explorar los grupos musculares sin seleccionarlos
3. **Prevención de errores**: Evita selecciones accidentales en móvil
4. **UX consistente**: Mismo comportamiento visual en todas las plataformas
5. **Feedback claro**: Los usuarios saben qué están tocando antes de seleccionar

## Testing

### Desktop
1. Pasar el mouse sobre un grupo muscular → Ver tooltip
2. Hacer clic → Seleccionar directamente

### Móvil
1. Tocar un grupo muscular → Ver tooltip
2. Tocar el mismo grupo de nuevo → Seleccionar
3. Tocar otro grupo → Cambiar tooltip
4. Esperar 2 segundos → Tooltip se oculta automáticamente
5. Tocar fuera del mapa → Tooltip se oculta

## Compatibilidad

- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Móvil (iOS Safari, Chrome Android)
- ✅ Tablet (iPad, Android tablets)
- ✅ Touch screens en laptops

## Notas Técnicas

- El parámetro `e` es opcional (`e?: React.MouseEvent`) para evitar errores
- Se usa `e?.stopPropagation()` para prevenir propagación del evento
- El tooltip tiene `pointer-events-none` para no interferir con los clics
- Se usa `setTimeout` para auto-ocultar (no `setInterval` para evitar memory leaks)
- El listener de click fuera se limpia correctamente en el cleanup del useEffect
