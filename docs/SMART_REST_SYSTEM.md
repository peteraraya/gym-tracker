# Sistema de Descanso Inteligente 🧠⏱️

## Descripción

El Sistema de Descanso Inteligente calcula automáticamente los tiempos de descanso óptimos entre series y ejercicios basándose en:

- **Tipo de entrenamiento** (fuerza, hipertrofia, resistencia, potencia)
- **Características del ejercicio** (compuesto vs aislado)
- **Series y repeticiones** configuradas
- **Nivel del usuario** (principiante, intermedio, avanzado)

## Características Implementadas ✅

### 1. Timer Automático entre Series
- ⏱️ Cálculo inteligente del tiempo de descanso
- 🎯 Ajustado según el tipo de ejercicio
- 📊 Muestra rango recomendado (mínimo - máximo)

### 2. Recomendaciones según el Tipo de Ejercicio

#### 🏋️ Entrenamiento de Fuerza (1-5 reps)
- **Descanso:** 3-5 minutos
- **Objetivo:** Recuperación completa del sistema nervioso
- **Ideal para:** Press de banca, sentadillas pesadas, peso muerto

#### 💪 Hipertrofia (6-12 reps)
- **Descanso:** 1-2 minutos
- **Objetivo:** Mantener tensión muscular y fatiga metabólica
- **Ideal para:** La mayoría de ejercicios de culturismo

#### 🔥 Resistencia (12+ reps)
- **Descanso:** 30-60 segundos
- **Objetivo:** Mantener ritmo cardíaco elevado
- **Ideal para:** Circuitos y acondicionamiento

#### ⚡ Potencia (3-8 reps explosivas)
- **Descanso:** 2-4 minutos
- **Objetivo:** Recuperación para mantener explosividad
- **Ideal para:** Olympic lifts, pliométricos

### 3. Notificaciones cuando el Descanso Termina

#### Notificaciones del Navegador
- 🔔 Solicita permiso automáticamente
- 📱 Funciona incluso con la pestaña en segundo plano
- 🔊 Incluye vibración en dispositivos móviles

#### Sonido de Alerta
- 🎵 Tono agradable generado con Web Audio API
- 🔇 No intrusivo pero audible
- ⚙️ Se reproduce automáticamente al terminar

#### Mensajes Motivacionales
- 💬 Cambian según el tiempo restante
- 🎯 Mantienen al usuario enfocado
- 🔥 Aumentan la motivación

### 4. Ajustes por Nivel de Usuario

```typescript
// Multiplicadores de tiempo según nivel
beginner: 1.2      // +20% más descanso
intermediate: 1.0  // Tiempo estándar
advanced: 0.8      // -20% menos descanso
```

### 5. Detección de Ejercicios Compuestos

Los ejercicios compuestos (multiarticulares) reciben un 20% más de tiempo de descanso:

**Compuestos detectados:**
- Press (banca, inclinado, militar)
- Sentadillas (squat)
- Peso muerto (deadlift)
- Dominadas (pull-up)
- Remos (row)
- Fondos (dip)
- Estocadas (lunge)

### 6. Descanso Inteligente entre Ejercicios

- **Mismo grupo muscular:** 2 minutos (recuperación extendida)
- **Diferente grupo muscular:** 1.5 minutos (transición estándar)

## Uso

### En la Página de Workout

```tsx
import { calculateRestBetweenSets } from '@/lib/restCalculator';

const restRecommendation = calculateRestBetweenSets(
  exerciseTemplate,
  sets,
  reps,
  fitnessLevel
);

// Resultado:
{
  min: 60,
  max: 120,
  recommended: 90,
  type: 'hypertrophy',
  description: 'Descanso medio para mantener la tensión muscular'
}
```

### En el Timer Mejorado

```tsx
<Timer
  duration={restRecommendation.recommended}
  onComplete={handleTimerComplete}
  autoStart={true}
  title="Descanso - Serie 2/4"
  nextExerciseName="Press Inclinado"
  showMotivation={true}
/>
```

## API del Sistema

### Funciones Principales

#### `calculateRestBetweenSets()`
Calcula el tiempo de descanso entre series del mismo ejercicio.

**Parámetros:**
- `exercise`: ExerciseTemplate - Plantilla del ejercicio
- `sets`: number - Número de series
- `reps`: number - Número de repeticiones
- `fitnessLevel`: 'beginner' | 'intermediate' | 'advanced'

**Retorna:** `RestRecommendation`

#### `calculateRestBetweenExercises()`
Calcula el tiempo de descanso entre ejercicios diferentes.

**Parámetros:**
- `currentExercise`: ExerciseTemplate
- `nextExercise`: ExerciseTemplate
- `fitnessLevel`: 'beginner' | 'intermediate' | 'advanced'

**Retorna:** `RestRecommendation`

#### `requestNotificationPermission()`
Solicita permiso para mostrar notificaciones del navegador.

**Retorna:** `Promise<boolean>`

#### `showRestCompleteNotification()`
Muestra una notificación cuando termina el descanso.

**Parámetros:**
- `exerciseName?`: string - Nombre del siguiente ejercicio

#### `playRestCompleteSound()`
Reproduce un sonido de alerta al terminar el descanso.

#### `formatRestTime()`
Formatea segundos a un formato legible (ej: "1min 30s").

**Parámetros:**
- `seconds`: number

**Retorna:** string

#### `getRestMessage()`
Obtiene un mensaje motivacional según el tiempo restante.

**Parámetros:**
- `secondsRemaining`: number
- `totalSeconds`: number

**Retorna:** string

## Mensajes Motivacionales

El sistema muestra mensajes dinámicos según el progreso:

| % Restante | Mensaje |
|------------|---------|
| 80-100% | "Respira profundo y recupérate 🧘" |
| 60-80% | "Recuperando energía... 💚" |
| 40-60% | "Casi listo para continuar 🔥" |
| 20-40% | "Prepárate para la siguiente serie 💪" |
| 5-20% | "¡Últimos segundos! 🚀" |
| 0-5% | "¡Muy bien! ¡A darle! 💥" |

## Próximas Mejoras 🚀

- [ ] Integración con perfil de usuario para nivel personalizado
- [ ] Historial de tiempos de descanso utilizados
- [ ] Ajuste manual del tiempo recomendado
- [ ] Patrones de descanso según objetivo (volumen vs intensidad)
- [ ] Sugerencias de actividades durante el descanso (movilidad, estiramiento)
- [ ] Estadísticas de adherencia al tiempo de descanso
- [ ] Modo "superconjuntos" con descanso reducido
- [ ] Alarmas progresivas (avisos a 10s, 5s)

## Tecnologías Utilizadas

- **Web Audio API** - Generación de sonidos
- **Notifications API** - Notificaciones del navegador
- **React Hooks** - Gestión de estado y efectos
- **TypeScript** - Tipado fuerte y seguridad

## Consideraciones de UX

✅ **Permisos opcionales:** Las notificaciones son opcionales, la app funciona sin ellas  
✅ **Feedback visual:** Timer circular con colores según estado  
✅ **Skip option:** Siempre se puede saltar el descanso  
✅ **Información clara:** Muestra el tiempo recomendado antes de iniciar  
✅ **Responsive:** Funciona perfectamente en móvil y desktop
