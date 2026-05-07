# 🎨 Sistema de Ejercicios Personalizados

## 📋 Descripción General

Sistema completo que permite a los usuarios crear, gestionar y utilizar sus propios ejercicios personalizados en la aplicación. Los ejercicios se almacenan localmente en el navegador y se integran perfectamente con el sistema de ejercicios existente.

---

## ✨ Características Principales

### 1. **Creación de Ejercicios**
- ✅ Formulario intuitivo con validación
- ✅ Campos obligatorios: nombre, grupo muscular
- ✅ Campos opcionales: equipamiento, descripción, dificultad, categoría
- ✅ Configuración de series y repeticiones por defecto
- ✅ Validación en tiempo real

### 2. **Almacenamiento Local**
- ✅ Guardado en `localStorage` del navegador
- ✅ Persistencia entre sesiones
- ✅ No requiere conexión a internet
- ✅ Exportación/importación en formato JSON

### 3. **Integración Completa**
- ✅ Aparecen en el selector de ejercicios
- ✅ Se pueden buscar globalmente
- ✅ Se filtran por grupo muscular
- ✅ Indicador visual "✨ Personalizado"
- ✅ Compatible con sistema de equipamiento

### 4. **Gestión**
- ✅ Crear nuevos ejercicios
- ✅ Actualizar ejercicios existentes
- ✅ Eliminar ejercicios
- ✅ Exportar todos los ejercicios
- ✅ Importar ejercicios desde JSON

---

## 🏗️ Arquitectura

### Archivos Principales

```
lib/customExercises.ts              # Lógica de negocio
components/AddCustomExerciseModal.tsx  # UI para crear ejercicios
components/ExerciseSelector.tsx     # Integración en selector
```

### Estructura de Datos

```typescript
interface ExerciseTemplate {
  id: string;                    // Generado automáticamente: "custom-{name}-{timestamp}"
  name: string;                  // Nombre del ejercicio
  muscleGroup: MuscleGroup;      // Grupo muscular
  equipment?: string;            // Equipamiento necesario
  description?: string;          // Descripción breve
  defaultSets?: number;          // Series por defecto (1-10)
  defaultReps?: number;          // Repeticiones por defecto (1-100)
  difficulty?: DifficultyLevel;  // principiante | intermedio | avanzado
  category?: ExerciseCategory;   // compuesto | aislamiento | cardio | movilidad
  // ... otros campos opcionales
}
```

---

## 🔧 Funciones Principales

### `lib/customExercises.ts`

#### **getCustomExercises()**
Obtiene todos los ejercicios personalizados del localStorage.

```typescript
const exercises = getCustomExercises();
// Retorna: ExerciseTemplate[]
```

#### **saveCustomExercise(exercise)**
Guarda un nuevo ejercicio personalizado.

```typescript
const newExercise = saveCustomExercise({
  name: 'Press de banca con agarre cerrado',
  muscleGroup: 'pecho',
  equipment: 'Barra',
  defaultSets: 4,
  defaultReps: 8,
  difficulty: 'intermedio',
  category: 'compuesto'
});
// Retorna: ExerciseTemplate (con ID generado)
```

#### **updateCustomExercise(id, updates)**
Actualiza un ejercicio existente.

```typescript
const success = updateCustomExercise('custom-press-123', {
  defaultSets: 5,
  description: 'Nueva descripción'
});
// Retorna: boolean
```

#### **deleteCustomExercise(id)**
Elimina un ejercicio personalizado.

```typescript
const success = deleteCustomExercise('custom-press-123');
// Retorna: boolean
```

#### **getCustomExercisesByMuscleGroup(muscleGroup)**
Obtiene ejercicios personalizados de un grupo muscular específico.

```typescript
const chestExercises = getCustomExercisesByMuscleGroup('pecho');
// Retorna: ExerciseTemplate[]
```

#### **isCustomExercise(exerciseId)**
Verifica si un ejercicio es personalizado.

```typescript
const isCustom = isCustomExercise('custom-press-123');
// Retorna: boolean
```

