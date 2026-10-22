[**gym-logic**](../../../README.md)

***

[gym-logic](../../../README.md) / [lib/logger](../README.md) / createLogger

# Function: createLogger()

> **createLogger**(`defaultContext`): `object`

Defined in: [lib/logger/index.ts:111](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/logger/index.ts#L111)

## Parameters

### defaultContext

[`LogContext`](../interfaces/LogContext.md)

## Returns

`object`

### debug

> **debug**: (`message`, `context?`) => `void`

#### Parameters

##### message

`string`

##### context?

[`LogContext`](../interfaces/LogContext.md)

#### Returns

`void`

### error

> **error**: (`message`, `context?`, `error?`) => `void`

#### Parameters

##### message

`string`

##### context?

[`LogContext`](../interfaces/LogContext.md)

##### error?

`Error`

#### Returns

`void`

### info

> **info**: (`message`, `context?`) => `void`

#### Parameters

##### message

`string`

##### context?

[`LogContext`](../interfaces/LogContext.md)

#### Returns

`void`

### warn

> **warn**: (`message`, `context?`, `error?`) => `void`

#### Parameters

##### message

`string`

##### context?

[`LogContext`](../interfaces/LogContext.md)

##### error?

`Error`

#### Returns

`void`
