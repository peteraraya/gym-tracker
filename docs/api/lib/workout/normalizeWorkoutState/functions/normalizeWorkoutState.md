[**gym-logic**](../../../../README.md)

***

[gym-logic](../../../../README.md) / [lib/workout/normalizeWorkoutState](../README.md) / normalizeWorkoutState

# Function: normalizeWorkoutState()

> **normalizeWorkoutState**(`data`, `routine?`): [`WorkoutState`](../interfaces/WorkoutState.md)

Defined in: [lib/workout/normalizeWorkoutState.ts:89](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/workout/normalizeWorkoutState.ts#L89)

Transforma datos crudos de storage en un `WorkoutState` válido.

Maneja casos de datos corruptos:
- `completedSets` como número en lugar de objeto
- Índices de ejercicio/serie fuera de rango
- Campos de timer faltantes

## Parameters

### data

`any`

Datos crudos del storage (tipo `any`)

### routine?

`Routine`

Rutina activa para validar rangos de índices (opcional)

## Returns

[`WorkoutState`](../interfaces/WorkoutState.md)
