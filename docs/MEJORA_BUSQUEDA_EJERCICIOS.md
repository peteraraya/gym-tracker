# Mejora: Búsqueda Global de Ejercicios

## Problema Identificado

Al editar o agregar rutinas, buscar ejercicios era complejo cuando el usuario ya conocía el nombre del ejercicio. Tenía que:
1. Seleccionar el grupo muscular
2. Navegar por la lista
3. Buscar dentro del grupo

Esto resultaba ineficiente cuando el usuario sabía exactamente qué ejercicio quería agregar.

## Solución Implementada

### 1. Buscador Global en Pantalla Principal

Se agregó un buscador prominente en la pantalla inicial del selector de ejercicios que permite:

- **Búsqueda directa por nombre**: Escribe "press banca" y encuentra todos los ejercicios relacionados
- **Búsqueda en todos los grupos**: No necesitas saber a qué grupo pertenece el ejercicio
- **Incluye ejercicios de entrenamiento y calentamiento**: Búsqueda unificada
- **Respeta filtros de equipamiento**: Solo muestra ejercicios disponibles según tu equipo
- **Búsqueda flexible**: Ignora acentos, mayúsculas y minúsculas (ej: "biceps" encuentra "Bíceps", "BICEPS", "bíceps")

### 2. Características del Buscador

```typescript
// Función de normalización para búsqueda flexible
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Elimina diacríticos (acentos)
};

// Búsqueda en tiempo real con useMemo para optimización
const globalSearchResults = useMemo(() => {
  const normalizedTerm = normalizeText(globalSearchTerm);
  
  // Busca en ejercicios de entrenamiento
  const trainingResults = EXERCISE_DATABASE
    .filter(ex => normalizeText(ex.name).includes(normalizedTerm))
    .filter(ex => hasEquipment(ex.equipment));
  
  // Busca en ejercicios de calentamiento
  const warmupResults = getAllWarmups()
    .filter(ex => normalizeText(ex.name).includes(normalizedTerm));
  
  return [...trainingResults, ...warmupResults];
}, [globalSearchTerm, selectedMuscle, hasEquipment]);
```

**Ejemplos de búsqueda flexible:**
- "biceps" → encuentra "Bíceps", "BICEPS", "bíceps"
- "sentadilla" → encuentra "Sentadilla", "SENTADILLA"
- "gluteo" → encuentra "Glúteo", "gluteo", "GLÚTEO"
- "traccion" → encuentra "Tracción", "traccion"

### 3. Interfaz Mejorada

**Elementos visuales agregados:**
- 🔍 Icono de búsqueda en el input
- ❌ Botón para limpiar búsqueda rápidamente
- Badge con el grupo muscular en cada resultado
- Contador de resultados encontrados
- Estado vacío informativo cuando no hay resultados

**Flujo de usuario:**
1. Usuario abre selector de ejercicios
2. Ve el buscador prominente en la parte superior
3. Escribe el nombre del ejercicio
4. Ve resultados instantáneos con información completa
5. Selecciona ejercicios con checkbox
6. Confirma selección

### 4. Mantiene Funcionalidad Existente

La mejora es **aditiva**, no reemplaza la navegación por grupos musculares:

- ✅ Mapa corporal sigue disponible
- ✅ Vista de lista por grupos sigue disponible
- ✅ Búsqueda dentro de grupo muscular sigue funcionando
- ✅ Filtros de calentamiento/entrenamiento se mantienen

## Mejoras Adicionales de UX Propuestas

### 1. Búsqueda Inteligente (Fuzzy Search)

**Problema**: El usuario debe escribir exactamente el nombre
**Solución**: Implementar búsqueda difusa que tolere errores

```typescript
// Ejemplo con fuse.js
import Fuse from 'fuse.js';

const fuse = new Fuse(EXERCISE_DATABASE, {
  keys: ['name', 'description', 'equipment'],
  threshold: 0.3, // Tolerancia a errores
  includeScore: true
});

const results = fuse.search(searchTerm);
```

**Beneficios:**
- "sentadila" encuentra "sentadilla"
- "pres banca" encuentra "press banca"
- Búsqueda por descripción o equipamiento

