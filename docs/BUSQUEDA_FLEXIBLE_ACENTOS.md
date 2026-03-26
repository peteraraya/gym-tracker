# Mejora: Búsqueda Flexible sin Acentos ni Mayúsculas

## Problema

La búsqueda de ejercicios era estricta y requería:
- Escribir exactamente con mayúsculas/minúsculas correctas
- Incluir todos los acentos (ej: "Bíceps" no se encontraba con "biceps")
- Esto generaba frustración cuando el usuario escribía rápido o sin acentos

## Solución Implementada

### Función de Normalización

Se creó una función que normaliza el texto eliminando acentos y convirtiendo a minúsculas:

```typescript
// Función para normalizar texto: elimina acentos y convierte a minúsculas
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Elimina diacríticos (acentos)
};
```

**Cómo funciona:**
1. `.toLowerCase()` - Convierte todo a minúsculas
2. `.normalize('NFD')` - Descompone caracteres con acentos (ej: "é" → "e" + "´")
3. `.replace(/[\u0300-\u036f]/g, '')` - Elimina los diacríticos (acentos)

### Aplicación en Búsqueda Global

```typescript
const globalSearchResults = useMemo(() => {
  if (!globalSearchTerm.trim() || selectedMuscle) return [];
  
  const normalizedTerm = normalizeText(globalSearchTerm);
  
  const trainingResults = EXERCISE_DATABASE
    .filter(ex => normalizeText(ex.name).includes(normalizedTerm))
    .filter(ex => hasEquipment(ex.equipment));
  
  const warmupResults = getAllWarmups()
    .filter(ex => normalizeText(ex.name).includes(normalizedTerm));
  
  return [...trainingResults, ...warmupResults];
}, [globalSearchTerm, selectedMuscle, hasEquipment]);
```

### Aplicación en Búsqueda Local (dentro de grupo)

```typescript
const filteredExercises = selectedMuscle
  ? getExercisesByMuscleGroup(selectedMuscle)
    .filter(ex => normalizeText(ex.name).includes(normalizeText(searchTerm)))
    .filter(ex => hasEquipment(ex.equipment))
  : [];

const warmupExercises = selectedMuscle
  ? getWarmupsByMuscleGroup(selectedMuscle)
    .filter(ex => normalizeText(ex.name).includes(normalizeText(searchTerm)))
    .filter(ex => warmupCategoryFilter === 'all' || ex.category === warmupCategoryFilter)
  : [];
```

## Ejemplos de Uso

### Búsqueda sin Acentos

| Usuario escribe | Encuentra |
|----------------|-----------|
| `biceps` | Bíceps, BICEPS, bíceps |
| `gluteo` | Glúteo, gluteo, GLÚTEO |
| `traccion` | Tracción, traccion, TRACCIÓN |
| `abdominales` | Abdominales, ABDOMINALES |

### Búsqueda con Mayúsculas/Minúsculas

| Usuario escribe | Encuentra |
|----------------|-----------|
| `PRESS` | Press Banca, press militar, Press Inclinado |
| `SentaDILLA` | Sentadilla, sentadilla búlgara, SENTADILLA |
| `CuRl` | Curl de Bíceps, curl martillo, CURL |

### Búsqueda Combinada

| Usuario escribe | Encuentra |
|----------------|-----------|
| `BICEPS` | Bíceps, biceps, BÍCEPS |
| `gluteo` | Glúteo, gluteo, Glúteos |
| `TRACCION` | Tracción, traccion, TRACCIÓN |

## Beneficios

### Para el Usuario

1. **Más rápido**: No necesita preocuparse por acentos
2. **Menos errores**: Funciona con cualquier combinación de mayúsculas
3. **Más natural**: Escribe como habla
4. **Menos frustración**: Siempre encuentra lo que busca

### Técnicos

1. **Mejor UX**: Búsqueda más tolerante
2. **Accesibilidad**: Funciona en teclados sin acentos
3. **Internacional**: Útil para usuarios con teclados en inglés
4. **Performance**: Normalización es muy rápida (O(n))

