[**gym-logic**](../../../../README.md)

***

[gym-logic](../../../../README.md) / [lib/workout/normalizeWorkoutState](../README.md) / WorkoutState

# Interface: WorkoutState

Defined in: [lib/workout/normalizeWorkoutState.ts:16](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/workout/normalizeWorkoutState.ts#L16)

## Properties

### actualReps

> **actualReps**: `object`

Defined in: [lib/workout/normalizeWorkoutState.ts:22](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/workout/normalizeWorkoutState.ts#L22)

#### Index Signature

\[`key`: `string`\]: `number`[]

***

### actualWeights

> **actualWeights**: `object`

Defined in: [lib/workout/normalizeWorkoutState.ts:23](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/workout/normalizeWorkoutState.ts#L23)

#### Index Signature

\[`key`: `string`\]: `number`[]

***

### completedSets

> **completedSets**: `object`

Defined in: [lib/workout/normalizeWorkoutState.ts:21](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/workout/normalizeWorkoutState.ts#L21)

#### Index Signature

\[`key`: `string`\]: `number`

***

### currentExerciseIndex

> **currentExerciseIndex**: `number`

Defined in: [lib/workout/normalizeWorkoutState.ts:19](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/workout/normalizeWorkoutState.ts#L19)

***

### currentSet

> **currentSet**: `number`

Defined in: [lib/workout/normalizeWorkoutState.ts:20](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/workout/normalizeWorkoutState.ts#L20)

***

### isResting?

> `optional` **isResting?**: `boolean`

Defined in: [lib/workout/normalizeWorkoutState.ts:28](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/workout/normalizeWorkoutState.ts#L28)

Estado del timer de descanso para persistencia entre recargas

***

### modifiedRoutine?

> `optional` **modifiedRoutine?**: `Routine`

Defined in: [lib/workout/normalizeWorkoutState.ts:26](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/workout/normalizeWorkoutState.ts#L26)

Rutina modificada durante el entrenamiento (series agregadas/eliminadas)

***

### perSetRestOverrides?

> `optional` **perSetRestOverrides?**: `object`

Defined in: [lib/workout/normalizeWorkoutState.ts:41](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/workout/normalizeWorkoutState.ts#L41)

#### Index Signature

\[`key`: `string`\]: `number`[]

***

### restOverrides?

> `optional` **restOverrides?**: `object`

Defined in: [lib/workout/normalizeWorkoutState.ts:40](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/workout/normalizeWorkoutState.ts#L40)

#### Index Signature

\[`key`: `string`\]: `number`

***

### restTimerNextExercise?

> `optional` **restTimerNextExercise?**: `string`

Defined in: [lib/workout/normalizeWorkoutState.ts:34](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/workout/normalizeWorkoutState.ts#L34)

***

### restTimerRemaining?

> `optional` **restTimerRemaining?**: `number`

Defined in: [lib/workout/normalizeWorkoutState.ts:30](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/workout/normalizeWorkoutState.ts#L30)

Tiempo restante en segundos (snapshot al guardar)

***

### restTimerStartedAt?

> `optional` **restTimerStartedAt?**: `number`

Defined in: [lib/workout/normalizeWorkoutState.ts:32](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/workout/normalizeWorkoutState.ts#L32)

Timestamp (ms) cuando se guardó el tiempo restante

***

### restTimerTitle?

> `optional` **restTimerTitle?**: `string`

Defined in: [lib/workout/normalizeWorkoutState.ts:33](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/workout/normalizeWorkoutState.ts#L33)

***

### routineId

> **routineId**: `string`

Defined in: [lib/workout/normalizeWorkoutState.ts:17](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/workout/normalizeWorkoutState.ts#L17)

***

### routineName

> **routineName**: `string`

Defined in: [lib/workout/normalizeWorkoutState.ts:18](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/workout/normalizeWorkoutState.ts#L18)

***

### setTypes?

> `optional` **setTypes?**: `object`

Defined in: [lib/workout/normalizeWorkoutState.ts:39](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/workout/normalizeWorkoutState.ts#L39)

#### Index Signature

\[`key`: `string`\]: `string`[]

***

### skippedExercises?

> `optional` **skippedExercises?**: `string`[]

Defined in: [lib/workout/normalizeWorkoutState.ts:38](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/workout/normalizeWorkoutState.ts#L38)

IDs de ejercicios omitidos en esta sesión (no eliminados)

***

### startedAt

> **startedAt**: `Date`

Defined in: [lib/workout/normalizeWorkoutState.ts:24](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/workout/normalizeWorkoutState.ts#L24)

***

### totalPausedTime?

> `optional` **totalPausedTime?**: `number`

Defined in: [lib/workout/normalizeWorkoutState.ts:36](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/workout/normalizeWorkoutState.ts#L36)

Tiempo total pausado en el entrenamiento (en milisegundos)
