[**gym-tracker**](../../../../../../README.md)

***

[gym-tracker](../../../../../../README.md) / [app/workout/\[id\]/utils/workoutCalculations](../README.md) / calculateExerciseRestTime

# Variable: calculateExerciseRestTime

> `const` **calculateExerciseRestTime**: (`__namedParameters`) => `number` = `unifiedCalculateExerciseRestTime`

Defined in: [app/workout/\[id\]/utils/workoutCalculations.ts:9](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/utils/workoutCalculations.ts#L9)

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
