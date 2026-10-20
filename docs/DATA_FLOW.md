# Flujo de Datos — GymLogiX

Este documento describe cómo viajan los datos a través de la aplicación, desde la interfaz de usuario hasta la base de datos de Supabase y viceversa.

## 1. Arquitectura de Capas de Datos

La aplicación utiliza una **doble capa de datos** para soportar tanto web (SSR) como móvil (Capacitor/PWA):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CLIENTE (Navegador / App Móvil)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │  UI Layer   │  │  React      │  │  TanStack   │  │  Supabase       │   │
│  │  (Components│  │  Contexts   │  │  Query v5   │  │  Client (SSR)   │   │
│  │   + Hooks)  │  │  (Providers)│  │  (Cache)    │  │  + Service.ts   │   │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘   │
│         │                │                │                   │            │
│         ▼                ▼                ▼                   ▼            │
└─────────────────────────────────────────────────────────────────────────────┘
│                              SUPABASE (PostgreSQL)                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  auth.users         routines         workout_sessions               │   │
│  │  user_profiles      exercises        session_exercises              │   │
│  │  profiles           exercise_catalog session_sets                   │   │
│  │                                                       active_workouts│   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2. Flujo de Datos por Caso de Uso

### 2.1. Crear una Rutina

```mermaid
sequenceDiagram
    participant U as Usuario
    participant UI as RoutineForm (Client)
    participant RQ as TanStack Query
    participant SV as service.ts (Supabase Client)
    participant DB as Supabase / PostgreSQL

    U->>UI: Llena formulario (nombre, ejercicios, series)
    UI->>RQ: createRoutine(mutation)
    RQ->>SV: createRoutine(data)
    SV->>DB: INSERT INTO routines (user_id, name, ...)
    DB-->>SV: routine {id, ...}
    SV->>DB: INSERT INTO exercises (routine_id, name, sets, ...)
    DB-->>SV: success
    SV-->>RQ: { success: true, id: routineId }
    RQ-->>UI: invalidateQueries(['routines'])
    UI->>UI: Mostrar éxito + redirigir a rutina creada
```

### 2.2. Iniciar un Entrenamiento

```mermaid
sequenceDiagram
    participant U as Usuario
    participant UI as WorkoutPage (Client)
    participant WC as WorkoutContext
    participant SV as service.ts / shared-service.ts
    participant DB as Supabase / PostgreSQL

    U->>UI: Seleccionar rutina + "Iniciar entrenamiento"
    UI->>WC: setActiveWorkout(routineId)
    WC->>SV: createSession({routineId, ...})
    SV->>DB: INSERT INTO workout_sessions (user_id, routine_id, date)
    DB-->>SV: session {id, ...}
    SV->>DB: INSERT INTO active_workouts (user_id, session_id, ...)
    DB-->>SV: active_workout {id, ...}
    SV-->>WC: { session, activeWorkout }
    WC-->>UI: Estado inicializado
    UI->>UI: Mostrar timer + primer ejercicio
```

### 2.3. Registrar una Serie

```mermaid
sequenceDiagram
    participant U as Usuario
    participant UI as SeriesTable / ExerciseCard
    participant WC as WorkoutContext
    participant SV as service.ts
    participant DB as Supabase / PostgreSQL

    U->>UI: Ingresar reps y peso de la serie
    UI->>WC: completeSet(exerciseId, setNumber, reps, weight)
    WC->>SV: upsertSessionExercise({sessionId, exerciseId, ...})
    SV->>DB: UPSERT INTO session_exercises (session_id, exercise_id, actual_reps, actual_weight)
    DB-->>SV: session_exercise {id, ...}
    WC->>DB: UPDATE active_workouts SET current_set_number = current_set_number + 1
    SV-->>WC: Éxito
    WC-->>UI: Actualizar UI (siguiente serie / descanso)
    UI->>UI: Mostrar timer de descanso si aplica
```