#### **validateExercise(exercise)**
Valida que un ejercicio tenga los campos requeridos.

```typescript
const validation = validateExercise({
  name: '',
  muscleGroup: 'pecho'
});
// Retorna: { valid: false, errors: ['El nombre es obligatorio'] }
```

#### **exportCustomExercises()**
Exporta todos los ejercicios como JSON.

```typescript
const json = exportCustomExercises();
// Retorna: string (JSON)
```

#### **importCustomExercises(jsonString)**
Importa ejercicios desde JSON.

```typescript
const result = importCustomExercises(jsonString);
// Retorna: { success: boolean, count: number, error?: string }
```

#### **clearCustomExercises()**
Elimina todos los ejercicios personalizados.

```typescript
clearCustomExercises();
```

---

## 🎨 Componente Modal

### `AddCustomExerciseModal`

#### Props

```typescript
interface AddCustomExerciseModalProps {
  onClose: () => void;              // Callback al cerrar
  onExerciseAdded: () => void;      // Callback al agregar ejercicio
  preselectedMuscleGroup?: MuscleGroup;  // Grupo muscular preseleccionado
}
```

#### Uso

```tsx
<AddCustomExerciseModal
  onClose={() => setShowModal(false)}
  onExerciseAdded={() => {
    // Recargar ejercicios
    setCustomExercises(getCustomExercises());
  }}
  preselectedMuscleGroup="pecho"
/>
```

---

## 🔄 Integración en ExerciseSelector

### Cambios Realizados

1. **Estado para ejercicios personalizados**
```typescript
const [customExercises, setCustomExercises] = useState<ExerciseTemplate[]>([]);
const [showAddCustomModal, setShowAddCustomModal] = useState(false);
```

2. **Carga inicial**
```typescript
useEffect(() => {
  setCustomExercises(getCustomExercises());
}, []);
```

3. **Búsqueda global incluye personalizados**
```typescript
const customResults = customExercises
  .filter(ex => normalizeText(ex.name).includes(normalizedTerm))
  .filter(ex => hasEquipment(ex.equipment))
  .map(ex => ({ ...ex, type: 'custom' as const }));
```

4. **Filtrado por grupo muscular incluye personalizados**
```typescript
const filteredExercises = selectedMuscle
  ? [
      ...getExercisesByMuscleGroup(selectedMuscle),
      ...getCustomExercisesByMuscleGroup(selectedMuscle)
    ]
  : [];
```

5. **Botón para crear ejercicios**
```tsx
<Button
  variant="ghost"
  size="sm"
  onClick={() => setShowAddCustomModal(true)}
  className="text-emerald-600"
>
  ✨ Nuevo
</Button>
```

6. **Indicador visual**
```tsx
{exercise.id.startsWith('custom-') && (
  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full font-medium">
    ✨ Personalizado
  </span>
)}
```

---

## 📊 Flujo de Usuario

### Crear un Ejercicio Personalizado

1. Usuario abre el selector de ejercicios
2. Selecciona un grupo muscular (opcional)
3. Hace clic en el botón "✨ Nuevo"
4. Completa el formulario:
   - Nombre (obligatorio)
   - Grupo muscular (obligatorio)
   - Equipamiento (opcional)
   - Descripción (opcional)
   - Series y repeticiones (con valores por defecto)
   - Dificultad y categoría
5. Hace clic en "✨ Crear Ejercicio"
6. El ejercicio aparece inmediatamente en la lista
7. Puede seleccionarlo y agregarlo a su rutina

### Usar un Ejercicio Personalizado

1. Los ejercicios personalizados aparecen junto a los predefinidos
2. Tienen una etiqueta "✨ Personalizado" para identificarlos
3. Se pueden buscar por nombre
4. Se filtran por grupo muscular
5. Se pueden agregar a rutinas como cualquier otro ejercicio

---

## 🎯 Validaciones

### Campos Obligatorios
- ✅ Nombre no vacío
- ✅ Grupo muscular seleccionado