### 2. Historial de Búsquedas Recientes

**Implementación:**
```typescript
// Guardar en localStorage
const [recentSearches, setRecentSearches] = useState<string[]>([]);

useEffect(() => {
  const saved = localStorage.getItem('recentExerciseSearches');
  if (saved) setRecentSearches(JSON.parse(saved));
}, []);

const addRecentSearch = (term: string) => {
  const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
  setRecentSearches(updated);
  localStorage.setItem('recentExerciseSearches', JSON.stringify(updated));
};
```

**UI:**
```tsx
{!globalSearchTerm && recentSearches.length > 0 && (
  <div className="flex gap-2 flex-wrap">
    <span className="text-xs text-gray-500">Recientes:</span>
    {recentSearches.map(term => (
      <button
        key={term}
        onClick={() => setGlobalSearchTerm(term)}
        className="text-xs px-2 py-1 bg-gray-100 rounded-full hover:bg-gray-200"
      >
        {term}
      </button>
    ))}
  </div>
)}
```

### 3. Sugerencias Automáticas (Autocomplete)

**Implementación:**
```typescript
const suggestions = useMemo(() => {
  if (globalSearchTerm.length < 2) return [];
  
  const term = globalSearchTerm.toLowerCase();
  return EXERCISE_DATABASE
    .filter(ex => ex.name.toLowerCase().startsWith(term))
    .slice(0, 5)
    .map(ex => ex.name);
}, [globalSearchTerm]);
```

**UI:**
```tsx
{suggestions.length > 0 && (
  <div className="absolute top-full left-0 right-0 mt-1 bg-white shadow-lg rounded-lg">
    {suggestions.map(name => (
      <button
        key={name}
        onClick={() => setGlobalSearchTerm(name)}
        className="w-full text-left px-4 py-2 hover:bg-gray-100"
      >
        {name}
      </button>
    ))}
  </div>
)}
```

### 4. Filtros Rápidos en Búsqueda Global

**Agregar chips de filtro:**
```tsx
<div className="flex gap-2 flex-wrap">
  <button
    onClick={() => setFilterType('all')}
    className={filterType === 'all' ? 'active' : ''}
  >
    Todos
  </button>
  <button
    onClick={() => setFilterType('training')}
    className={filterType === 'training' ? 'active' : ''}
  >
    🏋️ Entrenamiento
  </button>
  <button
    onClick={() => setFilterType('warmup')}
    className={filterType === 'warmup' ? 'active' : ''}
  >
    🔥 Calentamiento
  </button>
  <button
    onClick={() => setFilterType('favorites')}
    className={filterType === 'favorites' ? 'active' : ''}
  >
    ⭐ Favoritos
  </button>
</div>
```

### 5. Ejercicios Favoritos

**Permitir marcar ejercicios como favoritos:**
```typescript
const [favorites, setFavorites] = useState<Set<string>>(new Set());

const toggleFavorite = (exerciseId: string) => {
  const updated = new Set(favorites);
  if (updated.has(exerciseId)) {
    updated.delete(exerciseId);
  } else {
    updated.add(exerciseId);
  }
  setFavorites(updated);
  localStorage.setItem('favoriteExercises', JSON.stringify([...updated]));
};
```

**Mostrar favoritos primero en resultados:**
```typescript
const sortedResults = [...globalSearchResults].sort((a, b) => {
  const aFav = favorites.has(a.id) ? 1 : 0;
  const bFav = favorites.has(b.id) ? 1 : 0;
  return bFav - aFav;
});
```

### 6. Atajos de Teclado

