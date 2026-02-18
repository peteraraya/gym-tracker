# Plan de Implementación Q1 2026 - Prioridad Media

## 📅 Timeline: 6-8 semanas

---

## 1️⃣ Notificaciones Inteligentes (Semana 1-2)

### Objetivo
Sistema automatizado de notificaciones basado en comportamiento del usuario.

### Características

#### 1.1 Recordatorio de Entrenamiento
- Analizar horarios habituales del usuario
- Enviar notificación 30 min antes del horario usual
- Personalizar mensaje según rutina planificada

#### 1.2 Notificación de Inactividad
- Si no entrena en 3 días → recordatorio suave
- Si no entrena en 7 días → recordatorio motivacional
- Si no entrena en 14 días → oferta de ayuda/tips

#### 1.3 Celebración de Logros
- Nuevo PR → notificación inmediata
- Racha de X días → celebración
- Meta alcanzada → confetti + notificación

#### 1.4 Resumen Semanal
- Domingo 8 PM → resumen de la semana
- Estadísticas: entrenamientos, volumen, PRs
- Motivación para la próxima semana

### Implementación

```typescript
// lib/notifications/scheduler.ts
interface NotificationSchedule {
  type: 'workout_reminder' | 'inactivity' | 'achievement' | 'weekly_summary';
  userId: string;
  scheduledFor: Date;
  data: Record<string, any>;
}

export class NotificationScheduler {
  // Analizar patrón de entrenamientos
  async analyzeWorkoutPattern(userId: string): Promise<{
    preferredDays: number[];
    preferredTime: string;
    frequency: number;
  }> {
    // Analizar últimas 4 semanas
    // Retornar patrón detectado
  }

  // Programar recordatorio
  async scheduleWorkoutReminder(userId: string) {
    const pattern = await this.analyzeWorkoutPattern(userId);
    // Programar notificación
  }

  // Verificar inactividad
  async checkInactivity(userId: string) {
    const lastWorkout = await getLastWorkoutDate(userId);
    const daysSince = getDaysSince(lastWorkout);
    
    if (daysSince >= 3) {
      await sendNotification({
        title: '¿Todo bien? 💪',
        body: 'Te extrañamos en el gym. ¡Vamos por ese entrenamiento!',
        tag: 'inactivity-3d'
      });
    }
  }
}
```

```typescript
// lib/notifications/templates.ts
export const notificationTemplates = {
  workoutReminder: (routineName: string) => ({
    title: '⏰ Hora de entrenar',
    body: `Tu rutina "${routineName}" te está esperando`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    actions: [
      { action: 'start', title: 'Comenzar' },
      { action: 'snooze', title: 'Más tarde' }
    ]
  }),

  newPR: (exercise: string, weight: number) => ({
    title: '🎉 ¡Nuevo Récord Personal!',
    body: `${exercise}: ${weight}kg - ¡Increíble progreso!`,
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200]
  }),

  weeklySummary: (stats: WeeklyStats) => ({
    title: '📊 Resumen Semanal',
    body: `${stats.workouts} entrenamientos, ${stats.volume}kg levantados. ¡Sigue así!`,
    data: { url: '/progress' }
  })
};
```

```typescript
// app/api/notifications/schedule/route.ts
export async function POST(request: NextRequest) {
  const { userId, type } = await request.json();
  
  const scheduler = new NotificationScheduler();
  
  switch (type) {
    case 'workout_reminder':
      await scheduler.scheduleWorkoutReminder(userId);
      break;
    case 'check_inactivity':
      await scheduler.checkInactivity(userId);
      break;
    // ...
  }
  
  return NextResponse.json({ success: true });
}
```

