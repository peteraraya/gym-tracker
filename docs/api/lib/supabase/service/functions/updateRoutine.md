[**gym-tracker**](../../../../README.md)

***

[gym-tracker](../../../../README.md) / [lib/supabase/service](../README.md) / updateRoutine

# Function: updateRoutine()

> **updateRoutine**(`id`, `data`): `Promise`\<`Routine`\>

Defined in: [lib/supabase/service.ts:164](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/supabase/service.ts#L164)

Update a routine
IMPROVED: Includes rollback if exercise insertion fails

## Parameters

### id

`string`

### data

[`CreateRoutineData`](../interfaces/CreateRoutineData.md)

## Returns

`Promise`\<`Routine`\>
