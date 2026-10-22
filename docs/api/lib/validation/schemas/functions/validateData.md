[**gym-logic**](../../../../README.md)

***

[gym-logic](../../../../README.md) / [lib/validation/schemas](../README.md) / validateData

# Function: validateData()

> **validateData**\<`T`\>(`schema`, `data`): `object`

Defined in: [lib/validation/schemas.ts:183](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/validation/schemas.ts#L183)

Valida datos de forma segura
Retorna { success: true, data } o { success: false, error }

## Type Parameters

### T

`T`

## Parameters

### schema

`ZodType`\<`T`\>

### data

`unknown`

## Returns

`object`

### data?

> `optional` **data?**: `T`

### error?

> `optional` **error?**: `string`

### success

> **success**: `boolean`
