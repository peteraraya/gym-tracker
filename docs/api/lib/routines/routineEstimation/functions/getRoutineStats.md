[**gym-logic**](../../../../README.md)

***

[gym-logic](../../../../README.md) / [lib/routines/routineEstimation](../README.md) / getRoutineStats

# Function: getRoutineStats()

> **getRoutineStats**(`exercises`, `restBetweenSets?`, `restBetweenExercises?`): `object`

Defined in: [lib/routines/routineEstimation.ts:111](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/routines/routineEstimation.ts#L111)

Calcula estadísticas detalladas de la rutina

## Parameters

### exercises

(`Exercise` \| `Omit`\<`Exercise`, `"id"`\>)[]

### restBetweenSets?

`number` = `60`

### restBetweenExercises?

`number` = `120`

## Returns

`object`

### durationRange

> **durationRange**: `object`

#### durationRange.max

> **max**: `number` = `range.max`

#### durationRange.maxFormatted

> **maxFormatted**: `string`

#### durationRange.min

> **min**: `number` = `range.min`

#### durationRange.minFormatted

> **minFormatted**: `string`

### estimatedDuration

> **estimatedDuration**: `number` = `duration`

### estimatedDurationFormatted

> **estimatedDurationFormatted**: `string`

### totalExercises

> **totalExercises**: `number`

### totalSets

> **totalSets**: `number`
