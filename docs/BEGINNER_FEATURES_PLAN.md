# Plan de Funcionalidades para Principiantes

## 📋 Estado de Implementación

### ✅ PASO 1: Guía de Ejercicios con Instrucciones Detalladas
**Estado:** COMPLETADO

**Implementado:**
- ✅ Tipos expandidos en `data/exercises/types.ts`:
  - `difficulty`: principiante | intermedio | avanzado
  - `category`: compuesto | aislamiento | cardio | movilidad
  - `primaryMuscles` y `secondaryMuscles`
  - `instructions`: paso a paso detallado
  - `commonMistakes`: errores comunes
  - `tips`: consejos profesionales
  - `benefits`: beneficios del ejercicio
  - `variations`: más fáciles, más difíciles, alternativas
  - `safetyNotes`: notas de seguridad
  - `videoUrl`: enlace a video demostrativo

- ✅ Componente `ExerciseGuide.tsx`:
  - Modal profesional con diseño moderno
  - 3 tabs: Información General, Técnica, Variaciones
  - Badges de dificultad y categoría con colores
  - Estadísticas rápidas (series, reps, descanso)
  - Músculos trabajados (primarios y secundarios)
  - Instrucciones paso a paso numeradas
  - Errores comunes con iconos
  - Consejos pro con emojis
  - Notas de seguridad
  - Variaciones por nivel
  - Enlace a video (si disponible)
  - Animaciones fadeIn
  - Responsive design

- ✅ Ejercicios actualizados con información completa:
  - Press de Banca (ejemplo completo)
  - Flexiones (ejemplo completo)

**Próximos pasos:**
1. Integrar `ExerciseGuide` en la página de ejercicios
2. Agregar botón "Ver Guía" en cada ejercicio
3. Completar información educativa para todos los ejercicios

---

### ✅ PASO 2: Glosario de Términos
**Estado:** COMPLETADO

**Implementado:**
- ✅ Archivo de datos `data/glossary.ts`:
  - 60+ términos esenciales de fitness
  - 6 categorías: Básicos, Métricas, Entrenamiento, Técnicas, Anatomía, Nutrición
  - Cada término incluye: definición, ejemplo, términos relacionados, icono
  - Funciones helper: searchTerms, getTermsByCategory, getTermById

- ✅ Página `/glossary` con diseño profesional:
  - Búsqueda en tiempo real
  - Filtrado por categorías con colores únicos
  - Términos agrupados alfabéticamente
  - Modal de detalle con información completa
  - Términos relacionados clicables
  - Responsive design
  - Animaciones fadeIn
  - Dark mode support

**Términos incluidos:**
- Conceptos básicos: Serie, Repetición, Descanso, Calentamiento, Forma, etc.
- Métricas: 1RM, RPE, RIR, Volumen, Intensidad, Frecuencia, FFMI, IMC
- Entrenamiento: Hipertrofia, Fuerza, Resistencia, Potencia, Cardio, HIIT, Compuesto, Aislamiento
- Técnicas: Superserie, Drop Set, Rest-Pause, Tempo, TUT, Fallo Muscular, Periodización
- Anatomía: Excéntrica, Concéntrica, Core, Antagonistas, Estabilizadores
- Nutrición: Déficit/Superávit Calórico, TDEE, BMR, Proteína, Macros, Bulking, Cutting

**Próximos pasos:**
1. Agregar enlace al glosario en el navbar
2. Expandir con más términos según feedback de usuarios

---

### 🔄 PASO 3: Onboarding/Tutorial Inicial
**Estado:** PENDIENTE

**Diseño propuesto:**
- Wizard de 4 pasos con diseño profesional
- Paso 1: Información básica
  - ¿Cuántos días puedes entrenar? (2-6 días)
  - ¿Cuánto tiempo por sesión? (30/45/60/90 min)
  - ¿Cuál es tu nivel? (principiante/intermedio/avanzado)
- Paso 2: Equipo disponible
  - Checkboxes con iconos para cada tipo de equipo
  - Opciones: Barra, Mancuernas, Máquinas, Peso corporal, Poleas, etc.
