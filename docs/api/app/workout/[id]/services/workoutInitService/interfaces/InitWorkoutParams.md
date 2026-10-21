[**gym-logic**](../../../../../../README.md)

***

[gym-logic](../../../../../../README.md) / [app/workout/\[id\]/services/workoutInitService](../README.md) / InitWorkoutParams

# Interface: InitWorkoutParams

Defined in: [app/workout/\[id\]/services/workoutInitService.ts:21](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/services/workoutInitService.ts#L21)

## Properties

### activeWorkout

> **activeWorkout**: `RestorableWorkout`

Defined in: [app/workout/\[id\]/services/workoutInitService.ts:23](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/services/workoutInitService.ts#L23)

***

### getRoutineById

> **getRoutineById**: (`id`) => `Routine`

Defined in: [app/workout/\[id\]/services/workoutInitService.ts:24](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/services/workoutInitService.ts#L24)

#### Parameters

##### id

`string`

#### Returns

`Routine`

***

### id

> **id**: `string`

Defined in: [app/workout/\[id\]/services/workoutInitService.ts:22](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/services/workoutInitService.ts#L22)

***

### routerPush

> **routerPush**: (`path`) => `void`

Defined in: [app/workout/\[id\]/services/workoutInitService.ts:41](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/services/workoutInitService.ts#L41)

#### Parameters

##### path

`string`

#### Returns

`void`

***

### setIsInitialized

> **setIsInitialized**: (`val`) => `void`

Defined in: [app/workout/\[id\]/services/workoutInitService.ts:40](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/services/workoutInitService.ts#L40)

#### Parameters

##### val

`boolean`

#### Returns

`void`

***

### setOriginalRoutine

> **setOriginalRoutine**: (`routine`) => `void`

Defined in: [app/workout/\[id\]/services/workoutInitService.ts:39](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/services/workoutInitService.ts#L39)

#### Parameters

##### routine

`Routine`

#### Returns

`void`

***

### setRoutine

> **setRoutine**: (`routine`) => `void`

Defined in: [app/workout/\[id\]/services/workoutInitService.ts:38](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/services/workoutInitService.ts#L38)

#### Parameters

##### routine

`Routine`

#### Returns

`void`

***

### setShowStartSplash

> **setShowStartSplash**: (`show`) => `void`

Defined in: [app/workout/\[id\]/services/workoutInitService.ts:37](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/services/workoutInitService.ts#L37)

#### Parameters

##### show

`boolean`

#### Returns

`void`

***

### setWorkoutStartTime

> **setWorkoutStartTime**: (`time`) => `void`

Defined in: [app/workout/\[id\]/services/workoutInitService.ts:36](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/services/workoutInitService.ts#L36)

#### Parameters

##### time

`number`

#### Returns

`void`

***

### shouldContinue

> **shouldContinue**: () => `boolean`

Defined in: [app/workout/\[id\]/services/workoutInitService.ts:42](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/services/workoutInitService.ts#L42)

#### Returns

`boolean`

***

### startWorkout

> **startWorkout**: (`routine`) => `void`

Defined in: [app/workout/\[id\]/services/workoutInitService.ts:25](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/services/workoutInitService.ts#L25)

#### Parameters

##### routine

`Routine`

#### Returns

`void`

***

### timerHandlers

> **timerHandlers**: `object`

Defined in: [app/workout/\[id\]/services/workoutInitService.ts:33](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/services/workoutInitService.ts#L33)

#### startTimer

> **startTimer**: (`duration`, `title`, `nextExerciseName?`) => `void`

##### Parameters

###### duration

`number`

###### title

`string`

###### nextExerciseName?

`string`

##### Returns

`void`

***

### workoutState

> **workoutState**: `object`

Defined in: [app/workout/\[id\]/services/workoutInitService.ts:26](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/services/workoutInitService.ts#L26)

#### restoreData

> **restoreData**: (`data`) => `void`

##### Parameters

###### data

`Partial`\<[`WorkoutData`](../../../hooks/useWorkoutState/interfaces/WorkoutData.md)\>

##### Returns

`void`

#### setCurrentExerciseIndex

> **setCurrentExerciseIndex**: (`index`) => `void`

##### Parameters

###### index

`number`

##### Returns

`void`

#### setCurrentReps

> **setCurrentReps**: (`reps`) => `void`

##### Parameters

###### reps

`number` \| `""`

##### Returns

`void`

#### setCurrentSet

> **setCurrentSet**: (`set`) => `void`

##### Parameters

###### set

`number`

##### Returns

`void`

#### setCurrentWeight

> **setCurrentWeight**: (`weight`) => `void`

##### Parameters

###### weight

`number` \| `""`

##### Returns

`void`
