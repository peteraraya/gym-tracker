# Mejoras de UX Móvil para Modo Guiado

## Análisis del Estado Actual

El modo guiado ya tiene una buena base de usabilidad, pero hay oportunidades de mejora para hacerlo más intuitivo y eficiente en móviles.

### Componentes Principales:
1. **ExerciseCard** - Tarjeta del ejercicio actual
2. **Botón flotante** - Iniciar/Completar serie
3. **SeriesTable** - Tabla expandible de series
4. **ExerciseList** - Lista de ejercicios

## Problemas Identificados

### 1. Progreso Visual Poco Prominente
- La barra de progreso es pequeña (h-2)
- No hay indicador numérico grande del progreso
- Falta feedback visual del ejercicio actual vs completados

### 2. Información del Ejercicio Poco Jerarquizada
- El título es grande pero falta contexto visual
- "Serie X de Y" es pequeño
- No hay indicador visual claro de cuántas series quedan

### 3. Timer de Serie Poco Visible
- El timer está en un banner pero podría ser más prominente
- Falta indicador de tiempo objetivo (si existe)

### 4. Botones de Ajuste Rápido Pequeños
- Los botones -5kg, -2.5kg, +2.5kg, +5kg son pequeños
- Difíciles de tocar con precisión en móvil

### 5. Falta Indicador de Ejercicio Siguiente
- No hay preview del próximo ejercicio
- El usuario no sabe qué viene después

## Mejoras Propuestas

### 1. Header del Ejercicio Mejorado

**Antes:**
```tsx
<CardTitle className="text-2xl mb-2">{exercise.name}</CardTitle>
<div className="flex items-center gap-2 text-sm">
  <span>Serie {currentSet} de {totalSets}</span>
</div>
```

**Después:**
```tsx
<div className="flex items-center gap-3 mb-3">
  {/* Número de ejercicio grande y colorido */}
  <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold shadow-lg">
    {exerciseIndex + 1}
  </div>
  
  <div className="flex-1">
    <CardTitle className="text-xl mb-1">{exercise.name}</CardTitle>
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
        Serie {currentSet} de {totalSets}
      </span>
      {/* Badge de estado */}
      <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full">
        EN PROGRESO
      </span>
    </div>
  </div>
  
  {/* Progreso circular */}
  <div className="relative w-14 h-14">
    <svg className="w-14 h-14 transform -rotate-90">
      <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="none" className="text-gray-200 dark:text-gray-700" />
      <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="none" 
        strokeDasharray={`${2 * Math.PI * 24}`}
        strokeDashoffset={`${2 * Math.PI * 24 * (1 - completedSets / totalSets)}`}
        className="text-blue-500 transition-all duration-500"
        strokeLinecap="round"
      />
    </svg>
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="text-sm font-bold">{completedSets}/{totalSets}</span>
    </div>
  </div>
</div>
```

**Beneficios:**
- Número de ejercicio más visible
- Progreso circular intuitivo
- Badge de estado claro
- Mejor jerarquía visual

### 2. Timer de Serie Más Prominente

**Antes:**
```tsx
<div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-3 flex items-center justify-between text-white">
  <div className="flex items-center gap-2">
    <span className="text-xl">⏱️</span>
    <span className="text-sm font-semibold">En progreso</span>
  </div>
  <div className="text-2xl font-bold tabular-nums">
    {formatTime(elapsedTime)}
  </div>
</div>
```

**Después:**
```tsx
<div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 shadow-lg">
  <div className="flex items-center justify-between mb-2">
    <div className="flex items-center gap-2">
      <span className="text-2xl">⏱️</span>
      <span className="text-sm font-semibold text-white/90">Serie en progreso</span>
    </div>
    {/* Indicador de tiempo objetivo si existe */}
    {targetTime && (
      <span className="text-xs text-white/70">
        Objetivo: {formatTime(targetTime)}
      </span>
    )}
  </div>
  <div className="text-center">
    <div className="text-5xl font-bold tabular-nums text-white">
      {formatTime(elapsedTime)}
    </div>
    {/* Barra de progreso si hay tiempo objetivo */}
    {targetTime && (
      <div className="mt-2 w-full bg-white/20 rounded-full h-1.5">
        <div 
          className="bg-white rounded-full h-1.5 transition-all"
          style={{ width: `${Math.min((elapsedTime / targetTime) * 100, 100)}%` }}
        />
      </div>
    )}
  </div>
</div>
```

**Beneficios:**
- Timer mucho más grande y legible
- Indicador de tiempo objetivo
- Barra de progreso visual
- Más espacio y padding

### 3. Botones de Ajuste Rápido Más Grandes

