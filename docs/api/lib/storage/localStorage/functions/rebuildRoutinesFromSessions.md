[**gym-logic**](../../../../README.md)

***

[gym-logic](../../../../README.md) / [lib/storage/localStorage](../README.md) / rebuildRoutinesFromSessions

# Function: rebuildRoutinesFromSessions()

> **rebuildRoutinesFromSessions**(): `Promise`\<`Routine`[]\>

Defined in: [lib/storage/localStorage.ts:283](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/storage/localStorage.ts#L283)

Reconstruir rutinas a partir de sesiones huérfanas.
Crea una rutina por cada `routineId` único encontrado en las sesiones
que no exista ya en las rutinas, usando `routineName` o un nombre generado.

## Returns

`Promise`\<`Routine`[]\>
