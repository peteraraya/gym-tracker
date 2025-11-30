# 💪 Gym Tracker

Una aplicación web moderna y completa para el seguimiento de entrenamientos en el gimnasio, construida con Next.js 16, React 19, TypeScript y Supabase.

![Next.js](https://img.shields.io/badge/Next.js-16.0.5-black)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)

## 📋 Características

### 🏋️ Gestión de Rutinas
- **Crear rutinas personalizadas** con múltiples ejercicios
- **Base de datos de +180 ejercicios** organizados por grupos musculares
- **Imágenes y GIFs** demostrativos para cada ejercicio
- **Recomendaciones de técnica** para cada ejercicio
- **Configuración de series, repeticiones y pesos** personalizables
- **Tiempos de descanso** configurables entre series y ejercicios

### 📊 Seguimiento de Entrenamientos
- **Registro de sesiones** de entrenamiento en tiempo real
- **Temporizador de descanso** integrado
- **Historial completo** de todas tus sesiones
- **Seguimiento de progreso** con estadísticas detalladas
- **Gráficos de volumen** de entrenamiento

### 📈 Análisis y Progreso
- **Dashboard interactivo** con métricas clave
- **Mapa de calor de actividad** (estilo GitHub)
- **Estadísticas por grupo muscular**
- **Seguimiento de volumen total** (series × reps × peso)
- **Visualización de progreso** en el tiempo

### 👤 Perfil y Personalización
- **Perfil de usuario** con datos personales
- **Configuración de objetivos** (ganancia muscular, fuerza, pérdida de peso, etc.)
- **Nivel de fitness** (principiante, intermedio, avanzado)
- **Seguimiento de peso y medidas**

### 🎯 Rutinas Recomendadas
- **Sistema de recomendaciones** basado en perfil y objetivos
- **Rutinas pregeneradas** para diferentes niveles
- **Recomendaciones personalizadas** según:
  - Nivel de fitness
  - Objetivos de entrenamiento
  - Frecuencia semanal
  - Equipo disponible

### 🎨 Interfaz y UX
- **Diseño moderno y responsivo** con Tailwind CSS
- **Soporte multi-idioma** (Español e Inglés)
- **Modo oscuro/claro** (próximamente)
- **Componentes reutilizables** con UI consistente
- **Navegación intuitiva** entre secciones

### 🔒 Autenticación y Seguridad
- **Autenticación segura** con Supabase Auth
- **Row Level Security (RLS)** en la base de datos
- **Rutas protegidas** para usuarios autenticados
- **Gestión de sesiones** persistente

## 🚀 Tecnologías Utilizadas

### Frontend
- **Next.js 16** - Framework React con App Router
- **React 19** - Librería de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Framework de estilos
- **next-intl** - Internacionalización
- **lucide-react** - Iconos modernos

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL - Base de datos
  - Auth - Autenticación
  - Storage - Almacenamiento de imágenes
  - Row Level Security - Seguridad a nivel de fila

### Optimizaciones
- **React Compiler** - Optimización automática de componentes
- **Server Components** - Renderizado del lado del servidor
- **Client Components** - Interactividad del cliente
- **Suspense & Lazy Loading** - Carga diferida

## 📁 Estructura del Proyecto

```
gym-tracker/
├── app/                      # App Router de Next.js
│   ├── api/                  # API Routes
│   │   ├── profile/         # Endpoints de perfil
│   │   ├── routines/        # Endpoints de rutinas
│   │   └── sessions/        # Endpoints de sesiones
│   ├── auth/                # Página de autenticación
│   ├── dashboard/           # Dashboard principal
│   ├── equipment/           # Gestión de equipo
│   ├── exercises/           # Biblioteca de ejercicios
│   ├── profile/             # Perfil de usuario
│   ├── progress/            # Seguimiento de progreso
│   ├── recommended/         # Rutinas recomendadas
│   ├── routines/            # Gestión de rutinas
│   ├── sessions/            # Historial de sesiones
│   ├── setup/               # Configuración inicial
│   └── workout/             # Página de entrenamiento activo
├── components/              # Componentes reutilizables
│   ├── ui/                  # Componentes de UI base
│   ├── ActivityHeatmap.tsx  # Mapa de calor
│   ├── BodyMap.tsx          # Mapa corporal
│   ├── ExerciseSelector.tsx # Selector de ejercicios
│   ├── Navbar.tsx           # Barra de navegación
│   ├── RoutineForm.tsx      # Formulario de rutinas
│   ├── Timer.tsx            # Temporizador
│   └── VolumeChart.tsx      # Gráfico de volumen
├── context/                 # Contextos de React
│   ├── AuthContext.tsx      # Contexto de autenticación
│   ├── EquipmentContext.tsx # Contexto de equipo
│   ├── GymContext.tsx       # Contexto principal
│   └── LocaleContext.tsx    # Contexto de idioma
├── data/                    # Datos estáticos
│   ├── exercises.ts         # Base de datos de ejercicios
│   ├── equipment.ts         # Equipos de gimnasio
│   └── recommendedRoutines.ts # Rutinas predefinidas
├── lib/                     # Utilidades
│   ├── recommendations.ts   # Sistema de recomendaciones
│   └── supabase/           # Cliente de Supabase
├── messages/               # Traducciones
│   ├── en.json            # Inglés
│   └── es.json            # Español
├── public/                # Archivos públicos
│   └── exercises/         # Imágenes de ejercicios
├── supabase/              # Configuración de Supabase
│   └── schema.sql         # Esquema de base de datos
└── types/                 # Tipos de TypeScript
    └── index.ts          # Tipos globales
```

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 20 o superior
- npm o yarn
- Cuenta de Supabase (gratis)

### 1. Clonar el repositorio
```bash
git clone https://github.com/peteraraya/gym-tracker.git
cd gym-tracker
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Supabase

#### Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta y un nuevo proyecto
3. Espera a que el proyecto se inicialice

#### Configurar la base de datos
1. En el dashboard de Supabase, ve a **SQL Editor**
2. Copia y pega el contenido de `supabase/schema.sql`
3. Ejecuta el SQL para crear las tablas y políticas

#### Configurar variables de entorno
1. Crea un archivo `.env.local` en la raíz del proyecto:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

2. En tu proyecto de Supabase, ve a **Settings > API**
3. Copia los valores:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Configurar Storage (opcional)
Para las imágenes de rutinas personalizadas:
1. Ve a **Storage** en el dashboard
2. Crea un bucket llamado `routine-images`
3. Configura como público
4. Aplica las políticas de acceso (ver `SUPABASE_SETUP.md`)

### 4. Ejecutar la aplicación

#### Modo desarrollo
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

#### Modo producción
```bash
npm run build
npm start
```

## 📖 Guía de Uso

### Primera vez
1. **Registra una cuenta** en la página de autenticación
2. **Completa tu perfil** con datos personales y objetivos
3. **Explora rutinas recomendadas** o crea la tuya propia

### Crear una rutina
1. Ve a **Rutinas** → **Crear Nueva Rutina**
2. Dale un nombre y descripción
3. Agrega ejercicios de la base de datos
4. Configura series, repeticiones y pesos
5. Ajusta tiempos de descanso
6. Guarda tu rutina

### Realizar un entrenamiento
1. Selecciona una rutina desde **Rutinas**
2. Haz clic en **Iniciar Entrenamiento**
3. Sigue los ejercicios en orden
4. Registra los pesos y repeticiones reales
5. Usa el temporizador para los descansos
6. Completa la sesión

### Ver tu progreso
1. Ve al **Dashboard** para ver estadísticas generales
2. Visita **Progreso** para análisis detallados
3. Consulta el **Historial** de sesiones

## 🎯 Grupos Musculares Soportados

- 💪 **Pecho**: Press de banca, aperturas, fondos, etc.
- 🔙 **Espalda**: Dominadas, remo, peso muerto, etc.
- 🦵 **Piernas**: Sentadillas, prensa, curl femoral, etc.
- 🏋️ **Hombros**: Press militar, elevaciones, remo al mentón, etc.
- 💪 **Brazos**: Curl bíceps, press francés, tríceps, etc.
- 🧘 **Core**: Abdominales, planchas, oblicuos, etc.
- 🍑 **Glúteos**: Hip thrust, patada, puente, etc.
- 🦿 **Pantorrillas**: Elevaciones de talones, etc.

## 🌍 Idiomas Soportados

- 🇪🇸 Español
- 🇬🇧 English

Cambia el idioma usando el selector en la barra de navegación.

## 📊 Base de Datos

### Tablas principales

#### `routines`
Rutinas de entrenamiento de los usuarios
- `id`, `user_id`, `name`, `description`
- `image_url`, `rest_between_sets`, `rest_between_exercises`
- `created_at`, `updated_at`

#### `exercises`
Ejercicios dentro de cada rutina
- `id`, `routine_id`, `name`, `sets`, `reps`, `weight`
- `notes`, `order_index`, `created_at`

#### `workout_sessions`
Sesiones de entrenamiento completadas
- `id`, `user_id`, `routine_id`, `date`
- `created_at`

#### `session_exercises`
Detalles de ejercicios en cada sesión
- `id`, `session_id`, `exercise_id`
- `completed_sets`, `actual_reps[]`, `actual_weight[]`
- `created_at`

#### `user_profiles`
Perfiles de usuario con datos personales
- `id`, `user_id`, `age`, `gender`, `height`, `weight`
- `fitness_goal`, `fitness_level`, `weekly_workouts`
- `created_at`, `updated_at`

### Seguridad
- **Row Level Security (RLS)** habilitado en todas las tablas
- Los usuarios solo pueden acceder a sus propios datos
- Políticas de lectura/escritura específicas por tabla

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Autor

**Peter Araya**
- GitHub: [@peteraraya](https://github.com/peteraraya)

## 🙏 Agradecimientos

- Datos de ejercicios e imágenes inspirados en recursos fitness de código abierto
- Iconos de [Lucide](https://lucide.dev/)
- UI inspirada en las mejores prácticas de diseño moderno

## 📮 Soporte

Si encuentras algún problema o tienes sugerencias:
- Abre un [issue](https://github.com/peteraraya/gym-tracker/issues)
- Contacta al autor

---

**¡Empieza a trackear tus entrenamientos hoy! 💪**
