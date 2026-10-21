[**gym-logic**](../../../../README.md)

***

[gym-logic](../../../../README.md) / [lib/validation/schemas](../README.md) / validateDataWithLogging

# Function: validateDataWithLogging()

> **validateDataWithLogging**\<`T`\>(`schema`, `data`, `context`): `object`

Defined in: [lib/validation/schemas.ts:205](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/validation/schemas.ts#L205)

Valida datos de forma segura con logging

## Type Parameters

### T

`T`

## Parameters

### schema

`ZodType`\<`T`\>

### data

`unknown`

### context

`string`

## Returns

`object`

### data?

> `optional` **data?**: `T`

### error?

> `optional` **error?**: `string`

### success

> **success**: `boolean`
