# Mejora: Series Dinámicas en Rutinas

## Fecha
${new Date().toISOString().split('T')[0]}

## Descripción
Se ha modificado completamente el sistema de gestión de series en las rutinas de entrenamiento. Ahora, en lugar de especificar un número total de series con valores uniformes de repeticiones y peso, cada serie individual puede tener sus propios valores personalizados.

## Cambios Realizados

### 1. Tipos de Datos Actualizados (`types/index.ts`)

#### Antes:
```typescript
export interface Exercise {
  id: string;
  name: string;
  sets: number;      // Solo número de series
  reps: number;      // Repeticiones para todas las series
  weight?: number;   // Peso para todas las series
  notes?: string;
  equipment?: string;
}
```

#### Después:
```typescript
export interface Set {
  reps: number;
  weight?: number;
}

export interface Exercise {
  id: string;
  name: string;
  sets: Set[];       // Array de series, cada una con sus propios valores
  notes?: string;
  equipment?: string;
}
```

### 2. Formulario de Rutinas (`components/RoutineForm.tsx`)

**Nuevas Características:**
- ✅ **Vista detallada de series**: Cada serie se muestra en una fila individual
- ✅ **Campos independientes**: Cada serie tiene sus propios inputs de repeticiones y peso
- ✅ **Botón "Añadir serie"**: Agregar series dinámicamente con un clic
- ✅ **Botón "Copiar serie"** (📋): Duplicar una serie existente con todos sus valores
- ✅ **Botón "Eliminar serie"** (🗑️): Eliminar series individuales (mínimo 1 serie)
- ✅ **Pre-llenado inteligente**: Nuevas series se pre-llenan automáticamente con los valores de la serie anterior
- ✅ **Migración automática**: Rutinas existentes con formato antiguo se convierten automáticamente al cargar

**Flujo de Usuario:**
1. Agregar ejercicio desde biblioteca o manualmente
2. Por defecto, el ejercicio tiene 1 serie con valores predeterminados
3. Modificar reps/peso de cada serie individualmente
4. Agregar más series con el botón "➕ Añadir serie"
5. Copiar series completas con el botón 📋
6. Eliminar series no deseadas con el botón 🗑️

### 3. Página de Entrenamiento (`app/workout/[id]/page.tsx`)

**Actualizaciones:**
- ✅ **Valores por serie**: Muestra las repeticiones y peso específicos de la serie actual
- ✅ **Progreso preciso**: Barra de progreso calcula correctamente el total de series
- ✅ **Descanso inteligente**: Calcula descanso basado en los valores de la serie actual
- ✅ **Navegación entre series**: Pre-carga automáticamente los valores de la siguiente serie
- ✅ **Restauración de estado**: Mantiene el estado correcto al pausar/reanudar entrenamientos

**Experiencia de Usuario:**
- Al completar una serie, los valores de la siguiente serie se cargan automáticamente
- La información mostrada es específica para la serie actual, no genérica
- El temporizador de descanso se ajusta según la intensidad de la serie completada

### 4. Exportación de Datos (`lib/dataExport.ts`)

**Actualización del CSV:**
- Campo "Sets": Ahora muestra el número total de series
- Campo "Reps": Lista separada por `;` de repeticiones por serie (ej: "10;10;12")
- Campo "Weight": Lista separada por `;` de pesos por serie (ej: "60;60;65")

**Ejemplo:**
```csv
Routine ID,Exercise Name,Sets,Reps,Weight (kg)
routine-1,"Press de banca",3,"10;10;8","60;65;70"
```

### 5. Visualización de Ejercicios (`components/ExerciseListWithDetails.tsx`)

**Mejora en la Vista:**
- Muestra número total de series
- Detalla las repeticiones de cada serie entre paréntesis
- Ejemplo: "3 series (10 reps, 10 reps, 12 reps)"

### 6. Migración de Datos Existentes

**Compatibilidad Retroactiva:**
El sistema detecta automáticamente rutinas con el formato antiguo y las convierte al nuevo formato:

```typescript
// Formato antiguo detectado
{
  sets: 3,
  reps: 10,
  weight: 60
}

// Se convierte automáticamente a:
{
  sets: [
    { reps: 10, weight: 60 },
    { reps: 10, weight: 60 },
    { reps: 10, weight: 60 }
  ]
}
```

Esta conversión ocurre transparentemente al:
- Abrir rutinas existentes para editar
- Iniciar un entrenamiento con rutinas antiguas
- No requiere intervención del usuario

## Beneficios

### Para el Usuario
1. **Mayor flexibilidad**: Programar pirámides (aumento/disminución progresiva de peso)
2. **Precisión**: Cada serie puede tener valores específicos
3. **Facilidad de uso**: Botón de copiar serie ahorra tiempo
4. **Visualización clara**: Ver exactamente qué hacer en cada serie

### Para el Desarrollo
1. **Estructura escalable**: Fácil agregar más campos por serie en el futuro
2. **Migración limpia**: Compatibilidad con datos existentes garantizada
3. **Código mantenible**: Lógica clara y bien separada

## Casos de Uso

### Ejemplo 1: Pirámide de Fuerza
```
Serie 1: 8 reps @ 60kg
Serie 2: 6 reps @ 70kg
Serie 3: 4 reps @ 80kg
Serie 4: 2 reps @ 90kg
```

### Ejemplo 2: Drop Set
```
Serie 1: 10 reps @ 70kg
Serie 2: 10 reps @ 60kg
Serie 3: 10 reps @ 50kg
```

### Ejemplo 3: Series Tradicionales
```
Serie 1: 10 reps @ 60kg
Serie 2: 10 reps @ 60kg
Serie 3: 10 reps @ 60kg
```
(Con un clic en "Copiar serie" después de configurar la primera)

## Archivos Modificados

1. `types/index.ts` - Nueva interfaz `Set`, modificada `Exercise`
2. `components/RoutineForm.tsx` - UI completa renovada con series dinámicas
3. `app/workout/[id]/page.tsx` - Lógica actualizada para manejar arrays de series
4. `lib/dataExport.ts` - Exportación CSV con nuevo formato
5. `components/ExerciseListWithDetails.tsx` - Vista mejorada de series

## Notas Técnicas

- **Warnings de ESLint**: Hay algunos usos de `any` en el código de migración. Son intencionales para compatibilidad con el formato antiguo.
- **Validación**: Se asegura que siempre haya al menos 1 serie por ejercicio
- **Rendimiento**: No hay impacto significativo en el rendimiento con la nueva estructura
- **Testing**: Se recomienda agregar tests para la migración de datos y la nueva UI

## Próximos Pasos Sugeridos

1. ✅ Agregar validación visual cuando los valores están fuera de rango razonable
2. ✅ Implementar plantillas de progresión (pirámide, drop set, etc.)
3. ✅ Agregar historial de series anteriores durante el entrenamiento
4. ✅ Permitir copiar series completas entre ejercicios
5. ✅ Crear atajos de teclado para añadir/copiar series

## Conclusión

Este cambio mejora significativamente la flexibilidad del sistema de entrenamiento, permitiendo a los usuarios crear programas más sofisticados mientras mantiene la simplicidad para casos básicos. La migración automática asegura que ningún dato existente se pierda.
