# Iconos de la Aplicación

## Diseños Disponibles

### gymlogix-mark.svg (actual)
- Símbolo G con mancuerna integrado
- Blanco y turquesa sobre negro grafito
- Fuente única de los iconos web y PWA

## Cambiar el Diseño del Icono

Para cambiar entre diseños, ejecuta:

```bash
# Generar los iconos institucionales
npm run generate:icons -- public/gymlogix-mark.svg
```

## Iconos Generados

Todos los iconos se generan automáticamente en:
- `public/icons/` - Iconos PWA en todos los tamaños
- `public/favicon-*.png` - Favicons para navegadores
- `public/apple-touch-icon.png` - Icono para iOS

### Tamaños Generados
- 72x72, 96x96, 128x128, 144x144, 152x152
- 192x192, 384x384, 512x512
- Badge 72x72 (notificaciones)
- Shortcuts 96x96 (workout, progress, ai)
- Favicon 16x16, 32x32
- Apple Touch Icon 180x180

## Verificar los Iconos

1. **Chrome DevTools**
   - F12 → Application → Manifest
   - Verifica que todos los iconos se muestren

2. **Lighthouse**
   - F12 → Lighthouse → PWA
   - Debe mostrar 100/100

3. **Instalación**
   - Instala la PWA en tu dispositivo
   - Verifica que el icono se vea correctamente

## Personalizar

Para crear tu propio diseño:

1. Edita `public/gymlogix-mark.svg`
2. Ejecuta `npm run generate:icons -- public/gymlogix-mark.svg`
3. Los iconos se regenerarán automáticamente

## Estructura de Archivos

```
public/
├── icons/
│   ├── icon-*.png (todos los tamaños)
│   ├── badge-72x72.png
│   └── shortcut-*.png
├── gymlogix-mark.svg (símbolo institucional)
├── favicon-16x16.png
├── favicon-32x32.png
└── apple-touch-icon.png
```

## Notas

- Los iconos se cachean en el service worker
- Después de cambiar iconos, limpia el caché del navegador
- Los iconos deben tener padding del 10-15% para verse bien en todos los dispositivos
