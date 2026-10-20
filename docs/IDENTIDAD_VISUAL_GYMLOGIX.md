# Identidad visual de GymLogiX

## Marca

El nombre de producto se escribe **GymLogiX**, respetando las mayúsculas de `G`, `L` y `X`. El logotipo de referencia combina un símbolo de fuerza con un trazo turquesa y una palabra blanca sobre fondo negro.

**Tagline:** Tus rutinas + tus complementos + tu progreso.

## Paleta institucional

| Uso | Color | Hex |
| --- | --- | --- |
| Fondo de marca / tema oscuro | Negro grafito | `#08090B` |
| Texto e iconografía sobre negro | Blanco suave | `#F4F6F5` |
| Acento del logotipo | Turquesa eléctrico | `#00D6A4` |
| Acción principal accesible | Verde profundo | `#007A5E` |
| Acento secundario | Verde profundo | `#007A5E` |

El turquesa brillante se reserva para acentos, indicadores y elementos sobre superficies oscuras. En botones y texto de acción sobre fondos claros se utiliza el verde profundo para conservar el contraste. Los tonos de éxito, advertencia y error siguen siendo semánticos; los colores por grupo muscular siguen identificando cada grupo y no deben sustituirse por colores de marca.

## Aplicación en la interfaz

- Los tokens globales se mantienen en `app/globals.css`; las utilidades de marca derivan de esa paleta para los temas claro y oscuro.
- El nombre, el icono de aplicación y los metadatos deben conservar la misma escritura en web, PWA, notificaciones y aplicación Android.
- El símbolo fuente es [`public/gymlogix-mark.svg`](../public/gymlogix-mark.svg). Los iconos PNG instalables se generan desde ese SVG con `npm run generate:icons -- public/gymlogix-mark.svg`.
- Los recursos visibles se actualizan sin renombrar identificadores internos, claves de almacenamiento, URL de publicación ni el identificador de paquete de Android. La caché de imágenes sí incrementa su versión para renovar iconos ya instalados.
