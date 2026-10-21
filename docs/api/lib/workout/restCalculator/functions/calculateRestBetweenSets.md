[**gym-logic**](../../../../README.md)

***

[gym-logic](../../../../README.md) / [lib/workout/restCalculator](../README.md) / calculateRestBetweenSets

# Function: calculateRestBetweenSets()

> **calculateRestBetweenSets**(`exercise`, `sets?`, `reps?`, `fitnessLevel?`): `RestRecommendation`

Defined in: [lib/workout/restCalculator.ts:66](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/workout/restCalculator.ts#L66)

Calcula el tiempo de descanso recomendado entre series.
Prioridad: restTime del ejercicio (campo de la BD) → fórmula genérica por tipo de entrenamiento.

## Parameters

### exercise

`ExerciseTemplate`

### sets?

`number` = `3`

### reps?

`number` = `10`

### fitnessLevel?

`"beginner"` \| `"intermediate"` \| `"advanced"` = `'intermediate'`

## Returns

`RestRecommendation`
