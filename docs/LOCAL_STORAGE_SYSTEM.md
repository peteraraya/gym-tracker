# 💾 Sistema de Almacenamiento Condicional

## 📅 Fecha: Mayo 7, 2026

---

## 🎯 Objetivo

Implementar un sistema de almacenamiento que pueda funcionar tanto con Supabase (cloud) como con localStorage (local), controlado por la variable de entorno `NEXT_PUBLIC_ENABLE_DATABASE`.

---

## ⚙️ Configuración

### **Variable de Entorno**

En tu archivo `.env.local`:

```bash
# Modo LOCAL (sin Supabase)
NEXT_PUBLIC_ENABLE_DATABASE=false

# Modo DATABASE (con Supabase)
NEXT_PUBLIC_ENABLE_DATABASE=true
```

### **Cambiar de Modo**

1. Edita `.env.local`
2. Cambia `NEXT_PUBLIC_ENABLE_DATABASE` a `true` o `false`
3. Reinicia el servidor de desarrollo (`npm run dev`)
4. ✅ La app usará automáticamente el modo correcto

---

## 🔧 Implementación

### **Archivo Principal de Configuración**
`lib/storageConfig.ts`

### **Funciones de Configuración**

#### 1. `isDatabaseEnabled(): boolean`
Verifica si la base de datos está habilitada.

**Retorna:**
- `true` si `NEXT_PUBLIC_ENABLE_DATABASE=true`
- `false` si `NEXT_PUBLIC_ENABLE_DATABASE=false`

**Ejemplo:**
```typescript
import { isDatabaseEnabled } from '@/lib/storageConfig';

if (isDatabaseEnabled()) {
  console.log('Usando Supabase');
} else {
  console.log('Usando localStorage');
}
```

---

#### 2. `useLocalStorage(): boolean`
Verifica si se debe usar almacenamiento local.

**Retorna:**
- `true` si la base de datos está deshabilitada
- `false` si la base de datos está habilitada

**Ejemplo:**
```typescript
import { useLocalStorage } from '@/lib/storageConfig';

if (useLocalStorage()) {
  // Guardar en localStorage
} else {
  // Guardar en Supabase
}
```

---

#### 3. `getStorageMode(): 'database' | 'local'`
Obtiene el modo de almacenamiento actual.

**Retorna:**
- `'database'` si Supabase está habilitado
- `'local'` si localStorage está habilitado

**Ejemplo:**
```typescript
import { getStorageMode } from '@/lib/storageConfig';

const mode = getStorageMode();
console.log(`Modo actual: ${mode}`);
```

---

### **Archivo de Almacenamiento Local**
`lib/localProfile.ts`

### **Funciones Disponibles**

#### 1. `saveProfileLocally(profile: Partial<UserProfile>): UserProfile`
Guarda el perfil del usuario en localStorage.

**Parámetros:**
- `profile`: Objeto con los datos del perfil a guardar (puede ser parcial)

**Retorna:**
- `UserProfile`: El perfil completo guardado

**Ejemplo:**
```typescript
import { saveProfileLocally } from '@/lib/localProfile';

const profile = saveProfileLocally({
  age: 25,
  gender: 'male',
  weight: 70,
  height: 175,
  fitnessGoal: 'muscle_gain',
  fitnessLevel: 'intermediate',
  weeklyWorkouts: 4
});
```

---

#### 2. `getProfileLocally(): UserProfile | null`
Obtiene el perfil del usuario desde localStorage.

**Retorna:**
- `UserProfile | null`: El perfil guardado o null si no existe

**Ejemplo:**
```typescript
import { getProfileLocally } from '@/lib/localProfile';

const profile = getProfileLocally();
if (profile) {
  console.log('Perfil encontrado:', profile);
} else {
  console.log('No hay perfil guardado');
}
```

---

#### 3. `clearProfileLocally(): void`
Elimina el perfil del usuario de localStorage.

**Ejemplo:**
```typescript
import { clearProfileLocally } from '@/lib/localProfile';

clearProfileLocally();
console.log('Perfil eliminado');
```

---

#### 4. `hasLocalProfile(): boolean`
Verifica si existe un perfil guardado localmente.

**Retorna:**
- `boolean`: true si existe un perfil, false si no

