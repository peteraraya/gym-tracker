[**gym-tracker**](../../../../README.md)

***

[gym-tracker](../../../../README.md) / [lib/storage/storage](../README.md) / StorageStrategy

# Interface: StorageStrategy

Defined in: [lib/storage/storage.ts:21](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/storage/storage.ts#L21)

## Properties

### name

> **name**: `string`

Defined in: [lib/storage/storage.ts:22](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/storage/storage.ts#L22)

## Methods

### clearActiveWorkout()

> **clearActiveWorkout**(): `Promise`\<`void`\>

Defined in: [lib/storage/storage.ts:44](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/storage/storage.ts#L44)

#### Returns

`Promise`\<`void`\>

***

### createRoutine()

> **createRoutine**(`data`): `Promise`\<`Routine`\>

Defined in: [lib/storage/storage.ts:24](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/storage/storage.ts#L24)

#### Parameters

##### data

[`CreateRoutineData`](../../localStorage/interfaces/CreateRoutineData.md)

#### Returns

`Promise`\<`Routine`\>

***

### deleteRoutine()

> **deleteRoutine**(`id`): `Promise`\<`void`\>

Defined in: [lib/storage/storage.ts:26](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/storage/storage.ts#L26)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`void`\>

***

### deleteSession()

> **deleteSession**(`id`): `Promise`\<`void`\>

Defined in: [lib/storage/storage.ts:31](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/storage/storage.ts#L31)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`void`\>

***

### deleteSessionsByRoutine()?

> `optional` **deleteSessionsByRoutine**(`id`): `Promise`\<`void`\>

Defined in: [lib/storage/storage.ts:27](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/storage/storage.ts#L27)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`void`\>

***

### getActiveWorkout()

> **getActiveWorkout**(): `Promise`\<[`ActiveWorkout`](../../localStorage/type-aliases/ActiveWorkout.md)\>

Defined in: [lib/storage/storage.ts:42](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/storage/storage.ts#L42)

#### Returns

`Promise`\<[`ActiveWorkout`](../../localStorage/type-aliases/ActiveWorkout.md)\>

***

### getLastWeights()

> **getLastWeights**(): `Promise`\<`Record`\<`string`, `number`[]\>\>

Defined in: [lib/storage/storage.ts:40](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/storage/storage.ts#L40)

#### Returns

`Promise`\<`Record`\<`string`, `number`[]\>\>

***

### getMonthlyPlan()

> **getMonthlyPlan**(): `Promise`\<[`MonthlyPlan`](../../localStorage/type-aliases/MonthlyPlan.md)\>

Defined in: [lib/storage/storage.ts:36](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/storage/storage.ts#L36)

#### Returns

`Promise`\<[`MonthlyPlan`](../../localStorage/type-aliases/MonthlyPlan.md)\>

***

### getProfile()

> **getProfile**(): `Promise`\<[`UserProfile`](../../localStorage/interfaces/UserProfile.md)\>

Defined in: [lib/storage/storage.ts:32](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/storage/storage.ts#L32)

#### Returns

`Promise`\<[`UserProfile`](../../localStorage/interfaces/UserProfile.md)\>

***

### getRecommendations()

> **getRecommendations**(): `Promise`\<[`ProgressRecommendation`](../../localStorage/interfaces/ProgressRecommendation.md)[]\>

Defined in: [lib/storage/storage.ts:38](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/storage/storage.ts#L38)

#### Returns

`Promise`\<[`ProgressRecommendation`](../../localStorage/interfaces/ProgressRecommendation.md)[]\>

***

### getRoutines()

> **getRoutines**(): `Promise`\<`Routine`[]\>

Defined in: [lib/storage/storage.ts:23](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/storage/storage.ts#L23)

#### Returns

`Promise`\<`Routine`[]\>

***

### getSessions()

> **getSessions**(): `Promise`\<`WorkoutSession`[]\>

Defined in: [lib/storage/storage.ts:28](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/storage/storage.ts#L28)

#### Returns

`Promise`\<`WorkoutSession`[]\>

***

### getWeeklyPlan()

> **getWeeklyPlan**(): `Promise`\<[`WeeklyPlan`](../../localStorage/type-aliases/WeeklyPlan.md)\>

Defined in: [lib/storage/storage.ts:34](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/storage/storage.ts#L34)

#### Returns

`Promise`\<[`WeeklyPlan`](../../localStorage/type-aliases/WeeklyPlan.md)\>

***

### migrateLegacySessions()

> **migrateLegacySessions**(): `Promise`\<\{ `migrated`: `number`; `total`: `number`; \}\>

Defined in: [lib/storage/storage.ts:46](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/storage/storage.ts#L46)

#### Returns

`Promise`\<\{ `migrated`: `number`; `total`: `number`; \}\>

***

### rebuildRoutinesFromSessions()

> **rebuildRoutinesFromSessions**(): `Promise`\<`Routine`[]\>

Defined in: [lib/storage/storage.ts:45](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/storage/storage.ts#L45)

#### Returns

`Promise`\<`Routine`[]\>

***

### saveActiveWorkout()

> **saveActiveWorkout**(`payload`): `Promise`\<`void`\>

Defined in: [lib/storage/storage.ts:43](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/storage/storage.ts#L43)

#### Parameters

##### payload

[`ActiveWorkout`](../../localStorage/type-aliases/ActiveWorkout.md)

#### Returns

`Promise`\<`void`\>

***

### saveLastWeights()

> **saveLastWeights**(`w`): `Promise`\<`void`\>

Defined in: [lib/storage/storage.ts:41](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/storage/storage.ts#L41)

#### Parameters

##### w

`Record`\<`string`, `number`[]\>

#### Returns

`Promise`\<`void`\>

***

### saveMonthlyPlan()

> **saveMonthlyPlan**(`plan`): `Promise`\<`void`\>

Defined in: [lib/storage/storage.ts:37](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/storage/storage.ts#L37)

#### Parameters

##### plan

[`MonthlyPlan`](../../localStorage/type-aliases/MonthlyPlan.md)

#### Returns

`Promise`\<`void`\>

***

### saveRecommendations()

> **saveRecommendations**(`recs`): `Promise`\<`void`\>

Defined in: [lib/storage/storage.ts:39](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/storage/storage.ts#L39)

#### Parameters

##### recs

[`ProgressRecommendation`](../../localStorage/interfaces/ProgressRecommendation.md)[]

#### Returns

`Promise`\<`void`\>

***

### saveSession()

> **saveSession**(`session`): `Promise`\<`void`\>

Defined in: [lib/storage/storage.ts:29](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/storage/storage.ts#L29)

#### Parameters

##### session

`WorkoutSession`

#### Returns

`Promise`\<`void`\>

***

### saveWeeklyPlan()

> **saveWeeklyPlan**(`plan`): `Promise`\<`void`\>

Defined in: [lib/storage/storage.ts:35](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/storage/storage.ts#L35)

#### Parameters

##### plan

[`WeeklyPlan`](../../localStorage/type-aliases/WeeklyPlan.md)

#### Returns

`Promise`\<`void`\>

***

### updateProfile()

> **updateProfile**(`data`): `Promise`\<`void`\>

Defined in: [lib/storage/storage.ts:33](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/storage/storage.ts#L33)

#### Parameters

##### data

`Partial`\<[`UserProfile`](../../localStorage/interfaces/UserProfile.md)\>

#### Returns

`Promise`\<`void`\>

***

### updateRoutine()

> **updateRoutine**(`id`, `data`): `Promise`\<`Routine`\>

Defined in: [lib/storage/storage.ts:25](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/storage/storage.ts#L25)

#### Parameters

##### id

`string`

##### data

[`CreateRoutineData`](../../localStorage/interfaces/CreateRoutineData.md)

#### Returns

`Promise`\<`Routine`\>

***

### updateSession()

> **updateSession**(`session`): `Promise`\<`void`\>

Defined in: [lib/storage/storage.ts:30](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/storage/storage.ts#L30)

#### Parameters

##### session

`WorkoutSession`

#### Returns

`Promise`\<`void`\>
