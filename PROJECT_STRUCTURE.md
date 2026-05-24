# Estructura de Carpetas del Proyecto Gym Tracker

A continuación se detalla la jerarquía de directorios organizada y su función específica dentro del proyecto:

## 📂 Estructura General

```
gym-tracker/
├── .github/                     # Configuración de GitHub (workflows, ISSUE_TEMPLATES)
├── .kilo/                       # Configuración local de Kilo (comandos, agentes, skills)
├── docs/                        # Documentación técnica y guías
├── public/                      # Assets estáticos accesibles directamente
├── src/                         # Código fuente principal (opcional, depende de configuración)
│   └── ...                      # Si se usa src/, contendría app/, components/, etc.
├── app/                         # **App Router de Next.js 16** (rutas y layouts)
├── components/                  # Componentes reutilizables de UI
├── context/                     # Contextos de React para estado global
├── data/                        # Datos estáticos y configuraciones
├── lib/                         # Utilidades, servicios y helpers
├── messages/                    # Archivos de traducción (i18n)
├── supabase/                    # Configuración y esquema de Supabase
├── types/                       # Definiciones de TypeScript
└── ...                          # Archivos de configuración raíz
```

## 🔍 Descripción Detallada por Directorio

### 📁 Raíz del Proyecto
- **`.github/`**: Contiene workflows de GitHub Actions (CI/CD), plantillas de issues y pull requests.
- **`.kilo/`**: Configuración específica del agente Kilo para este proyecto (comandos personalizados, agents, skills).
- **`docs/`**: Documentación técnica detallada:
  - `SUPABASE_MIGRATIONS.md`: Guía para ejecutar migraciones de base de datos
  - `SUPABASE_SETUP.md`: Configuración inicial de Supabase
  - `PERFORMANCE.md`: Optimizaciones y mejores prácticas de rendimiento
  - `MEJORAS_IMPLEMENTADAS.md`: Historial de cambios y funcionalidades agregadas
  - `ANALISIS_Y_MEJORAS.md`: Evaluación técnica y recomendaciones
  - `__tests__/`: Documentación y helpers para testing
- **`public/`**: Archivos estáticos servidos directamente por Next.js:
  - `favicon.ico`, `robots.txt`, `manifest.json`
  - `exercises/`: Imágenes y GIFs demostrativos de ejercicios
  - `icons/`, `images/`: Otros recursos visuales

### 🧩 Arquitectura de la Aplicación (Next.js App Router)
- **`app/`**: Contiene todas las rutas de la aplicación usando el App Router de Next.js 16:
  - **`layout.tsx`**: Layout raíz global (proveedores, metadatos comunes)
  - **`page.tsx`**: Página principal (home)
  - **`auth/`**: Ruta de autenticación (login, registro)
    - `page.tsx`: Formulario de autenticación
    - `layout.tsx`: Layout específico para auth (sin navbars, etc.)
  - **`dashboard/`**: Panel principal de usuario
    - `page.tsx`: Vista principal del dashboard
    - `components/`: Componentes específicos del dashboard
    - `services/`: Lógica de negocio relacionada con métricas del dashboard
  - **`workout/`**: Flujo de entrenamiento activo
    - `[id]/`: Ruta dinámica para entrenamientos específicos
      - `page.tsx`: Interfaz principal de entrenamiento
      - `services/restCalculationService.ts`: Lógica para cálculos de descansos (ejemplo activo)
      - `components/`: Componentes específicos del workout (timer, exercise display)
      - `hooks/`: Hooks custom para manejo de estado de entrenamiento
  - **`routines/`**: Gestión de rutinas de entrenamiento
    - `create/`: Formulario para crear nueva rutina
    - `[id]/`: Rutina específica (ver, editar, eliminar)
  - **`exercises/`**: Biblioteca de ejercicios
    - `[id]/`: Detalles de ejercicio específico
    - `search/`: Funcionalidad de búsqueda de ejercicios
  - **`profile/`**: Gestión de perfil de usuario
    - `edit/`: Edición de datos personales y objetivos
  - **`progress/`**: Seguimiento y análisis de progreso
    - `charts/`: Componentes de visualización de datos
    - `heatmap/`: Implementación del mapa de calor de actividad
  - **`api/`**: Routes de API (backend dentro de Next.js)
    - `routines/`: Endpoints para gestión de rutinas
    - `sessions/`: Endpoints para sesiones de entrenamiento
    - `auth/[...nextauth]/`: Configuración de NextAuth (si se usa) o endpoints de Supabase Auth

### ⚙️ Componentes y Lógica de Negocio
- **`components/`**: Componentes reutilizables en toda la aplicación:
  - `ui/`: Componentes primitivos de UI (buttons, inputs, cards, modals) construidos con Tailwind
    - `Button.tsx`, `Input.tsx`, `Card.tsx`, `Modal.tsx`, etc.
  - `layout/`: Componentes de estructura de página (headers, footers, sidebars)
  - `features/`: Components específicos de funcionalidades que se reutilizan en múltiples rutas
    - `ExerciseSelector.tsx`: Selector reutilizable de ejercicios
    - `RoutineForm.tsx`: Formulario base para crear/editar rutinas
    - `VolumeChart.tsx`: Gráfico de volumen reutilizable
    - `ActivityHeatmap.tsx`: Mapa de calor de actividad
    - `BodyMap.tsx`: Visualización corporal para seleccionar grupos musculares
  - `context-providers/`: Envoltures para contextos de React (si se prefieren separados)

