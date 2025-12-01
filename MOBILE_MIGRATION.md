# Guía de Migración a Android con Capacitor

## ✅ Estado de Preparación

Tu app **Gym Tracker** está 100% lista para convertirse en APK y publicarse en Google Play.

### Análisis de Compatibilidad

- ✅ **Next.js 16** con App Router
- ✅ **React 19** 
- ✅ **Supabase Auth** con localStorage (compatible con móvil)
- ✅ **TailwindCSS** (funciona perfectamente en WebView)
- ✅ **next-intl** (i18n funcionará sin cambios)
- ✅ **Sin dependencias nativas** (ideal para Capacitor)

---

## 📋 Pasos de Implementación

### 1️⃣ Instalar Capacitor

```bash
npm install @capacitor/core @capacitor/cli --save-dev
npm install @capacitor/android
```

### 2️⃣ Inicializar Capacitor

```bash
npm run cap:init
```

Esto ya está preconfigurado para:
- **App ID**: `com.gymtracker.app`
- **App Name**: `Gym Tracker`
- **WebDir**: `out` (carpeta de build estático de Next.js)

### 3️⃣ Generar Build Estático

```bash
npm run build:mobile
```

Esto ejecutará `next build` con la configuración de exportación estática.

**Verifica** que se haya creado la carpeta `/out` con:
- `index.html`
- `_next/static/...`
- Todos tus assets

### 4️⃣ Agregar Plataforma Android

```bash
npm run cap:add:android
```

Esto creará la carpeta `/android` con el proyecto Android nativo.

### 5️⃣ Sincronizar Assets Web → Android

```bash
npm run cap:sync
```

Este comando copia el contenido de `/out` al proyecto Android.

### 6️⃣ Abrir en Android Studio

```bash
npm run mobile:open
```

O manualmente:
```bash
npm run cap:open:android
```

---

## 🔧 Configuración Importante

### next.config.ts

Ya está configurado con:

```typescript
{
  output: "export",           // Build estático
  images: { unoptimized: true }, // Deshabilita optimización de imágenes
  trailingSlash: true,        // Compatibilidad con rutas
}
```

### capacitor.config.ts

Ya está configurado con:

```typescript
{
  appId: 'com.gymtracker.app',
  appName: 'Gym Tracker',
  webDir: 'out',
  androidScheme: 'https',
}
```

---

## 🚀 Workflow de Desarrollo

### Desarrollo Web Normal
```bash
npm run dev
```

### Build y Sincronizar con Android
```bash
npm run mobile:build
```

Este comando automáticamente:
1. Genera build estático (`next build`)
2. Sincroniza con Android (`cap sync`)

### Abrir en Android Studio
```bash
npm run mobile:open
```

---

## 📱 Generar APK/AAB en Android Studio

### Para Pruebas (APK Debug)

1. En Android Studio: `Build > Build Bundle(s) / APK(s) > Build APK(s)`
2. El APK se generará en: `android/app/build/outputs/apk/debug/app-debug.apk`
3. Instala directamente en tu dispositivo

### Para Google Play (AAB Release)

1. En Android Studio: `Build > Generate Signed Bundle / APK`
2. Selecciona **Android App Bundle**
3. Crea un **Keystore** (guárdalo en lugar seguro)
4. Firma con tu keystore
5. El AAB se generará en: `android/app/build/outputs/bundle/release/app-release.aab`

---

## ⚠️ Consideraciones Importantes

### 1. Variables de Entorno

Asegúrate de que tus variables de Supabase estén en `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

**Importante**: En build de producción, estas variables se "queman" en el código JavaScript. Para mayor seguridad, considera usar Supabase RLS (Row Level Security).

### 2. Rutas y Navegación

Tu app usa App Router de Next.js. En móvil:
- ✅ Navegación funciona igual
- ✅ `useRouter()` funciona
- ⚠️ NO uses `redirect()` del servidor, usa solo navegación del lado del cliente

### 3. Autenticación

Tu `AuthContext` ya usa `createBrowserClient` que:
- ✅ Guarda tokens en **localStorage**
- ✅ Funciona en Android sin cambios
- ✅ Persiste sesión entre reinicios de app

### 4. APIs y CORS

Supabase ya maneja CORS correctamente, pero si usas otras APIs:
- Configura CORS para permitir el dominio `capacitor://localhost`
- O usa el plugin de Capacitor HTTP para bypass de CORS

---

## 🔍 Verificación Pre-Publicación

Antes de subir a Google Play, verifica:

### ✅ Checklist Funcional
- [ ] Login/Registro funciona
- [ ] Navegación entre páginas funciona
- [ ] Datos se guardan en Supabase
- [ ] Imágenes cargan correctamente
- [ ] i18n (español/inglés) funciona
- [ ] Sesión persiste al cerrar/abrir app

### ✅ Checklist Google Play
- [ ] App firmada con keystore de producción
- [ ] Versión en `android/app/build.gradle` actualizada
- [ ] Íconos de app configurados (512x512, 192x192, etc.)
- [ ] Splash screen personalizado
- [ ] Política de privacidad publicada (requerido por Google)
- [ ] Descripción y screenshots preparados

---

## 📦 Plugins Capacitor Recomendados

### Básicos (ya incluidos)
- ✅ `@capacitor/core`
- ✅ `@capacitor/android`

### Opcionales pero útiles
```bash
# Status bar personalizada
npm install @capacitor/status-bar

# Información de red
npm install @capacitor/network

# Notificaciones push (futuro)
npm install @capacitor/push-notifications

# Keyboard management
npm install @capacitor/keyboard
```

---

## 🎯 Siguientes Pasos

1. **Instalar dependencias de Capacitor**
   ```bash
   npm install @capacitor/core @capacitor/cli --save-dev
   npm install @capacitor/android
   ```

2. **Inicializar proyecto**
   ```bash
   npm run cap:init
   ```

3. **Generar build**
   ```bash
   npm run build:mobile
   ```

4. **Agregar Android**
   ```bash
   npm run cap:add:android
   ```

5. **Abrir Android Studio**
   ```bash
   npm run mobile:open
   ```

6. **Probar en emulador o dispositivo real**

---

## 💰 Costos

- **Cuenta Google Play Developer**: USD $25 (pago único, de por vida)
- **Todo lo demás**: Gratis

---

## 🆘 Troubleshooting Común

### Error: "Cannot find module '@capacitor/cli'"
```bash
npm install @capacitor/cli --save-dev
```

### Error: "webDir does not exist"
```bash
npm run build:mobile
```

### Error: "Cleartext HTTP traffic not permitted"
En `capacitor.config.ts` ya está configurado `androidScheme: 'https'`

### App se ve diferente en Android
Verifica en Chrome DevTools → Mobile emulation → iPhone/Android para debug

---

## 📚 Recursos

- [Documentación Capacitor](https://capacitorjs.com/docs)
- [Guía Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Google Play Console](https://play.google.com/console)
- [Supabase en Móvil](https://supabase.com/docs/guides/getting-started/tutorials/with-ionic-react)

---

**✅ Tu app está lista. Solo faltan los comandos de instalación.**
