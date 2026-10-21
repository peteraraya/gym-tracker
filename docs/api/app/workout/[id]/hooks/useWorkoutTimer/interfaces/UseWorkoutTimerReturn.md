[**gym-logic**](../../../../../../README.md)

***

[gym-logic](../../../../../../README.md) / [app/workout/\[id\]/hooks/useWorkoutTimer](../README.md) / UseWorkoutTimerReturn

# Interface: UseWorkoutTimerReturn

Defined in: [app/workout/\[id\]/hooks/useWorkoutTimer.ts:20](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWorkoutTimer.ts#L20)

## Extends

- [`TimerState`](TimerState.md)

## Properties

### currentTimeLeft

> **currentTimeLeft**: `number`

Defined in: [app/workout/\[id\]/hooks/useWorkoutTimer.ts:17](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWorkoutTimer.ts#L17)

#### Inherited from

[`TimerState`](TimerState.md).[`currentTimeLeft`](TimerState.md#currenttimeleft)

***

### expandTimer

> **expandTimer**: () => `void`

Defined in: [app/workout/\[id\]/hooks/useWorkoutTimer.ts:24](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWorkoutTimer.ts#L24)

#### Returns

`void`

***

### minimizeTimer

> **minimizeTimer**: (`timeLeft`) => `void`

Defined in: [app/workout/\[id\]/hooks/useWorkoutTimer.ts:23](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWorkoutTimer.ts#L23)

#### Parameters

##### timeLeft

`number`

#### Returns

`void`

***

### nextExerciseName?

> `optional` **nextExerciseName?**: `string`

Defined in: [app/workout/\[id\]/hooks/useWorkoutTimer.ts:14](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWorkoutTimer.ts#L14)

#### Inherited from

[`TimerState`](TimerState.md).[`nextExerciseName`](TimerState.md#nextexercisename)

***

### setCurrentTimeLeft

> **setCurrentTimeLeft**: (`time`) => `void`

Defined in: [app/workout/\[id\]/hooks/useWorkoutTimer.ts:27](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWorkoutTimer.ts#L27)

#### Parameters

##### time

`number`

#### Returns

`void`

***

### showTimer

> **showTimer**: `boolean`

Defined in: [app/workout/\[id\]/hooks/useWorkoutTimer.ts:11](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWorkoutTimer.ts#L11)

#### Inherited from

[`TimerState`](TimerState.md).[`showTimer`](TimerState.md#showtimer)

***

### skipAndAdvance

> **skipAndAdvance**: () => `void`

Defined in: [app/workout/\[id\]/hooks/useWorkoutTimer.ts:26](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWorkoutTimer.ts#L26)

#### Returns

`void`

***

### skipTimer

> **skipTimer**: () => `void`

Defined in: [app/workout/\[id\]/hooks/useWorkoutTimer.ts:25](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWorkoutTimer.ts#L25)

#### Returns

`void`

***

### startTimer

> **startTimer**: (`duration`, `title`, `nextExercise?`) => `void`

Defined in: [app/workout/\[id\]/hooks/useWorkoutTimer.ts:21](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWorkoutTimer.ts#L21)

#### Parameters

##### duration

`number`

##### title

`string`

##### nextExercise?

`string`

#### Returns

`void`

***

### stopTimer

> **stopTimer**: () => `void`

Defined in: [app/workout/\[id\]/hooks/useWorkoutTimer.ts:22](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWorkoutTimer.ts#L22)

#### Returns

`void`

***

### timerDuration

> **timerDuration**: `number`

Defined in: [app/workout/\[id\]/hooks/useWorkoutTimer.ts:12](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWorkoutTimer.ts#L12)

#### Inherited from

[`TimerState`](TimerState.md).[`timerDuration`](TimerState.md#timerduration)

***

### timerMinimized

> **timerMinimized**: `boolean`

Defined in: [app/workout/\[id\]/hooks/useWorkoutTimer.ts:15](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWorkoutTimer.ts#L15)

#### Inherited from

[`TimerState`](TimerState.md).[`timerMinimized`](TimerState.md#timerminimized)

***

### timerStartTime

> **timerStartTime**: `number`

Defined in: [app/workout/\[id\]/hooks/useWorkoutTimer.ts:16](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWorkoutTimer.ts#L16)

#### Inherited from

[`TimerState`](TimerState.md).[`timerStartTime`](TimerState.md#timerstarttime)

***

### timerTitle

> **timerTitle**: `string`

Defined in: [app/workout/\[id\]/hooks/useWorkoutTimer.ts:13](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useWorkoutTimer.ts#L13)

#### Inherited from

[`TimerState`](TimerState.md).[`timerTitle`](TimerState.md#timertitle)
