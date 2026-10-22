[**gym-logic**](../../../../README.md)

***

[gym-logic](../../../../README.md) / [lib/routines/routineEstimation](../README.md) / calculateRoutineDuration

# Function: calculateRoutineDuration()

> **calculateRoutineDuration**(`exercises`, `restBetweenSets?`, `restBetweenExercises?`): `number`

Defined in: [lib/routines/routineEstimation.ts:23](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/routines/routineEstimation.ts#L23)

Calcula el tiempo estimado de una rutina en segundos

## Parameters

### exercises

(`Exercise` \| `Omit`\<`Exercise`, `"id"`\>)[]

Array de ejercicios de la rutina

### restBetweenSets?

`number` = `60`

Descanso por defecto entre series (segundos)

### restBetweenExercises?

`number` = `120`

Descanso por defecto entre ejercicios (segundos)

## Returns

`number`

Tiempo estimado en segundos