**Antes:**
```tsx
<div className="grid grid-cols-4 gap-2">
  <Button size="sm" variant="secondary" className="text-xs py-2">
    -5kg
  </Button>
  ...
</div>
```

**Después:**
```tsx
<div className="space-y-2">
  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
    Ajuste rápido de peso
  </p>
  <div className="grid grid-cols-4 gap-2">
    <button
      onClick={() => handleQuickWeightAdjustment(-5)}
      className="min-h-[48px] px-3 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg font-bold text-base transition-all active:scale-95 border-2 border-red-200 dark:border-red-800"
    >
      -5
    </button>
    <button
      onClick={() => handleQuickWeightAdjustment(-2.5)}
      className="min-h-[48px] px-3 py-2 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-lg font-bold text-base transition-all active:scale-95 border-2 border-orange-200 dark:border-orange-800"
    >
      -2.5
    </button>
    <button
      onClick={() => handleQuickWeightAdjustment(+2.5)}
      className="min-h-[48px] px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg font-bold text-base transition-all active:scale-95 border-2 border-emerald-200 dark:border-emerald-800"
    >
      +2.5
    </button>
    <button
      onClick={() => handleQuickWeightAdjustment(+5)}
      className="min-h-[48px] px-3 py-2 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 rounded-lg font-bold text-base transition-all active:scale-95 border-2 border-green-200 dark:border-green-800"
    >
      +5
    </button>
  </div>
</div>
```

**Beneficios:**
- Área táctil de 48px (cumple WCAG)
- Colores diferenciados (rojo para restar, verde para sumar)
- Texto más grande
- Feedback visual con active:scale-95
- Bordes para mejor definición

### 4. Preview del Próximo Ejercicio

**Nuevo componente:**
```tsx
{!isLastSet && nextExercise && (
  <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-2 border-orange-200 dark:border-orange-800">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
        Siguiente ejercicio:
      </span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
        {exerciseIndex + 2}
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {nextExercise.name}
      </span>
    </div>
  </div>
)}
```

**Beneficios:**
- Usuario sabe qué viene después
- Puede prepararse mentalmente
- Reduce ansiedad de no saber

### 5. Botón Flotante Mejorado

**Antes:**
```tsx
<Button className="w-full py-6 text-lg font-bold ... flex items-center justify-center gap-3">
  <span className="text-2xl">▶️</span>
  <div className="flex flex-col items-start">
    <span>Iniciar Serie {currentSet}</span>
    <span className="text-xs">...</span>
  </div>
</Button>
```

**Después:**
```tsx
<div className="px-4 pb-4">
  <button
    onClick={handleAction}
    className="w-full py-5 rounded-2xl shadow-2xl transition-all active:scale-[0.98] border-2 border-white/20 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
  >
    <div className="flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
          <span className="text-2xl">{isExecuting ? '✅' : '▶️'}</span>
        </div>
        <div className="text-left">
          <div className="text-lg font-bold text-white">
            {isExecuting ? 'Completar' : 'Iniciar'} Serie
          </div>
          <div className="text-xs text-white/80">
            {currentReps} reps × {currentWeight}kg
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-white">
          {currentSet}
        </div>
        <div className="text-xs text-white/70">
          de {totalSets}
        </div>
      </div>
    </div>
  </button>
</div>
```

**Beneficios:**
- Información más organizada
- Número de serie más visible
- Mejor feedback visual
- Más espacio para información

### 6. Inputs de Reps/Peso Mejorados

**Mejora actual:**
```tsx
<button
  onClick={() => setEditingField('reps')}
  className={`w-full min-h-[56px] ... text-xl ...`}
>
  {currentReps === '' ? '-' : currentReps}
</button>
```

**Sugerencia adicional:**
```tsx
<div className="relative">
  <button
    onClick={() => setEditingField('reps')}
    className={`w-full min-h-[64px] px-4 py-3 rounded-xl transition-all font-bold text-2xl border-2 ${
      currentReps === '' || currentReps === 0
        ? 'text-gray-400 bg-gray-50 border-gray-200 hover:border-gray-300'
        : 'text-blue-600 bg-blue-50 border-blue-300 hover:border-blue-400 shadow-sm'
    } active:scale-95`}
  >
    <div className="flex flex-col items-center">
      <span className="text-3xl font-bold">
        {currentReps === '' || currentReps === 0 ? '-' : currentReps}
      </span>
      <span className="text-xs text-gray-500 mt-1">
        Toca para editar
      </span>
    </div>
  </button>
  {/* Indicador de valor anterior */}
  {lastSetData && lastSetData.reps !== currentReps && (
    <div className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs px-2 py-0.5 rounded-full">
      Anterior: {lastSetData.reps}
    </div>
  )}
</div>
```