- Paso 3: Objetivos
  - Fuerza máxima
  - Hipertrofia (ganar músculo)
  - Pérdida de peso
  - Resistencia
  - Fitness general
- Paso 4: Revisión y generación
  - Muestra la rutina generada
  - Permite ajustes manuales
  - Botón "Crear Rutina"

**Componentes a crear:**
- `components/RoutineWizard.tsx`
- `lib/routineGenerator.ts` (lógica de generación)

**Algoritmo de generación:**
- Basado en días disponibles, crear split apropiado
- Filtrar ejercicios por equipo disponible
- Seleccionar ejercicios según objetivo y nivel
- Balancear grupos musculares
- Ajustar volumen según tiempo disponible

---

### 🔄 PASO 3: Glosario de Términos
**Estado:** PENDIENTE

**Diseño propuesto:**
- Página `/glossary` con diseño de diccionario
- Búsqueda y filtrado por categoría
- Categorías:
  - Conceptos básicos (serie, repetición, descanso)
  - Métricas (1RM, RPE, RIR, FFMI, etc.)
  - Tipos de entrenamiento (hipertrofia, fuerza, resistencia)
  - Técnicas avanzadas (drop sets, supersets, etc.)
  - Anatomía (grupos musculares)

**Estructura de cada término:**
```typescript
interface GlossaryTerm {
  id: string;
  term: string;
  category: string;
  definition: string;
  example?: string;
  relatedTerms?: string[];
  icon?: string;
}
```

**Componentes a crear:**
- `app/glossary/page.tsx`
- `components/GlossaryCard.tsx`
- `data/glossary.ts`

---

### 🔄 PASO 4: Onboarding/Tutorial Inicial
**Estado:** PENDIENTE

**Diseño propuesto:**
- Tour interactivo con spotlight en elementos clave
- 5-6 pasos mostrando:
  1. Bienvenida y configuración de perfil
  2. Cómo crear tu primera rutina
  3. Cómo registrar un entrenamiento
  4. Cómo ver tu progreso
  5. Calculadoras y herramientas
  6. Guía de ejercicios

**Tecnología:**
- Usar biblioteca como `react-joyride` o implementar custom
- Guardar estado en localStorage para no repetir
- Opción de "Saltar tutorial" y "Ver tutorial" en settings

**Componentes a crear:**
- `components/Onboarding.tsx`
- `context/OnboardingContext.tsx`
- `components/OnboardingStep.tsx`

---

### 🔄 PASO 5: Sugerencias Inteligentes Durante el Entrenamiento
**Estado:** PENDIENTE

**Funcionalidades:**
1. **Detección de progreso:**
   - "Has completado 3 sesiones con este peso, considera aumentar"
   - "Este peso parece muy ligero (< 60% esfuerzo), ¿aumentar?"

2. **Sugerencias de descanso:**
   - Basado en tipo de ejercicio y objetivo
   - Timer con recomendación

3. **Motivación:**
   - "¡Buen trabajo! Has completado todas las series"
   - "Llevas X semanas consecutivas entrenando"

4. **Alertas de seguridad:**
   - "Aumento de peso muy grande (>20%), ¿estás seguro?"
   - "Has entrenado el mismo grupo muscular 3 días seguidos"

**Componentes a crear:**
- `lib/workoutSuggestions.ts`
- `components/WorkoutSuggestion.tsx`
- Integrar en `app/workout/[id]/page.tsx`

---

### 🔄 PASO 6: Biblioteca de Rutinas Pre-hechas Expandida
**Estado:** PARCIAL (ya existe `recommendedRoutines.ts`)

**Mejoras propuestas:**
- Expandir categorización:
  - Por nivel (Principiante/Intermedio/Avanzado)
  - Por objetivo (Fuerza/Hipertrofia/Pérdida de peso/Resistencia)
  - Por tiempo (30min/45min/60min/90min)
  - Por equipo (Peso corporal/Mancuernas/Gimnasio completo)
  - Por días (2/3/4/5/6 días)

