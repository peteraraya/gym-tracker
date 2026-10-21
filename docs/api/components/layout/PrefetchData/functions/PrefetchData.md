[**gym-logic**](../../../../README.md)

***

[gym-logic](../../../../README.md) / [components/layout/PrefetchData](../README.md) / PrefetchData

# Function: PrefetchData()

> **PrefetchData**(): `any`

Defined in: [components/layout/PrefetchData.tsx:16](https://github.com/peteraraya/gym-logic/blob/74372adb244d74daa6aebba3b788149270126542/components/layout/PrefetchData.tsx#L16)

Pre-carga rutinas y sesiones en el caché de React Query al arrancar la app,
para que las páginas muestren datos al instante sin skeleton en la primera navegación.
Usa las mismas queryKeys y queryFn que GymContext: React Query deduplica la petición
si esta ya está en vuelo.

## Returns

`any`
