# Fix: IDs Duplicados en Base de Datos de Ejercicios

## Problema
Error de React en consola:
```
Encountered two children with the same key, `dumbbell-shrugs`. 
Keys should be unique so that components maintain their identity across updates.
```

## Causa
El ejercicio "Encogimientos con Mancuernas" estaba duplicado con el mismo ID `dumbbell-shrugs` en dos grupos musculares diferentes:
- `data/exercises/groups/hombros.ts`
- `data/exercises/groups/trapecio.ts`

Esto causaba conflictos cuando React intentaba renderizar listas de ejercicios, ya que las keys deben ser únicas.

## Solución Implementada

### 1. Renombrar IDs para hacerlos únicos

**Trapecio** (`data/exercises/groups/trapecio.ts`):
```typescript
{
  id: 'dumbbell-shrugs-trapezius', // Antes: 'dumbbell-shrugs'
  name: 'Encogimientos con Mancuernas',
  muscleGroup: 'trapecio',
  // ... resto de propiedades
}
```

**Hombros** (`data/exercises/groups/hombros.ts`):
```typescript
{
  id: 'dumbbell-shrugs-shoulders', // Antes: 'dumbbell-shrugs'
  name: 'Encogimientos con Mancuernas',
  muscleGroup: 'hombros',
  // ... resto de propiedades
}
```

### 2. Convención de nombres para IDs

Para evitar duplicados futuros, usar el siguiente patrón cuando un ejercicio aparece en múltiples grupos musculares:

```
{ejercicio-base}-{grupo-muscular}
```

Ejemplos:
- `dumbbell-shrugs-trapezius`
- `dumbbell-shrugs-shoulders`
- `cable-row-back`
- `cable-row-biceps`

## Impacto

- ✅ Elimina error de React keys duplicadas
- ✅ Permite que el mismo ejercicio aparezca en múltiples grupos musculares sin conflictos
- ✅ Mejora la estabilidad del renderizado de listas
- ⚠️ Los usuarios que tengan rutinas guardadas con el ID antiguo no se verán afectados (los IDs en rutinas guardadas son independientes)

## Testing

1. Navegar a la página de rutinas
2. Abrir selector de ejercicios
3. Buscar "Encogimientos con Mancuernas"
4. Verificar que no aparezcan errores en consola
5. Seleccionar múltiples ejercicios incluyendo este
6. Confirmar que todos se agregan correctamente

## Archivos Modificados

- `data/exercises/groups/hombros.ts` - ID cambiado a `dumbbell-shrugs-shoulders`
- `data/exercises/groups/trapecio.ts` - ID cambiado a `dumbbell-shrugs-trapezius`
- `data/exercises.ts` - IDs actualizados en el archivo principal
- `docs/FIX_DUPLICATE_EXERCISE_IDS.md` - Esta documentación

## Fecha
2024-01-XX
