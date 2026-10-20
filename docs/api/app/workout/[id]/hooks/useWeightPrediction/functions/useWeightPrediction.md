[**gym-tracker**](../../../../../../README.md)

***

[gym-tracker](../../../../../../README.md) / [app/workout/\[id\]/hooks/useWeightPrediction](../README.md) / useWeightPrediction

# Function: useWeightPrediction()

> **useWeightPrediction**(`__namedParameters`): `object`

Defined in: [app/workout/\[id\]/hooks/useWeightPrediction.ts:13](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWeightPrediction.ts#L13)

## Parameters

### \_\_namedParameters

`UseWeightPredictionProps`

## Returns

`object`

### dismissedWeightSuggestion

> **dismissedWeightSuggestion**: `boolean`

### predictWeightForSet

> **predictWeightForSet**: (`currentWeight`) => `object`

#### Parameters

##### currentWeight

`number`

#### Returns

`object`

##### reasoning?

> `optional` **reasoning?**: `string`

##### weight

> **weight**: `number`

### setDismissedWeightSuggestion

> **setDismissedWeightSuggestion**: `Dispatch`\<`SetStateAction`\<`boolean`\>\>

### weightSuggestion

> **weightSuggestion**: [`WeightSuggestion`](../../../../../../lib/data/weightSuggestions/interfaces/WeightSuggestion.md)
