[**gym-tracker**](../../../../README.md)

***

[gym-tracker](../../../../README.md) / [lib/workout/progression](../README.md) / default

# Variable: default

> **default**: `object`

Defined in: [lib/workout/progression.ts:87](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/workout/progression.ts#L87)

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

> **recommendForSession**: (`session`, `allSessions`, `options?`) => [`Recommendation`](../type-aliases/Recommendation.md)[]

Recomienda para todas las exercises presentes en una sesión

#### Parameters

##### session

`WorkoutSession`

##### allSessions

`WorkoutSession`[]

##### options?

###### compound?

`boolean`

###### repTarget?

`number`

#### Returns

[`Recommendation`](../type-aliases/Recommendation.md)[]

### recommendWeightIncrease

> **recommendWeightIncrease**: (`exerciseId`, `sessions`, `options?`) => [`Recommendation`](../type-aliases/Recommendation.md)

Regla simple 2-for-2: si en las últimas dos sesiones donde aparece el ejercicio
el usuario completó >= repTarget en la última serie, entonces sugerimos aumentar.

#### Parameters

##### exerciseId

`string`

##### sessions

`WorkoutSession`[]

##### options?

###### absoluteIncrementKg?

`number`

###### compound?

`boolean`

###### repTarget?

`number`

#### Returns

[`Recommendation`](../type-aliases/Recommendation.md)
