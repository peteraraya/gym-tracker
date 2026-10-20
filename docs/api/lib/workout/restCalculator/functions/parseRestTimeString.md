[**gym-tracker**](../../../../README.md)

***

[gym-tracker](../../../../README.md) / [lib/workout/restCalculator](../README.md) / parseRestTimeString

# Function: parseRestTimeString()

> **parseRestTimeString**(`restTime`): `object`

Defined in: [lib/workout/restCalculator.ts:40](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/workout/restCalculator.ts#L40)

Parsea el campo restTime de un ejercicio (ej: "2-3 minutos", "90-120 segundos", "60 segundos")
y devuelve min/max/recommended en segundos.
Retorna null si el string no tiene un formato reconocido.

## Parameters

### restTime

`string`

## Returns

`object`

### max

> **max**: `number`

### min

> **min**: `number`

### recommended

> **recommended**: `number`
