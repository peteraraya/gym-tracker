[**gym-tracker**](../../../../../../README.md)

***

[gym-tracker](../../../../../../README.md) / [app/workout/\[id\]/types/workout.types](../README.md) / WorkoutHandlers

# Interface: WorkoutHandlers

Defined in: [app/workout/\[id\]/types/workout.types.ts:150](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/types/workout.types.ts#L150)

Handlers para eventos del workout

## Properties

### onCancelWorkout

> **onCancelWorkout**: () => `void`

Defined in: [app/workout/\[id\]/types/workout.types.ts:160](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/types/workout.types.ts#L160)

#### Returns

`void`

***

### onCompleteSet

> **onCompleteSet**: () => `void`

Defined in: [app/workout/\[id\]/types/workout.types.ts:152](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/types/workout.types.ts#L152)

#### Returns

`void`

***

### onEditReps

> **onEditReps**: (`exerciseId`, `setIndex`, `value`) => `void`

Defined in: [app/workout/\[id\]/types/workout.types.ts:154](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/types/workout.types.ts#L154)

#### Parameters

##### exerciseId

`string`

##### setIndex

`number`

##### value

`number`

#### Returns

`void`

***

### onEditRestOverride

> **onEditRestOverride**: (`exerciseId`, `value`) => `void`

Defined in: [app/workout/\[id\]/types/workout.types.ts:156](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/types/workout.types.ts#L156)

#### Parameters

##### exerciseId

`string`

##### value

`number`

#### Returns

`void`

***

### onEditSetRestOverride

> **onEditSetRestOverride**: (`exerciseId`, `setIndex`, `value`) => `void`

Defined in: [app/workout/\[id\]/types/workout.types.ts:157](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/types/workout.types.ts#L157)

#### Parameters

##### exerciseId

`string`

##### setIndex

`number`

##### value

`number`

#### Returns

`void`

***

### onEditSetType

> **onEditSetType**: (`exerciseId`, `setIndex`, `type`) => `void`

Defined in: [app/workout/\[id\]/types/workout.types.ts:155](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/types/workout.types.ts#L155)

#### Parameters

##### exerciseId

`string`

##### setIndex

`number`

##### type

`SetType`

#### Returns

`void`

***

### onEditWeight

> **onEditWeight**: (`exerciseId`, `setIndex`, `value`) => `void`

Defined in: [app/workout/\[id\]/types/workout.types.ts:153](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/types/workout.types.ts#L153)

#### Parameters

##### exerciseId

`string`

##### setIndex

`number`

##### value

`number`

#### Returns

`void`

***

### onFinishWorkout

> **onFinishWorkout**: () => `void`

Defined in: [app/workout/\[id\]/types/workout.types.ts:161](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/types/workout.types.ts#L161)

#### Returns

`void`

***

### onMoveExercise

> **onMoveExercise**: (`fromIndex`, `toIndex`) => `void`

Defined in: [app/workout/\[id\]/types/workout.types.ts:159](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/types/workout.types.ts#L159)

#### Parameters

##### fromIndex

`number`

##### toIndex

`number`

#### Returns

`void`

***

### onStartSet

> **onStartSet**: () => `void`

Defined in: [app/workout/\[id\]/types/workout.types.ts:151](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/types/workout.types.ts#L151)

#### Returns

`void`

***

### onToggleSetComplete

> **onToggleSetComplete**: (`exerciseId`, `setIndex`) => `void`

Defined in: [app/workout/\[id\]/types/workout.types.ts:158](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/types/workout.types.ts#L158)

#### Parameters

##### exerciseId

`string`

##### setIndex

`number`

#### Returns

`void`
