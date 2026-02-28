# Fase 2: Optimizaciones Core - Plan de Implementación

## Objetivo
Implementar mejoras de impacto alto y esfuerzo medio para reducir significativamente el tiempo de workout y mejorar la experiencia del usuario.

---

## 🎯 Mejoras a Implementar

### 1. Colapsar SeriesTable por Defecto
**Prioridad:** ALTA (implementar primero)  
**Esfuerzo:** BAJO (1-2 horas)  
**Impacto:** ALTO (reduce scroll en mobile)

**Problema:**
- SeriesTable ocupa mucho espacio en mobile
- Información redundante con ExerciseCard
- Usuario debe hacer scroll para ver botones de acción

**Solución:**
```typescript
// Estado para controlar expansión
const [isSeriesTableExpanded, setIsSeriesTableExpanded] = useState(false);

// Botón toggle
<Button onClick={() => setIsSeriesTableExpanded(!isSeriesTableExpanded)}>
  {isSeriesTableExpanded ? '▼ Ocultar series' : '▶ Ver todas las series'}
</Button>

// Render condicional
{isSeriesTableExpanded && <SeriesTable {...props} />}
```

**Beneficio:** -60% scroll requerido en mobile

---

### 2. Acciones Rápidas (±2.5kg, ±5kg)
**Prioridad:** ALTA  
**Esfuerzo:** BAJO (1-2 horas)  
**Impacto:** ALTO (menos input manual)

**Problema:**
- Usuario debe usar selector para ajustar peso
- Ajustes comunes (±2.5kg, ±5kg) requieren múltiples clics

**Solución:**
```typescript
// Botones de ajuste rápido en ExerciseCard
<div className="flex gap-2 justify-center">
  <Button onClick={() => adjustWeight(-5)}>-5kg</Button>
  <Button onClick={() => adjustWeight(-2.5)}>-2.5kg</Button>
  <span className="font-bold">{currentWeight}kg</span>
  <Button onClick={() => adjustWeight(+2.5)}>+2.5kg</Button>
  <Button onClick={() => adjustWeight(+5)}>+5kg</Button>
</div>
```

**Ubicación:** Debajo de inputs de reps/peso, antes del botón "Repetir Anterior"

**Beneficio:** Ajustes rápidos sin usar selector

---

### 3. Predicción Inteligente de Pesos
**Prioridad:** MEDIA  
**Esfuerzo:** MEDIO (2-3 horas)  
**Impacto:** ALTO (pre-llena datos automáticamente)

**Problema:**
- Usuario debe ingresar peso manualmente cada serie
- Datos de sesiones anteriores no se usan proactivamente

**Solución:**
```typescript
// Lógica de predicción
function predictWeight(params: {
  exerciseName: string;
  currentSet: number;
  sessions: Session[];
  currentExercise: Exercise;
}): number {
  const { exerciseName, currentSet, sessions, currentExercise } = params;
  
  // Primera serie: usar última sesión
  if (currentSet === 1) {
    const lastSession = getLastSessionForExercise(exerciseName, sessions);
    if (lastSession) {
      return lastSession.actualWeight[0] || currentExercise.sets[0].weight;
    }
  }
  
  // Serie 2+: usar serie anterior del workout actual
  if (currentSet > 1) {
    const prevWeight = actualWeights[exerciseId]?.[currentSet - 2];
    if (prevWeight) return prevWeight;
  }
  
  // Fallback: peso configurado en rutina
  return currentExercise.sets[currentSet - 1].weight;
}
```

**Implementación:**
- Agregar en `useEffect` que se ejecuta al cambiar de serie
- Pre-llenar `currentWeight` automáticamente
- Mostrar indicador visual: "💡 Peso sugerido basado en última sesión"

**Beneficio:** Menos input manual, flujo más rápido

---

### 4. Modo Enfocado (Focus Mode)
**Prioridad:** BAJA (implementar al final)  
**Esfuerzo:** MEDIO (3-4 horas)  
**Impacto:** MEDIO (reduce distracción)

**Problema:**
- Mucha información en pantalla puede distraer
- Usuario solo necesita ver serie actual durante ejecución

**Solución:**
```typescript
// Toggle para modo enfocado
const [isFocusMode, setIsFocusMode] = useState(false);

// Vista simplificada
{isFocusMode ? (
  <FocusedView
    exercise={currentExercise}
    currentSet={currentSet}
    currentReps={currentReps}
    currentWeight={currentWeight}
    onComplete={handleCompleteSet}
    onExit={() => setIsFocusMode(false)}
  />
) : (
  <NormalView {...props} />
)}
```

**Características del Modo Enfocado:**
- Solo serie actual visible
- Botones grandes (touch targets 60x60px)
- Información mínima y relevante
- Botón "Salir de modo enfocado" siempre visible
- Fondo oscuro para reducir distracción

**Beneficio:** Mejora concentración, reduce carga cognitiva

---

