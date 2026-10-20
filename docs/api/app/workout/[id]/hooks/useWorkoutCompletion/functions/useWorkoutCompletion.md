[**gym-tracker**](../../../../../../README.md)

***

[gym-tracker](../../../../../../README.md) / [app/workout/\[id\]/hooks/useWorkoutCompletion](../README.md) / useWorkoutCompletion

# Function: useWorkoutCompletion()

> **useWorkoutCompletion**(`__namedParameters`): `object`

Defined in: [app/workout/\[id\]/hooks/useWorkoutCompletion.ts:23](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWorkoutCompletion.ts#L23)

## Parameters

### \_\_namedParameters

`UseWorkoutCompletionProps`

## Returns

`object`

### completeSplash

> **completeSplash**: [`CompleteSplashStats`](../../../../../../components/features/workout/WorkoutCompleteSplash/interfaces/CompleteSplashStats.md)

### finishWorkout

> **finishWorkout**: (`workoutData`, `confirmedDuration?`) => `Promise`\<`void`\>

#### Parameters

##### workoutData

`any`

##### confirmedDuration?

`number`

#### Returns

`Promise`\<`void`\>

### isSaving

> **isSaving**: `boolean`

### onCompleteSplashDone

> **onCompleteSplashDone**: () => `void`

#### Returns

`void`

### openCompletionModal

> **openCompletionModal**: (`duration?`) => `void`

#### Parameters

##### duration?

`number`

#### Returns

`void`

### proposedDuration

> **proposedDuration**: `number`

### sessionNotes

> **sessionNotes**: `string`

### setProposedDuration

> **setProposedDuration**: `Dispatch`\<`SetStateAction`\<`number`\>\>

### setSessionNotes

> **setSessionNotes**: `Dispatch`\<`SetStateAction`\<`string`\>\>

### setShowNotesModal

> **setShowNotesModal**: `Dispatch`\<`SetStateAction`\<`boolean`\>\>

### showNotesModal

> **showNotesModal**: `boolean`
