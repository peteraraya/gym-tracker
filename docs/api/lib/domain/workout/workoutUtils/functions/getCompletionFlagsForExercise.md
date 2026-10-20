[**gym-tracker**](../../../../../README.md)

***

[gym-tracker](../../../../../README.md) / [lib/domain/workout/workoutUtils](../README.md) / getCompletionFlagsForExercise

# Function: getCompletionFlagsForExercise()

> **getCompletionFlagsForExercise**(`params`): `boolean`[]

Defined in: [lib/domain/workout/workoutUtils.ts:81](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/domain/workout/workoutUtils.ts#L81)

Obtiene las flags de completado para un ejercicio específico.
Primero usa los flags explícitos si existen, de lo contrario
calcula basado en completedSets.

## Parameters

### params

#### completedSetFlags?

`Record`\<`string`, `boolean`[]\>

#### completedSets?

`Record`\<`string`, `number`\>

#### exerciseId

`string`

#### totalSets

`number`

## Returns

`boolean`[]