- Agregar más rutinas populares:
  - Starting Strength (principiantes)
  - StrongLifts 5x5 (principiantes)
  - PPL (Push/Pull/Legs) (intermedio)
  - Upper/Lower Split (intermedio)
  - Bro Split (intermedio/avanzado)
  - Full Body 3x/semana (principiantes)

**Componentes a mejorar:**
- `data/recommendedRoutines.ts`
- `app/recommended/page.tsx` (agregar filtros)
- `components/RoutineCard.tsx` (mejorar diseño)

---

### 🔄 PASO 7: Sección de "Aprende"
**Estado:** PENDIENTE

**Estructura propuesta:**
- Nueva página `/learn` con artículos educativos
- Categorías:
  - Fundamentos del entrenamiento
  - Nutrición básica
  - Técnica y forma
  - Progresión
  - Recuperación
  - Prevención de lesiones

**Contenido de artículos:**
```typescript
interface Article {
  id: string;
  title: string;
  category: string;
  readTime: number; // minutos
  difficulty: 'principiante' | 'intermedio' | 'avanzado';
  summary: string;
  content: string; // Markdown
  author?: string;
  date: string;
  tags: string[];
  relatedArticles?: string[];
}
```

**Artículos iniciales:**
1. "Cómo calentar correctamente"
2. "La importancia de la técnica"
3. "Cómo progresar de forma segura"
4. "Nutrición básica para el gym"
5. "Descanso y recuperación"
6. "Prevención de lesiones comunes"
7. "Entendiendo las series y repeticiones"
8. "¿Cuánto peso debo usar?"

**Componentes a crear:**
- `app/learn/page.tsx`
- `app/learn/[slug]/page.tsx`
- `components/ArticleCard.tsx`
- `data/articles.ts`

---

### 🔄 PASO 8: Validación y Alertas de Seguridad
**Estado:** PENDIENTE

**Validaciones a implementar:**
1. **Aumento de peso excesivo:**
   - Detectar si el aumento es > 10% del peso anterior
   - Mostrar alerta: "⚠️ Estás aumentando X kg, ¿estás seguro?"

2. **Frecuencia de entrenamiento:**
   - Detectar si entrena el mismo grupo muscular < 48h
   - Alerta: "Has entrenado [grupo] hace menos de 2 días"

3. **Días consecutivos sin descanso:**
   - Detectar > 6 días consecutivos
   - Sugerencia: "Considera un día de recuperación"

4. **Volumen excesivo:**
   - Detectar si series totales > recomendado
   - Alerta: "Estás haciendo muchas series, considera reducir"

**Componentes a crear:**
- `lib/safetyValidations.ts`
- `components/SafetyAlert.tsx`
- Integrar en workout y routine creation

---

### 🔄 PASO 9: Programa de Progresión Automática
**Estado:** PENDIENTE

**Funcionalidad:**
- Sistema que sugiere cuándo y cómo aumentar peso
- Basado en:
  - RPE/RIR reportado
  - Número de sesiones con mismo peso
  - Completitud de series/reps

**Algoritmo:**
```
Si (completó todas las series Y reps) Y (RPE < 8) Y (3+ sesiones con mismo peso):
  Sugerir: Aumentar 2.5-5kg (ejercicios compuestos) o 1-2.5kg (aislamiento)

Si (no completó todas las reps) Y (2+ sesiones):
  Sugerir: Mantener peso o reducir 5-10%

Si (RPE > 9) Y (no completó):
  Sugerir: Reducir peso 10%
```

**Componentes a crear:**
- `lib/progressionSystem.ts`
- `components/ProgressionSuggestion.tsx`
- Integrar en workout completion

---

### 🔄 PASO 10: Feedback Visual del Progreso Mejorado
**Estado:** PARCIAL (ya existen gráficos)

**Mejoras propuestas:**
1. **Celebraciones de logros:**
   - "🎉 ¡Has aumentado 10kg en sentadilla este mes!"
   - "💪 Llevas 4 semanas consecutivas entrenando"
   - Animaciones y confetti

2. **Badges/Logros gamificados:**
   - "Primera rutina completada"
   - "10 entrenamientos"
   - "Mes completo sin faltar"
   - "Aumento de 20kg en press banca"
   - "100 flexiones en una sesión"