## 📋 Plan de Implementación

### Orden Recomendado

#### Día 1: Quick Wins (2-3 horas)
1. ✅ Colapsar SeriesTable por defecto (1h)
2. ✅ Acciones rápidas ±kg (1-2h)

#### Día 2: Predicción Inteligente (2-3 horas)
3. ✅ Predicción inteligente de pesos (2-3h)

#### Día 3: Modo Enfocado (3-4 horas) - OPCIONAL
4. ⚠️ Modo enfocado (3-4h)

**Tiempo Total Estimado:** 5-10 horas

---

## 🎨 Diseño y UX

### Colapsar SeriesTable

**Estado Colapsado:**
```
┌─────────────────────────────┐
│ Peso Muerto                 │
│ Serie 3 de 10               │
│ ▓▓▓▓▓▓░░░░ 30%             │
├─────────────────────────────┤
│ Reps: [10]  Peso: [50kg]   │
│ 🔄 Repetir Anterior         │
│                             │
│ ▶ Ver todas las series (10)│
│                             │
│ [✅ Completar] [⏭️ Saltar]  │
└─────────────────────────────┘
```

**Estado Expandido:**
```
┌─────────────────────────────┐
│ Peso Muerto                 │
│ Serie 3 de 10               │
│ ▓▓▓▓▓▓░░░░ 30%             │
├─────────────────────────────┤
│ Reps: [10]  Peso: [50kg]   │
│ 🔄 Repetir Anterior         │
│                             │
│ ▼ Ocultar series            │
│                             │
│ ┌─────────────────────────┐ │
│ │ Serie 1: ✓ 10 × 50kg   │ │
│ │ Serie 2: ✓ 10 × 50kg   │ │
│ │ Serie 3: ⏱️ 10 × 50kg   │ │
│ │ Serie 4: ⭕ 10 × 50kg   │ │
│ └─────────────────────────┘ │
│                             │
│ [✅ Completar] [⏭️ Saltar]  │
└─────────────────────────────┘
```

---

### Acciones Rápidas

**Diseño:**
```
┌─────────────────────────────┐
│ Reps: [10]  Peso: [50kg]   │
│                             │
│ Ajuste rápido de peso:      │
│ [-5kg] [-2.5kg] [+2.5kg] [+5kg] │
│                             │
│ 🔄 Repetir Anterior         │
└─────────────────────────────┘
```

**Interacción:**
- Click en botón ajusta peso inmediatamente
- Feedback visual: botón se anima
- Toast opcional: "Peso ajustado a 52.5kg"

---

### Predicción Inteligente

**Indicador Visual:**
```
┌─────────────────────────────┐
│ 💡 Peso sugerido: 50kg      │
│ (basado en última sesión)   │
│                             │
│ Reps: [10]  Peso: [50kg]   │
└─────────────────────────────┘
```

**Comportamiento:**
- Pre-llena automáticamente al cambiar de serie
- Usuario puede modificar si lo desea
- No es intrusivo, solo ayuda

---

### Modo Enfocado

**Vista Simplificada:**
```
┌─────────────────────────────┐
│          MODO ENFOCADO      │
│                             │
│      Peso Muerto            │
│      Serie 3 de 10          │
│                             │
│      ⏱️ 0:45                │
│                             │
│      Reps: [10]             │
│      Peso: [50kg]           │
│                             │
│   [✅ COMPLETAR SERIE]      │
│                             │
│   [Salir de modo enfocado]  │
└─────────────────────────────┘
```

**Características:**
- Fondo oscuro (reduce distracción)
- Texto grande y legible
- Botones extra grandes
- Información mínima

---

## 📊 Métricas de Éxito

### Antes (Fase 1)
- Clics por serie: 2-3
- Tiempo por serie: ~30s
- Scroll requerido: Medio
- Input manual: Alto

### Después (Fase 2 - Esperado)
- Clics por serie: 1-2 (-50%)
- Tiempo por serie: ~20s (-33%)
- Scroll requerido: Bajo (-60%)
- Input manual: Bajo (-70%)

---

## 🔧 Implementación Técnica

### 1. Colapsar SeriesTable

**Archivos a modificar:**
- `app/workout/[id]/page.tsx`: Estado `isSeriesTableExpanded`
- `app/workout/[id]/components/ExerciseCard.tsx`: Botón toggle

**Código:**
```typescript
// En page.tsx
const [isSeriesTableExpanded, setIsSeriesTableExpanded] = useState(false);

// Pasar como prop
<ExerciseCard
  {...props}
  isSeriesTableExpanded={isSeriesTableExpanded}
  onToggleSeriesTable={() => setIsSeriesTableExpanded(!isSeriesTableExpanded)}
/>

// Render condicional de SeriesTable
{isSeriesTableExpanded && <SeriesTable {...props} />}
```

---

### 2. Acciones Rápidas

**Archivos a modificar:**
- `app/workout/[id]/components/ExerciseCard.tsx`: Botones de ajuste

