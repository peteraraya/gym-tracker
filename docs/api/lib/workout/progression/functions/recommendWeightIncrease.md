[**gym-tracker**](../../../../README.md)

***

[gym-tracker](../../../../README.md) / [lib/workout/progression](../README.md) / recommendWeightIncrease

# Function: recommendWeightIncrease()

> **recommendWeightIncrease**(`exerciseId`, `sessions`, `options?`): [`Recommendation`](../type-aliases/Recommendation.md)

Defined in: [lib/workout/progression.ts:25](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/workout/progression.ts#L25)

Regla simple 2-for-2: si en las últimas dos sesiones donde aparece el ejercicio
el usuario completó >= repTarget en la última serie, entonces sugerimos aumentar.

## Parameters

### exerciseId

`string`

### sessions

`WorkoutSession`[]

### options?

#### absoluteIncrementKg?

`number`

#### compound?

`boolean`

#### repTarget?

`number`

## Returns

[`Recommendation`](../type-aliases/Recommendation.md)