**Ejemplo:**
```typescript
import { hasLocalProfile } from '@/lib/localProfile';

if (hasLocalProfile()) {
  console.log('Hay un perfil guardado');
} else {
  console.log('No hay perfil guardado');
}
```

---

#### 5. `exportProfileAsJSON(): string | null`
Exporta el perfil como JSON para backup.

**Retorna:**
- `string | null`: JSON del perfil o null si no existe

**Ejemplo:**
```typescript
import { exportProfileAsJSON } from '@/lib/localProfile';

const json = exportProfileAsJSON();
if (json) {
  // Descargar como archivo
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'perfil-backup.json';
  a.click();
}
```

---

#### 6. `importProfileFromJSON(jsonString: string): UserProfile`
Importa un perfil desde JSON.

**Parámetros:**
- `jsonString`: String JSON con los datos del perfil

**Retorna:**
- `UserProfile`: El perfil importado y guardado

**Ejemplo:**
```typescript
import { importProfileFromJSON } from '@/lib/localProfile';

const jsonString = '{"age":25,"gender":"male",...}';
const profile = importProfileFromJSON(jsonString);
console.log('Perfil importado:', profile);
```

---

## 📱 Integración en la Aplicación

### **Patrón de Uso Estándar**

Todos los componentes que necesitan acceder al perfil siguen este patrón:

```typescript
import { useLocalStorage } from '@/lib/storageConfig';
import { getProfileLocally } from '@/lib/localProfile';

const loadProfile = async () => {
  try {
    // Verificar modo de almacenamiento
    if (useLocalStorage()) {
      // Modo LOCAL: Cargar desde localStorage
      const localProfile = getProfileLocally();
      if (localProfile) {
        setUserProfile(localProfile);
        return;
      }
    } else {
      // Modo DATABASE: Cargar desde Supabase
      const response = await fetch('/api/profile');
      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
      }
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  }
};
```

---

### **1. Página de Perfil (`app/profile/page.tsx`)**

#### Carga del Perfil
```typescript
const loadProfile = async () => {
  try {
    // Verificar modo de almacenamiento
    const { useLocalStorage } = await import('@/lib/storageConfig');
    
    if (useLocalStorage()) {
      // Modo LOCAL: Cargar desde localStorage
      if (typeof window !== 'undefined') {
        const { getProfileLocally } = await import('@/lib/localProfile');
        const localProfile = getProfileLocally();
        
        if (localProfile) {
          console.log('[Profile] ✅ Loaded from localStorage');
          // Usar perfil local
          setAge(localProfile.age || '');
          // ... resto de campos
          return;
        }
      }
    } else {
      // Modo DATABASE: Cargar desde Supabase
      console.log('[Profile] ☁️ Loading from Supabase...');
      const response = await fetch('/api/profile');
      if (response.ok) {
        const profile = await response.json();
        console.log('[Profile] ✅ Loaded from Supabase');
        // Usar perfil de Supabase
        setAge(profile.age || '');
        // ... resto de campos
      }
    }
  } catch (err) {
    console.error('[Profile] ❌ Error loading profile:', err);
  }
};
```

#### Guardado del Perfil
```typescript
const handleSaveProfile = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const profileData = { age, gender, height, weight, ... };

    // Verificar modo de almacenamiento
    const { useLocalStorage } = await import('@/lib/storageConfig');
    
    if (useLocalStorage()) {
      // Modo LOCAL: Guardar en localStorage
      if (typeof window !== 'undefined') {
        const { saveProfileLocally } = await import('@/lib/localProfile');
        saveProfileLocally(profileData);
        console.log('[Profile] ✅ Saved to localStorage');
        setProfileMessage('✓ Perfil guardado localmente');
        return;
      }
    } else {
      // Modo DATABASE: Guardar en Supabase
      console.log('[Profile] ☁️ Saving to Supabase...');
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      
      if (response.ok) {
        console.log('[Profile] ✅ Saved to Supabase');
        setProfileMessage('✓ Perfil actualizado correctamente');
      }
    }
  } catch (err) {
    console.error('[Profile] ❌ Error saving profile:', err);
  }
};
```

---

### **2. RoutineForm (`components/RoutineForm.tsx`)**

