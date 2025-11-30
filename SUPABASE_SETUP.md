# Configuración de Supabase

## Pasos para configurar el proyecto:

### 1. Crear cuenta en Supabase
1. Ve a https://supabase.com
2. Crea una cuenta gratis
3. Crea un nuevo proyecto

### 2. Configurar la base de datos
1. En el dashboard de Supabase, ve a "SQL Editor"
2. Copia y pega el contenido del archivo `supabase/schema.sql`
3. Ejecuta el SQL para crear las tablas y políticas

### 3. Configurar las variables de entorno
1. En tu proyecto de Supabase, ve a Settings > API
2. Copia los valores:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Pégalos en el archivo `.env.local`

### 4. Configurar Storage para imágenes (opcional)
1. Ve a "Storage" en el dashboard
2. Si no existe, crea un nuevo bucket llamado "routine-images"
3. Configura las políticas de acceso ejecutando este SQL en "SQL Editor" (copia solo las líneas de código, SIN los backticks):

   ```sql
   -- IMPORTANTE: Copia solo estas líneas, sin los ``` de arriba y abajo
   
   -- Si el bucket no existe, créalo (si ya existe, omite esta línea)
   insert into storage.buckets (id, name, public)
   values ('routine-images', 'routine-images', true)
   on conflict (id) do nothing;

   -- Permitir que cualquiera vea las imágenes
   create policy "Anyone can view routine images"
   on storage.objects for select
   using (bucket_id = 'routine-images');

   -- Permitir que usuarios autenticados suban imágenes
   create policy "Users can upload routine images"
   on storage.objects for insert
   with check (bucket_id = 'routine-images' and auth.role() = 'authenticated');

   -- Permitir que usuarios autenticados actualicen sus imágenes
   create policy "Users can update their routine images"
   on storage.objects for update
   using (bucket_id = 'routine-images' and auth.role() = 'authenticated');

   -- Permitir que usuarios autenticados eliminen sus imágenes
   create policy "Users can delete their routine images"
   on storage.objects for delete
   using (bucket_id = 'routine-images' and auth.role() = 'authenticated');
   ```

### 5. Configurar autenticación
1. Ve a "Authentication" > "Providers"
2. Habilita "Email" (ya está habilitado por defecto)
3. Opcionalmente, habilita proveedores OAuth (Google, GitHub, etc.)

## Estructura de la Base de Datos

### Tablas:
- **routines**: Rutinas de entrenamiento
- **exercises**: Ejercicios dentro de las rutinas
- **workout_sessions**: Sesiones de entrenamiento completadas
- **session_exercises**: Detalles de ejercicios en cada sesión
- **user_profiles**: Perfiles de usuario con datos personales y objetivos

### Relaciones:
```
users (auth.users)
  ├── user_profiles (perfil personal)
  ├── routines
  │     └── exercises
  └── workout_sessions
        └── session_exercises
```

## Actualización del esquema (si ya tienes la base de datos creada)

Si ya configuraste Supabase anteriormente y necesitas agregar la tabla de perfiles, copia y pega este código en el SQL Editor (sin los backticks):

```sql
-- IMPORTANTE: Copia solo estas líneas, sin los ``` de arriba y abajo

-- Crear tabla de perfiles de usuario
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

-- Habilitar Row Level Security
alter table public.user_profiles enable row level security;

-- Políticas de seguridad para que cada usuario solo vea su propio perfil
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

-- Crear índice para mejorar el rendimiento
create index user_profiles_user_id_idx on public.user_profiles(user_id);

-- Trigger para actualizar automáticamente la fecha de modificación
create trigger handle_user_profiles_updated_at
  before update on public.user_profiles
  for each row
  execute function public.handle_updated_at();
```

## Seguridad (RLS - Row Level Security)

Todas las tablas tienen políticas de seguridad configuradas:
- Los usuarios solo pueden ver/editar/eliminar sus propios datos
- Las relaciones están protegidas (solo puedes crear ejercicios para tus rutinas)

## Próximos pasos

Después de configurar Supabase:
1. La aplicación usará la base de datos en lugar de localStorage
2. Las imágenes se podrán subir a Supabase Storage
3. Los datos estarán disponibles en cualquier dispositivo
4. Los datos persistirán incluso si borras el caché del navegador
