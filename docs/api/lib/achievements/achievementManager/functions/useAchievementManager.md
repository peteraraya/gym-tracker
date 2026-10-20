[**gym-tracker**](../../../../README.md)

***

[gym-tracker](../../../../README.md) / [lib/achievements/achievementManager](../README.md) / useAchievementManager

# Function: useAchievementManager()

> **useAchievementManager**(): `object`

Defined in: [lib/achievements/achievementManager.ts:188](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/achievements/achievementManager.ts#L188)

## Returns

`object`

### checkPersonalRecords

> **checkPersonalRecords**: (`session`, `allSessions`) => `object`

#### Parameters

##### session

`WorkoutSession`

##### allSessions

`WorkoutSession`[]

#### Returns

`object`

##### durationRecord

> **durationRecord**: `boolean`

##### setsRecord

> **setsRecord**: `boolean`

##### volumeRecord

> **volumeRecord**: `boolean`

### generateMotivationalMessage

> **generateMotivationalMessage**: (`achievements`, `stats`) => `string`

#### Parameters

##### achievements

`AchievementNotification`[]

##### stats

###### currentStreak

`number`

###### longestStreak

`number`

###### totalSessions

`number`

###### totalVolume

`number`

#### Returns

`string`

### getNextAchievement

> **getNextAchievement**: (`sessions`) => `Achievement`

#### Parameters

##### sessions

`WorkoutSession`[]

#### Returns

`Achievement`

### getQuickStats

> **getQuickStats**: (`sessions`) => `object`

#### Parameters

##### sessions

`WorkoutSession`[]

#### Returns

`object`

##### currentStreak

> **currentStreak**: `number`

##### longestStreak

> **longestStreak**: `number`

##### totalSessions

> **totalSessions**: `number`

##### totalVolume

> **totalVolume**: `number`

### initialize

> **initialize**: (`sessions`) => `void`

#### Parameters

##### sessions

`WorkoutSession`[]

#### Returns

`void`

### processNewSession

> **processNewSession**: (`session`, `allSessions`) => `AchievementNotification`[]

#### Parameters

##### session

`WorkoutSession`

##### allSessions

`WorkoutSession`[]

#### Returns

`AchievementNotification`[]
