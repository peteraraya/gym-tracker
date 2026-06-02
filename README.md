# 💪 Gym Tracker

Una aplicación web moderna y completa para el seguimiento de entrenamientos en el gimnasio, construida con Next.js 16, React 19, TypeScript y Supabase.

![Next.js](https://img.shields.io/badge/Next.js-16.0.5-black)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)

## 📋 Descripción del Proyecto

Gym Tracker es una aplicación full-stack diseñada para ayudar a usuarios de todos los niveles a planificar, ejecutar y seguir su progreso en entrenamientos de fuerza. La aplicación ofrece:

- **Gestión integral de rutinas**: Crear, personalizar y seguir rutinas de entrenamiento
- **Base de datos extensa de ejercicios**: Más de 180 ejercicios con demostraciones visuales
- **Seguimiento detallado de progreso**: Estadísticas, gráficos y análisis de volumen de entrenamiento
- **Personalización avanzada**: Perfiles de usuario, objetivos de fitness y rutinas recomendadas
- **Experiencia de usuario premium**: Diseño responsivo, multiidioma y tema oscuro/claro

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 16** - Framework React con App Router
- **React 19** - Librería de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Framework de estilos
- **next-intl** - Internacionalización
- **lucide-react** - Iconos modernos

### Backend & Infraestructura
- **Supabase** - Backend as a Service
  - PostgreSQL - Base de datos
  - Auth - Autenticación
  - Storage - Almacenamiento de imágenes
  - Row Level Security - Seguridad a nivel de fila

### Optimizaciones
- **React Query** - Caché inteligente y gestión de estado del servidor
- **Virtualización** - Renderizado eficiente de listas largas
- **Code Splitting** - Carga diferida de componentes pesados
- **Memoización** - Prevención de re-renders innecesarios
- **React Compiler** - Optimización automática de componentes
- **Server Components** - Renderizado del lado del servidor
- **Client Components** - Interactividad del cliente
- **Suspense & Lazy Loading** - Carga diferida

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:
- [Node.js](https://nodejs.org/) 20 o superior
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
- Una cuenta gratuita en [Supabase](https://supabase.com)

## 🚀 Guía de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/peteraraya/gym-tracker.git
   cd gym-tracker
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar Supabase**
   - Crea un nuevo proyecto en [supabase.com](https://supabase.com)
   - Ejecuta el esquema SQL en `supabase/schema.sql` a través del SQL Editor
   - **Importante**: Ejecuta las migraciones pendientes (ver [docs/SUPABASE_MIGRATIONS.md](./docs/SUPABASE_MIGRATIONS.md))
   - Configura tus variables de entorno en `.env.local`:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
     NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
     ```

4. **Ejecutar la aplicación**
   ```bash
   # Desarrollo
   npm run dev
   
   # Producción
   npm run build
   npm start
   ```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 📖 Instrucciones de Uso

### Primera Configuración
1. Regístrate en la página de autenticación
2. Completa tu perfil con datos personales y objetivos de fitness
3. Explora las rutinas recomendadas o crea tu propia rutina

### Crear una Rutina
1. Navega a **Rutinas** → **Crear Nueva Rutina**
2. Asigna un nombre y descripción a tu rutina
3. Agrega ejercicios desde la base de datos (+180 disponibles)
4. Configura series, repeticiones y pesos para cada ejercicio
5. Ajusta los tiempos de descanso entre series y ejercicios
6. Guarda tu rutina para futuros usos

### Realizar un Entrenamiento
1. Selecciona una rutina guardada desde la sección de Rutinas
2. Haz clic en **Iniciar Entrenamiento**
3. Sigue los ejercicios en el orden especificado
4. Registra las repeticiones y pesos reales realizados
5. Utiliza el temporizador integrado para los descansos
6. Marca la sesión como completada al finalizar

### Seguimiento de Progreso
- Visita el **Dashboard** para ver méclas clave y tendencias
- Explora **Progreso** para análisis detallados por grupo muscular
- Revisa tu **Historial** de todas las sesiones completadas
- Consulta el **Mapa de Calor** de actividad (estilo GitHub)

## 💻 Ejemplos de Implementación

### Consulta de Datos con React Query
```typescript
import { useQuery } from '@tanstack/react-query';
import { getUserSessions } from '@/lib/supabase/sessions';

function SessionsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['sessions'],
    queryFn: getUserSessions,
  });

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error al cargar sesiones</div>;

  return (
    <ul>
      {data.map(session => (
        <li key={session.id}>
          {session.date} - {session.totalVolumen} kg
        </li>
      ))}
    </ul>
  );
}
```

### Mutación de Datos (Crear Rutina)
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRoutine } from '@/lib/supabase/routines';

function CreateRoutineForm() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: createRoutine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      mutation.mutate(formData);
    }}>
      {/* Campos del formulario */}
      <button type="submit" disabled={mutation.isLoading}>
        {mutation.isLoading ? 'Guardando...' : 'Guardar Rutina'}
      </button>
    </form>
  );
}
```

### Componente Reutilizable con Tailwind
```typescript
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend 
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Icon className="h-6 w-6 text-indigo-500" />
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      </div>
      
      <p className="text-2xl font-bold text-gray-900">
        {value}
      </p>
      
      {trend && (
        <p className={`text-sm font-medium mt-1 ${
          trend.isPositive ? 'text-green-500' : 'text-red-500'
        }`}>
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
        </p>
      )}
    </div>
  );
}
```

## 🤝 Contribución

¡Gracias por considerar contribuir a Gym Tracker! Para asegurar una colaboración efectiva, por favor sigue estas guías:

### Reportando Issues
- Usa el [issue tracker](https://github.com/peteraraya/gym-tracker/issues)
- Incluye pasos claros para reproducir el problema
- Añade capturas de pantalla cuando sea relevante
- Especifica tu entorno (navegador, OS, versión de la app)

### Enviando Pull Requests
1. Haz fork del repositorio
2. Crea una rama descriptiva: `git checkout -b feature/nombre-feature`
3. Implementa tus cambios siguiendo el estilo de código existente
4. Asegúrate de que tu código pase los linting y tests
5. Haz commit con mensajes claros y convencionales
6. Push a tu rama: `git push origin feature/nombre-feature`
7. Abre un Pull Request describiendo tus cambios

### Estilo de Código
- Seguimos las convenciones de [ESLint](https://eslint.org/) y [Prettier](https://prettier.io/)
- Usamos TypeScript estricto con reglas de [tsconfig.json](./tsconfig.json)
- Los componentes siguen las mejores prácticas de React y Next.js
- El CSS utiliza utilidades de Tailwind CSS

### Proceso de Revisión
- Todos los PRs requieren al menos una revisión
- Mantén los cambios enfocados y relacionados
- Incluye tests para nuevas funcionalidades cuando corresponda
- Actualiza la documentación si tus cambios afectan el uso

## 📚 Documentación Adicional

Para información más detallada, consulta los documentos en el directorio [`./docs/`](./docs/):

- [Guía de Migraciones de Supabase](./docs/SUPABASE_MIGRATIONS.md) - Pasos para ejecutar migraciones SQL
- [Configuración de Supabase](./docs/SUPABASE_SETUP.md) - Detalles de configuración del backend
- [Mejoras Implementadas](./docs/MEJORAS_IMPLEMENTADAS.md) - Historial de cambios y funcionalidades agregadas
- [Análisis y Mejoreras](./docs/ANALISIS_Y_MEJORAS.md) - Evaluación técnica y recomendaciones
- [Guía de Performance](./docs/PERFORMANCE.md) - Optimizaciones y mejores prácticas de rendimiento
- [Guía de Testing](./docs/__tests__/README.md) - Estrategias y ejemplos de pruebas

## 🗂️ Documentación del Proyecto (Generación)

La documentación principal está en [./docs/](./docs/). Para generar documentación de la API y del código TypeScript, se recomiendan estas herramientas y pasos:

- Documentación de la API (TypeScript) con `typedoc`:
  ```bash
  npm install --save-dev typedoc typedoc-plugin-markdown
  npx typedoc --entryPoints app lib components --out docs/api --plugin typedoc-plugin-markdown --tsconfig tsconfig.json
  ```

- Sitio estático de documentación (opcional) con `Docusaurus` o `MkDocs`:
  ```bash
  npx create-docusaurus@latest docs-site classic
  cd docs-site
  npm run build
  # Copia o enlaza ./docs/ en docs-site/docs
  ```

- Sugerencia de scripts a añadir en `package.json`:
  ```json
  {
    "scripts": {
      "docs:api": "typedoc --entryPoints app lib components --out docs/api --plugin typedoc-plugin-markdown --tsconfig tsconfig.json",
      "docs:site:init": "npx create-docusaurus@latest docs-site classic",
      "docs:site:build": "cd docs-site && npm run build"
    }
  }
  ```

Mantén la documentación manual en `./docs/` y añade nuevas páginas siguiendo la estructura existente.

## 📝 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](./LICENSE) para más detalles.

## 👨‍💻 Autor

**Peter Araya**  
- GitHub: [@peteraraya](https://github.com/peteraraya)

## 🙏 Agradecimientos

- Datos de ejercicios e imágenes inspirados en recursos fitness de código abierto
- Iconos de [Lucide](https://lucide.dev/)
- UI inspirada en las mejores prácticas de diseño moderno
- Comunidad de código abierto por sus contribuciones y feedback

## 📮 Soporte

Si encuentras problemas o tienes sugerencias:
- Abre un [issue](https://github.com/peteraraya/gym-tracker/issues) con detalles específicos
- Para consultas generales, revisa la [documentación](./docs/) primero
- Seguimos activamente los issues y apreciamos tu contribución al proyecto

---
*Última actualización: Mayo 2026*