### Cron Jobs (Vercel)
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/notifications/check-reminders",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/notifications/weekly-summary",
      "schedule": "0 20 * * 0"
    }
  ]
}
```

---

## 2️⃣ AI Assistant Real (Semana 2-3)

### Objetivo
Integrar OpenAI GPT-4 para respuestas inteligentes y personalizadas.

### Características

#### 2.1 Contexto del Usuario
- Rutinas actuales
- Historial de entrenamientos
- Objetivos y nivel
- Lesiones/limitaciones

#### 2.2 Capacidades
- Responder preguntas sobre ejercicios
- Sugerir modificaciones de rutinas
- Analizar progreso y dar feedback
- Crear rutinas personalizadas
- Consejos de nutrición básicos

#### 2.3 Límites
- Free: 10 mensajes/día
- Premium: Ilimitado

### Implementación

```typescript
// lib/ai/openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateAIResponse(
  message: string,
  context: UserContext
): Promise<string> {
  const systemPrompt = `Eres un entrenador personal experto en fitness y nutrición.
Contexto del usuario:
- Nivel: ${context.level}
- Objetivo: ${context.goal}
- Rutinas actuales: ${context.routines.map(r => r.name).join(', ')}
- Último entrenamiento: ${context.lastWorkout}

Responde de forma concisa, motivadora y práctica.
Usa emojis apropiados.
Si no estás seguro, recomienda consultar a un profesional.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ],
    max_tokens: 500,
    temperature: 0.7
  });

  return completion.choices[0].message.content || '';
}
```

```typescript
// app/api/ai/chat/route.ts
export async function POST(request: NextRequest) {
  const { message, userId } = await request.json();
  
  // Verificar límite de mensajes
  const usage = await checkDailyUsage(userId);
  const isPremium = await checkPremiumStatus(userId);
  
  if (!isPremium && usage >= 10) {
    return NextResponse.json({
      error: 'Límite diario alcanzado. Upgrade a Premium para mensajes ilimitados.'
    }, { status: 429 });
  }
  
  // Obtener contexto del usuario
  const context = await getUserContext(userId);
  
  // Generar respuesta
  const response = await generateAIResponse(message, context);
  
  // Incrementar contador
  await incrementUsage(userId);
  
  return NextResponse.json({ response, usage: usage + 1 });
}
```

```typescript
// components/AIChat.tsx - Mejorado
export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState(0);
  const [limit] = useState(10);

  const sendMessage = async (text: string) => {
    setLoading(true);
    
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      setMessages([...messages, 
        { role: 'user', content: text },
        { role: 'assistant', content: data.response }
      ]);
      setUsage(data.usage);
    } else {
      // Mostrar error de límite
    }
    
    setLoading(false);
  };

  return (
    <div>
      {/* Indicador de uso */}
      <div className="text-xs text-gray-500">
        {usage}/{limit} mensajes hoy
      </div>
      
      {/* Chat UI */}
      {/* ... */}
    </div>
  );
}
```

### Costos Estimados
- GPT-4 Turbo: $0.01/1K input tokens, $0.03/1K output tokens
- Promedio por mensaje: ~500 tokens = $0.02
- 1000 usuarios × 5 mensajes/día = $100/día = $3000/mes
- Con Premium ($5/mes), break-even en 600 usuarios premium

---

## 3️⃣ Imágenes de Ejercicios (Semana 3-4)

### Objetivo
Agregar imágenes/GIFs/videos educativos para cada ejercicio.

### Fuentes de Contenido

#### Opción 1: API ExerciseDB (Recomendado)
- **Pros**: Gratis, 1300+ ejercicios con GIFs
- **Cons**: Requiere atribución
- **URL**: https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb

#### Opción 2: Wger API
- **Pros**: Open source, gratis
- **Cons**: Menos ejercicios, calidad variable

#### Opción 3: YouTube Embeds
- **Pros**: Videos de alta calidad
- **Cons**: Requiere conexión, más pesado

### Implementación

```typescript
// lib/exerciseMedia.ts
interface ExerciseMedia {
  exerciseId: string;
  imageUrl?: string;
  gifUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  source: 'exercisedb' | 'youtube' | 'custom';
  attribution?: string;
}

export async function fetchExerciseMedia(
  exerciseName: string
): Promise<ExerciseMedia | null> {
  // Buscar en ExerciseDB
  const response = await fetch(
    `https://exercisedb.p.rapidapi.com/exercises/name/${exerciseName}`,
    {
      headers: {
        'X-RapidAPI-Key': process.env.EXERCISEDB_API_KEY!,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
      }
    }
  );
  
  const data = await response.json();
  
  if (data.length > 0) {
    return {
      exerciseId: data[0].id,
      gifUrl: data[0].gifUrl,
      imageUrl: data[0].gifUrl, // Usar GIF como imagen
      source: 'exercisedb',
      attribution: 'ExerciseDB'
    };
  }
  
  return null;
}
```

```typescript
// components/ExerciseMediaViewer.tsx
export function ExerciseMediaViewer({ 
  exercise 
}: { 
  exercise: Exercise 
}) {
  const [media, setMedia] = useState<ExerciseMedia | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    loadMedia();
  }, [exercise.id]);

  const loadMedia = async () => {
    const data = await fetchExerciseMedia(exercise.name);
    setMedia(data);
    setLoading(false);
  };

  if (loading) {
    return <Skeleton className="w-full h-64" />;
  }

  if (!media) {
    return (
      <div className="text-center text-gray-500">
        No hay media disponible para este ejercicio
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* GIF/Imagen */}
      {media.gifUrl && !showVideo && (
        <div className="relative">
          <Image
            src={media.gifUrl}
            alt={exercise.name}
            width={400}
            height={300}
            className="rounded-lg"
            loading="lazy"
          />
          {media.videoUrl && (
            <button
              onClick={() => setShowVideo(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/70 transition"
            >
              <Play className="w-16 h-16 text-white" />
            </button>
          )}
        </div>
      )}

      {/* Video */}
      {showVideo && media.videoUrl && (
        <div className="aspect-video">
          <iframe
            src={media.videoUrl}
            className="w-full h-full rounded-lg"
            allowFullScreen
          />
        </div>
      )}

      {/* Atribución */}
      {media.attribution && (
        <p className="text-xs text-gray-500">
          Fuente: {media.attribution}
        </p>
      )}
    </div>
  );
}
```

```typescript
// Actualizar tipo Exercise
interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  // NUEVO
  media?: {
    imageUrl?: string;
    gifUrl?: string;
    videoUrl?: string;
  };
}
```

### Migración de Datos
```typescript
// scripts/fetch-exercise-media.ts
async function migrateExerciseMedia() {
  const exercises = EXERCISE_DATABASE;
  
  for (const exercise of exercises) {
    const media = await fetchExerciseMedia(exercise.name);
    
    if (media) {
      // Actualizar ejercicio con media
      exercise.media = {
        imageUrl: media.imageUrl,
        gifUrl: media.gifUrl,
        videoUrl: media.videoUrl
      };
    }
    
    // Rate limiting
    await sleep(100);
  }
  
  // Guardar ejercicios actualizados
  await saveExercises(exercises);
}
```

---

## 4️⃣ Sistema de Plantillas (Semana 4-5)

### Objetivo
Permitir guardar, compartir y usar plantillas de rutinas.

### Características

#### 4.1 Crear Plantilla desde Rutina
- Botón "Guardar como plantilla"
- Agregar descripción, tags, nivel
- Marcar como pública/privada

#### 4.2 Marketplace de Plantillas
- Explorar plantillas públicas
- Filtrar por: nivel, objetivo, duración, equipamiento
- Buscar por nombre
- Ver detalles y preview

#### 4.3 Usar Plantilla
- Crear rutina desde plantilla
- Personalizar antes de guardar
- Tracking de uso

### Implementación

```sql
-- supabase/migrations/create_templates.sql
CREATE TABLE routine_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  level text CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  goal text CHECK (goal IN ('strength', 'hypertrophy', 'endurance', 'general')),
  duration_minutes integer,
  exercises_count integer,
  equipment_needed text[],
  tags text[],
  is_public boolean DEFAULT false,
  use_count integer DEFAULT 0,
  rating_avg decimal(3,2),
  rating_count integer DEFAULT 0,
  data jsonb NOT NULL, -- Estructura de la rutina
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_templates_public ON routine_templates(is_public) WHERE is_public = true;
CREATE INDEX idx_templates_level ON routine_templates(level);
CREATE INDEX idx_templates_goal ON routine_templates(goal);
CREATE INDEX idx_templates_tags ON routine_templates USING GIN(tags);