3. **Comparación antes/después:**
   - Gráficos de progreso por ejercicio
   - Fotos de progreso (opcional)
   - Métricas de composición corporal

**Componentes a crear:**
- `components/Achievement.tsx`
- `components/ProgressCelebration.tsx`
- `lib/achievements.ts` (ya existe, expandir)
- `components/ProgressComparison.tsx`

---

### 🔄 PASO 11: Modo "Entrenador Virtual" (IA)
**Estado:** PENDIENTE (Requiere integración con IA)

**Funcionalidad:**
- Chat o asistente que responda preguntas
- Ejemplos:
  - "¿Qué ejercicio puedo hacer en lugar de press banca?"
  - "¿Cómo sé si estoy haciendo bien las sentadillas?"
  - "¿Cuánto peso debería usar?"

**Tecnología:**
- Integración con OpenAI API o similar
- Context: perfil del usuario, rutinas, historial
- Respuestas basadas en datos de la app

**Componentes a crear:**
- `components/VirtualCoach.tsx`
- `lib/aiCoach.ts`
- `app/api/coach/route.ts`

---

### 🔄 PASO 12: Plantillas de Calentamiento
**Estado:** PENDIENTE

**Funcionalidad:**
- Plantillas de calentamiento por grupo muscular
- Calentamiento general (5-10 min)
- Calentamiento específico antes de ejercicio pesado

**Estructura:**
```typescript
interface WarmupTemplate {
  id: string;
  name: string;
  duration: number; // minutos
  targetMuscles: MuscleGroup[];
  exercises: {
    name: string;
    duration?: number; // segundos
    reps?: number;
    sets?: number;
    description: string;
  }[];
}
```

**Plantillas a crear:**
- Calentamiento general
- Calentamiento para tren superior
- Calentamiento para tren inferior
- Calentamiento para press banca
- Calentamiento para sentadilla
- Calentamiento para peso muerto

**Componentes a crear:**
- `data/warmupTemplates.ts`
- `components/WarmupGuide.tsx`
- Integrar en inicio de workout

---

## 🎯 Orden de Implementación Recomendado

1. ✅ **Guía de Ejercicios** (COMPLETADO)
2. **Integrar ExerciseGuide en la app**
3. **Glosario de Términos** (educativo, fácil de implementar)
4. **Onboarding/Tutorial** (mejora UX inicial)
5. **Asistente de Rutinas Guiado** (alto valor para principiantes)
6. **Sugerencias Inteligentes** (mejora experiencia de entrenamiento)
7. **Validación y Alertas** (seguridad)
8. **Progresión Automática** (valor agregado)
9. **Biblioteca de Rutinas Expandida** (contenido)
10. **Plantillas de Calentamiento** (complementario)
11. **Sección "Aprende"** (contenido educativo)
12. **Feedback Visual Mejorado** (gamificación)
13. **Modo Entrenador Virtual** (requiere IA, opcional)

---

## 📝 Notas de Diseño

**Principios de diseño a seguir:**
- ✅ Gradientes profesionales en headers
- ✅ Animaciones suaves (fadeIn, scale)
- ✅ Iconos consistentes de lucide-react
- ✅ Colores semánticos (verde=éxito, rojo=error, amarillo=advertencia)
- ✅ Responsive design mobile-first
- ✅ Dark mode support
- ✅ Accesibilidad (ARIA labels, keyboard navigation)
- ✅ Loading states y feedback visual
- ✅ Tooltips informativos
- ✅ Micro-interacciones

**Paleta de colores:**
- Primario: Blue (600-700)
- Secundario: Purple (600-700)
- Éxito: Green (600-700)
- Advertencia: Yellow/Amber (600-700)
- Error: Red (600-700)
- Info: Cyan/Teal (600-700)

---

## 🚀 Próximos Pasos Inmediatos

1. Integrar `ExerciseGuide` en la página de ejercicios
2. Agregar botón "Ver Guía Completa" en cada ejercicio
3. Completar información educativa para 5-10 ejercicios más populares
4. Comenzar con el Glosario de Términos
