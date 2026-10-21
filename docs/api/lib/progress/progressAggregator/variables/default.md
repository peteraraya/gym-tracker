[**gym-logic**](../../../../README.md)

***

[gym-logic](../../../../README.md) / [lib/progress/progressAggregator](../README.md) / default

# Variable: default

> **default**: `object`

Defined in: [lib/progress/progressAggregator.ts:281](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/progress/progressAggregator.ts#L281)

## Type Declaration

### calculateProgressMetrics

> **calculateProgressMetrics**: (`sessions`, `userWeightKg`, `userGender`) => [`ProgressMetrics`](../interfaces/ProgressMetrics.md)

Main function to calculate progress metrics from sessions

#### Parameters

##### sessions

`WorkoutSession`[]

##### userWeightKg?

`number` = `75`

##### userGender?

`"male"` \| `"female"` = `'male'`

#### Returns

[`ProgressMetrics`](../interfaces/ProgressMetrics.md)

### calculateSessionVolume

> **calculateSessionVolume**: (`session`) => `number`

Calculate volume for a single session (Σ reps × weight)

#### Parameters

##### session

`WorkoutSession`

#### Returns

`number`

### estimate1RM

> **estimate1RM**: (`weight`, `reps`) => `number`

Estimate 1RM using Epley formula (most common)

#### Parameters

##### weight

`number`

##### reps

`number`

#### Returns

`number`

### estimateWilksScore

> **estimateWilksScore**: (`session`, `bodyWeightKg`, `isMale`) => `number`

Calculate Wilks score for a session
Note: This is simplified - actual Wilks requires specific lifts

#### Parameters

##### session

`WorkoutSession`

##### bodyWeightKg?

`number` = `75`

##### isMale?

`boolean` = `true`

#### Returns

`number`
