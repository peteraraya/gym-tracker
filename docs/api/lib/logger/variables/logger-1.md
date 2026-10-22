[**gym-logic**](../../../README.md)

***

[gym-logic](../../../README.md) / [lib/logger](../README-1.md) / logger

# Variable: logger

> `const` **logger**: `object`

Defined in: [lib/logger.ts:10](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/logger.ts#L10)

## Type Declaration

### debug

> **debug**: (...`args`) => `void`

#### Parameters

##### args

...`LogArgs`

#### Returns

`void`

### error

> **error**: (...`args`) => `void`

#### Parameters

##### args

...`LogArgs`

#### Returns

`void`

### group

> **group**: (`label`) => `void`

#### Parameters

##### label

`string`

#### Returns

`void`

### groupEnd

> **groupEnd**: () => `void`

#### Returns

`void`

### info

> **info**: (...`args`) => `void`

#### Parameters

##### args

...`LogArgs`

#### Returns

`void`

### log

> **log**: (...`args`) => `void`

#### Parameters

##### args

...`LogArgs`

#### Returns

`void`

### table

> **table**: (`data`) => `void`

#### Parameters

##### data

`unknown`[] \| `Record`\<`string`, `unknown`\>

#### Returns

`void`

### time

> **time**: (`label`) => `void`

#### Parameters

##### label

`string`

#### Returns

`void`

### timeEnd

> **timeEnd**: (`label`) => `void`

#### Parameters

##### label

`string`

#### Returns

`void`

### warn

> **warn**: (...`args`) => `void`

#### Parameters

##### args

...`LogArgs`

#### Returns

`void`
