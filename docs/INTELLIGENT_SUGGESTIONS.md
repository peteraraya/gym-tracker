# Sistema de Sugerencias Inteligentes Durante Workout

## Estado: ✅ COMPLETADO

## Objetivo
Implementar un sistema de sugerencias inteligentes que analice el historial de entrenamientos y proporcione recomendaciones en tiempo real durante las sesiones de workout.

## Características Implementadas

### 1. Tipos de Sugerencias

#### 💪 Progresión de Peso (`weight_increase`)
**Cuándo se activa:**
- El usuario ha completado 3+ sesiones con el mismo peso en un ejercicio
- El peso actual coincide con el peso de las últimas 3 sesiones

**Mensaje:**
> "Has completado 3 sesiones con {peso}kg en {ejercicio}. ¡Es momento de progresar! Intenta aumentar 2.5kg."

**Datos adicionales:**
- Peso actual
- Peso sugerido (+2.5kg)
- Nombre del ejercicio

#### ⏱️ Advertencia de Descanso (`rest_warning`)
**Cuándo se activa:**
- Ejercicio compuesto con descanso < 90s
- Ejercicio pesado/avanzado con descanso < 120s

**Mensajes:**
> "Descanso muy corto para ejercicio compuesto. Se recomienda 90-180 segundos."
> "Para ejercicios pesados, considera descansar 2-3 minutos entre series."

**Datos adicionales:**
- Descanso actual
- Rango recomendado (min-max)

#### 🛑 Sobreentrenamiento (`overtraining`)
**Cuándo se activa:**
- 5+ días consecutivos de entrenamiento

**Mensaje:**
> "Llevas {días} días consecutivos entrenando. El descanso es crucial para la recuperación muscular y prevenir lesiones."

**Datos adicionales:**
- Número de días consecutivos

#### 🔄 Semana de Deload (`deload`)
**Cuándo se activa:**
- 4+ semanas de entrenamiento intenso
- Promedio >20 series por sesión

**Mensaje:**
> "Has entrenado intensamente por {semanas} semanas. Una semana de deload (50-60% del volumen) ayudará a tu recuperación."

**Datos adicionales:**
- Semanas de entrenamiento
- Promedio de series por sesión

#### 🎉 Consistencia (`consistency`)
**Cuándo se activa:**
- 4+ entrenamientos en las últimas 2 semanas

**Mensaje:**
> "¡Excelente consistencia! Has completado {número} entrenamientos en las últimas 2 semanas. ¡Sigue así!"

#### 📊 Comparación con Última Sesión
**Cuándo se activa:**
- Primera serie de un ejercicio
- Peso diferente al de la última sesión

**Mensajes:**
- Peso menor: "La última vez usaste {peso}kg. Hoy estás usando {peso}kg. ¿Es intencional?"
- Peso mayor: "¡Progreso detectado! Has aumentado de {peso}kg a {peso}kg."

#### 🎯 Motivación en Última Serie
**Cuándo se activa:**
- Última serie de un ejercicio

**Mensaje:**
> "¡Última serie! Dale todo en esta última serie. ¡Tú puedes!"

### 2. Componentes Creados

#### `lib/workoutSuggestions.ts`
Librería principal con la lógica de análisis y generación de sugerencias.

**Funciones principales:**
- `generateWorkoutSuggestions()` - Genera sugerencias generales basadas en historial
- `generateLiveSuggestions()` - Genera sugerencias en tiempo real durante el workout
- `checkWeightProgression()` - Analiza progresión de peso
- `checkRestTime()` - Valida tiempos de descanso
- `checkOvertraining()` - Detecta sobreentrenamiento
- `checkDeloadNeeded()` - Sugiere semana de deload
- `checkConsistency()` - Reconoce consistencia

**Tipos:**
```typescript
type SuggestionType = 
  | 'weight_increase' 
  | 'rest_warning' 
  | 'overtraining' 
  | 'deload' 
  | 'consistency' 
  | 'volume';

interface WorkoutSuggestion {
  type: SuggestionType;
  title: string;
  message: string;
  icon: string;
  variant: 'info' | 'warning' | 'success' | 'danger';
  actionable?: boolean;
  data?: any;
}
```

#### `components/WorkoutSuggestions.tsx`
Componente visual para mostrar las sugerencias.

**Props:**
- `suggestions` - Array de sugerencias a mostrar
- `onDismiss` - Callback para cerrar una sugerencia
- `compact` - Modo compacto (menos padding, sin colapsar)

**Características:**
- Diseño responsive
- Colores según variante (info, warning, success, danger)
- Botón para cerrar sugerencias individuales
- Modo colapsable (solo en modo no-compacto)
- Animaciones de entrada
- Datos adicionales expandibles

### 3. Integración en Workout

#### Página de Workout con Rutina (`app/workout/[id]/page.tsx`)

**Estados agregados:**
```typescript
const [suggestions, setSuggestions] = useState<WorkoutSuggestion[]>([]);
const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<number>>(new Set());
```

**useEffect para generar sugerencias:**
- Se ejecuta cuando cambia: ejercicio, serie, peso, descanso
- Combina sugerencias generales y en vivo
- Reset de sugerencias cerradas al cambiar ejercicio

**Ubicación en UI:**
- Después de la barra de progreso
- Antes del card del ejercicio actual
- Modo compacto para no ocupar mucho espacio

### 4. Algoritmos de Análisis

#### Progresión de Peso
1. Buscar últimas 5 sesiones con el ejercicio
2. Extraer peso máximo de cada sesión
3. Verificar si las últimas 3 tienen el mismo peso
4. Comparar con peso actual
5. Sugerir aumento de 2.5kg si coincide

