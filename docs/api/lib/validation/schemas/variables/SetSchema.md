[**gym-logic**](../../../../README.md)

***

[gym-logic](../../../../README.md) / [lib/validation/schemas](../README.md) / SetSchema

# Variable: SetSchema

> `const` **SetSchema**: `ZodObject`\<\{ `notes`: `ZodOptional`\<`ZodString`\>; `reps`: `ZodNumber`; `type`: `ZodOptional`\<`ZodEnum`\<\{ `amrap`: `"amrap"`; `cluster`: `"cluster"`; `dropset`: `"dropset"`; `failure`: `"failure"`; `normal`: `"normal"`; `rest-pause`: `"rest-pause"`; `warmup`: `"warmup"`; \}\>\>; `weight`: `ZodOptional`\<`ZodNumber`\>; \}, `$strip`\>

Defined in: [lib/validation/schemas.ts:12](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/validation/schemas.ts#L12)

Esquemas de validación centralizados con Zod

Estos esquemas se usan para validar datos antes de guardarlos
en storage o usarlos en la aplicación.