-- RLS
ALTER TABLE routine_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public templates are viewable by everyone"
  ON routine_templates FOR SELECT
  USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Users can create their own templates"
  ON routine_templates FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own templates"
  ON routine_templates FOR UPDATE
  USING (auth.uid() = created_by);
```

```typescript
// app/templates/page.tsx
export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filters, setFilters] = useState({
    level: 'all',
    goal: 'all',
    equipment: []
  });

  return (
    <div>
      <h1>Plantillas de Rutinas</h1>
      
      {/* Filtros */}
      <TemplateFilters 
        filters={filters}
        onChange={setFilters}
      />
      
      {/* Grid de plantillas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <TemplateCard 
            key={template.id}
            template={template}
            onUse={handleUseTemplate}
          />
        ))}
      </div>
    </div>
  );
}
```

```typescript
// components/TemplateCard.tsx
export function TemplateCard({ template, onUse }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{template.name}</CardTitle>
        <div className="flex gap-2">
          <Badge>{template.level}</Badge>
          <Badge>{template.goal}</Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-gray-600">
          {template.description}
        </p>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            {template.duration_minutes} min
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Dumbbell className="w-4 h-4" />
            {template.exercises_count} ejercicios
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 fill-yellow-400" />
            {template.rating_avg} ({template.rating_count})
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <Button onClick={() => onUse(template)}>
            Usar Plantilla
          </Button>
          <Button variant="ghost">
            Vista Previa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 5️⃣ Gráficos Mejorados (Semana 5-6)

### Objetivo
Visualizaciones avanzadas de progreso con predicciones.

### Nuevos Gráficos

#### 5.1 Volumen por Grupo Muscular (Tiempo)
- Línea de tiempo mostrando volumen por grupo
- Comparar múltiples grupos
- Detectar desbalances

#### 5.2 Predicción de 1RM
- Calcular 1RM estimado por ejercicio
- Mostrar tendencia y predicción
- Algoritmo: Epley, Brzycki, etc.

#### 5.3 Comparación de Períodos
- Este mes vs mes pasado
- Esta semana vs semana pasada
- Métricas: volumen, frecuencia, intensidad

#### 5.4 Heatmap de Consistencia
- Calendario mostrando días entrenados
- Colores según intensidad
- Racha actual destacada

### Implementación

```typescript
// components/charts/VolumeByMuscleGroupChart.tsx
export function VolumeByMuscleGroupChart({ 
  sessions,
  muscleGroups 
}: Props) {
  const data = useMemo(() => {
    return processVolumeData(sessions, muscleGroups);
  }, [sessions, muscleGroups]);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        {muscleGroups.map((group, i) => (
          <Line
            key={group}
            type="monotone"
            dataKey={group}
            stroke={COLORS[i]}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
```

```typescript
// lib/predictions.ts
export function predict1RM(
  exercise: string,
  recentSets: Array<{ weight: number; reps: number }>
): {
  current: number;
  predicted30Days: number;
  predicted90Days: number;
  confidence: number;
} {
  // Calcular 1RM actual usando fórmula de Epley
  const current1RMs = recentSets.map(set => 
    set.weight * (1 + set.reps / 30)
  );
  const current = Math.max(...current1RMs);
  
  // Calcular tendencia (regresión lineal simple)
  const trend = calculateTrend(recentSets);
  
  // Predicción conservadora
  const predicted30Days = current + (trend * 30);
  const predicted90Days = current + (trend * 90);
  
  // Confianza basada en consistencia de datos
  const confidence = calculateConfidence(recentSets);
  
  return {
    current,
    predicted30Days,
    predicted90Days,
    confidence
  };
}
```

---

## 6️⃣ Sistema Social (Semana 6-8)

### Objetivo
Conectar usuarios para motivación y competencia sana.

### Características

#### 6.1 Agregar Amigos
- Por código de usuario
- Por email
- Escanear QR

#### 6.2 Feed Social
- Ver entrenamientos de amigos (opcional)
- Reaccionar con emojis
- Comentar

#### 6.3 Desafíos
- Crear desafío (ej: "100 flexiones en 1 semana")
- Invitar amigos
- Tabla de clasificación
- Premios virtuales

#### 6.4 Privacidad
- Control granular de qué compartir
- Perfil público/privado
- Bloquear usuarios

### Implementación

```sql
-- supabase/migrations/create_social.sql
CREATE TABLE friendships (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

CREATE TABLE challenges (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by uuid REFERENCES auth.users(id),
  name text NOT NULL,
  description text,
  type text CHECK (type IN ('volume', 'frequency', 'exercise_specific')),
  goal jsonb NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE challenge_participants (
  challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  progress jsonb,
  completed boolean DEFAULT false,
  PRIMARY KEY (challenge_id, user_id)
);

CREATE TABLE activity_feed (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text CHECK (type IN ('workout', 'pr', 'achievement', 'challenge')),
  data jsonb NOT NULL,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

```typescript
// app/social/page.tsx
export default function SocialPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Feed principal */}
      <div className="lg:col-span-2">
        <ActivityFeed items={feed} />
      </div>
      
      {/* Sidebar */}
      <div className="space-y-6">
        <FriendsList friends={friends} />
        <ActiveChallenges challenges={challenges} />
      </div>
    </div>
  );
}
```

---

## 📊 Métricas de Éxito

### Notificaciones
- Tasa de apertura > 30%
- Tasa de conversión (notificación → entrenamiento) > 15%

### AI Assistant
- Satisfacción del usuario > 4/5
- Tasa de upgrade a premium > 5%

### Imágenes
- Tiempo en página de ejercicios +50%
- Reducción de preguntas sobre forma

### Plantillas
- 50+ plantillas públicas en primer mes
- 30% de usuarios usan plantillas

### Gráficos
- Tiempo en página de progreso +40%
- Engagement con gráficos > 60%

### Social
- 20% de usuarios agregan amigos
- 10% participan en desafíos

---

## 🚀 Orden de Implementación Sugerido

1. **Semana 1-2**: Notificaciones + AI Assistant (paralelo)
2. **Semana 3-4**: Imágenes de ejercicios
3. **Semana 4-5**: Sistema de plantillas
4. **Semana 5-6**: Gráficos mejorados
5. **Semana 6-8**: Sistema social

**Total**: 6-8 semanas para completar todas las features de prioridad media.

---

**Última actualización**: Febrero 2026