```typescript
useEffect(() => {
  const loadProfile = async () => {
    try {
      // Verificar modo de almacenamiento
      const { useLocalStorage } = await import('@/lib/storageConfig');
      
      if (useLocalStorage()) {
        // Modo LOCAL: Cargar desde localStorage
        if (typeof window !== 'undefined') {
          const { getProfileLocally } = await import('@/lib/localProfile');
          const localProfile = getProfileLocally();
          
          if (localProfile) {
            console.log('[RoutineForm] ✅ Loaded from localStorage');
            setUserProfile(localProfile);
            return;
          }
        }
      } else {
        // Modo DATABASE: Cargar desde Supabase
        console.log('[RoutineForm] ☁️ Loading from Supabase...');
        const response = await fetch('/api/profile');
        if (response.ok) {
          const profile = await response.json();
          console.log('[RoutineForm] ✅ Loaded from Supabase');
          setUserProfile(profile);
        }
      }
    } catch (error) {
      console.error('[RoutineForm] ❌ Error loading profile:', error);
    }
  };
  loadProfile();
}, []);
```

---

### **3. Free Workout (`app/workout/free/page.tsx`)**

```typescript
useEffect(() => {
  const loadProfile = async () => {
    try {
      // Verificar modo de almacenamiento
      const { useLocalStorage } = await import('@/lib/storageConfig');
      
      if (useLocalStorage()) {
        // Modo LOCAL: Cargar desde localStorage
        if (typeof window !== 'undefined') {
          const { getProfileLocally } = await import('@/lib/localProfile');
          const localProfile = getProfileLocally();
          
          if (localProfile) {
            console.log('[FreeWorkout] ✅ Loaded from localStorage');
            setUserProfile(localProfile);
            return;
          }
        }
      } else {
        // Modo DATABASE: Cargar desde Supabase
        console.log('[FreeWorkout] ☁️ Loading from Supabase...');
        const response = await fetch('/api/profile');
        if (response.ok) {
          const profile = await response.json();
          console.log('[FreeWorkout] ✅ Loaded from Supabase');
          setUserProfile(profile);
        }
      }
    } catch (error) {
      console.error('[FreeWorkout] ❌ Error loading profile:', error);
    }
  };
  loadProfile();
}, []);
```

---

## 🔄 Flujo de Datos

### **Modo LOCAL (NEXT_PUBLIC_ENABLE_DATABASE=false)**

#### Guardado
```
Usuario completa formulario
        ↓
handleSaveProfile()
        ↓
useLocalStorage() → true
        ↓
saveProfileLocally()
        ↓
localStorage.setItem()
        ↓
Perfil guardado en navegador ✓
```

#### Carga
```
Componente se monta
        ↓
loadProfile()
        ↓
useLocalStorage() → true
        ↓
getProfileLocally()
        ↓
localStorage.getItem()
        ↓
Perfil cargado desde navegador ✓
```

---

### **Modo DATABASE (NEXT_PUBLIC_ENABLE_DATABASE=true)**

#### Guardado
```
Usuario completa formulario
        ↓
handleSaveProfile()
        ↓
useLocalStorage() → false
        ↓
fetch('/api/profile', POST)
        ↓
Supabase.insert/update
        ↓
Perfil guardado en cloud ✓
```

#### Carga
```
Componente se monta
        ↓
loadProfile()
        ↓
useLocalStorage() → false
        ↓
fetch('/api/profile', GET)
        ↓
Supabase.select
        ↓
Perfil cargado desde cloud ✓
```

---

## 💡 Ventajas del Sistema Condicional

### **Flexibilidad Total**
- ✅ Cambia entre modos con una variable de entorno
- ✅ No requiere cambios de código
- ✅ Ideal para desarrollo y producción

### **Modo LOCAL (localStorage)**
- ✅ Funciona sin internet
- ✅ No requiere configuración de base de datos
- ✅ Privacidad total (datos en el navegador)
- ✅ Velocidad máxima (sin latencia de red)
- ⚠️ No sincroniza entre dispositivos
- ⚠️ Puede perderse si se borran datos del navegador

### **Modo DATABASE (Supabase)**
- ✅ Sincronización entre dispositivos
- ✅ Backup automático en la nube
- ✅ Datos seguros y persistentes
- ✅ Accesible desde cualquier lugar
- ⚠️ Requiere internet
- ⚠️ Requiere configuración de Supabase

---

## ⚠️ Limitaciones

### **1. Datos No Sincronizados**
- Los datos solo existen en el navegador actual
- No se sincronizan entre dispositivos
- No hay backup automático en la nube