**Código:**
```typescript
const handleAdjustWeight = (delta: number) => {
  const newWeight = Math.max(0, (currentWeight || 0) + delta);
  onWeightChange(newWeight);
  // Optional toast
  success(`Peso ajustado a ${newWeight}kg`, 1500);
};

// UI
<div className="flex gap-2 justify-center items-center">
  <Button size="sm" onClick={() => handleAdjustWeight(-5)}>-5</Button>
  <Button size="sm" onClick={() => handleAdjustWeight(-2.5)}>-2.5</Button>
  <span className="text-lg font-bold">{currentWeight}kg</span>
  <Button size="sm" onClick={() => handleAdjustWeight(+2.5)}>+2.5</Button>
  <Button size="sm" onClick={() => handleAdjustWeight(+5)}>+5</Button>
</div>
```

---

### 3. Predicción Inteligente

**Archivos a modificar:**
- `app/workout/[id]/page.tsx`: Lógica de predicción en useEffect

**Código:**
```typescript
// Predecir peso al cambiar de serie
useEffect(() => {
  if (!currentExercise || !isInitialized) return;
  
  const exerciseId = currentExercise.id;
  const setIndex = workoutState.currentSet - 1;
  
  // Si ya hay valor editado, no predecir
  const hasEditedValue = workoutState.workoutData.actualWeights[exerciseId]?.[setIndex];
  if (hasEditedValue) return;
  
  // Predecir peso
  const predictedWeight = predictWeight({
    exerciseName: currentExercise.name,
    currentSet: workoutState.currentSet,
    sessions,
    currentExercise,
    actualWeights: workoutState.workoutData.actualWeights,
    exerciseId
  });
  
  if (predictedWeight !== workoutState.currentWeight) {
    workoutState.setCurrentWeight(predictedWeight);
  }
}, [currentExercise, workoutState.currentSet, isInitialized]);
```

---

### 4. Modo Enfocado

**Archivos a crear:**
- `app/workout/[id]/components/FocusedView.tsx`: Nuevo componente

**Archivos a modificar:**
- `app/workout/[id]/page.tsx`: Estado y render condicional

**Código:**
```typescript
// FocusedView.tsx
export function FocusedView({
  exercise,
  currentSet,
  currentReps,
  currentWeight,
  onRepsChange,
  onWeightChange,
  onComplete,
  onExit,
  setStartTime
}: FocusedViewProps) {
  return (
    <div className="fixed inset-0 bg-gray-900 z-40 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="text-sm text-gray-400">MODO ENFOCADO</div>
        
        <h2 className="text-3xl font-bold text-white">{exercise.name}</h2>
        <p className="text-xl text-gray-300">Serie {currentSet} de {exercise.sets.length}</p>
        
        {setStartTime && <Timer startTime={setStartTime} />}
        
        <div className="space-y-4">
          <Input
            type="number"
            value={currentReps}
            onChange={(e) => onRepsChange(parseInt(e.target.value))}
            className="text-4xl text-center h-20"
            placeholder="Reps"
          />
          
          <WeightSelector
            value={currentWeight}
            onChange={onWeightChange}
            className="text-4xl h-20"
          />
        </div>
        
        <Button
          variant="primary"
          onClick={onComplete}
          className="w-full py-6 text-2xl"
        >
          ✅ COMPLETAR SERIE
        </Button>
        
        <Button
          variant="ghost"
          onClick={onExit}
          className="text-gray-400"
        >
          Salir de modo enfocado
        </Button>
      </div>
    </div>
  );
}
```

---

## ✅ Checklist de Testing

### Colapsar SeriesTable
- [ ] SeriesTable colapsada por defecto
- [ ] Botón toggle funciona correctamente
- [ ] Estado persiste durante el workout
- [ ] Animación suave al expandir/colapsar

### Acciones Rápidas
- [ ] Botones ajustan peso correctamente
- [ ] No permite pesos negativos
- [ ] Feedback visual al hacer clic
- [ ] Funciona con WeightSelector

### Predicción Inteligente
- [ ] Predice peso de última sesión (serie 1)
- [ ] Predice peso de serie anterior (serie 2+)
- [ ] No sobrescribe valores editados
- [ ] Indicador visual claro

### Modo Enfocado
- [ ] Toggle funciona correctamente
- [ ] Vista simplificada muestra info esencial
- [ ] Botones grandes y accesibles
- [ ] Salir de modo enfocado restaura vista normal

---

## 🚀 Próximos Pasos (Fase 3)

Después de completar Fase 2:
1. Gestos táctiles (swipe para completar)
2. Modo voz (control por voz)
3. Indicadores de rendimiento en tiempo real
4. Animaciones y celebraciones

---

**Documento creado:** 2026-02-28  
**Estado:** Planificación  
**Prioridad:** ALTA  
**Tiempo estimado:** 5-10 horas
