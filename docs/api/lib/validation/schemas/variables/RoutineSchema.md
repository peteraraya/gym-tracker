[**gym-tracker**](../../../../README.md)

***

[gym-tracker](../../../../README.md) / [lib/validation/schemas](../README.md) / RoutineSchema

# Variable: RoutineSchema

> `const` **RoutineSchema**: `ZodObject`\<\{ `createdAt`: `ZodCoercedDate`\<`unknown`\>; `description`: `ZodOptional`\<`ZodString`\>; `exercises`: `ZodArray`\<`ZodObject`\<\{ `equipment`: `ZodOptional`\<`ZodString`\>; `id`: `ZodString`; `name`: `ZodString`; `notes`: `ZodOptional`\<`ZodString`\>; `recommendedReps`: `ZodOptional`\<`ZodString`\>; `recommendedSets`: `ZodOptional`\<`ZodString`\>; `restBetweenSets`: `ZodOptional`\<`ZodNumber`\>; `restTime`: `ZodOptional`\<`ZodString`\>; `sets`: `ZodArray`\<`ZodObject`\<\{ `notes`: `ZodOptional`\<`ZodString`\>; `reps`: `ZodNumber`; `type`: `ZodOptional`\<`ZodEnum`\<\{ `amrap`: ...; `cluster`: ...; `dropset`: ...; `failure`: ...; `normal`: ...; `rest-pause`: ...; `warmup`: ...; \}\>\>; `weight`: `ZodOptional`\<`ZodNumber`\>; \}, `$strip`\>\>; `technique`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; \}, `$strip`\>\>; `id`: `ZodString`; `image`: `ZodOptional`\<`ZodString`\>; `name`: `ZodString`; `restBetweenExercises`: `ZodOptional`\<`ZodNumber`\>; `restBetweenSets`: `ZodOptional`\<`ZodNumber`\>; `updatedAt`: `ZodCoercedDate`\<`unknown`\>; \}, `$strip`\>

Defined in: [lib/validation/schemas.ts:40](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/validation/schemas.ts#L40)
