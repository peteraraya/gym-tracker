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
