# Iconos de la Aplicación

## Diseños Disponibles

### 1. icon-gt.svg (ACTUAL)
- Letras "GT" grandes y visibles
- Fondo con gradiente azul-púrpura
- Ideal para reconocimiento rápido
- **Actualmente en uso**

### 2. icon-dumbbell.svg
- Mancuerna simplificada
- Más visual y temático
- Fondo con gradiente azul-púrpura

### 3. icon-simple.svg (original)
- Mancuerna detallada con efectos 3D
- Más compleja pero elegante

## Cambiar el Diseño del Icono

Para cambiar entre diseños, ejecuta:

```bash
# Usar letras GT (actual)
npm run generate:icons public/icon-gt.svg

# Usar mancuerna simplificada
npm run generate:icons public/icon-dumbbell.svg

# Usar mancuerna detallada
npm run generate:icons public/icon-simple.svg
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

1. Edita cualquiera de los archivos SVG en `public/`
2. Ejecuta `npm run generate:icons public/tu-icono.svg`
3. Los iconos se regenerarán automáticamente

## Estructura de Archivos

```
public/
├── icons/
│   ├── icon-*.png (todos los tamaños)
│   ├── badge-72x72.png
│   └── shortcut-*.png
├── icon-gt.svg (letras GT - ACTUAL)
├── icon-dumbbell.svg (mancuerna simple)
├── icon-simple.svg (mancuerna detallada)
├── favicon-16x16.png
├── favicon-32x32.png
└── apple-touch-icon.png
```

## Notas

- Los iconos se cachean en el service worker
- Después de cambiar iconos, limpia el caché del navegador
- Los iconos deben tener padding del 10-15% para verse bien en todos los dispositivos
