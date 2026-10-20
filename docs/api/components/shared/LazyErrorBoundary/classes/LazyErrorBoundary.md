[**gym-tracker**](../../../../README.md)

***

[gym-tracker](../../../../README.md) / [components/shared/LazyErrorBoundary](../README.md) / LazyErrorBoundary

# Class: LazyErrorBoundary

Defined in: [components/shared/LazyErrorBoundary.tsx:21](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/components/shared/LazyErrorBoundary.tsx#L21)

## Extends

- `Component`\<`LazyErrorBoundaryProps`, `LazyErrorBoundaryState`\>

## Constructors

### Constructor

> **new LazyErrorBoundary**(`props`): `LazyErrorBoundary`

Defined in: [components/shared/LazyErrorBoundary.tsx:24](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/components/shared/LazyErrorBoundary.tsx#L24)

#### Parameters

##### props

`LazyErrorBoundaryProps`

#### Returns

`LazyErrorBoundary`

#### Overrides

`Component<LazyErrorBoundaryProps, LazyErrorBoundaryState>.constructor`

## Methods

### componentDidCatch()

> **componentDidCatch**(`error`, `errorInfo`): `void`

Defined in: [components/shared/LazyErrorBoundary.tsx:41](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/components/shared/LazyErrorBoundary.tsx#L41)

Catches exceptions generated in descendant components. Unhandled exceptions will cause
the entire component tree to unmount.

#### Parameters

##### error

`Error`

##### errorInfo

`ErrorInfo`

#### Returns

`void`

#### Overrides

`Component.componentDidCatch`

***

### componentWillUnmount()

> **componentWillUnmount**(): `void`

Defined in: [components/shared/LazyErrorBoundary.tsx:54](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/components/shared/LazyErrorBoundary.tsx#L54)

Called immediately before a component is destroyed. Perform any necessary cleanup in this method, such as
cancelled network requests, or cleaning up any DOM elements created in `componentDidMount`.

#### Returns

`void`

#### Overrides

`Component.componentWillUnmount`

***

### handleManualRetry()

> **handleManualRetry**(): `void`

Defined in: [components/shared/LazyErrorBoundary.tsx:75](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/components/shared/LazyErrorBoundary.tsx#L75)

#### Returns

`void`

***

### handleReload()

> **handleReload**(): `void`

Defined in: [components/shared/LazyErrorBoundary.tsx:84](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/components/shared/LazyErrorBoundary.tsx#L84)

#### Returns

`void`

***

### render()

> **render**(): `string` \| `number` \| `bigint` \| `boolean` \| `Iterable`\<`ReactNode`, `any`, `any`\> \| `Promise`\<`AwaitedReactNode`\> \| `Element`

Defined in: [components/shared/LazyErrorBoundary.tsx:88](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/components/shared/LazyErrorBoundary.tsx#L88)

#### Returns

`string` \| `number` \| `bigint` \| `boolean` \| `Iterable`\<`ReactNode`, `any`, `any`\> \| `Promise`\<`AwaitedReactNode`\> \| `Element`

#### Overrides

`Component.render`

***

### scheduleRetry()

> **scheduleRetry**(): `void`

Defined in: [components/shared/LazyErrorBoundary.tsx:60](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/components/shared/LazyErrorBoundary.tsx#L60)

#### Returns

`void`

***

### getDerivedStateFromError()

> `static` **getDerivedStateFromError**(`error`): `Partial`\<`LazyErrorBoundaryState`\>

Defined in: [components/shared/LazyErrorBoundary.tsx:34](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/components/shared/LazyErrorBoundary.tsx#L34)

#### Parameters

##### error

`Error`

#### Returns

`Partial`\<`LazyErrorBoundaryState`\>
