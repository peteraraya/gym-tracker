[**gym-logic**](../../../../README.md)

***

[gym-logic](../../../../README.md) / [lib/routines/routineEstimation](../README.md) / calculateRoutineDurationRange

# Function: calculateRoutineDurationRange()

> **calculateRoutineDurationRange**(`exercises`, `restBetweenSets?`, `restBetweenExercises?`): `object`

Defined in: [lib/routines/routineEstimation.ts:89](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/routines/routineEstimation.ts#L89)

Obtiene un rango de duración estimada (mínimo y máximo)
considerando variabilidad en la ejecución

## Parameters

### exercises

(`Exercise` \| `Omit`\<`Exercise`, `"id"`\>)[]

Array de ejercicios de la rutina

### restBetweenSets?

`number` = `60`

Descanso por defecto entre series

### restBetweenExercises?

`number` = `120`

Descanso por defecto entre ejercicios

## Returns

`object`

Objeto con duración mínima y máxima en segundos

### avg

> **avg**: `number`

### max

> **max**: `number`

### min

> **min**: `number`
