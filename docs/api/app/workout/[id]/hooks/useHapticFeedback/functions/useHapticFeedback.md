[**gym-logic**](../../../../../../README.md)

***

[gym-logic](../../../../../../README.md) / [app/workout/\[id\]/hooks/useHapticFeedback](../README.md) / useHapticFeedback

# Function: useHapticFeedback()

> **useHapticFeedback**(): `object`

Defined in: [app/workout/\[id\]/hooks/useHapticFeedback.ts:41](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/app/workout/[id]/hooks/useHapticFeedback.ts#L41)

Hook para feedback háptico mejorado durante el entrenamiento

## Returns

`object`

### achievement

> **achievement**: () => `boolean`

#### Returns

`boolean`

### custom

> **custom**: (`pattern`) => `boolean`

#### Parameters

##### pattern

`number` \| `number`[]

#### Returns

`boolean`

### error

> **error**: () => `boolean`

#### Returns

`boolean`

### exerciseChange

> **exerciseChange**: () => `boolean`

#### Returns

`boolean`

### heavy

> **heavy**: () => `boolean`

#### Returns

`boolean`

### isSupported

> **isSupported**: `boolean`

### light

> **light**: () => `boolean`

#### Returns

`boolean`

### medium

> **medium**: () => `boolean`

#### Returns

`boolean`

### restComplete

> **restComplete**: () => `boolean`

#### Returns

`boolean`

### restStart

> **restStart**: () => `boolean`

#### Returns

`boolean`

### restWarning

> **restWarning**: () => `boolean`

#### Returns

`boolean`

### setComplete

> **setComplete**: () => `boolean`

#### Returns

`boolean`

### setStart

> **setStart**: () => `boolean`

#### Returns

`boolean`

### success

> **success**: () => `boolean`

#### Returns

`boolean`

### vibrate

> **vibrate**: (`pattern`) => `boolean`

#### Parameters

##### pattern

`number` \| `number`[] \| `"error"` \| `"success"` \| `"medium"` \| `"light"` \| `"heavy"` \| `"setStart"` \| `"setComplete"` \| `"restStart"` \| `"restWarning"` \| `"restComplete"` \| `"exerciseChange"` \| `"achievement"` \| `"workoutComplete"` \| `"warning"`

#### Returns

`boolean`

### warning

> **warning**: () => `boolean`

#### Returns

`boolean`

### workoutComplete

> **workoutComplete**: () => `boolean`

#### Returns

`boolean`
