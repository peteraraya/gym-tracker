[**gym-logic**](../../../../README.md)

***

[gym-logic](../../../../README.md) / [lib/react-query/queryKeys](../README.md) / queryKeys

# Variable: queryKeys

> `const` **queryKeys**: `object`

Defined in: [lib/react-query/queryKeys.ts:1](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/lib/react-query/queryKeys.ts#L1)

## Type Declaration

### activeWorkout

> `readonly` **activeWorkout**: `object`

#### activeWorkout.all

> `readonly` **all**: readonly \[`"activeWorkout"`\]

#### activeWorkout.detail

> `readonly` **detail**: () => readonly \[`"activeWorkout"`, `"detail"`\]

##### Returns

readonly \[`"activeWorkout"`, `"detail"`\]

### auth

> `readonly` **auth**: `object`

#### auth.all

> `readonly` **all**: readonly \[`"auth"`\]

#### auth.session

> `readonly` **session**: () => readonly \[`"auth"`, `"session"`\]

##### Returns

readonly \[`"auth"`, `"session"`\]

#### auth.user

> `readonly` **user**: () => readonly \[`"auth"`, `"user"`\]

##### Returns

readonly \[`"auth"`, `"user"`\]

### plans

> `readonly` **plans**: `object`

#### plans.all

> `readonly` **all**: readonly \[`"plans"`\]

#### plans.monthly

> `readonly` **monthly**: () => readonly \[`"plans"`, `"monthly"`\]

##### Returns

readonly \[`"plans"`, `"monthly"`\]

#### plans.weekly

> `readonly` **weekly**: () => readonly \[`"plans"`, `"weekly"`\]

##### Returns

readonly \[`"plans"`, `"weekly"`\]

### profile

> `readonly` **profile**: `object`

#### profile.all

> `readonly` **all**: readonly \[`"profile"`\]

#### profile.detail

> `readonly` **detail**: () => readonly \[`"profile"`, `"detail"`\]

##### Returns

readonly \[`"profile"`, `"detail"`\]

### routines

> `readonly` **routines**: `object`

#### routines.all

> `readonly` **all**: readonly \[`"routines"`\]

#### routines.detail

> `readonly` **detail**: (`id`) => readonly \[`"routines"`, `"detail"`, `string`\]

##### Parameters

###### id

`string`

##### Returns

readonly \[`"routines"`, `"detail"`, `string`\]

#### routines.details

> `readonly` **details**: () => readonly \[`"routines"`, `"detail"`\]

##### Returns

readonly \[`"routines"`, `"detail"`\]

#### routines.list

> `readonly` **list**: (`filters`) => readonly \[`"routines"`, `"list"`, \{ `filters`: `string`; \}\]

##### Parameters

###### filters

`string`

##### Returns

readonly \[`"routines"`, `"list"`, \{ `filters`: `string`; \}\]

#### routines.lists

> `readonly` **lists**: () => readonly \[`"routines"`, `"list"`\]

##### Returns

readonly \[`"routines"`, `"list"`\]

### sessions

> `readonly` **sessions**: `object`

#### sessions.all

> `readonly` **all**: readonly \[`"sessions"`\]

#### sessions.detail

> `readonly` **detail**: (`id`) => readonly \[`"sessions"`, `"detail"`, `string`\]

##### Parameters

###### id

`string`

##### Returns

readonly \[`"sessions"`, `"detail"`, `string`\]

#### sessions.details

> `readonly` **details**: () => readonly \[`"sessions"`, `"detail"`\]

##### Returns

readonly \[`"sessions"`, `"detail"`\]

#### sessions.list

> `readonly` **list**: (`filters`) => readonly \[`"sessions"`, `"list"`, \{ `filters`: `string`; \}\]

##### Parameters

###### filters

`string`

##### Returns

readonly \[`"sessions"`, `"list"`, \{ `filters`: `string`; \}\]

#### sessions.lists

> `readonly` **lists**: () => readonly \[`"sessions"`, `"list"`\]

##### Returns

readonly \[`"sessions"`, `"list"`\]