## Casos de Prueba

### Test 1: Búsqueda sin acentos
```typescript
// Input: "biceps"
// Expected: Encuentra "Bíceps", "Curl de Bíceps", etc.
const results = searchExercises("biceps");
expect(results).toContainExercise("Bíceps");
```

### Test 2: Búsqueda con mayúsculas
```typescript
// Input: "PRESS"
// Expected: Encuentra "Press Banca", "press militar", etc.
const results = searchExercises("PRESS");
expect(results).toContainExercise("Press Banca");
```

### Test 3: Búsqueda mixta
```typescript
// Input: "GLUTEO"
// Expected: Encuentra "Glúteo", "Glúteos", etc.
const results = searchExercises("GLUTEO");
expect(results).toContainExercise("Glúteo");
```

### Test 4: Búsqueda con caracteres especiales
```typescript
// Input: "traccion"
// Expected: Encuentra "Tracción", "Tracciones", etc.
const results = searchExercises("traccion");
expect(results).toContainExercise("Tracción");
```

## Limitaciones Conocidas

### No implementado (futuras mejoras)

1. **Fuzzy search**: No tolera errores de escritura
   - "sentadila" NO encuentra "sentadilla"
   - Solución: Implementar algoritmo de distancia de Levenshtein

2. **Sinónimos**: No busca por términos relacionados
   - "pecho" NO encuentra "pectoral"
   - Solución: Diccionario de sinónimos

3. **Búsqueda por descripción**: Solo busca en el nombre
   - No busca en la descripción del ejercicio
   - Solución: Extender búsqueda a más campos

## Archivos Modificados

1. **components/ExerciseSelector.tsx**
   - Agregada función `normalizeText()`
   - Actualizada búsqueda global con normalización
   - Actualizada búsqueda local con normalización

## Compatibilidad

- ✅ Funciona en todos los navegadores modernos
- ✅ Compatible con teclados en español
- ✅ Compatible con teclados en inglés (sin acentos)
- ✅ Compatible con teclados móviles
- ✅ No afecta performance (normalización es O(n))

## Próximas Mejoras

### Prioridad Alta
1. ✅ Búsqueda sin acentos (IMPLEMENTADO)
2. ✅ Búsqueda case-insensitive (IMPLEMENTADO)
3. 🔄 Fuzzy search (tolerar errores)

### Prioridad Media
4. 🔄 Búsqueda por sinónimos
5. 🔄 Búsqueda en descripción
6. 🔄 Búsqueda por equipamiento

### Prioridad Baja
7. 🔄 Búsqueda por grupo muscular
8. 🔄 Búsqueda por dificultad
9. 🔄 Búsqueda por categoría

## Notas Técnicas

### Unicode Normalization

La normalización Unicode (NFD) descompone caracteres:
- `é` → `e` + `´` (U+0065 + U+0301)
- `á` → `a` + `´` (U+0061 + U+0301)
- `ñ` → `n` + `~` (U+006E + U+0303)

Luego eliminamos los diacríticos (U+0300 a U+036F):
- `e` + `´` → `e`
- `a` + `´` → `a`
- `n` + `~` → `n`

### Performance

La normalización es muy eficiente:
- Tiempo: O(n) donde n es la longitud del string
- Memoria: O(n) para el string normalizado
- No afecta la experiencia del usuario

### Alternativas Consideradas

1. **Diccionario de reemplazos**: Más lento y difícil de mantener
2. **Regex complejos**: Menos legible y más propenso a errores
3. **Librería externa**: Agrega peso innecesario al bundle

## Conclusión

La búsqueda flexible mejora significativamente la experiencia del usuario al:
- Eliminar la necesidad de escribir con acentos
- Permitir cualquier combinación de mayúsculas/minúsculas
- Hacer la búsqueda más natural e intuitiva
- Funcionar en cualquier tipo de teclado

Esta es una mejora fundamental que hace la app más accesible y fácil de usar.
