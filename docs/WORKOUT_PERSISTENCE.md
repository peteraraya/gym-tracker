# Sistema de Entrenamiento Persistente

## ✨ Características Implementadas

### 🌐 Contexto Global de Entrenamiento (`WorkoutContext`)

El sistema ahora mantiene el estado del entrenamiento activo de forma global en toda la aplicación:

- **Persistencia en localStorage**: El entrenamiento se guarda automáticamente y se restaura al recargar la página
- **Navegación libre**: Puedes navegar por cualquier sección de la app sin perder el progreso
- **Restauración automática**: Al volver a la página de workout, continúas exactamente donde lo dejaste

### 🎯 Funcionalidades Principales

#### 1. **WorkoutProvider**
```typescript
interface WorkoutState {
  routineId: string;
  routineName: string;
  currentExerciseIndex: number;
  currentSet: number;
  completedSets: { [key: string]: number };
  actualReps: { [key: string]: number[] };
  actualWeights: { [key: string]: number[] };
  startedAt: Date;
}
```

#### 2. **Banner de Entrenamiento Activo**
- Se muestra en la parte superior de todas las páginas cuando hay un entrenamiento activo
- Muestra el nombre de la rutina y el progreso actual
- Botones para continuar o cancelar el entrenamiento
- Diseño con gradiente verde y animación pulse

#### 3. **Página de Rutinas Mejorada**
- Botón "Continuar" para rutinas con entrenamiento activo
- Detección automática de entrenamientos en curso
- Confirmación al iniciar nueva rutina si ya hay una activa

#### 4. **Página de Workout Optimizada**
- Restaura automáticamente el estado al regresar
- Actualiza el contexto global en cada acción
- Sincronización perfecta entre localStorage y estado de React

### 🔄 Flujo de Uso

1. **Iniciar Entrenamiento**
   - Usuario hace clic en "Iniciar" en una rutina
   - Se crea el estado global del workout
   - Se guarda en localStorage automáticamente
   - Se redirige a `/workout/[id]`

2. **Durante el Entrenamiento**
   - Cada serie completada actualiza el estado global
   - Cambios de ejercicio actualizan el progreso
   - Todo se sincroniza con localStorage en tiempo real

3. **Navegación Libre**
   - Usuario puede navegar a Dashboard, Logros, etc.
   - Banner verde muestra que hay entrenamiento activo
   - Click en "Continuar" regresa al punto exacto

4. **Finalizar/Cancelar**
   - Al completar: se guarda la sesión y se limpia el estado
   - Al cancelar: confirmación y limpieza del estado
   - localStorage se limpia automáticamente

### 📦 Archivos Creados/Modificados

#### Nuevos Archivos
- `context/WorkoutContext.tsx` - Contexto global de entrenamiento
- `components/ActiveWorkoutBanner.tsx` - Banner visual de workout activo

#### Archivos Modificados
- `app/layout.tsx` - Integración del WorkoutProvider
- `app/workout/[id]/page.tsx` - Uso del contexto y persistencia
- `app/routines/page.tsx` - Detección de workout activo
- `components/Navbar.tsx` - Muestra el banner

### 🎨 Diseño Visual

**ActiveWorkoutBanner**
- Gradiente verde (emerald-500 → green-600)
- Icono Activity con animación pulse
- Información del entrenamiento en dos líneas
- Botones de acción alineados a la derecha
- Responsive y adaptado a dark mode

### 💡 Ventajas del Sistema

1. **Sin Pérdida de Datos**: El entrenamiento se guarda automáticamente
2. **Experiencia Fluida**: Navega libremente sin interrupciones
3. **Recuperación Automática**: Continúa donde dejaste incluso después de cerrar el navegador
4. **UX Mejorada**: Indicadores visuales claros del estado
5. **Prevención de Errores**: Confirmaciones al iniciar nuevo workout con uno activo

### 🚀 Uso desde el Código

```typescript
// Importar el hook
import { useWorkout } from '@/context/WorkoutContext';

// En tu componente
const { 
  activeWorkout,      // Estado actual o null
  startWorkout,       // Iniciar nuevo entrenamiento
  updateWorkoutProgress, // Actualizar progreso
  finishWorkout,      // Finalizar entrenamiento
  cancelWorkout,      // Cancelar entrenamiento
  isWorkoutActive     // Boolean helper
} = useWorkout();

// Iniciar un entrenamiento
startWorkout(routine);

// Actualizar progreso
updateWorkoutProgress(
  exerciseIndex,
  setNumber,
  completedSets,
  actualReps,
  actualWeights
);

// Finalizar
finishWorkout();
```

### 🔒 Manejo de Edge Cases

- **Múltiples pestañas**: localStorage sincroniza entre tabs
- **Recarga de página**: Estado se restaura automáticamente
- **Rutina eliminada**: Validación al intentar continuar
- **Conflicto de rutinas**: Confirmación al iniciar nueva con una activa

### 📱 Responsive

- Banner se adapta a móviles
- Información colapsada en pantallas pequeñas
- Botones táctiles optimizados

---

## 🎉 Resultado Final

El usuario ahora puede:
1. ✅ Iniciar un entrenamiento
2. ✅ Navegar a cualquier sección de la app
3. ✅ Ver estadísticas, logros, perfil, etc.
4. ✅ Regresar al entrenamiento desde el banner
5. ✅ Continuar exactamente donde lo dejó
6. ✅ Cerrar el navegador y retomar después
