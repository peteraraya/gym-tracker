[**gym-logic**](../../../../README.md)

***

[gym-logic](../../../../README.md) / [components/ui/StandardEmptyState](../README.md) / StandardEmptyStateProps

# Interface: StandardEmptyStateProps

Defined in: [components/ui/StandardEmptyState.tsx:21](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/components/ui/StandardEmptyState.tsx#L21)

Componente unificado de estado vacío para GymLogiX.
Combina la simplicidad de EmptyState con las acciones de EmptyStateCard.

Uso recomendado en todas las páginas que puedan mostrar contenido vacío.

Ejemplo:
  <StandardEmptyState
    icon="🏋️"
    title="No hay rutinas"
    description="Crea tu primera rutina para empezar a entrenar"
    actionLabel="Crear rutina"
    onAction={() => router.push('/routines/create')}
  />

## Properties

### actionLabel?

> `optional` **actionLabel?**: `string`

Defined in: [components/ui/StandardEmptyState.tsx:25](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/components/ui/StandardEmptyState.tsx#L25)

***

### className?

> `optional` **className?**: `string`

Defined in: [components/ui/StandardEmptyState.tsx:29](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/components/ui/StandardEmptyState.tsx#L29)

***

### description?

> `optional` **description?**: `string`

Defined in: [components/ui/StandardEmptyState.tsx:24](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/components/ui/StandardEmptyState.tsx#L24)

***

### icon?

> `optional` **icon?**: `ReactNode`

Defined in: [components/ui/StandardEmptyState.tsx:22](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/components/ui/StandardEmptyState.tsx#L22)

***

### onAction?

> `optional` **onAction?**: () => `void`

Defined in: [components/ui/StandardEmptyState.tsx:26](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/components/ui/StandardEmptyState.tsx#L26)

#### Returns

`void`

***

### onSecondaryAction?

> `optional` **onSecondaryAction?**: () => `void`

Defined in: [components/ui/StandardEmptyState.tsx:28](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/components/ui/StandardEmptyState.tsx#L28)

#### Returns

`void`

***

### secondaryActionLabel?

> `optional` **secondaryActionLabel?**: `string`

Defined in: [components/ui/StandardEmptyState.tsx:27](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/components/ui/StandardEmptyState.tsx#L27)

***

### title

> **title**: `string`

Defined in: [components/ui/StandardEmptyState.tsx:23](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/components/ui/StandardEmptyState.tsx#L23)
