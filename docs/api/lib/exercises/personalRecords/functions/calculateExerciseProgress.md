[**gym-tracker**](../../../../README.md)

***

[gym-tracker](../../../../README.md) / [lib/exercises/personalRecords](../README.md) / calculateExerciseProgress

# Function: calculateExerciseProgress()

> **calculateExerciseProgress**(`sessions`, `exerciseName`): `object`

Defined in: [lib/exercises/personalRecords.ts:242](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/exercises/personalRecords.ts#L242)

Calcula el progreso de un ejercicio específico

## Parameters

### sessions

`WorkoutSession`[]

### exerciseName

`string`

## Returns

`object`

### currentWeight

> **currentWeight**: `number`

### improvement

> **improvement**: `number`

### improvementPercentage

> **improvementPercentage**: `number`

### personalRecord

> **personalRecord**: `object`

#### personalRecord.date

> **date**: `Date`

#### personalRecord.maxWeight

> **maxWeight**: `number`

#### personalRecord.reps

> **reps**: `number`

### previousWeight

> **previousWeight**: `number`

### sessions

> **sessions**: `number`

### totalSessions

> **totalSessions**: `number`

### totalVolume

> **totalVolume**: `number`

### trend

> **trend**: `"stable"` \| `"up"` \| `"down"`
