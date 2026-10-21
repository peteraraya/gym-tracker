[**gym-logic**](../../../../README.md)

***

[gym-logic](../../../../README.md) / [lib/exercises/personalRecords](../README.md) / getProgressionStats

# Function: getProgressionStats()

> **getProgressionStats**(`exerciseId`, `sessions`): `object`

Defined in: [lib/exercises/personalRecords.ts:207](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/exercises/personalRecords.ts#L207)

Calcula estadísticas de progresión

## Parameters

### exerciseId

`string`

### sessions

`WorkoutSession`[]

## Returns

`object`

### averageImprovementPerRecord

> **averageImprovementPerRecord**: `number`

### currentRecord

> **currentRecord**: `number` = `lastRecord.weight`

### daysBetween

> **daysBetween**: `number`

### firstRecord

> **firstRecord**: `number` = `firstRecord.weight`

### improvementPercentage

> **improvementPercentage**: `number`

### totalImprovement

> **totalImprovement**: `number`

### totalRecords

> **totalRecords**: `number` = `history.length`