### **2. Pérdida de Datos**
- Si se borran los datos del navegador, se pierde el perfil
- Si se cambia de navegador, no hay perfil
- Si se cambia de dispositivo, no hay perfil

### **3. Capacidad Limitada**
- localStorage tiene límite de ~5-10MB
- No apto para grandes cantidades de datos
- Puede llenarse con el tiempo

---

## 🔐 Seguridad

### **Datos Almacenados**
```javascript
{
  "id": "local-profile",
  "userId": "local-user",
  "age": 25,
  "gender": "male",
  "height": 175,
  "weight": 70,
  "fitnessGoal": "muscle_gain",
  "fitnessLevel": "intermediate",
  "weeklyWorkouts": 4,
  "createdAt": "2026-05-07T10:00:00.000Z",
  "updatedAt": "2026-05-07T10:00:00.000Z"
}
```

### **Clave de Almacenamiento**
```
gym-tracker-user-profile
```

### **Consideraciones de Seguridad**
- ✅ Los datos están en el navegador del usuario
- ✅ No se transmiten por red
- ✅ No hay riesgo de interceptación
- ⚠️ Cualquiera con acceso al navegador puede ver los datos
- ⚠️ No hay encriptación (localStorage es texto plano)

---

## 🛠️ Debugging

### **Ver Perfil en Consola**
```javascript
// En la consola del navegador
const profile = JSON.parse(localStorage.getItem('gym-tracker-user-profile'));
console.log(profile);
```

### **Limpiar Perfil**
```javascript
// En la consola del navegador
localStorage.removeItem('gym-tracker-user-profile');
console.log('Perfil eliminado');
```

### **Verificar Existencia**
```javascript
// En la consola del navegador
const exists = localStorage.getItem('gym-tracker-user-profile') !== null;
console.log('Perfil existe:', exists);
```

---

## 📊 Logs del Sistema

El sistema incluye logs detallados para debugging:

```
[LocalProfile] Profile saved successfully: {...}
[LocalProfile] Profile loaded successfully: {...}
[LocalProfile] No profile found in localStorage
[LocalProfile] Profile cleared successfully
[LocalProfile] Error saving profile: ...
[LocalProfile] Error loading profile: ...
```

---

## 🔄 Migración a Supabase (Futuro)

Cuando se reactive Supabase, el sistema puede migrar fácilmente:

```typescript
// Migrar perfil local a Supabase
const migrateToSupabase = async () => {
  const localProfile = getProfileLocally();
  
  if (localProfile) {
    // Guardar en Supabase
    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(localProfile)
    });
    
    if (response.ok) {
      console.log('Perfil migrado a Supabase');
      // Opcionalmente limpiar localStorage
      clearProfileLocally();
    }
  }
};
```

---

## 📝 Notas Importantes

### **Para Usuarios**
1. ⚠️ **Backup Manual**: Exporta tu perfil regularmente
2. ⚠️ **No Borrar Datos**: No limpies los datos del navegador
3. ⚠️ **Un Solo Dispositivo**: El perfil solo existe en este navegador
4. ✅ **Privacidad**: Tus datos nunca salen de tu dispositivo

### **Para Desarrolladores**
1. ✅ **Siempre verificar `typeof window !== 'undefined'`** antes de usar localStorage
2. ✅ **Usar dynamic imports** para evitar errores en SSR
3. ✅ **Manejar errores** de localStorage (puede estar lleno o deshabilitado)
4. ✅ **Logs claros** para facilitar debugging

---

## 🎯 Conclusión

El sistema de almacenamiento local permite que la aplicación funcione completamente sin Supabase, guardando el perfil del usuario en localStorage. Es una solución simple, rápida y privada, ideal para desarrollo local o cuando no se tiene acceso a una base de datos.

**Ventajas principales:**
- ✅ Funciona sin internet
- ✅ No requiere configuración
- ✅ Privacidad total
- ✅ Velocidad máxima

**Limitaciones principales:**
- ⚠️ No sincroniza entre dispositivos
- ⚠️ Puede perderse si se borran datos del navegador
- ⚠️ Capacidad limitada

---

**Documento creado por:** Kiro AI  
**Fecha:** Mayo 7, 2026  
**Versión:** 1.0  
**Estado:** ✅ Implementado y Funcional

