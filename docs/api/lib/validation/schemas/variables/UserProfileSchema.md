[**gym-logic**](../../../../README.md)

***

[gym-logic](../../../../README.md) / [lib/validation/schemas](../README.md) / UserProfileSchema

# Variable: UserProfileSchema

> `const` **UserProfileSchema**: `ZodObject`\<\{ `age`: `ZodOptional`\<`ZodNumber`\>; `createdAt`: `ZodCoercedDate`\<`unknown`\>; `fitnessGoal`: `ZodOptional`\<`ZodEnum`\<\{ `endurance`: `"endurance"`; `general_fitness`: `"general_fitness"`; `muscle_gain`: `"muscle_gain"`; `strength`: `"strength"`; `weight_loss`: `"weight_loss"`; \}\>\>; `fitnessLevel`: `ZodOptional`\<`ZodEnum`\<\{ `advanced`: `"advanced"`; `beginner`: `"beginner"`; `intermediate`: `"intermediate"`; \}\>\>; `gender`: `ZodOptional`\<`ZodEnum`\<\{ `female`: `"female"`; `male`: `"male"`; `other`: `"other"`; \}\>\>; `height`: `ZodOptional`\<`ZodNumber`\>; `id`: `ZodString`; `updatedAt`: `ZodCoercedDate`\<`unknown`\>; `userId`: `ZodString`; `weeklyWorkouts`: `ZodOptional`\<`ZodNumber`\>; `weight`: `ZodOptional`\<`ZodNumber`\>; \}, `$strip`\>

Defined in: [lib/validation/schemas.ts:113](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/validation/schemas.ts#L113)
