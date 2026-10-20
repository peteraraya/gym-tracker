-- Migración: Nuevas tablas para catálogo de ejercicios, sets individuales,
-- perfiles unificados y entrenamientos activos
-- Fecha: 2026-10-20
-- Idempotente: verifica existencia de tablas y columnas antes de operar.

-- ============================================================
-- TABLA: profiles
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
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

-- Añadir user_id de forma nullable para conservar filas existentes. Los perfiles
-- antiguos usan id = auth.uid(); solo se vinculan cuando ese usuario existe.
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'user_id'
  ) then
    alter table public.profiles add column user_id uuid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_user_id_fkey'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end $$;

update public.profiles as p
set user_id = p.id
from auth.users as u
where p.user_id is null
  and p.id = u.id;

create unique index if not exists profiles_user_id_unique_idx
  on public.profiles(user_id);

-- ============================================================
-- TABLA: exercise_catalog
-- ============================================================
create table if not exists public.exercise_catalog (
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
-- TABLA: routine_exercises
-- ============================================================
create table if not exists public.routine_exercises (
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
-- TABLA: session_sets
-- ============================================================
create table if not exists public.session_sets (
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
-- TABLA: active_workouts
-- ============================================================
create table if not exists public.active_workouts (
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
-- CONSTRAINT: array lengths match in session_exercises
-- ============================================================
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'chk_session_exercises_array_lengths'
      and conrelid = 'public.session_exercises'::regclass
  ) then
    alter table public.session_exercises
      add constraint chk_session_exercises_array_lengths
      check (array_length(actual_reps, 1) = array_length(actual_weight, 1));
  end if;
end $$;

-- ============================================================
-- ENABLE RLS ON NEW TABLES
-- ============================================================
alter table if exists public.profiles enable row level security;
alter table if exists public.exercise_catalog enable row level security;
alter table if exists public.routine_exercises enable row level security;
alter table if exists public.session_sets enable row level security;
alter table if exists public.active_workouts enable row level security;

-- ============================================================
-- POLICIES: profiles (solo si existe la columna user_id)
-- ============================================================
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'user_id'
  ) then
    execute 'drop policy if exists "Users can view own profile" on public.profiles';
    execute 'drop policy if exists "Users can insert own profile" on public.profiles';
    execute 'drop policy if exists "Users can update own profile" on public.profiles';
    execute 'drop policy if exists "Users can delete own profile" on public.profiles';
    execute 'drop policy if exists "Users can view their own profile" on public.profiles';
    execute 'create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = coalesce(user_id, id))';
    execute 'drop policy if exists "Users can create their own profile" on public.profiles';
    execute 'create policy "Users can create their own profile" on public.profiles for insert with check (auth.uid() = coalesce(user_id, id))';
    execute 'drop policy if exists "Users can update their own profile" on public.profiles';
    execute 'create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = coalesce(user_id, id)) with check (auth.uid() = coalesce(user_id, id))';
    execute 'drop policy if exists "Users can delete their own profile" on public.profiles';
    execute 'create policy "Users can delete their own profile" on public.profiles for delete using (auth.uid() = coalesce(user_id, id))';
  end if;
end $$;

-- ============================================================
-- POLICIES: exercise_catalog
-- ============================================================
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'exercise_catalog' and column_name = 'user_id'
  ) then
    execute 'drop policy if exists "Users can view public exercises and their own custom exercises" on public.exercise_catalog';
    execute 'create policy "Users can view public exercises and their own custom exercises" on public.exercise_catalog for select using (is_public = true OR auth.uid() = user_id)';
    execute 'drop policy if exists "Users can create their own custom exercises" on public.exercise_catalog';
    execute 'create policy "Users can create their own custom exercises" on public.exercise_catalog for insert with check (auth.uid() = user_id)';
    execute 'drop policy if exists "Users can update their own custom exercises" on public.exercise_catalog';
    execute 'create policy "Users can update their own custom exercises" on public.exercise_catalog for update using (auth.uid() = user_id)';
    execute 'drop policy if exists "Users can delete their own custom exercises" on public.exercise_catalog';
    execute 'create policy "Users can delete their own custom exercises" on public.exercise_catalog for delete using (auth.uid() = user_id)';
  end if;
end $$;

-- ============================================================
-- POLICIES: routine_exercises (heredan propiedad de la rutina padre)
-- ============================================================
do $$
begin
  execute 'drop policy if exists "Users can view routine exercises from their routines" on public.routine_exercises';
  execute 'create policy "Users can view routine exercises from their routines" on public.routine_exercises for select using (exists (select 1 from public.routines where routines.id = routine_exercises.routine_id and routines.user_id = auth.uid()))';
  execute 'drop policy if exists "Users can create routine exercises for their routines" on public.routine_exercises';
  execute 'create policy "Users can create routine exercises for their routines" on public.routine_exercises for insert with check (exists (select 1 from public.routines where routines.id = routine_exercises.routine_id and routines.user_id = auth.uid()))';
  execute 'drop policy if exists "Users can update routine exercises from their routines" on public.routine_exercises';
  execute 'create policy "Users can update routine exercises from their routines" on public.routine_exercises for update using (exists (select 1 from public.routines where routines.id = routine_exercises.routine_id and routines.user_id = auth.uid()))';
  execute 'drop policy if exists "Users can delete routine exercises from their routines" on public.routine_exercises';
  execute 'create policy "Users can delete routine exercises from their routines" on public.routine_exercises for delete using (exists (select 1 from public.routines where routines.id = routine_exercises.routine_id and routines.user_id = auth.uid()))';
end $$;

-- ============================================================
-- POLICIES: session_sets (heredan propiedad a través de sesión)
-- ============================================================
do $$
begin
  execute 'drop policy if exists "Users can view session sets from their sessions" on public.session_sets';
  execute 'create policy "Users can view session sets from their sessions" on public.session_sets for select using (exists (select 1 from public.session_exercises join public.workout_sessions on workout_sessions.id = session_exercises.session_id where session_exercises.id = session_sets.session_exercise_id and workout_sessions.user_id = auth.uid()))';
  execute 'drop policy if exists "Users can create session sets for their sessions" on public.session_sets';
  execute 'create policy "Users can create session sets for their sessions" on public.session_sets for insert with check (exists (select 1 from public.session_exercises join public.workout_sessions on workout_sessions.id = session_exercises.session_id where session_exercises.id = session_sets.session_exercise_id and workout_sessions.user_id = auth.uid()))';
  execute 'drop policy if exists "Users can update session sets from their sessions" on public.session_sets';
  execute 'create policy "Users can update session sets from their sessions" on public.session_sets for update using (exists (select 1 from public.session_exercises join public.workout_sessions on workout_sessions.id = session_exercises.session_id where session_exercises.id = session_sets.session_exercise_id and workout_sessions.user_id = auth.uid()))';
  execute 'drop policy if exists "Users can delete session sets from their sessions" on public.session_sets';
  execute 'create policy "Users can delete session sets from their sessions" on public.session_sets for delete using (exists (select 1 from public.session_exercises join public.workout_sessions on workout_sessions.id = session_exercises.session_id where session_exercises.id = session_sets.session_exercise_id and workout_sessions.user_id = auth.uid()))';
end $$;

-- ============================================================
-- POLICIES: active_workouts
-- ============================================================
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'active_workouts' and column_name = 'user_id'
  ) then
    execute 'drop policy if exists "Users can view their own active workouts" on public.active_workouts';
    execute 'create policy "Users can view their own active workouts" on public.active_workouts for select using (auth.uid() = user_id)';
    execute 'drop policy if exists "Users can create their own active workouts" on public.active_workouts';
    execute 'create policy "Users can create their own active workouts" on public.active_workouts for insert with check (auth.uid() = user_id)';
    execute 'drop policy if exists "Users can update their own active workouts" on public.active_workouts';
    execute 'create policy "Users can update their own active workouts" on public.active_workouts for update using (auth.uid() = user_id)';
    execute 'drop policy if exists "Users can delete their own active workouts" on public.active_workouts';
    execute 'create policy "Users can delete their own active workouts" on public.active_workouts for delete using (auth.uid() = user_id)';
  end if;
