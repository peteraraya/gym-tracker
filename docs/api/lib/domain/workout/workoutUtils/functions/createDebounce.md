[**gym-logic**](../../../../../README.md)

***

[gym-logic](../../../../../README.md) / [lib/domain/workout/workoutUtils](../README.md) / createDebounce

# Function: createDebounce()

> **createDebounce**\<`T`\>(`func`, `wait`): \{(...`args`): `void`; `cancel`: () => `void`; `flush`: () => `void`; \}

Defined in: [lib/domain/workout/workoutUtils.ts:14](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/domain/workout/workoutUtils.ts#L14)

Crea una función debounce con cancel y flush.
Útil para operaciones que no deben ejecutarse en cada cambio,
sino después de un período de inactividad.

## Type Parameters

### T

`T` *extends* (...`args`) => `any`

## Parameters

### func

`T`

### wait

`number`

## Returns

\{(...`args`): `void`; `cancel`: () => `void`; `flush`: () => `void`; \}

### cancel

> **cancel**: () => `void`

#### Returns

`void`

### flush

> **flush**: () => `void`

#### Returns

`void`
