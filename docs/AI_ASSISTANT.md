# Asistente de IA - Implementación

## Resumen
Sistema de asistente conversacional basado en reglas para ayudar a los usuarios con preguntas sobre ejercicios, análisis de progreso, sugerencias personalizadas y consejos de entrenamiento.

## Características Implementadas

### 1. Interfaz de Chat Completa (`app/ai-assistant/page.tsx`)

#### Componentes Visuales:
- **Header con estadísticas**:
  - Ejercicios en base de datos
  - Sesiones registradas del usuario
  - Disponibilidad 24/7

- **Chat conversacional**:
  - Mensajes del usuario (azul/cyan)
  - Respuestas del asistente (gris)
  - Avatares distintivos (User/Bot)
  - Timestamps
  - Auto-scroll a último mensaje

- **Sugerencias rápidas**:
  - Botones con preguntas comunes
  - Click para autocompletar input
  - Aparecen en mensaje de bienvenida

- **Input de texto**:
  - Envío con Enter
  - Botón de envío con icono
  - Indicador de carga (typing...)
  - Deshabilitado durante procesamiento

### 2. Sistema de Respuestas Basado en Reglas

#### Categorías de Preguntas:

**A. Análisis de Progreso**
```typescript
Keywords: "progreso", "análisis", "analiza"
Respuesta:
- Total de sesiones
- Duración promedio
- Ejercicios recientes
- Observaciones personalizadas
```

**B. Información de Ejercicios**
```typescript
Detección: Nombre de ejercicio en mensaje
Respuesta:
- Descripción del ejercicio
- Músculos trabajados
- Equipamiento necesario
- Consejos de técnica
- Series/reps recomendadas
- Tiempo de descanso
```

**C. Sugerencias de Rutinas**
```typescript
Keywords: "rutina", "programa"
Respuestas:
- Rutina para principiantes (3 días)
- Tipos de rutinas disponibles
- Detalles según nivel
```

**D. Técnica y Forma**
```typescript
Keywords: "técnica", "forma", "cómo hacer"
Respuesta:
- Principios de buena técnica
- Control del movimiento
- Rango de movimiento
- Respiración
- Postura
```

**E. Nutrición**
```typescript
Keywords: "nutrición", "dieta", "proteína"
Respuesta:
- Guía de macronutrientes
- Timing de comidas
- Hidratación
- Fuentes de alimentos
```

**F. Recuperación**
```typescript
Keywords: "recuperación", "descanso", "dolor"
Respuesta:
- Importancia del sueño
- Descanso activo
- Nutrición post-entreno
- Manejo del dolor (DOMS)
```

### 3. Características de UX

#### Diseño Visual:
- Gradientes purple/blue/cyan
- Cards con estadísticas
- Mensajes con bordes redondeados
- Avatares con gradientes
- Animación de typing (3 puntos)

#### Interactividad:
- Sugerencias clickeables
- Enter para enviar
- Auto-scroll a nuevos mensajes
- Estados de carga claros
- Feedback visual inmediato

#### Responsive:
- Layout adaptable
- Grid de stats responsive
- Chat height fijo con scroll
- Input siempre visible

### 4. Integración con Datos del Usuario

El asistente accede a:
- `sessions`: Historial de entrenamientos
- `routines`: Rutinas creadas
- `EXERCISE_DATABASE`: Base de datos de ejercicios
- `user`: Información del usuario

Esto permite respuestas personalizadas basadas en el contexto real del usuario.

### 5. Widget Flotante Global (`components/FloatingAIAssistant.tsx`)

#### Características del Widget:
- **Botón flotante**: Icono Sparkles con indicador verde pulsante
- **Posición fija**: Esquina inferior derecha (bottom-right)
- **Siempre disponible**: En todas las páginas excepto /auth
- **Minimizable**: Puede minimizarse para no obstruir
- **Animaciones**: Hover effects y transiciones suaves

#### Estados del Widget:
1. **Cerrado**: Botón flotante pequeño con icono
2. **Abierto**: Chat completo (400px × 600px)
3. **Minimizado**: Solo header visible

#### Funcionalidades:
- Chat completo con historial de mensajes
- Input con envío por Enter
- Respuestas rápidas y contextuales
- Auto-scroll a nuevos mensajes
- Indicador de "escribiendo..."
- Botones de minimizar/maximizar/cerrar

## Flujo de Uso

### Primera Interacción:
1. Usuario entra a `/ai-assistant`
2. Ve mensaje de bienvenida con sugerencias
3. Click en sugerencia o escribe pregunta
4. Asistente procesa y responde
5. Conversación continúa

### Análisis de Progreso:
```
Usuario: "Analiza mi progreso"
↓
Sistema: Calcula estadísticas de sesiones
↓
Respuesta: Métricas + observaciones personalizadas
```

### Consulta de Ejercicio:
```
Usuario: "¿Cómo hacer press de banca?"
↓
Sistema: Busca "press de banca" en EXERCISE_DATABASE
↓
Respuesta: Info completa del ejercicio
```

## Limitaciones Actuales

### Sistema Basado en Reglas:
- No usa IA real (GPT, Claude, etc.)
- Respuestas predefinidas por categoría
- Detección por keywords simple
- No aprende de conversaciones