### Rangos Válidos
- ✅ Series: 1-10
- ✅ Repeticiones: 1-100

### Mensajes de Error
- ❌ "El nombre es obligatorio"
- ❌ "El grupo muscular es obligatorio"
- ❌ "Las series deben estar entre 1 y 10"
- ❌ "Las repeticiones deben estar entre 1 y 100"

---

## 💾 Almacenamiento

### Clave de localStorage
```
gym_tracker_custom_exercises
```

### Formato de Datos
```json
[
  {
    "id": "custom-press-cerrado-1234567890",
    "name": "Press de banca con agarre cerrado",
    "muscleGroup": "pecho",
    "equipment": "Barra",
    "description": "Variante del press que enfatiza tríceps",
    "defaultSets": 4,
    "defaultReps": 8,
    "difficulty": "intermedio",
    "category": "compuesto"
  }
]
```

---

## 🔐 Seguridad y Privacidad

- ✅ Datos almacenados solo en el navegador del usuario
- ✅ No se envían a ningún servidor
- ✅ El usuario tiene control total sobre sus datos
- ✅ Puede exportar/importar sus ejercicios
- ✅ Puede eliminar todos los datos en cualquier momento

---

## 🚀 Mejoras Futuras

### Funcionalidades Planeadas
- [ ] Editar ejercicios personalizados desde la UI
- [ ] Eliminar ejercicios personalizados desde la UI
- [ ] Agregar imágenes personalizadas
- [ ] Compartir ejercicios entre usuarios (exportar/importar)
- [ ] Sincronización con Supabase (cuando esté habilitado)
- [ ] Categorías personalizadas
- [ ] Plantillas de ejercicios
- [ ] Historial de cambios

### Optimizaciones
- [ ] Caché de ejercicios en memoria
- [ ] Búsqueda fuzzy mejorada
- [ ] Ordenamiento personalizado
- [ ] Filtros avanzados

---

## 📝 Ejemplos de Uso

### Ejemplo 1: Crear un ejercicio de pecho con poleas

```typescript
saveCustomExercise({
  name: 'Aperturas en Polea Sentado',
  muscleGroup: 'pecho',
  equipment: 'Poleas',
  description: 'Ejercicio de aislamiento que mantiene tensión constante',
  defaultSets: 3,
  defaultReps: 12,
  difficulty: 'intermedio',
  category: 'aislamiento'
});
```

### Ejemplo 2: Exportar e importar ejercicios

```typescript
// Exportar
const json = exportCustomExercises();
console.log(json); // Copiar y guardar

// Importar
const result = importCustomExercises(json);
if (result.success) {
  console.log(`${result.count} ejercicios importados`);
}
```

### Ejemplo 3: Buscar ejercicios personalizados de pecho

```typescript
const chestExercises = getCustomExercisesByMuscleGroup('pecho');
console.log(`Tienes ${chestExercises.length} ejercicios personalizados de pecho`);
```

---

## 🐛 Troubleshooting

### Los ejercicios no aparecen
- Verifica que el localStorage esté habilitado en el navegador
- Revisa la consola para errores de parsing JSON
- Intenta limpiar y volver a crear los ejercicios

### Error al guardar
- Verifica que el nombre no esté vacío
- Asegúrate de que los valores numéricos estén en rango
- Revisa que el grupo muscular sea válido

### Los ejercicios desaparecen
- Verifica que no estés en modo incógnito
- Revisa que no se esté limpiando el localStorage
- Exporta tus ejercicios regularmente como respaldo

---

## 📚 Referencias

- [ExerciseTemplate Type](../data/exercises/types.ts)
- [Custom Exercises Library](../lib/customExercises.ts)
- [Add Custom Exercise Modal](../components/AddCustomExerciseModal.tsx)
- [Exercise Selector Integration](../components/ExerciseSelector.tsx)

---

**Última actualización**: Mayo 2026
**Versión**: 1.0.0
**Estado**: ✅ Implementado y funcional