end $$;

-- ============================================================
-- ÍNDICES PARA RENDIMIENTO
-- ============================================================
create index if not exists workout_sessions_user_date_idx on public.workout_sessions(user_id, date desc);
create index if not exists exercise_catalog_muscle_group_idx on public.exercise_catalog(muscle_group, is_public);
create index if not exists routine_exercises_routine_order_idx on public.routine_exercises(routine_id, order_index);
create index if not exists session_sets_session_exercise_idx on public.session_sets(session_exercise_id, set_number);
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'active_workouts' and column_name = 'user_id'
  ) then
    create index if not exists active_workouts_user_id_idx on public.active_workouts(user_id);
  end if;
end $$;
-- ============================================================
-- TRIGGERS PARA NUEVAS TABLAS (updated_at automático)
-- ============================================================
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'handle_profiles_updated_at' and tgrelid = 'public.profiles'::regclass) then
    create trigger handle_profiles_updated_at before update on public.profiles for each row execute function public.handle_updated_at();
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'handle_exercise_catalog_updated_at' and tgrelid = 'public.exercise_catalog'::regclass) then
    create trigger handle_exercise_catalog_updated_at before update on public.exercise_catalog for each row execute function public.handle_updated_at();
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'handle_routine_exercises_updated_at' and tgrelid = 'public.routine_exercises'::regclass) then
    create trigger handle_routine_exercises_updated_at before update on public.routine_exercises for each row execute function public.handle_updated_at();
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'handle_session_sets_updated_at' and tgrelid = 'public.session_sets'::regclass) then
    create trigger handle_session_sets_updated_at before update on public.session_sets for each row execute function public.handle_updated_at();
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'handle_active_workouts_updated_at' and tgrelid = 'public.active_workouts'::regclass) then
    create trigger handle_active_workouts_updated_at before update on public.active_workouts for each row execute function public.handle_updated_at();
  end if;
end $$;
