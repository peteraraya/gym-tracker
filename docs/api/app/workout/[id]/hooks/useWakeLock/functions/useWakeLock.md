[**gym-tracker**](../../../../../../README.md)

***

[gym-tracker](../../../../../../README.md) / [app/workout/\[id\]/hooks/useWakeLock](../README.md) / useWakeLock

# Function: useWakeLock()

> **useWakeLock**(): `object`

Defined in: [app/workout/\[id\]/hooks/useWakeLock.ts:7](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWakeLock.ts#L7)

Hook para mantener la pantalla activa durante el entrenamiento
Usa la Wake Lock API cuando está disponible

## Returns

`object`

### isActive

> **isActive**: `boolean`

### isSupported

> **isSupported**: `boolean`

### releaseWakeLock

> **releaseWakeLock**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

### requestWakeLock

> **requestWakeLock**: () => `Promise`\<`boolean`\>

#### Returns

`Promise`\<`boolean`\>
