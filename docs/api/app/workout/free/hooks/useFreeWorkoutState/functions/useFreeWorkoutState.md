[**gym-tracker**](../../../../../../README.md)

***

[gym-tracker](../../../../../../README.md) / [app/workout/free/hooks/useFreeWorkoutState](../README.md) / useFreeWorkoutState

# Function: useFreeWorkoutState()

> **useFreeWorkoutState**(): `object`

Defined in: [app/workout/free/hooks/useFreeWorkoutState.ts:71](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/free/hooks/useFreeWorkoutState.ts#L71)

## Returns

`object`

### activeExercise

> **activeExercise**: [`FreeExercise`](../interfaces/FreeExercise.md)

### activeExerciseIndex

> **activeExerciseIndex**: `number`

### addExerciseFromSuggestion

> **addExerciseFromSuggestion**: (`rawExercises`, `restBetweenSets`) => `void`

#### Parameters

##### rawExercises

`any`[]

##### restBetweenSets

`number`

#### Returns

`void`

### addExercises

> **addExercises**: (`templates`, `userProfile`) => `void`

#### Parameters

##### templates

`ExerciseTemplate`[]

##### userProfile

[`UserProfile`](../../../../../../lib/storage/localStorage/interfaces/UserProfile.md)

#### Returns

`void`

### clearStorage

> **clearStorage**: () => `void` = `clearFreeWorkoutStorage`

#### Returns

`void`

### collapsedExercises

> **collapsedExercises**: `Set`\<`number`\>

### completeSet

> **completeSet**: (`reps`, `weight`, `setType`) => `void`

#### Parameters

##### reps

`number`

##### weight

`number`

##### setType

`SetType`

#### Returns

`void`

### deleteSet

> **deleteSet**: (`exerciseIndex`, `setIndex`) => `void`

#### Parameters

##### exerciseIndex

`number`

##### setIndex

`number`

#### Returns

`void`

### exercises

> **exercises**: [`FreeExercise`](../interfaces/FreeExercise.md)[]

### getSmartRest

> **getSmartRest**: (`exerciseId`, `completedSetsCount`, `reps`) => `number`

#### Parameters

##### exerciseId

`string`

##### completedSetsCount

`number`

##### reps

`number`

#### Returns

`number`

### globalRestTime

> **globalRestTime**: `number`

### removeExercise

> **removeExercise**: (`index`) => `void`

#### Parameters

##### index

`number`

#### Returns

`void`

### setExerciseActive

> **setExerciseActive**: (`index`) => `void`

#### Parameters

##### index

`number`

#### Returns

`void`

### setGlobalRestTime

> **setGlobalRestTime**: `Dispatch`\<`SetStateAction`\<`number`\>\>

### toggleCollapse

> **toggleCollapse**: (`index`) => `void`

#### Parameters

##### index

`number`

#### Returns

`void`

### toggleSetChecked

> **toggleSetChecked**: (`exerciseIndex`, `setIndex`, `checked`) => `void`

#### Parameters

##### exerciseIndex

`number`

##### setIndex

`number`

##### checked

`boolean`

#### Returns

`void`

### updateSet

> **updateSet**: (`exerciseIndex`, `setIndex`, `updates`) => `void`

#### Parameters

##### exerciseIndex

`number`

##### setIndex

`number`

##### updates

`Partial`\<`FreeExerciseSet`\>

#### Returns

`void`