### 2.4. Consultar Progreso (Dashboard)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant UI as DashboardPage (Server Component)
    participant SV as service.ts (Server)
    participant DB as Supabase / PostgreSQL

    UI->>SV: getSessions() + getRoutines()
    SV->>DB: SELECT * FROM workout_sessions WHERE user_id = ? ORDER BY date DESC
    SV->>DB: SELECT * FROM session_exercises WHERE session_id IN (...)
    DB-->>SV: Datos de sesiones y ejercicios
    SV-->>UI: Datos transformados
    UI->>UI: Renderizar gráficos (Recharts) + métricas
```

## 3. Capa de Caché (TanStack Query)

```
┌─────────────────────────────────────────────────────────────┐
│                    TanStack Query v5                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Query Key: ['routines', 'list']                      │  │
│  │  staleTime: 5 min (datos de usuario)                  │  │
│  │  gcTime: 10 min                                       │  │
│  │  refetchOnWindowFocus: false                          │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Query Key: ['exercises', 'muscle', 'pecho']          │  │
│  │  staleTime: Infinity (datos estáticos)                │  │
│  │  refetchOnMount: false                                │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 4. Flujo de Autenticación

```mermaid
sequenceDiagram
    participant U as Usuario
    participant UI as AuthPage
    participant AC as AuthContext
    participant SB as Supabase Auth

    U->>UI: Email + Contraseña
    UI->>SB: signInWithPassword({email, password})
    SB-->>UI: { user, session, error }
    UI->>AC: setUser(user)
    AC->>AC: Guardar en localStorage / cookies
    AC->>UI: Redirigir a dashboard
```

## 5. Flujo Offline (PWA / Móvil)

```
┌─────────────────────────────────────────────────────────────┐
│                      Estrategia Offline-First               │
│                                                             │
│  1. Intento de escritura a Supabase                         │
│     ├─ Éxito → Datos se persisten en DB + caché local       │
│     └─ Fallo (sin conexión) → Guardar en saveQueue          │
│                                                         │
│  2. saveQueue (IndexedDB / LocalStorage)                    │
│     ├─ Al recuperar conexión → flush() de operaciones       │
│     ├─ Cada operación se reintenta con backoff exponencial  │
│     └─ Max 3 reintentos antes de marcar como fallida        │
│                                                             │
│  3. Lecturas                                                │
│     ├─ Primero caché de TanStack Query                      │
│     ├─ Si no hay caché y sin conexión → mostrar estado vacío│
│     └─ Si hay conexión → fetch desde Supabase               │
└─────────────────────────────────────────────────────────────┘
```

## 6. Responsabilidades por Capa

| Capa | Responsabilidad | Tecnología |
|------|----------------|------------|
| **UI Layer** | Presentación, captura de entrada, navegación | React 19, Next.js 16, Tailwind CSS |
| **React Context** | Estado global de sesión (auth, tema, workout, equipo) | React Context API |
| **TanStack Query** | Caché de servidor, sincronización, mutaciones optimistas | TanStack Query v5 |
| **Supabase Service** | Operaciones CRUD, autenticación, RLS | @supabase/ssr, @supabase/supabase-js |
| **Supabase DB** | Almacenamiento persistente, integridad referencial, RLS | PostgreSQL 15+ |

## 7. Decisiones Arquitectónicas Clave

| Decisión | Razón | Documentada en |
|----------|-------|----------------|
| Doble capa de datos (service.ts + API Routes) | Compatibilidad con build estático móvil (Capacitor) | `docs/ADR/001-dual-data-layer.md` |
| Carga diferida de ejercicios por grupo muscular | Reducir bundle inicial de ~500 KB a ~35 KB | `docs/ADR/002-lazy-loading-exercises.md` |
| Offline-first con saveQueue | Soportar uso sin conexión en gimnasios | `docs/ADR/003-offline-first.md` |
| RLS en todas las tablas | Seguridad a nivel de fila sin middleware adicional | `supabase/schema.sql` |
