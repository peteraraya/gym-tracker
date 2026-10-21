[**gym-logic**](../../../../README.md)

***

[gym-logic](../../../../README.md) / [lib/audio/soundSystem](../README.md) / useSoundSettings

# Function: useSoundSettings()

> **useSoundSettings**(): `object`

Defined in: [lib/audio/soundSystem.ts:269](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/audio/soundSystem.ts#L269)

## Returns

`object`

### availableSounds

> **availableSounds**: `Record`\<[`SoundType`](../type-aliases/SoundType.md), `SoundConfig`\>

### getCurrentSound

> **getCurrentSound**: () => [`SoundType`](../type-aliases/SoundType.md)

#### Returns

[`SoundType`](../type-aliases/SoundType.md)

### getVolume

> **getVolume**: () => `number`

#### Returns

`number`

### isEnabled

> **isEnabled**: () => `boolean`

#### Returns

`boolean`

### playMetronomeTick

> **playMetronomeTick**: (`isPhaseChange?`) => `Promise`\<`void`\>

#### Parameters

##### isPhaseChange?

`boolean`

#### Returns

`Promise`\<`void`\>

### playRestCompleteSound

> **playRestCompleteSound**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

### resumeContext

> **resumeContext**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

### setEnabled

> **setEnabled**: (`enabled`) => `void`

#### Parameters

##### enabled

`boolean`

#### Returns

`void`

### setSoundType

> **setSoundType**: (`type`) => `void`

#### Parameters

##### type

[`SoundType`](../type-aliases/SoundType.md)

#### Returns

`void`

### setVolume

> **setVolume**: (`volume`) => `void`

#### Parameters

##### volume

`number`

#### Returns

`void`

### testSound

> **testSound**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>
