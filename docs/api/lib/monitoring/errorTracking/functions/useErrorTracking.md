[**gym-tracker**](../../../../README.md)

***

[gym-tracker](../../../../README.md) / [lib/monitoring/errorTracking](../README.md) / useErrorTracking

# Function: useErrorTracking()

> **useErrorTracking**(): `object`

Defined in: [lib/monitoring/errorTracking.tsx:169](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/monitoring/errorTracking.tsx#L169)

## Returns

`object`

### getStats

> **getStats**: () => `object`

#### Returns

`object`

##### errors

> **errors**: `object`

###### errors.byAction

> **byAction**: `Record`\<`string`, `number`\>

###### errors.byComponent

> **byComponent**: `Record`\<`string`, `number`\>

###### errors.last24h

> **last24h**: `number` = `recentErrors.length`

###### errors.total

> **total**: `number`

##### performance

> **performance**: `object`

###### performance.averageByName

> **averageByName**: `Record`\<`string`, `number`\>

###### performance.slowOperations

> **slowOperations**: `PerformanceMetric`[]

###### performance.total

> **total**: `number` = `recentMetrics.length`

### trackError

> **trackError**: `any`

### trackPerformance

> **trackPerformance**: `any`

### trackUserAction

> **trackUserAction**: `any`
