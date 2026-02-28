# Recursos para SVG Anatómico Detallado

## 🎯 Objetivo

Reemplazar el SVG actual con uno más musculoso, detallado y anatómicamente correcto.

## 📦 Recursos Recomendados

### 1. Freepik (Mejor Opción - Gratuito con Atribución)

**Búsquedas recomendadas:**
- https://www.freepik.com/search?format=search&query=muscle+anatomy+svg
- https://www.freepik.com/search?format=search&query=body+muscles+diagram
- https://www.freepik.com/search?format=search&query=human+body+muscles+front+back

**Términos de búsqueda:**
- "muscle anatomy svg"
- "body muscle map"
- "anatomical body diagram"
- "fitness body muscles"
- "human muscular system"

**Filtros a aplicar:**
- Formato: SVG
- Licencia: Free
- Orientación: Vertical
- Color: Puede ser color o monocromo (lo colorearemos después)

### 2. Flaticon (Iconos Vectoriales)

**URL directa:**
- https://www.flaticon.com/search?word=body+muscles
- https://www.flaticon.com/search?word=anatomy+muscles
- https://www.flaticon.com/search?word=muscular+system

**Ventajas:**
- SVGs limpios y optimizados
- Fácil de editar
- Licencia gratuita con atribución

### 3. SVG Repo (Repositorio Gratuito)

**URL:**
- https://www.svgrepo.com/vectors/anatomy/
- https://www.svgrepo.com/vectors/muscle/
- https://www.svgrepo.com/vectors/body/

**Ventajas:**
- Completamente gratuito
- Sin necesidad de atribución en muchos casos
- SVGs optimizados

### 4. Vecteezy (Vectores Gratuitos)

**URL:**
- https://www.vecteezy.com/free-vector/muscle-anatomy
- https://www.vecteezy.com/free-vector/body-muscles

**Ventajas:**
- Alta calidad
- Muchas opciones
- Licencia gratuita disponible

### 5. Undraw (Ilustraciones Personalizables)

**URL:**
- https://undraw.co/illustrations
- Buscar: "fitness", "body", "exercise"

**Ventajas:**
- Estilo moderno y consistente
- Personalizable (colores)
- Completamente gratuito

## 🔍 Características a Buscar

### Requisitos Esenciales:

1. **Vista Frontal y Trasera**
   - Ambas vistas en el mismo estilo
   - Proporciones similares
   - Mismo nivel de detalle

2. **Músculos Claramente Definidos**
   - Pectorales separados
   - Abdominales visibles (six-pack)
   - Bíceps y tríceps diferenciados
   - Cuádriceps con 4 cabezas
   - Dorsales en forma de V
   - Glúteos redondeados

3. **Formato SVG Editable**
   - Paths separados por músculo
   - IDs o clases identificables
   - Sin grupos complejos anidados
   - Fácil de colorear

4. **Proporciones Anatómicas**
   - Cuerpo proporcionado
   - No caricaturesco
   - Aspecto atlético/fitness

## 📥 Cómo Descargar e Integrar

### Paso 1: Descargar el SVG

1. Ve a uno de los sitios recomendados
2. Busca "muscle anatomy svg" o similar
3. Descarga el archivo SVG
4. Guárdalo en `public/images/body-map-front.svg` y `body-map-back.svg`

### Paso 2: Inspeccionar el SVG

Abre el SVG en un editor de texto y busca:

```xml
<!-- Ejemplo de estructura ideal -->
<svg viewBox="0 0 300 600">
  <g id="pecho" class="muscle-group">
    <path d="..." fill="#ccc"/>
  </g>
  <g id="biceps" class="muscle-group">
    <path d="..." fill="#ccc"/>
  </g>
  <!-- etc -->
</svg>
```

### Paso 3: Identificar Grupos Musculares

Necesitas identificar qué paths corresponden a cada músculo:

```javascript
// Mapeo de IDs del SVG a nuestros grupos musculares
const muscleMapping = {
  'pecho': ['pectoral', 'chest', 'pecs'],
  'espalda': ['back', 'lats', 'dorsal'],
  'biceps': ['bicep', 'arm-front'],
  'triceps': ['tricep', 'arm-back'],
  'hombros': ['shoulder', 'deltoid'],
  'piernas': ['leg', 'quad', 'thigh'],
  'gluteos': ['glute', 'butt'],
  'core': ['abs', 'abdomen', 'core'],
  // etc...
};
```

### Paso 4: Adaptar el Componente

Opción A - Usar el SVG directamente con áreas clicables:

```tsx
// components/AnatomicalBodyMap.tsx
'use client';

import React, { useState } from 'react';
import { MuscleGroup, MUSCLE_GROUPS } from '@/data/exercises';

interface BodyMapProps {
  selectedMuscles: MuscleGroup[];
  onMuscleClick: (muscle: MuscleGroup) => void;
}

export const AnatomicalBodyMap: React.FC<BodyMapProps> = ({ 
  selectedMuscles, 
  onMuscleClick 
}) => {
  const [hovered, setHovered] = useState<MuscleGroup | null>(null);
  
  const getMuscleName = (muscle: MuscleGroup): string => {
    return MUSCLE_GROUPS.find(m => m.id === muscle)?.name || muscle;
  };

  const isActive = (muscle: MuscleGroup) => 
    selectedMuscles.includes(muscle) || hovered === muscle;

  return (
    <>
      {/* Tooltip */}
      {hovered && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg font-semibold text-sm animate-fade-in">
            {getMuscleName(hovered)}
          </div>
        </div>
      )}

      <div className="flex justify-center items-start gap-4 md:gap-8">
        {/* Vista Frontal */}
        <div className="relative">
          <h3 className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Vista Frontal
          </h3>
          
          <svg
            viewBox="0 0 300 600"
            className="w-64 h-auto border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-3 shadow-lg"
          >
            <defs>
              <linearGradient id="muscleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="1" />
              </linearGradient>
              
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Aquí va el contenido del SVG descargado */}
            {/* Cada grupo muscular debe tener eventos */}
            <g
              onClick={() => onMuscleClick('pecho')}
              onMouseEnter={() => setHovered('pecho')}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer transition-all duration-200"
              style={{ filter: isActive('pecho') ? 'url(#glow)' : 'none' }}
            >
              {/* Path del pecho del SVG descargado */}
              <path 
                d="..." 
                fill={isActive('pecho') ? 'url(#muscleGrad)' : '#f3f4f6'}
                stroke={isActive('pecho') ? '#1e40af' : '#d1d5db'}
                strokeWidth={isActive('pecho') ? '2.5' : '1.5'}
                className="transition-all duration-200"
              />
            </g>
            
            {/* Repetir para cada músculo */}
          </svg>
        </div>

        {/* Vista Trasera - Similar estructura */}
        <div className="relative">
          <h3 className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Vista Trasera
          </h3>
          {/* SVG trasero */}
        </div>
      </div>
    </>
  );
};
```

