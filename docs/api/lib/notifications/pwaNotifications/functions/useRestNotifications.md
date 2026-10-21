[**gym-logic**](../../../../README.md)

***

[gym-logic](../../../../README.md) / [lib/notifications/pwaNotifications](../README.md) / useRestNotifications

# Function: useRestNotifications()

> **useRestNotifications**(): `object`

Defined in: [lib/notifications/pwaNotifications.ts:304](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/notifications/pwaNotifications.ts#L304)

## Returns

`object`

### getPermissionState

> **getPermissionState**: () => `NotificationPermissionState`

#### Returns

`NotificationPermissionState`

### isSupported

> **isSupported**: () => `boolean`

#### Returns

`boolean`

### requestPermission

> **requestPermission**: () => `Promise`\<`boolean`\>

#### Returns

`Promise`\<`boolean`\>

### setupActionHandlers

> **setupActionHandlers**: () => `void`

#### Returns

`void`

### showRestComplete

> **showRestComplete**: (`data`) => `Promise`\<`void`\>

#### Parameters

##### data

`Omit`\<`RestNotificationData`, `"timeLeft"`\>

#### Returns

`Promise`\<`void`\>

### showRestTimer

> **showRestTimer**: (`data`) => `Promise`\<`void`\>

#### Parameters

##### data

`RestNotificationData`

#### Returns

`Promise`\<`void`\>

### startTimerNotifications

> **startTimerNotifications**: (`data`) => `void`

#### Parameters

##### data

`RestNotificationData`

#### Returns

`void`

### stopTimerNotifications

> **stopTimerNotifications**: () => `void`

#### Returns

`void`
