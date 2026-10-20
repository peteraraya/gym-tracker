[**gym-tracker**](../../../../README.md)

***

[gym-tracker](../../../../README.md) / [lib/validation/schemas](../README.md) / ExerciseSchema

# Variable: ExerciseSchema

> `const` **ExerciseSchema**: `ZodObject`\<\{ `equipment`: `ZodOptional`\<`ZodString`\>; `id`: `ZodString`; `name`: `ZodString`; `notes`: `ZodOptional`\<`ZodString`\>; `recommendedReps`: `ZodOptional`\<`ZodString`\>; `recommendedSets`: `ZodOptional`\<`ZodString`\>; `restBetweenSets`: `ZodOptional`\<`ZodNumber`\>; `restTime`: `ZodOptional`\<`ZodString`\>; `sets`: `ZodArray`\<`ZodObject`\<\{ `notes`: `ZodOptional`\<`ZodString`\>; `reps`: `ZodNumber`; `type`: `ZodOptional`\<`ZodEnum`\<\{ `amrap`: `"amrap"`; `cluster`: `"cluster"`; `dropset`: `"dropset"`; `failure`: `"failure"`; `normal`: `"normal"`; `rest-pause`: `"rest-pause"`; `warmup`: `"warmup"`; \}\>\>; `weight`: `ZodOptional`\<`ZodNumber`\>; \}, `$strip`\>\>; `technique`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; \}, `$strip`\>

Defined in: [lib/validation/schemas.ts:23](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/validation/schemas.ts#L23)