**Mejorar navegación con teclado:**
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl/Cmd + K para enfocar búsqueda
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchInputRef.current?.focus();
    }
    
    // Escape para limpiar búsqueda
    if (e.key === 'Escape') {
      setGlobalSearchTerm('');
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### 7. Vista Previa Rápida (Quick Preview)

**Hover sobre ejercicio muestra preview:**
```tsx
<div className="relative group">
  <ExerciseCard exercise={exercise} />
  
  {/* Preview al hacer hover */}
  <div className="absolute left-full ml-2 top-0 hidden group-hover:block z-50">
    <div className="bg-white shadow-xl rounded-lg p-4 w-64">
      <img src={exercise.image} alt={exercise.name} />
      <h4>{exercise.name}</h4>
      <p className="text-sm">{exercise.description}</p>
      <div className="flex gap-2 mt-2">
        <span>Sets: {exercise.defaultSets}</span>
        <span>Reps: {exercise.defaultReps}</span>
      </div>
    </div>
  </div>
</div>
```

### 8. Búsqueda por Voz

**Para dispositivos móviles:**
```typescript
const startVoiceSearch = () => {
  if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setGlobalSearchTerm(transcript);
    };
    recognition.start();
  }
};
```

### 9. Agrupación de Resultados

**Agrupar resultados por categoría:**
```tsx
<div className="space-y-4">
  {trainingResults.length > 0 && (
    <div>
      <h4 className="font-semibold mb-2">
        🏋️ Entrenamiento ({trainingResults.length})
      </h4>
      <div className="grid gap-2">
        {trainingResults.map(ex => <ExerciseCard key={ex.id} exercise={ex} />)}
      </div>
    </div>
  )}
  
  {warmupResults.length > 0 && (
    <div>
      <h4 className="font-semibold mb-2">
        🔥 Calentamiento ({warmupResults.length})
      </h4>
      <div className="grid gap-2">
        {warmupResults.map(ex => <ExerciseCard key={ex.id} exercise={ex} />)}
      </div>
    </div>
  )}
</div>
```

### 10. Selección Múltiple Mejorada

**Agregar acciones rápidas:**
```tsx
<div className="sticky bottom-0 bg-white border-t p-4">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm text-gray-600">
      {selectedExercises.size} seleccionados
    </span>
    <button
      onClick={() => setSelectedExercises(new Set())}
      className="text-sm text-blue-600"
    >
      Limpiar selección
    </button>
  </div>
  
  <div className="flex gap-2">
    <Button onClick={handleConfirmSelection} className="flex-1">
      Agregar ejercicios
    </Button>
    <Button variant="ghost" onClick={() => setShowPreview(true)}>
      Vista previa
    </Button>
  </div>
</div>
```

## Archivos Modificados

1. **components/ExerciseSelector.tsx**
   - Agregado estado `globalSearchTerm`
   - Agregado `useMemo` para búsqueda global
   - Agregada UI de búsqueda global
   - Agregada visualización de resultados

2. **data/warmupExercises.ts**
   - Agregada función `getAllWarmups()`

## Próximos Pasos Recomendados

### Prioridad Alta
1. ✅ Búsqueda global básica (IMPLEMENTADO)
2. 🔄 Historial de búsquedas recientes
3. 🔄 Ejercicios favoritos

### Prioridad Media
4. 🔄 Búsqueda inteligente (fuzzy search)
5. 🔄 Sugerencias automáticas
6. 🔄 Filtros rápidos en búsqueda

### Prioridad Baja
7. 🔄 Atajos de teclado
8. 🔄 Vista previa rápida
9. 🔄 Búsqueda por voz
10. 🔄 Agrupación de resultados

## Métricas de Éxito

- **Tiempo de búsqueda**: Reducción del 60-70% en tiempo para encontrar un ejercicio conocido
- **Clics necesarios**: De 3-5 clics a 1-2 clics
- **Satisfacción del usuario**: Flujo más intuitivo y rápido

## Testing

Para probar la nueva funcionalidad:

1. Abre el selector de ejercicios al crear/editar una rutina
2. Escribe en el buscador global (ej: "press", "sentadilla", "curl")
3. Verifica que aparezcan resultados de todos los grupos musculares
4. Selecciona múltiples ejercicios
5. Confirma que se agregan correctamente
6. Verifica que puedes limpiar la búsqueda y volver a la navegación por grupos

## Notas Técnicas

- La búsqueda usa `useMemo` para optimización de rendimiento
- Se mantiene compatibilidad con el sistema de equipamiento
- No afecta la funcionalidad existente de navegación por grupos
- La búsqueda es case-insensitive
- Incluye tanto ejercicios de entrenamiento como de calentamiento