**Beneficios:**
- Área táctil más grande (64px)
- Texto más grande (text-3xl)
- Indicador de valor anterior
- Hint "Toca para editar"
- Feedback visual mejorado

## Resumen de Mejoras

### Cambios Visuales:
1. ✅ Número de ejercicio grande (12x12) con color
2. ✅ Progreso circular en header
3. ✅ Badge "EN PROGRESO"
4. ✅ Timer más grande (text-5xl)
5. ✅ Botones de ajuste rápido más grandes (48px)
6. ✅ Colores diferenciados en botones de ajuste
7. ✅ Preview del próximo ejercicio
8. ✅ Botón flotante reorganizado
9. ✅ Inputs más grandes (64px)
10. ✅ Indicador de valor anterior

### Mejoras de Usabilidad:
- Áreas táctiles más grandes (48-64px)
- Feedback visual en todas las interacciones
- Información más jerarquizada
- Contexto del próximo ejercicio
- Indicadores visuales de progreso
- Colores semánticos (rojo=restar, verde=sumar)

### Impacto Esperado:
- ⬆️ Velocidad de interacción
- ⬇️ Errores de toque
- ⬆️ Claridad visual
- ⬇️ Carga cognitiva
- ⬆️ Confianza del usuario

## Implementación Sugerida

### Fase 1 (Crítico):
1. Botones de ajuste rápido más grandes
2. Timer más prominente
3. Inputs más grandes

### Fase 2 (Importante):
1. Header mejorado con progreso circular
2. Número de ejercicio grande
3. Badge de estado

### Fase 3 (Nice to have):
1. Preview del próximo ejercicio
2. Botón flotante reorganizado
3. Indicador de valor anterior

## Consideraciones

### Espacio Vertical:
- El modo guiado ya ocupa bastante espacio
- Priorizar mejoras que no aumenten mucho la altura
- Usar colapsables cuando sea necesario

### Consistencia:
- Mantener consistencia con modo de edición rápida
- Usar los mismos colores y estilos
- Misma jerarquía visual

### Performance:
- Evitar re-renders innecesarios
- Usar useMemo para cálculos pesados
- Optimizar animaciones

## Testing

Probar en dispositivo móvil:
1. ✅ Botones de ajuste rápido fáciles de tocar
2. ✅ Timer legible desde 50cm
3. ✅ Inputs fáciles de tocar sin errores
4. ✅ Progreso circular intuitivo
5. ✅ Preview del próximo ejercicio útil
6. ✅ Feedback visual claro en todas las acciones
7. ✅ Colores diferenciados ayudan a la navegación


## Implementación Completada

### Cambios Aplicados (Fase 1-2)

#### 1. Inputs de Reps/Peso Mejorados ✅
- Tamaño aumentado de `min-h-[56px]` a `min-h-[64px]` (+14%)
- Texto aumentado de `text-xl` a `text-3xl` (+50%)
- Agregado hint "Toca para editar" debajo del valor
- Colores diferenciados: azul para reps, púrpura para peso
- Feedback táctil con `active:scale-95`
- Bordes más definidos con `border-2`
- Esquinas más redondeadas `rounded-xl` vs `rounded-lg`

**Antes:**
```tsx
<button className="min-h-[56px] ... text-xl ...">
  {currentReps}
</button>
```

**Después:**
```tsx
<button className="min-h-[64px] ... active:scale-95 ...">
  <div className="flex flex-col items-center">
    <span className="text-3xl font-bold">{currentReps}</span>
    <span className="text-[10px] ...">Toca para editar</span>
  </div>
</button>
```

#### 2. Timer de Serie Más Prominente ✅
- Tamaño del tiempo aumentado de `text-2xl` a `text-5xl` (+150%)
- Padding aumentado de `p-3` a `p-4`
- Esquinas más redondeadas `rounded-xl` vs `rounded-lg`
- Layout centrado para mejor legibilidad
- Texto "Serie en progreso" más descriptivo

**Antes:**
```tsx
<div className="p-3 flex items-center justify-between">
  <span>En progreso</span>
  <div className="text-2xl">{time}</div>
</div>
```

**Después:**
```tsx
<div className="p-4 ...">
  <div className="flex items-center justify-between mb-2">
    <span className="text-2xl">⏱️</span>
    <span>Serie en progreso</span>
  </div>
  <div className="text-center">
    <div className="text-5xl font-bold">{time}</div>
  </div>
</div>
```

#### 3. Botones de Ajuste Rápido Mejorados ✅
- Tamaño aumentado a `min-h-[48px]` (cumple WCAG 2.1)
- Texto aumentado de `text-xs` a `text-base` (+33%)
- Colores semánticos diferenciados:
  - Rojo para -5kg
  - Naranja para -2.5kg
  - Esmeralda para +2.5kg
  - Verde para +5kg
