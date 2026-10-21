[**gym-logic**](../../../../../../README.md)

***

[gym-logic](../../../../../../README.md) / [app/workout/\[id\]/services/restCalculationService](../README.md) / calculateExerciseRestTime

# Function: calculateExerciseRestTime()

> **calculateExerciseRestTime**(`__namedParameters`): `number`

Defined in: [app/workout/\[id\]/services/restCalculationService.ts:69](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/services/restCalculationService.ts#L69)

Calculate rest time between different exercises.
Priority: routineConfig > smart > default

Note: `restOverrides` holds per-exercise "rest between sets" overrides
(set via onEditRestTime, keyed by exercise id). It is NOT a rest-between-
exercises override, so it must not be read here — doing so previously
reused the next exercise's "rest between its own sets" value as the
transition rest from the current exercise into it.

## Parameters

### \_\_namedParameters

`RestCalculationParams`

## Returns

`number`