#### Descanso Apropiado
1. Buscar ejercicio en base de datos
2. Verificar si es compuesto o avanzado
3. Comparar descanso actual con mínimos recomendados:
   - Compuesto: 90s mínimo
   - Avanzado: 120s mínimo
4. Generar advertencia si es insuficiente

#### Sobreentrenamiento
1. Obtener últimas 7 sesiones
2. Verificar días consecutivos hacia atrás desde hoy
3. Contar máximo de días consecutivos
4. Alertar si ≥5 días

#### Deload
1. Analizar últimas 12-16 sesiones (4 semanas)
2. Calcular promedio de series por sesión
3. Si promedio >20 y han pasado 4+ semanas
4. Sugerir semana de deload

#### Consistencia
1. Filtrar sesiones de últimas 2 semanas
2. Si ≥4 sesiones
3. Felicitar por consistencia

## Beneficios

### Para el Usuario
- ✅ Feedback inteligente en tiempo real
- ✅ Prevención de estancamiento
- ✅ Prevención de lesiones por sobreentrenamiento
- ✅ Motivación y reconocimiento de progreso
- ✅ Educación sobre descanso apropiado
- ✅ Optimización de la progresión

### Para la App
- ✅ Mayor engagement
- ✅ Valor agregado vs competencia
- ✅ Uso de datos históricos
- ✅ Personalización basada en comportamiento
- ✅ Retención de usuarios

## Ejemplos de Uso

### Escenario 1: Usuario Estancado
```
Usuario: 3 sesiones con 60kg en Press Banca
Sistema: "💪 Has completado 3 sesiones con 60kg. ¡Aumenta 2.5kg!"
Resultado: Usuario progresa a 62.5kg
```

### Escenario 2: Descanso Insuficiente
```
Usuario: Sentadilla con 45s de descanso
Sistema: "⚠️ Descanso muy corto para ejercicio compuesto. Recomendado: 90-180s"
Resultado: Usuario ajusta a 120s
```

### Escenario 3: Sobreentrenamiento
```
Usuario: 6 días consecutivos entrenando
Sistema: "🛑 Llevas 6 días consecutivos. Considera un día de descanso."
Resultado: Usuario toma día de descanso
```

### Escenario 4: Progreso Detectado
```
Usuario: Última sesión 50kg, hoy 52.5kg
Sistema: "📈 ¡Progreso detectado! Has aumentado de 50kg a 52.5kg."
Resultado: Usuario se siente motivado
```

## Archivos Creados/Modificados

### Nuevos
- ✅ `lib/workoutSuggestions.ts` - Lógica de análisis y sugerencias
- ✅ `components/WorkoutSuggestions.tsx` - Componente visual
- ✅ `docs/INTELLIGENT_SUGGESTIONS.md` - Documentación

### Modificados
- ✅ `app/workout/[id]/page.tsx` - Integración de sugerencias

## Configuración

### Umbrales Ajustables
```typescript
// En lib/workoutSuggestions.ts

// Progresión de peso
const SESSIONS_FOR_WEIGHT_INCREASE = 3;
const WEIGHT_INCREMENT = 2.5; // kg

// Descanso
const MIN_REST_COMPOUND = 90; // segundos
const MIN_REST_HEAVY = 120; // segundos

// Sobreentrenamiento
const CONSECUTIVE_DAYS_WARNING = 5;

// Deload
const WEEKS_FOR_DELOAD = 4;
const AVG_SETS_THRESHOLD = 20;

// Consistencia
const SESSIONS_FOR_CONSISTENCY = 4;
const CONSISTENCY_PERIOD_DAYS = 14;
```

## Próximas Mejoras (Opcional)

### Sugerencias Adicionales
- 📊 Volumen semanal excesivo
- 🎯 Sugerencia de ejercicios complementarios
- 📈 Predicción de 1RM basado en progreso
- 🔄 Sugerencia de variaciones de ejercicios
- 💧 Recordatorio de hidratación
- 🍽️ Sugerencia de nutrición post-workout

### Personalización
- Configuración de umbrales por usuario
- Desactivar tipos específicos de sugerencias
- Historial de sugerencias seguidas
- Análisis de efectividad de sugerencias

### Análisis Avanzado
- Machine learning para predicciones
- Análisis de patrones de lesiones
- Detección de desequilibrios musculares
- Sugerencias basadas en objetivos específicos

### Integración
- Notificaciones push para descanso
- Calendario de deload automático
- Exportar sugerencias a PDF
- Compartir progreso en redes sociales

## Testing

### Casos de Prueba
- ✅ Usuario nuevo sin historial
- ✅ Usuario con 3 sesiones mismo peso
- ✅ Usuario con descanso corto
- ✅ Usuario con 5+ días consecutivos
- ✅ Usuario con 4+ semanas intensas
- ✅ Usuario consistente (4+ sesiones/2 semanas)
- ✅ Usuario que aumenta peso
- ✅ Usuario que disminuye peso
- ✅ Última serie de ejercicio
- ✅ Cerrar sugerencias individuales
- ✅ Cambio de ejercicio (reset sugerencias)

### Validación
- ✅ Sugerencias no duplicadas
- ✅ Sugerencias relevantes al contexto
- ✅ Performance con muchas sesiones
- ✅ UI responsive en móviles
- ✅ Animaciones suaves
- ✅ Accesibilidad (aria-labels)

## Métricas de Éxito

### KPIs
- Porcentaje de usuarios que siguen sugerencias
- Reducción en estancamiento de peso
- Aumento en consistencia de entrenamientos
- Reducción en días de sobreentrenamiento
- Satisfacción del usuario (encuestas)
- Tiempo de retención en la app

### Análisis
- Tipos de sugerencias más seguidas
- Tipos de sugerencias más ignoradas
- Correlación entre sugerencias y progreso
- Impacto en lesiones/fatiga reportada
