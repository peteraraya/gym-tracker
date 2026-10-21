[**gym-logic**](../../../../README.md)

***

[gym-logic](../../../../README.md) / [lib/validation/schemas](../README.md) / WorkoutStateSchema

# Variable: WorkoutStateSchema

> `const` **WorkoutStateSchema**: `ZodObject`\<\{ `actualReps`: `ZodRecord`\<`ZodString`, `ZodArray`\<`ZodNumber`\>\>; `actualWeights`: `ZodRecord`\<`ZodString`, `ZodArray`\<`ZodNumber`\>\>; `completedSets`: `ZodRecord`\<`ZodString`, `ZodNumber`\>; `currentExerciseIndex`: `ZodNumber`; `currentSet`: `ZodNumber`; `isResting`: `ZodOptional`\<`ZodBoolean`\>; `restTimerDuration`: `ZodOptional`\<`ZodNumber`\>; `restTimerNextExercise`: `ZodOptional`\<`ZodString`\>; `restTimerStartedAt`: `ZodOptional`\<`ZodNumber`\>; `restTimerTitle`: `ZodOptional`\<`ZodString`\>; `routineId`: `ZodString`; `routineName`: `ZodString`; `startedAt`: `ZodCoercedDate`\<`unknown`\>; \}, `$strip`\>

Defined in: [lib/validation/schemas.ts:87](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/validation/schemas.ts#L87)
