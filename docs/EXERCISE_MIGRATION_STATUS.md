# Estado de Migración de Ejercicios

## 📊 Resumen

La base de datos de ejercicios está en proceso de migración desde un archivo monolítico (`data/exercises.ts`) hacia una estructura modular con code-splitting (`data/exercises/groups/`).

### Números Actuales:
- **Archivo antiguo** (`data/exercises.ts`): 250 ejercicios
- **Archivos nuevos** (`data/exercises/groups/`): 193 ejercicios
- **Faltantes por migrar**: 57 ejercicios (23%)

### Ejercicios por Grupo (Nuevo Sistema):
- Pecho: 9 ejercicios
- Espalda: 11 ejercicios
- Piernas: 16 ejercicios
- Glúteos: 11 ejercicios
- Hombros: 20 ejercicios
- Bíceps: 17 ejercicios
- Tríceps: 16 ejercicios
- Antebrazos: 15 ejercicios
- Trapecio: 12 ejercicios
- Cuello: 10 ejercicios
- Core: 15 ejercicios
- Gemelos: 19 ejercicios
- Cardio: 22 ejercicios

## ✅ Completado

1. **Estructura modular creada** (`data/exercises/groups/`)
   - 13 archivos de grupos musculares
   - Cada archivo exporta su array de ejercicios
   - Tipos compartidos en `data/exercises/types.ts`

2. **Sistema de carga dinámica** (`data/exercises/index.ts`)
   - Funciones asíncronas: `getExercisesByMuscleGroup()`, `getAllExercises()`
   - Cache para evitar cargas múltiples
   - Búsqueda por ID y nombre

3. **Capa de compatibilidad**
   - Export síncrono `EXERCISE_DATABASE` para componentes legacy
   - Importa todos los grupos de forma síncrona
   - Permite migración gradual sin romper la app

4. **Tipos expandidos** para funcionalidades educativas:
   - `difficulty`: principiante | intermedio | avanzado
   - `category`: compuesto | aislamiento | cardio | movilidad
   - `primaryMuscles` y `secondaryMuscles`
   - `instructions`: paso a paso
   - `commonMistakes`: errores comunes
   - `tips`: consejos profesionales
   - `benefits`: beneficios
   - `variations`: más fáciles, más difíciles, alternativas
   - `safetyNotes`: notas de seguridad

## 🔄 En Progreso

### Componentes Migrados (usan nuevo sistema):
- ✅ `app/exercises/page.tsx` - Usa `getExercisesByMuscleGroup()`
- ✅ `components/ExerciseSelector.tsx` - Usa `getExercisesByMuscleGroup()`

### Componentes Pendientes de Migración (usan `EXERCISE_DATABASE`):
- ⏳ `app/dashboard/page.tsx`
- ⏳ `app/progress/page.tsx`
- ⏳ `app/workout/[id]/page.tsx`
- ⏳ `app/workout/free/page.tsx`
- ⏳ `components/MuscleGroupStats.tsx`
- ⏳ `components/RoutineForm.tsx`
- ⏳ `components/ExerciseListWithDetails.tsx`
- ⏳ `components/ExerciseDetails.tsx`

## 📝 Tareas Pendientes

### 1. Completar Migración de Ejercicios
Comparar `data/exercises.ts` con los archivos en `data/exercises/groups/` y agregar los 57 ejercicios faltantes.

**Proceso sugerido:**
```bash
# Extraer IDs del archivo antiguo
grep "id: '" data/exercises.ts | cut -d"'" -f2 > old_ids.txt

# Extraer IDs de los archivos nuevos
grep -r "id: '" data/exercises/groups/ | cut -d"'" -f2 > new_ids.txt

# Comparar y encontrar faltantes
comm -23 <(sort old_ids.txt) <(sort new_ids.txt) > missing_ids.txt
```

### 2. Agregar Información Educativa
Expandir los ejercicios existentes con:
- Instrucciones paso a paso
- Errores comunes
- Consejos profesionales
- Beneficios
- Variaciones
- Notas de seguridad

**Prioridad:** Ejercicios más populares primero
- Press de Banca ✅
- Flexiones ✅
- Sentadilla
- Peso Muerto
- Dominadas
- Press Militar
- Remo con Barra

### 3. Migrar Componentes al Nuevo Sistema
Actualizar componentes para usar funciones asíncronas:

**Antes:**
```typescript
import { EXERCISE_DATABASE } from '@/data/exercises';
const exercises = EXERCISE_DATABASE.filter(ex => ex.muscleGroup === 'pecho');
```

**Después:**
```typescript
import { getExercisesByMuscleGroup } from '@/data/exercises';
const [exercises, setExercises] = useState([]);

useEffect(() => {
  getExercisesByMuscleGroup('pecho').then(setExercises);
}, []);
```

### 4. Eliminar Archivo Antiguo
Una vez que todos los componentes estén migrados y todos los ejercicios transferidos:
1. Verificar que ningún componente importe de `data/exercises.ts`
2. Eliminar `data/exercises.ts`
3. Remover exports de compatibilidad de `data/exercises/index.ts`

## 🎯 Beneficios de la Migración

1. **Code Splitting**: Reduce bundle inicial de ~250 ejercicios a solo los necesarios
2. **Performance**: Carga bajo demanda mejora tiempo de carga inicial
3. **Mantenibilidad**: Archivos más pequeños y organizados por grupo muscular
4. **Escalabilidad**: Fácil agregar nuevos ejercicios sin archivo monolítico
5. **Educativo**: Estructura preparada para información detallada de cada ejercicio

## 📚 Documentación Relacionada

- `docs/CODE_SPLITTING_PLAN.md` - Plan original de code splitting
- `docs/BEGINNER_FEATURES_PLAN.md` - Funcionalidades educativas
- `data/exercises/types.ts` - Tipos y estructura de datos
- `data/exercises/index.ts` - API de acceso a ejercicios

## 🚀 Próximos Pasos Inmediatos

1. Identificar los 57 ejercicios faltantes
2. Migrarlos a sus respectivos archivos de grupo
3. Actualizar 2-3 componentes críticos al nuevo sistema
4. Agregar información educativa a 5 ejercicios populares
5. Probar que todo funciona correctamente
6. Documentar cambios en CHANGELOG

---

**Última actualización:** 2026-02-13
**Estado:** 🟡 En Progreso (77% completado)
