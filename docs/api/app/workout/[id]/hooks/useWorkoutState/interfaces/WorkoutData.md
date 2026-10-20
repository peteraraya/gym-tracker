[**gym-tracker**](../../../../../../README.md)

***

[gym-tracker](../../../../../../README.md) / [app/workout/\[id\]/hooks/useWorkoutState](../README.md) / WorkoutData

# Interface: WorkoutData

Defined in: [app/workout/\[id\]/hooks/useWorkoutState.ts:17](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWorkoutState.ts#L17)

Hook que centraliza todo el estado del workout

Maneja:
- Estado de ejercicios y series
- Pesos y repeticiones
- Tiempos de descanso
- Notas de sesión

## Properties

### \_lastUpdate?

> `optional` **\_lastUpdate?**: `number`

Defined in: [app/workout/\[id\]/hooks/useWorkoutState.ts:32](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWorkoutState.ts#L32)

***

### actualPauseDurations

> **actualPauseDurations**: `object`

Defined in: [app/workout/\[id\]/hooks/useWorkoutState.ts:26](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWorkoutState.ts#L26)

#### Index Signature

\[`key`: `string`\]: `number`[]

***

### actualReps

> **actualReps**: `object`

Defined in: [app/workout/\[id\]/hooks/useWorkoutState.ts:19](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWorkoutState.ts#L19)

#### Index Signature

\[`key`: `string`\]: `number`[]

***

### actualRestTimes

> **actualRestTimes**: `object`

Defined in: [app/workout/\[id\]/hooks/useWorkoutState.ts:27](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWorkoutState.ts#L27)

#### Index Signature

\[`key`: `string`\]: `number`[]

***

### actualSetDurations

> **actualSetDurations**: `object`

Defined in: [app/workout/\[id\]/hooks/useWorkoutState.ts:25](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWorkoutState.ts#L25)

#### Index Signature

\[`key`: `string`\]: `number`[]

***

### actualWeights

> **actualWeights**: `object`

Defined in: [app/workout/\[id\]/hooks/useWorkoutState.ts:20](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWorkoutState.ts#L20)

#### Index Signature

\[`key`: `string`\]: `number`[]

***

### completedSetFlags

> **completedSetFlags**: `object`

Defined in: [app/workout/\[id\]/hooks/useWorkoutState.ts:30](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWorkoutState.ts#L30)

#### Index Signature

\[`exerciseId`: `string`\]: `boolean`[]

***

### completedSets

> **completedSets**: `object`

Defined in: [app/workout/\[id\]/hooks/useWorkoutState.ts:18](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWorkoutState.ts#L18)

#### Index Signature

\[`key`: `string`\]: `number`

***

### lastWeights

> **lastWeights**: `object`

Defined in: [app/workout/\[id\]/hooks/useWorkoutState.ts:22](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWorkoutState.ts#L22)

#### Index Signature

\[`key`: `string`\]: `number`[]

***

### perSetRestOverrides

> **perSetRestOverrides**: `object`

Defined in: [app/workout/\[id\]/hooks/useWorkoutState.ts:24](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWorkoutState.ts#L24)

#### Index Signature

\[`key`: `string`\]: `number`[]

***

### restOverrides

> **restOverrides**: `object`

Defined in: [app/workout/\[id\]/hooks/useWorkoutState.ts:23](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWorkoutState.ts#L23)

#### Index Signature

\[`key`: `string`\]: `number`

***

### setTypes

> **setTypes**: `object`

Defined in: [app/workout/\[id\]/hooks/useWorkoutState.ts:21](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWorkoutState.ts#L21)

#### Index Signature

\[`key`: `string`\]: `string`[]

***

### skippedExercises

> **skippedExercises**: `string`[]

Defined in: [app/workout/\[id\]/hooks/useWorkoutState.ts:28](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWorkoutState.ts#L28)
