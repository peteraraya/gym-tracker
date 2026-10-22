create table if not exists public.workout_share_links (
  token text primary key check (token ~ '^[A-Za-z0-9_-]{43}$'),
  owner_id uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check (expires_at > created_at)
);

alter table public.workout_share_links enable row level security;

drop policy if exists "Owners manage workout share links"
  on public.workout_share_links;
create policy "Owners manage workout share links"
  on public.workout_share_links
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create or replace function public.get_shared_workout(p_token text)
returns jsonb
language sql
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'routine', jsonb_build_object(
      'name', r.name,
      'exercises', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'id', e.id,
            'name', e.name,
            'sets', e.sets,
            'reps', e.reps,
            'weight', e.weight
          )
          order by e.order_index
        )
        from public.exercises e
        where e.routine_id = r.id
      ), '[]'::jsonb)
    ),
    'workout', jsonb_build_object(
      'currentExerciseIndex', aw.data -> 'currentExerciseIndex',
      'currentSet', aw.data -> 'currentSet',
      'completedSets', aw.data -> 'completedSets',
      'actualReps', aw.data -> 'actualReps',
      'actualWeights', aw.data -> 'actualWeights',
      'startedAt', aw.data -> 'startedAt',
      'isResting', aw.data -> 'isResting'
    )
  )
  from public.workout_share_links l
  join public.active_workouts aw on aw.user_id = l.owner_id
  join public.routines r
    on r.id::text = aw.data ->> 'routineId'
    and r.user_id = l.owner_id
  where l.token = p_token
    and l.revoked_at is null
    and l.expires_at > now()
  limit 1;
$$;

revoke all on public.workout_share_links from anon, authenticated;
grant select, insert, update, delete on public.workout_share_links to authenticated;

revoke all on function public.get_shared_workout(text) from public;
grant execute on function public.get_shared_workout(text) to anon, authenticated;
