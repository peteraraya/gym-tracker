# Coordenadas Body Map - Ajuste Manual Necesario

## Problema Identificado

Las áreas clicables no coinciden con los músculos visibles en el SVG porque:
1. El viewBox recorta el SVG original (500x500) a solo una porción
2. Las coordenadas de las áreas clicables deben estar en el sistema de coordenadas del SVG original, no del viewBox

## Solución

Las coordenadas deben ajustarse basándose en la posición real de los músculos en el SVG original `public/svg/human-men.svg`.

### Vista Frontal (viewBox="70 0 180 500")

Basado en las capturas, las áreas clicables están apareciendo:
- **Hombros**: Aparecen sobre el cuello/cara → Deben moverse ABAJO y hacia los lados
- **Pecho**: Aparece sobre los hombros → Debe moverse ABAJO
- **Core**: Aparece sobre el pecho → Debe moverse ABAJO  
- **Bíceps**: Aparecen fuera de lugar → Deben ajustarse a los brazos
- **Piernas**: Aparecen sobre el core → Deben moverse ABAJO
- **Gemelos**: Aparecen sobre las piernas → Deben moverse ABAJO

### Vista Trasera (viewBox="280 0 180 500")

Basado en las capturas:
- **Hombros traseros**: Aparecen sobre el cuello → Deben moverse ABAJO
- **Trapecio**: Aparece sobre la cabeza → Debe moverse ABAJO
- **Espalda**: Aparece muy arriba → Debe moverse ABAJO
- **Tríceps**: Fuera de lugar → Ajustar a brazos traseros
- **Glúteos**: Aparecen muy arriba → Deben moverse ABAJO
- **Gemelos**: Aparecen sobre las piernas → Deben moverse ABAJO

## Coordenadas Sugeridas (Basadas en SVG Original)

### VISTA FRONTAL
El SVG original tiene la figura frontal aproximadamente en x=50-220

```typescript
// Cuello
x="155" y="75" width="20" height="20"

// Hombros (izquierdo y derecho)
cx="125" cy="95"  // izquierdo
cx="185" cy="95"  // derecho

// Pecho (izquierdo y derecho)
cx="140" cy="115" // izquierdo
cx="170" cy="115" // derecho

// Bíceps
cx="105" cy="135" // izquierdo
cx="205" cy="135" // derecho

// Antebrazos
cx="95" cy="185"  // izquierdo
cx="215" cy="185" // derecho

// Core/Abdominales
x="140" y="140" width="40" height="70"

// Piernas (cuádriceps)
x="130" y="210" width="28" height="105" // izquierda
x="162" y="210" width="28" height="105" // derecha

// Gemelos
cx="144" cy="365" // izquierdo
cx="176" cy="365" // derecho
```

### VISTA TRASERA
El SVG original tiene la figura trasera aproximadamente en x=280-450

```typescript
// Cuello
x="360" y="75" width="20" height="20"

// Trapecio
x="345" y="90" width="50" height="30"

// Hombros traseros
cx="335" cy="95"  // izquierdo
cx="395" cy="95"  // derecho

// Espalda (dorsales)
x="340" y="120" width="22" height="85" // izquierda
x="378" y="120" width="22" height="85" // derecha

// Tríceps
cx="315" cy="135" // izquierdo
cx="415" cy="135" // derecho

// Antebrazos traseros
cx="305" cy="185" // izquierdo
cx="425" cy="185" // derecho

// Zona lumbar
x="348" y="205" width="44" height="30"

// Glúteos
cx="355" cy="250" // izquierdo
cx="385" cy="250" // derecho

// Piernas traseras (isquiotibiales)
x="340" y="280" width="28" height="35" // izquierda
x="372" y="280" width="28" height="35" // derecha

// Gemelos traseros
cx="354" cy="365" // izquierdo
cx="386" cy="365" // derecho
```

## Método de Ajuste Recomendado

1. **Usar herramientas de desarrollo del navegador**:
   - Inspeccionar el SVG
   - Ver las coordenadas reales de los paths del SVG
   - Ajustar las áreas clicables para que coincidan

2. **Hacer ajustes incrementales**:
   - Cambiar una coordenada a la vez
   - Probar en el navegador
   - Ajustar según sea necesario

3. **Usar semi-transparencia temporal**:
   - Cambiar `fill` de las áreas a `rgba(255, 0, 0, 0.3)` temporalmente
   - Esto permite ver dónde están las áreas clicables
   - Una vez alineadas, volver a la configuración original

## Nota Importante

Las coordenadas exactas pueden variar dependiendo de cómo esté estructurado el SVG original. Se recomienda:
1. Abrir `public/svg/human-men.svg` en un editor de SVG o navegador
2. Identificar las coordenadas exactas de cada músculo
3. Usar esas coordenadas en las áreas clicables

## Estado Actual

⚠️ **PENDIENTE DE AJUSTE MANUAL** - Las coordenadas necesitan ser ajustadas visualmente en el navegador para lograr una alineación perfecta.
