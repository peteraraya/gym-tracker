[**gym-tracker**](../../../../README.md)

***

[gym-tracker](../../../../README.md) / [lib/storage/localStorage](../README.md) / migrateLegacySessions

# Function: migrateLegacySessions()

> **migrateLegacySessions**(): `Promise`\<\{ `migrated`: `number`; `total`: `number`; \}\>

Defined in: [lib/storage/localStorage.ts:547](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/storage/localStorage.ts#L547)

Migrar sesiones de la clave antigua 'workoutSessions' a la nueva 'gym_tracker_sessions'
Esta función consolida sesiones que puedan estar en claves antiguas

## Returns

`Promise`\<\{ `migrated`: `number`; `total`: `number`; \}\>
