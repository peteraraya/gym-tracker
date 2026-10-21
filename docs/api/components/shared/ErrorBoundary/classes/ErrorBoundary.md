[**gym-logic**](../../../../README.md)

***

[gym-logic](../../../../README.md) / [components/shared/ErrorBoundary](../README.md) / ErrorBoundary

# Class: ErrorBoundary

Defined in: [components/shared/ErrorBoundary.tsx:17](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/components/shared/ErrorBoundary.tsx#L17)

## Extends

- `Component`\<`Props`, `State`\>

## Constructors

### Constructor

> **new ErrorBoundary**(`props`): `ErrorBoundary`

Defined in: [components/shared/ErrorBoundary.tsx:18](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/components/shared/ErrorBoundary.tsx#L18)

#### Parameters

##### props

`Props`

#### Returns

`ErrorBoundary`

#### Overrides

`Component<Props, State>.constructor`

## Methods

### componentDidCatch()

> **componentDidCatch**(`error`, `errorInfo`): `void`

Defined in: [components/shared/ErrorBoundary.tsx:27](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/components/shared/ErrorBoundary.tsx#L27)

Catches exceptions generated in descendant components. Unhandled exceptions will cause
the entire component tree to unmount.

#### Parameters

##### error

`Error`

##### errorInfo

`any`

#### Returns

`void`

#### Overrides

`Component.componentDidCatch`

***

### handleGoHome()

> **handleGoHome**(): `void`

Defined in: [components/shared/ErrorBoundary.tsx:58](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/components/shared/ErrorBoundary.tsx#L58)

#### Returns

`void`

***

### handleReload()

> **handleReload**(): `void`

Defined in: [components/shared/ErrorBoundary.tsx:54](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/components/shared/ErrorBoundary.tsx#L54)

#### Returns

`void`

***

### render()

> **render**(): `string` \| `number` \| `bigint` \| `boolean` \| `Iterable`\<`ReactNode`, `any`, `any`\> \| `Promise`\<`AwaitedReactNode`\> \| `Element`

Defined in: [components/shared/ErrorBoundary.tsx:62](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/components/shared/ErrorBoundary.tsx#L62)

#### Returns

`string` \| `number` \| `bigint` \| `boolean` \| `Iterable`\<`ReactNode`, `any`, `any`\> \| `Promise`\<`AwaitedReactNode`\> \| `Element`

#### Overrides

`Component.render`

***

### getDerivedStateFromError()

> `static` **getDerivedStateFromError**(`error`): `State`

Defined in: [components/shared/ErrorBoundary.tsx:23](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/components/shared/ErrorBoundary.tsx#L23)

#### Parameters

##### error

`Error`

#### Returns

`State`
