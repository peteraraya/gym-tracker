[**gym-tracker**](../../../../README.md)

***

[gym-tracker](../../../../README.md) / [components/ui/A11yAlert](../README.md) / A11yAlert

# Function: A11yAlert()

> **A11yAlert**(`__namedParameters`): `Element`

Defined in: [components/ui/A11yAlert.tsx:28](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/components/ui/A11yAlert.tsx#L28)

Componente de región live (aria-live) para anuncios a lectores de pantalla.

Úsalo para anunciar cambios de estado dinámicos sin mover el foco del usuario:
- Toasts (éxito, error, advertencia)
- Cambios de página en SPA
- Confirmaciones de acción (ej. "Rutina guardada")

Ejemplo:
  <A11yAlert message={toastMessage} announceId={toastId} />

El componente utiliza aria-live="polite" por defecto (no interrumpe al usuario).
Para anuncios urgentes, usa priority="assertive".

## Parameters

### \_\_namedParameters

[`A11yAlertProps`](../interfaces/A11yAlertProps.md)

## Returns

`Element`
