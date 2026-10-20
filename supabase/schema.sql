-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Routines table
create table public.routines (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  image_url text,
  rest_between_sets integer default 60,
  rest_between_exercises integer default 120,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Exercises table
create table public.exercises (
  id uuid primary key default uuid_generate_v4(),
  routine_id uuid references public.routines(id) on delete cascade not null,
  name text not null,
  sets integer not null,
  reps integer not null,
  weight numeric,
  notes text,
  order_index integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Workout sessions table
create table public.workout_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  routine_id uuid references public.routines(id) on delete cascade not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Session exercises table (records for each exercise in a session)
create table public.session_exercises (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references public.workout_sessions(id) on delete cascade not null,
  exercise_id uuid references public.exercises(id) on delete cascade not null,
  completed_sets integer not null,
  actual_reps integer[] not null,
  actual_weight numeric[] not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User profiles table
create table public.user_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  age integer,
  gender text check (gender in ('male', 'female', 'other')),
  height numeric, -- en cm
  weight numeric, -- en kg
  weight_history jsonb, -- historial de peso: [{date, weight}] en kg
  fitness_goal text check (fitness_goal in ('muscle_gain', 'strength', 'weight_loss', 'endurance', 'general_fitness')),
  fitness_level text check (fitness_level in ('beginner', 'intermediate', 'advanced')),
  weekly_workouts integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Policies
alter table public.routines enable row level security;
alter table public.exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.session_exercises enable row level security;
alter table public.user_profiles enable row level security;

-- Routines policies
create policy "Users can view their own routines"
  on public.routines for select
  using (auth.uid() = user_id);

create policy "Users can create their own routines"
  on public.routines for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own routines"
  on public.routines for update
  using (auth.uid() = user_id);

create policy "Users can delete their own routines"
  on public.routines for delete
  using (auth.uid() = user_id);

-- Exercises policies
create policy "Users can view exercises from their routines"
  on public.exercises for select
  using (exists (
    select 1 from public.routines
    where routines.id = exercises.routine_id
    and routines.user_id = auth.uid()
  ));

create policy "Users can create exercises for their routines"
  on public.exercises for insert
  with check (exists (
    select 1 from public.routines
    where routines.id = exercises.routine_id
    and routines.user_id = auth.uid()
  ));

create policy "Users can update exercises from their routines"
  on public.exercises for update
  using (exists (
    select 1 from public.routines
    where routines.id = exercises.routine_id
    and routines.user_id = auth.uid()
  ));

create policy "Users can delete exercises from their routines"
  on public.exercises for delete
  using (exists (
    select 1 from public.routines
    where routines.id = exercises.routine_id
    and routines.user_id = auth.uid()
  ));

-- Workout sessions policies
create policy "Users can view their own sessions"
  on public.workout_sessions for select
  using (auth.uid() = user_id);

create policy "Users can create their own sessions"
  on public.workout_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own sessions"
  on public.workout_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own sessions"
  on public.workout_sessions for delete
  using (auth.uid() = user_id);

-- Session exercises policies
create policy "Users can view session exercises from their sessions"
  on public.session_exercises for select
  using (exists (
    select 1 from public.workout_sessions
    where workout_sessions.id = session_exercises.session_id
    and workout_sessions.user_id = auth.uid()
  ));

create policy "Users can create session exercises for their sessions"
  on public.session_exercises for insert
  with check (exists (
    select 1 from public.workout_sessions
    where workout_sessions.id = session_exercises.session_id
    and workout_sessions.user_id = auth.uid()
  ));

create policy "Users can update session exercises from their sessions"
  on public.session_exercises for update
  using (exists (
    select 1 from public.workout_sessions
    where workout_sessions.id = session_exercises.session_id
    and workout_sessions.user_id = auth.uid()
  ));

create policy "Users can delete session exercises from their sessions"
  on public.session_exercises for delete
  using (exists (
    select 1 from public.workout_sessions
    where workout_sessions.id = session_exercises.session_id
    and workout_sessions.user_id = auth.uid()
  ));

-- User profiles policies
create policy "Users can view their own profile"
  on public.user_profiles for select
  using (auth.uid() = user_id);

create policy "Users can create their own profile"
  on public.user_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.user_profiles for update
  using (auth.uid() = user_id);

create policy "Users can delete their own profile"
  on public.user_profiles for delete
  using (auth.uid() = user_id);

-- Indexes for better performance
create index routines_user_id_idx on public.routines(user_id);
create index exercises_routine_id_idx on public.exercises(routine_id);
create index workout_sessions_user_id_idx on public.workout_sessions(user_id);
create index workout_sessions_routine_id_idx on public.workout_sessions(routine_id);
create index session_exercises_session_id_idx on public.session_exercises(session_id);
create index session_exercises_exercise_id_idx on public.session_exercises(exercise_id);
create index user_profiles_user_id_idx on public.user_profiles(user_id);

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at
create trigger handle_routines_updated_at
  before update on public.routines
  for each row
  execute function public.handle_updated_at();

create trigger handle_user_profiles_updated_at
  before update on public.user_profiles
  for each row
  execute function public.handle_updated_at();

-- ============================================================
-- TABLA: profiles (unificada con user_profiles para consistencia)
-- ============================================================
create table public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  age integer,
  gender text check (gender in ('male', 'female', 'other')),
  height numeric,
  weight numeric,
  weight_history jsonb default '[]'::jsonb,
  fitness_goal text check (fitness_goal in ('muscle_gain', 'strength', 'weight_loss', 'endurance', 'general_fitness')),
  fitness_level text check (fitness_level in ('beginner', 'intermediate', 'advanced')),
  weekly_workouts integer default 3,
  weekly_plan jsonb default '{}'::jsonb,
  last_weights jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- TABLA: exercise_catalog (catálogo global de ejercicios)
-- ============================================================
create table public.exercise_catalog (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  muscle_group text not null,
  equipment text,
  default_sets integer default 3,
  default_reps integer default 10,
  default_rest_seconds integer default 60,
  youtube_video_id text,
  image_url text,
  technique text[],
  instructions text[],
  is_custom boolean default false,
  is_public boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- TABLA: routine_exercises (vínculo rutina → ejercicio del catálogo)
-- ============================================================
create table public.routine_exercises (
  id uuid primary key default uuid_generate_v4(),
  routine_id uuid references public.routines(id) on delete cascade not null,
  catalog_exercise_id uuid references public.exercise_catalog(id) on delete set null,
  name text not null,
  sets integer not null,
  reps integer not null,
  weight numeric,
  rest_seconds integer,
  order_index integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- TABLA: session_sets (sets individuales para analítica)
-- ============================================================
create table public.session_sets (
  id uuid primary key default uuid_generate_v4(),
  session_exercise_id uuid references public.session_exercises(id) on delete cascade not null,
  set_number integer not null,
  planned_reps integer,
  planned_weight numeric,
  actual_reps integer,
  actual_weight numeric,
  rpe integer check (rpe between 1 and 10),
  rir integer check (rir between 0 and 10),
  completed boolean default false,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  rest_taken_seconds integer,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- TABLA: active_workouts (entrenamiento activo actual)
-- ============================================================
create table public.active_workouts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  session_id uuid references public.workout_sessions(id) on delete set null,
  current_exercise_id uuid,
  current_set_number integer default 1,
  is_paused boolean default false,
  paused_at timestamp with time zone,
  rest_timer_ends_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- CONSTRAINTS DE INTEGRIDAD
-- ============================================================

-- Asegurar que actual_reps y actual_weight tengan la misma longitud en session_exercises
alter table public.session_exercises
  add constraint chk_session_exercises_array_lengths
  check (array_length(actual_reps, 1) = array_length(actual_weight, 1));

-- ============================================================
-- ROW LEVEL SECURITY (RLS) PARA NUEVAS TABLAS
-- ============================================================

alter table public.profiles enable row level security;
alter table public.exercise_catalog enable row level security;
alter table public.routine_exercises enable row level security;
alter table public.session_sets enable row level security;
alter table public.active_workouts enable row level security;

-- Policies: profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can create their own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

create policy "Users can delete their own profile"
  on public.profiles for delete
  using (auth.uid() = user_id);

-- Policies: exercise_catalog
create policy "Users can view public exercises and their own custom exercises"
  on public.exercise_catalog for select
  using (is_public = true OR auth.uid() = user_id);

create policy "Users can create their own custom exercises"
  on public.exercise_catalog for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own custom exercises"
  on public.exercise_catalog for update
  using (auth.uid() = user_id);

create policy "Users can delete their own custom exercises"
  on public.exercise_catalog for delete
  using (auth.uid() = user_id);

-- Policies: routine_exercises
create policy "Users can view routine exercises from their routines"
  on public.routine_exercises for select
  using (exists (
    select 1 from public.routines
    where routines.id = routine_exercises.routine_id
    and routines.user_id = auth.uid()
  ));

create policy "Users can create routine exercises for their routines"
  on public.routine_exercises for insert
  with check (exists (
    select 1 from public.routines
    where routines.id = routine_exercises.routine_id
    and routines.user_id = auth.uid()
  ));

create policy "Users can update routine exercises from their routines"
  on public.routine_exercises for update
  using (exists (
    select 1 from public.routines
    where routines.id = routine_exercises.routine_id
    and routines.user_id = auth.uid()
  ));

create policy "Users can delete routine exercises from their routines"
  on public.routine_exercises for delete
  using (exists (
    select 1 from public.routines
    where routines.id = routine_exercises.routine_id
    and routines.user_id = auth.uid()
  ));

-- Policies: session_sets
create policy "Users can view session sets from their sessions"
  on public.session_sets for select
  using (exists (
    select 1 from public.session_exercises
    join public.workout_sessions on workout_sessions.id = session_exercises.session_id
    where session_exercises.id = session_sets.session_exercise_id
    and workout_sessions.user_id = auth.uid()
  ));

create policy "Users can create session sets for their sessions"
  on public.session_sets for insert
  with check (exists (
    select 1 from public.session_exercises
    join public.workout_sessions on workout_sessions.id = session_exercises.session_id
    where session_exercises.id = session_sets.session_exercise_id
    and workout_sessions.user_id = auth.uid()
  ));

create policy "Users can update session sets from their sessions"
  on public.session_sets for update
  using (exists (
    select 1 from public.session_exercises
    join public.workout_sessions on workout_sessions.id = session_exercises.session_id
    where session_exercises.id = session_sets.session_exercise_id
    and workout_sessions.user_id = auth.uid()
  ));

create policy "Users can delete session sets from their sessions"
  on public.session_sets for delete
  using (exists (
    select 1 from public.session_exercises
    join public.workout_sessions on workout_sessions.id = session_exercises.session_id
    where session_exercises.id = session_sets.session_exercise_id
    and workout_sessions.user_id = auth.uid()
  ));

-- Policies: active_workouts
create policy "Users can view their own active workouts"
  on public.active_workouts for select
  using (auth.uid() = user_id);

create policy "Users can create their own active workouts"
  on public.active_workouts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own active workouts"
  on public.active_workouts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own active workouts"
  on public.active_workouts for delete
  using (auth.uid() = user_id);


-- ============================================================
-- ÍNDICES PARA RENDIMIENTO
-- ============================================================

-- Índice compuesto: consultas de historial por usuario ordenado por fecha (muy frecuente en dashboard)
create index workout_sessions_user_date_idx on public.workout_sessions(user_id, date desc);

-- Índice para catálogo por grupo muscular (filtros frecuentes en UI de ejercicios)
create index exercise_catalog_muscle_group_idx on public.exercise_catalog(muscle_group, is_public);

-- Índice para ejercicios de rutina ordenados
create index routine_exercises_routine_order_idx on public.routine_exercises(routine_id, order_index);

-- Índice para sets individuales por ejercicio de sesión
create index session_sets_session_exercise_idx on public.session_sets(session_exercise_id, set_number);

-- Índice para active_workouts por usuario (consulta rápida de entrenamiento activo)
create index active_workouts_user_id_idx on public.active_workouts(user_id);

-- Índice para profiles por user_id
create index profiles_user_id_idx on public.profiles(user_id);

-- ============================================================
-- TRIGGERS PARA NUEVAS TABLAS (updated_at automático)
-- ============================================================

create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

create trigger handle_exercise_catalog_updated_at
  before update on public.exercise_catalog
  for each row
  execute function public.handle_updated_at();

create trigger handle_routine_exercises_updated_at
  before update on public.routine_exercises
  for each row
  execute function public.handle_updated_at();

create trigger handle_session_sets_updated_at
  before update on public.session_sets
  for each row
  execute function public.handle_updated_at();

create trigger handle_active_workouts_updated_at
  before update on public.active_workouts
  for each row
  execute function public.handle_updated_at();