Opción B - Usar imagen con áreas clicables (más simple):

```tsx
export const AnatomicalBodyMap: React.FC<BodyMapProps> = ({ 
  selectedMuscles, 
  onMuscleClick 
}) => {
  const [hovered, setHovered] = useState<MuscleGroup | null>(null);

  return (
    <>
      {/* Tooltip */}
      {hovered && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
            {getMuscleName(hovered)}
          </div>
        </div>
      )}

      <div className="flex gap-8">
        {/* Vista Frontal */}
        <div className="relative">
          <h3 className="text-center text-sm font-semibold mb-2">Vista Frontal</h3>
          
          <div className="relative">
            <img 
              src="/images/body-map-front.svg" 
              alt="Vista frontal"
              className="w-64 h-auto"
              useMap="#body-front-map"
            />
            
            <map name="body-front-map">
              {/* Pecho */}
              <area 
                shape="poly" 
                coords="120,100,180,100,190,140,150,160,110,140" 
                alt="Pecho"
                onClick={() => onMuscleClick('pecho')}
                onMouseEnter={() => setHovered('pecho')}
                onMouseLeave={() => setHovered(null)}
                className="cursor-pointer"
              />
              
              {/* Bíceps izquierdo */}
              <area 
                shape="circle" 
                coords="80,150,25" 
                alt="Bíceps"
                onClick={() => onMuscleClick('biceps')}
                onMouseEnter={() => setHovered('biceps')}
                onMouseLeave={() => setHovered(null)}
                className="cursor-pointer"
              />
              
              {/* Más áreas... */}
            </map>
          </div>
        </div>

        {/* Vista Trasera */}
        <div className="relative">
          <h3 className="text-center text-sm font-semibold mb-2">Vista Trasera</h3>
          
          <div className="relative">
            <img 
              src="/images/body-map-back.svg" 
              alt="Vista trasera"
              className="w-64 h-auto"
              useMap="#body-back-map"
            />
            
            <map name="body-back-map">
              {/* Áreas clicables para vista trasera */}
            </map>
          </div>
        </div>
      </div>
    </>
  );
};
```

## 🎨 Personalización de Colores

Una vez descargado el SVG, puedes personalizarlo:

### 1. Reemplazar Colores

```bash
# Buscar y reemplazar en el SVG
# Original: fill="#cccccc"
# Nuevo: fill="#f3f4f6"
```

### 2. Agregar Clases CSS

```xml
<!-- Antes -->
<path d="..." fill="#ccc"/>

<!-- Después -->
<path d="..." class="muscle-default" fill="#f3f4f6"/>
```

### 3. Agregar IDs

```xml
<!-- Agregar IDs para identificar músculos -->
<g id="pecho">
  <path d="..."/>
</g>
```

## 📋 Checklist de Integración

- [ ] Descargar SVG anatómico de alta calidad
- [ ] Guardar en `public/images/`
- [ ] Inspeccionar estructura del SVG
- [ ] Identificar paths de cada músculo
- [ ] Crear mapeo de IDs
- [ ] Adaptar componente BodyMap
- [ ] Agregar eventos de click y hover
- [ ] Aplicar estilos y gradientes
- [ ] Probar en navegador
- [ ] Ajustar coordenadas si es necesario
- [ ] Probar en móvil
- [ ] Verificar modo oscuro

## 🚀 Implementación Rápida

Si quieres una solución inmediata:

1. Ve a: https://www.freepik.com/search?format=search&query=muscle+anatomy+svg
2. Descarga un SVG que te guste (gratis con atribución)
3. Guárdalo en `public/images/body-map-front.svg`
4. Usa la Opción B (imagen con áreas clicables)
5. Define las coordenadas de las áreas con una herramienta como:
   - https://www.image-map.net/ (generador de image maps)
   - O manualmente con las coordenadas del SVG

## 💡 Recomendaciones

1. **Busca SVGs con paths separados** - Más fácil de manipular
2. **Prefiere estilo flat/minimalista** - Más fácil de colorear
3. **Verifica la licencia** - Asegúrate de poder usarlo comercialmente
4. **Optimiza el SVG** - Usa https://jakearchibald.github.io/svgomg/
5. **Mantén backup del original** - Por si necesitas volver atrás

## 📞 Siguiente Paso

Una vez que descargues un SVG que te guste:

1. Compártelo conmigo
2. Te ayudo a integrarlo en el componente
3. Configuramos las áreas clicables
4. Aplicamos los estilos y efectos

¿Quieres que te ayude a buscar SVGs específicos o prefieres buscar tú mismo y luego te ayudo con la integración?
