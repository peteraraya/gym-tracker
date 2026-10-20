[**gym-tracker**](../../../../README.md)

***

[gym-tracker](../../../../README.md) / [lib/validation/schemas](../README.md) / ActiveWorkoutSchema

# Variable: ActiveWorkoutSchema

> `const` **ActiveWorkoutSchema**: `ZodObject`\<\{ `actualReps`: `ZodRecord`\<`ZodString`, `ZodArray`\<`ZodNumber`\>\>; `actualWeights`: `ZodRecord`\<`ZodString`, `ZodArray`\<`ZodNumber`\>\>; `completedSets`: `ZodRecord`\<`ZodString`, `ZodNumber`\>; `currentExerciseIndex`: `ZodNumber`; `currentSet`: `ZodNumber`; `isResting`: `ZodOptional`\<`ZodBoolean`\>; `restTimerDuration`: `ZodOptional`\<`ZodNumber`\>; `restTimerNextExercise`: `ZodOptional`\<`ZodString`\>; `restTimerStartedAt`: `ZodOptional`\<`ZodNumber`\>; `restTimerTitle`: `ZodOptional`\<`ZodString`\>; `routineId`: `ZodString`; `routineName`: `ZodString`; `startedAt`: `ZodCoercedDate`\<`unknown`\>; \}, `$strip`\> = `WorkoutStateSchema`

Defined in: [lib/validation/schemas.ts:107](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/validation/schemas.ts#L107)
