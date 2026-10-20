[**gym-tracker**](../../../../README.md)

***

[gym-tracker](../../../../README.md) / [lib/workout/progression-advanced](../README.md) / default

# Variable: default

> **default**: `object`

Defined in: [lib/workout/progression-advanced.ts:337](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/workout/progression-advanced.ts#L337)

## Type Declaration

### estimate1RM

> **estimate1RM**: (`weight`, `reps`) => `number`

#### Parameters

##### weight

`number`

##### reps

`number`

#### Returns

`number`

### recommendForSession

> **recommendForSession**: (`session`, `allSessions`, `options`) => [`ProgressionRecommendation`](../type-aliases/ProgressionRecommendation.md)[]

Recomienda para todos los ejercicios en una sesión

#### Parameters

##### session

`WorkoutSession`

##### allSessions

`WorkoutSession`[]

##### options?

[`ProgressionOptions`](../type-aliases/ProgressionOptions.md) = `{}`

#### Returns

[`ProgressionRecommendation`](../type-aliases/ProgressionRecommendation.md)[]

### recommendWeightIncrease

> **recommendWeightIncrease**: (`exerciseId`, `sessions`, `options`) => [`ProgressionRecommendation`](../type-aliases/ProgressionRecommendation.md)

Algoritmo de progresión mejorado que considera múltiples factores

#### Parameters

##### exerciseId

`string`

##### sessions

`WorkoutSession`[]

##### options?

[`ProgressionOptions`](../type-aliases/ProgressionOptions.md) = `{}`

#### Returns

[`ProgressionRecommendation`](../type-aliases/ProgressionRecommendation.md)
