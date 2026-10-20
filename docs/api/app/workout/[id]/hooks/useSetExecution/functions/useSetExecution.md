[**gym-tracker**](../../../../../../README.md)

***

[gym-tracker](../../../../../../README.md) / [app/workout/\[id\]/hooks/useSetExecution](../README.md) / useSetExecution

# Function: useSetExecution()

> **useSetExecution**(`callbacks?`): `object`

Defined in: [app/workout/\[id\]/hooks/useSetExecution.ts:19](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useSetExecution.ts#L19)

Hook simplificado para ejecución de series
✅ Removida la cuenta atrás de preparación para evitar inconsistencias
Ahora startSet() inicia la serie inmediatamente

## Parameters

### callbacks?

[`SetExecutionCallbacks`](../interfaces/SetExecutionCallbacks.md)

## Returns

### cancelSetExecution

> **cancelSetExecution**: () => `void`

Cancela la ejecución de la serie

#### Returns

`void`

### completeSet

> **completeSet**: () => `void`

Completa la serie actual y resetea el timer

#### Returns

`void`

### isExecutingSet

> **isExecutingSet**: `boolean`

### setStartTime

> **setStartTime**: `number`

### showSetExecution

> **showSetExecution**: `boolean`

### startSet

> **startSet**: () => `void`

Inicia una serie inmediatamente (sin cuenta atrás de preparación)

#### Returns

`void`