### Funcionalidades No Implementadas:
- ❌ Análisis de video de forma
- ❌ Generación de rutinas personalizadas con IA
- ❌ Respuestas contextuales complejas
- ❌ Memoria de conversaciones previas
- ❌ Integración con APIs de IA externa

## Mejoras Futuras

### 1. Integración con IA Real

**OpenAI GPT-4:**
```typescript
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    {
      role: "system",
      content: `Eres un entrenador personal experto. 
      Usuario tiene ${sessions.length} sesiones registradas.
      Ejercicios favoritos: ${topExercises}.`
    },
    { role: "user", content: userMessage }
  ]
});
```

**Anthropic Claude:**
```typescript
const response = await anthropic.messages.create({
  model: "claude-3-opus-20240229",
  max_tokens: 1024,
  messages: [
    { role: "user", content: userMessage }
  ],
  system: `Contexto del usuario: ${userContext}`
});
```

### 2. Análisis de Video de Forma

**Usando MediaPipe o TensorFlow.js:**
```typescript
// Detectar pose en video
const pose = await poseDetection.createDetector(
  poseDetection.SupportedModels.MoveNet
);

// Analizar ángulos de articulaciones
const angles = calculateJointAngles(keypoints);

// Comparar con forma ideal
const feedback = compareWithIdealForm(angles, exercise);
```

### 3. Generación de Rutinas con IA

```typescript
const prompt = `
Genera una rutina de entrenamiento para:
- Objetivo: ${userGoal}
- Nivel: ${userLevel}
- Días disponibles: ${daysPerWeek}
- Equipamiento: ${availableEquipment}
- Historial: ${recentExercises}
`;

const routine = await generateRoutineWithAI(prompt);
```

### 4. Memoria de Conversaciones

```typescript
interface ConversationHistory {
  userId: string;
  messages: Message[];
  context: {
    topicsDiscussed: string[];
    exercisesAskedAbout: string[];
    lastAnalysisDate: Date;
  };
}

// Guardar en Supabase
await supabase
  .from('conversation_history')
  .insert({ user_id, messages, context });
```

### 5. Análisis Avanzado de Progreso

```typescript
// Detectar patrones con ML
const patterns = await analyzeProgressPatterns({
  sessions,
  exercises,
  weights,
  reps
});

// Predicciones
const predictions = {
  nextPR: predictNextPersonalRecord(patterns),
  plateauRisk: detectPlateauRisk(patterns),
  optimalVolume: calculateOptimalVolume(patterns)
};
```

## Estructura de Archivos

```
app/
  ai-assistant/
    page.tsx          # Página principal del asistente (full screen)

components/
  FloatingAIAssistant.tsx  # Widget flotante global
  GlobalUI.tsx             # Agregado widget flotante
  Navbar.tsx               # Agregado enlace al asistente
  icons/
    lucide.ts              # Agregados iconos (Bot, Send, Sparkles, Minimize2, Maximize2)

docs/
  AI_ASSISTANT.md          # Esta documentación
```

## Costos de Implementación con IA Real

### OpenAI GPT-4:
- Input: $0.03 / 1K tokens
- Output: $0.06 / 1K tokens
- Promedio por conversación: ~$0.10-0.30

### Anthropic Claude:
- Input: $0.015 / 1K tokens
- Output: $0.075 / 1K tokens
- Similar a GPT-4

### Alternativas Gratuitas:
- **Ollama** (local): Llama 2, Mistral
- **Hugging Face**: Modelos open source
- **Google Gemini**: Tier gratuito generoso

## Ejemplo de Implementación con API Real

```typescript
// lib/ai/openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateAIResponse(
  userMessage: string,
  userContext: {
    sessions: WorkoutSession[];
    routines: Routine[];
    profile: UserProfile;
  }
) {
  const systemPrompt = `
Eres un entrenador personal experto y amigable.

Contexto del usuario:
- Sesiones totales: ${userContext.sessions.length}
- Nivel: ${userContext.profile.fitnessLevel}
- Objetivo: ${userContext.profile.fitnessGoal}

Proporciona respuestas:
- Personalizadas basadas en su historial
- Motivadoras pero realistas
- Con ejemplos concretos
- En español
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.7,
    max_tokens: 500
  });

  return response.choices[0].message.content;
}
```

## Consideraciones de Privacidad

### Datos Sensibles:
- No enviar información personal identificable
- Anonimizar datos antes de enviar a APIs
- Cumplir con GDPR/CCPA
- Permitir opt-out de análisis con IA

### Almacenamiento:
- Encriptar conversaciones guardadas
- Permitir borrado de historial
- Retención limitada de datos
- Consentimiento explícito

## Testing

### Casos de Prueba:
1. ✅ Mensaje de bienvenida se muestra
2. ✅ Sugerencias son clickeables
3. ✅ Envío con Enter funciona
4. ✅ Respuestas se generan correctamente
5. ✅ Auto-scroll funciona
6. ✅ Estados de carga se muestran
7. ✅ Análisis de progreso usa datos reales
8. ✅ Detección de ejercicios funciona

### Escenarios:
- Usuario sin sesiones
- Usuario con muchas sesiones
- Preguntas sobre ejercicios inexistentes
- Mensajes muy largos
- Múltiples mensajes rápidos

---

**Fecha de implementación**: Febrero 2026
**Versión**: 1.0 (Basado en reglas)
**Estado**: Producción
**Próxima versión**: 2.0 (Con IA real)
