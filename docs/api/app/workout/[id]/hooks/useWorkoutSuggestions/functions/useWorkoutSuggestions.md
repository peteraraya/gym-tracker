[**gym-logic**](../../../../../../README.md)

***

[gym-logic](../../../../../../README.md) / [app/workout/\[id\]/hooks/useWorkoutSuggestions](../README.md) / useWorkoutSuggestions

# Function: useWorkoutSuggestions()

> **useWorkoutSuggestions**(`params`): `object`

Defined in: [app/workout/\[id\]/hooks/useWorkoutSuggestions.ts:30](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWorkoutSuggestions.ts#L30)

Hook que maneja las sugerencias de entrenamiento
- Genera sugerencias basadas en historial
- Genera sugerencias en vivo durante el entrenamiento
- Muestra toasts para sugerencias importantes

## Parameters

### params

`UseWorkoutSuggestionsParams`

## Returns

`object`

### dismissedSuggestions

> **dismissedSuggestions**: `Set`\<`number`\>

### dismissSuggestion

> **dismissSuggestion**: (`index`) => `void`

#### Parameters

##### index

`number`

#### Returns

`void`

### suggestions

> **suggestions**: [`WorkoutSuggestion`](../../../../../../lib/workout/workoutSuggestions/interfaces/WorkoutSuggestion.md)[]