- Bordes de 2px para mejor definición
- Feedback táctil con `active:scale-95`
- Eliminado "kg" del texto para más espacio
- Agregado label "Ajuste rápido de peso"

**Antes:**
```tsx
<Button size="sm" className="text-xs py-2">
  -5kg
</Button>
```

**Después:**
```tsx
<button className="min-h-[48px] ... text-base ... active:scale-95 border-2 border-red-200 bg-red-50 text-red-600">
  -5
</button>
```

#### 4. Header del Ejercicio Mejorado ✅
- Número de ejercicio grande (12x12) con fondo azul
- Progreso circular visual (14x14)
- Badge "EN PROGRESO" cuando la serie está activa
- Layout reorganizado para mejor jerarquía
- Título truncado para evitar overflow
- Botón de info más compacto (solo emoji)

**Componentes agregados:**
```tsx
{/* Número grande */}
<div className="w-12 h-12 rounded-full bg-blue-500 text-white ...">
  {exerciseIndex + 1}
</div>

{/* Progreso circular */}
<div className="relative w-14 h-14">
  <svg>...</svg>
  <span>{completedSets}/{totalSets}</span>
</div>

{/* Badge de estado */}
{isSetStarted && (
  <span className="px-2 py-0.5 bg-blue-500 text-white ...">
    EN PROGRESO
  </span>
)}
```

### Métricas de Mejora

#### Tamaños:
- Inputs: +14% altura (56px → 64px)
- Texto inputs: +50% (text-xl → text-3xl)
- Timer: +150% (text-2xl → text-5xl)
- Botones ajuste: +100% altura (24px → 48px)
- Texto botones: +33% (text-xs → text-base)
- Número ejercicio: nuevo elemento (48x48px)
- Progreso circular: nuevo elemento (56x56px)

#### Nuevos Elementos:
- Número de ejercicio grande con fondo
- Progreso circular visual
- Badge "EN PROGRESO"
- Hint "Toca para editar" en inputs
- Label "Ajuste rápido de peso"
- Colores semánticos en botones

#### Feedback Visual:
- `active:scale-95` en todos los botones táctiles
- Colores diferenciados por función
- Bordes más definidos (border-2)
- Sombras en elementos importantes

### Comparación Antes/Después

#### Inputs:
- Antes: 56px altura, text-xl, sin hint
- Después: 64px altura, text-3xl, con hint, colores diferenciados

#### Timer:
- Antes: text-2xl, layout horizontal
- Después: text-5xl, layout centrado, más padding

#### Botones Ajuste:
- Antes: ~24px altura, text-xs, sin colores
- Después: 48px altura, text-base, colores semánticos

#### Header:
- Antes: Título grande, progreso lineal
- Después: Número grande, progreso circular + lineal, badge de estado

### Archivos Modificados
- `app/workout/[id]/components/ExerciseCard.tsx`

### Testing Recomendado

En dispositivo móvil real:
1. ✅ Inputs fáciles de tocar sin errores
2. ✅ Timer legible desde 50cm de distancia
3. ✅ Botones de ajuste rápido fáciles de tocar
4. ✅ Colores ayudan a identificar función (rojo=restar, verde=sumar)
5. ✅ Progreso circular intuitivo
6. ✅ Número de ejercicio visible
7. ✅ Badge "EN PROGRESO" claro
8. ✅ Feedback visual en todos los toques

### Impacto en UX

- ✅ Reducción de errores de toque (áreas más grandes)
- ✅ Mejor legibilidad (textos más grandes)
- ✅ Navegación más intuitiva (colores semánticos)
- ✅ Feedback visual claro (active:scale-95)
- ✅ Mejor jerarquía visual (número grande, progreso circular)
- ✅ Contexto más claro (badge de estado, hints)

### Próximas Mejoras Opcionales

Si se requieren más optimizaciones:
1. Preview del próximo ejercicio
2. Indicador de valor anterior en inputs
3. Botón flotante reorganizado
4. Animaciones de transición entre series
5. Haptic feedback más sofisticado

### Fecha de Implementación
2024-03-06

### Notas

Las mejoras se enfocaron en:
- Aumentar áreas táctiles (WCAG 2.1)
- Mejorar legibilidad (textos más grandes)
- Agregar contexto visual (colores, badges, hints)
- Feedback táctil (active:scale-95)
- Jerarquía visual (número grande, progreso circular)

El modo guiado ahora tiene una experiencia móvil significativamente mejorada, con elementos más grandes, mejor feedback visual y navegación más intuitiva.
