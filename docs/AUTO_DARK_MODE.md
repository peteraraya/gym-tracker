# Sistema de Modo Oscuro Automático

## Resumen
Sistema completo de gestión de temas con modo automático basado en la hora del día, permitiendo al usuario elegir entre claro, oscuro o automático.

## Características Implementadas

### 1. Contexto de Tema (`context/ThemeContext.tsx`)

#### Modos Disponibles:
- **Light**: Tema claro siempre activo
- **Dark**: Tema oscuro siempre activo
- **Auto**: Cambia automáticamente según la hora del día

#### Lógica del Modo Automático:
```typescript
const getTimeBasedTheme = (): 'light' | 'dark' => {
  const hour = new Date().getHours();
  // Modo oscuro entre 20:00 (8 PM) y 7:00 (7 AM)
  return (hour >= 20 || hour < 7) ? 'dark' : 'light';
};
```

#### Horarios:
- **Modo Claro**: 7:00 AM - 7:59 PM
- **Modo Oscuro**: 8:00 PM - 6:59 AM

#### Funcionalidades:
- Persistencia en localStorage (`gym-tracker-theme`)
- Verificación cada minuto para cambios de hora (solo en modo auto)
- Aplicación inmediata al cambiar configuración
- Escucha cambios en preferencia del sistema (opcional)

### 2. Componente de Configuración (`components/ThemeSettings.tsx`)

#### Interfaz:
- Tres opciones visuales con iconos:
  - ☀️ Claro (Sun icon)
  - 🌙 Oscuro (Moon icon)
  - 🕐 Automático (Clock icon)
- Indicador de opción activa
- Información contextual del modo automático
- Vista previa del tema actual
- Consejos de uso

#### Información Dinámica:
Cuando está en modo automático, muestra:
- Hora actual
- Tema activo en ese momento
- Horarios de cambio
- Emoji indicador (☀️ o 🌙)

### 3. Integración en Layout (`app/layout.tsx`)

```typescript
<ThemeProvider>
  <AuthProvider>
    {/* ... otros providers */}
  </AuthProvider>
</ThemeProvider>
```

El ThemeProvider envuelve toda la aplicación para que el tema esté disponible globalmente.

### 4. Página de Perfil (`app/profile/page.tsx`)

Se agregó la sección de configuración de tema entre "Configuración de descansos" y "Tutorial".

## Flujo de Uso

### Primera Vez:
1. Usuario abre la app
2. Sistema carga tema guardado o usa "auto" por defecto
3. Si es auto, determina tema según hora actual
4. Aplica clase `dark` al `<html>` si corresponde

### Cambio Manual:
1. Usuario va a Perfil
2. Selecciona modo deseado (claro/oscuro/auto)
3. Cambio se aplica inmediatamente
4. Preferencia se guarda en localStorage

### Modo Automático:
1. Sistema verifica hora cada minuto
2. Si cruza umbral (7 AM o 8 PM), cambia tema
3. Transición suave gracias a CSS transitions
4. Usuario ve notificación visual del cambio

## Implementación Técnica

### Aplicación del Tema:
```typescript
const applyTheme = (appliedTheme: 'light' | 'dark') => {
  const root = document.documentElement;
  if (appliedTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};
```

### CSS (app/globals.css):
Ya existía soporte para dark mode con:
```css
@media (prefers-color-scheme: dark) {
  :root {
    /* Variables de tema oscuro */
  }
}
```

Ahora se controla mediante clase `.dark` en el elemento raíz.

### Transiciones:
```css
* {
  @apply transition-colors duration-200;
}
```

Todas las transiciones de color son suaves (200ms).

## Beneficios

### Para el Usuario:
1. **Comodidad**: Cambio automático sin intervención
2. **Salud visual**: Modo oscuro en horarios nocturnos
3. **Flexibilidad**: Control total si prefiere un modo fijo
4. **Transparencia**: Información clara de qué está activo

### Para el Sistema:
1. **Eficiencia**: Verificación cada minuto (bajo impacto)
2. **Persistencia**: Preferencia guardada localmente
3. **Compatibilidad**: Funciona con sistema de preferencias del OS
4. **Escalabilidad**: Fácil agregar más opciones de horario

## Personalización Futura

### Horarios Personalizados:
```typescript
// Permitir al usuario configurar sus propios horarios
interface ThemeSchedule {
  darkStart: number; // Hora de inicio modo oscuro (0-23)
  darkEnd: number;   // Hora de fin modo oscuro (0-23)
}
```

### Ubicación Geográfica:
```typescript
// Usar amanecer/atardecer según ubicación
const getSunriseSunset = async (lat: number, lon: number) => {
  // API de sunrise-sunset
};
```

### Transiciones Graduales:
```typescript
// Reducir brillo gradualmente antes del cambio
const gradualTransition = (minutes: number) => {
  // Implementar dimming progresivo
};
```

## Archivos Modificados

### Nuevos:
- ✅ `context/ThemeContext.tsx` - Contexto de tema
- ✅ `components/ThemeSettings.tsx` - UI de configuración

### Modificados:
- ✅ `app/layout.tsx` - Agregado ThemeProvider
- ✅ `app/profile/page.tsx` - Agregado ThemeSettings
- ✅ `components/icons/lucide.ts` - Agregados iconos Sun y Moon

### Existentes (sin cambios):
- ✅ `app/globals.css` - Ya tenía soporte dark mode
- ✅ Todos los componentes - Ya usan clases `dark:`

## Testing

### Casos de Prueba:
1. ✅ Cambio manual entre modos
2. ✅ Persistencia al recargar página
3. ✅ Cambio automático al cruzar umbral horario
4. ✅ Sincronización entre pestañas (localStorage)
5. ✅ Transiciones suaves
6. ✅ Información correcta en UI

### Escenarios:
- Usuario nuevo (sin preferencia guardada)
- Usuario con preferencia guardada
- Cambio de hora mientras app está abierta
- Múltiples pestañas abiertas
- Cambio de preferencia del sistema

## Notas de Implementación

### Hidratación SSR:
```typescript
suppressHydrationWarning
```
Usado en `<html>` y `<body>` para evitar warnings de hidratación cuando el tema se aplica en cliente.

### Performance:
- Verificación cada minuto (no cada segundo)
- Solo en modo auto
- Cleanup de intervals al desmontar
- Aplicación directa de clases (no re-renders)

### Accesibilidad:
- Botones con estados claros
- Iconos descriptivos
- Información contextual
- Contraste adecuado en ambos modos

---

**Fecha de implementación**: Febrero 2026
**Versión**: 1.0
**Estado**: Producción
