[**gym-tracker**](../../../../README.md)

***

[gym-tracker](../../../../README.md) / [lib/validation/schemas](../README.md) / WorkoutSessionSchema

# Variable: WorkoutSessionSchema

> `const` **WorkoutSessionSchema**: `ZodObject`\<\{ `completedAt`: `ZodOptional`\<`ZodCoercedDate`\<`unknown`\>\>; `date`: `ZodCoercedDate`\<`unknown`\>; `exercises`: `ZodArray`\<`ZodObject`\<\{ `actualReps`: `ZodArray`\<`ZodNumber`\>; `actualRestTimes`: `ZodOptional`\<`ZodArray`\<`ZodNumber`\>\>; `actualWeight`: `ZodArray`\<`ZodNumber`\>; `completedSets`: `ZodNumber`; `exerciseId`: `ZodString`; `exerciseName`: `ZodOptional`\<`ZodString`\>; `notes`: `ZodOptional`\<`ZodString`\>; `pauseDurations`: `ZodOptional`\<`ZodArray`\<`ZodNumber`\>\>; `setDurations`: `ZodOptional`\<`ZodArray`\<`ZodNumber`\>\>; \}, `$strip`\>\>; `id`: `ZodString`; `notes`: `ZodOptional`\<`ZodString`\>; `routineId`: `ZodString`; `routineName`: `ZodOptional`\<`ZodString`\>; `startedAt`: `ZodOptional`\<`ZodCoercedDate`\<`unknown`\>\>; `totalDuration`: `ZodOptional`\<`ZodNumber`\>; `totalPausedTime`: `ZodOptional`\<`ZodNumber`\>; \}, `$strip`\>

Defined in: [lib/validation/schemas.ts:70](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/validation/schemas.ts#L70)