- **`context/`**: Contextos de React para estado global y temas transversales:
  - `AuthContext.tsx`: Estado de autenticación y usuario actual
  - `GymContext.tsx`: Estado principal de la aplicación (rutinas activas, preferencias)
  - `EquipmentContext.tsx`: Estado de equipo disponible del usuario
  - `LocaleContext.tsx`: Manejo de idioma y traducciones (i18n)
  - `ThemeContext.tsx`: Gestión de tema claro/oscuro (si se implementa)

- **`lib/`**: Utilidades de bajo nivel y servicios:
  - `supabase/`: Cliente y helpers de Supabase
    - `client.ts`: Instancia configurada de Supabase client
    - `routines/`: Funciones CRUD para rutinas
    - `sessions/`: Funciones para manejo de sesiones de entrenamiento
    - `profile/`: Funciones para gestión de perfiles
    - `exercises/`: Funciones para consulta de ejercicios
  - `recommendations.ts`: Algoritmo de recomendación de rutinas basado en perfil
  - `logger.ts`: Sistema de logging (desarrollo vs producción)
  - `hooks/`: Custom hooks reutilizables
    - `useAuth.ts`: Hook para estado de autenticación
    - `useApi.ts`: Hook wrapper para llamadas a Supabase con manejo de errores
    - `useForm.ts`: Hook para manejo de estados de formulario
    - `useBreakpoints.ts`: Hook para responsive design
  - `utils/`: Funciones puras y helpers
    - `dateHelpers.ts`: Utilidades para manejo de fechas
    - `formatters.ts`: Funciones de formateo (números, monedas, etc.)
    - `validation.ts`: Esquemas de validación (Zod, Yup)
    - `constants.ts`: Valores constantes usados en toda la app

- **`data/`**: Datos estáticos que no cambian frecuentemente:
  - `exercises.ts`: Base de datos completa de ejercicios (+180 entries) con:
    - ID, nombre, grupos musculares, equipo necesario, imágenes/GIFs
    - Instrucciones técnicas y variaciones
  - `equipment.ts`: Lista de equipos de gimnasio con categorías
  - `recommendedRoutines.ts`: Plantillas de rutinas predefinidas por nivel y objetivo
  - `nutrition.ts`: (Opcional) Guías nutricionales básicas

- **`types/`**: Definiciones de TypeScript globales y reutilizables:
  - `index.ts`: Barrel export de todos los tipos
  - `supabase.ts`: Tipos generados de Supabase (o manuales si no se usan supabase-types)
  - `routines.ts`: Interfaces para rutinas y ejercicios
  - `sessions.ts`: Tipos para sesiones de entrenamiento y sus detalles
  - `user.ts`: Tipos de perfil de usuario, objetivos, niveles de fitness
  - `api.ts`: Tipos para respuestas de endpoints de API
  - `contexts.ts`: Tipos para valores de contexto de React

- **`messages/`**: Archivos de traducción para internacionalización (next-intl):
  - `en.json`: Todas las cadenas en inglés
  - `es.json`: Todas las cadenas en español
  - Estructura por namespace: `common.auth.login`, `workout.timer.start`, etc.

### 🗄️ Infraestructura y Configuración
- **`supabase/`**: Artefactos relacionados con Supabase:
  - `schema.sql`: Esquema completo de la base de datos (tablas, índices, políticas RLS)
  - `migrations/`: Scripts SQL de migración versionados
    - `001_init.sql`: Esquema inicial
    - `002_add_duration_tracking.sql`: Campos para tracking de duración
    - `003_add_session_fields.sql`: Campos adicionales para sesiones
  - `seed/`: Datos iniciales para poblar la base (opcional)
  - `generate-types.ts`: Script para generar tipos de TypeScript desde Supabase

### 🧪 Testing y Calidad
- **`__tests__/`** (o `tests/`): Pruebas unitarias e de integración:
  - `__tests__/helpers/`: Funciones auxiliares para testing (mock data, custom renderers)
  - `__tests__/unit/`: Pruebas de unidades para utils, hooks, servicios
    - `lib/recommendations.test.ts`
    - `utils/dateHelpers.test.ts`
  - `__tests__/integration/`: Pruebas de componentes y flujos
    - `components/ExerciseSelector.test.tsx`
    - `app/workout/[id]/page.test.tsx`
  - `__tests__/e2e/`: Pruebas end-to-end (si se usan Cypress, Playwright, etc.)
- **`.eslintrc.js`**: Configuración de ESLint
- **`.prettierrc`**: Configuración de Prettier
- **`tsconfig.json`**: Configuración de TypeScript
- **`next.config.js`**: Configuración de Next.js

### 📜 Configuración Raíz
- **`package.json`**: Dependencias, scripts y metadatos del proyecto
- **`README.md`**: Documentación principal (la que acabamos de mejorar)
- **`LICENSE`**: Licencia MIT
- **`.gitignore`**: Archivos y directorios a ignorar en Git
- **`env.example.txt`**: Ejemplo de variables de entorno requerida
- **`middleware.ts`**: Middleware de Next.js (auth, redirects, etc.)
- **`tsconfig.paths.json`**: Aliases de importación (si se usan `@/lib` en lugar de `../../lib`)