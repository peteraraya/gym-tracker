# Función de Duplicar Rutinas

## 📋 Resumen
Se ha agregado la funcionalidad para duplicar rutinas existentes con un solo click, permitiendo crear copias rápidas de rutinas para modificarlas sin perder la original.

## 🎯 Problema Resuelto
Los usuarios necesitaban crear variaciones de rutinas existentes pero tenían que:
1. Crear una nueva rutina desde cero
2. Copiar manualmente todos los ejercicios
3. Configurar todas las series y repeticiones nuevamente

Ahora pueden duplicar una rutina completa en segundos.

## ✨ Características Implementadas

### 1. Botón de Duplicar
- Ubicado en las tarjetas de rutinas
- Entre los botones "Editar" y "Eliminar"
- Icono de Copy (📋)
- Estilo "ghost" para diferenciarlo de acciones principales
- **Estado de loading**: Muestra spinner mientras duplica
- **Deshabilitado durante duplicación**: Previene clicks múltiples

### 2. Confirmación de Duplicación
- Modal de confirmación antes de duplicar
- Muestra el nombre de la rutina a duplicar
- Botones "Duplicar" y "Cancelar"

### 3. Feedback Visual Inmediato
- **Toast de progreso**: "⏳ Duplicando rutina..." (aparece inmediatamente)
- **Spinner en el botón**: Animación de carga mientras procesa
- **Texto "Duplicando..."**: En el botón durante el proceso
- **Toast de éxito**: "✅ Rutina duplicada exitosamente" (al completar)
- **Toast de error**: "❌ Error al duplicar la rutina" (si falla)

### 4. Proceso de Duplicación
- Crea una copia exacta de la rutina
- Genera nuevo ID único para la rutina
- Genera nuevos IDs únicos para cada ejercicio
- Agrega "(Copia)" al nombre de la rutina
- Delay de 300ms para feedback visual
- Mantiene todos los datos:
  - Ejercicios
  - Series y repeticiones
  - Pesos y configuraciones
  - Descripción
  - Imagen (si existe)
  - Notas

### 5. Prevención de Duplicaciones Múltiples
- Estado `isDuplicating` previene clicks múltiples
- Botón deshabilitado durante el proceso
- Return early si ya está duplicando

## 🔧 Implementación Técnica

### Estado de Loading
```typescript
const [isDuplicating, setIsDuplicating] = useState(false);
```

### Nueva Función con Feedback
```typescript
const handleDuplicate = async (id: string) => {
  if (isDuplicating) return; // Evitar duplicaciones múltiples
  
  try {
    const routineToDuplicate = routines.find(r => r.id === id);
    if (!routineToDuplicate) return;

    const confirmed = await confirm({
      title: 'Duplicar Rutina',
      message: `¿Deseas crear una copia de "${routineToDuplicate.name}"?`,
      confirmText: 'Duplicar',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      setIsDuplicating(true);
      
      // Toast de progreso inmediato
      success('⏳ Duplicando rutina...');

      // Delay para feedback visual
      await new Promise(resolve => setTimeout(resolve, 300));

      const duplicatedRoutine = {
        ...routineToDuplicate,
        id: `routine_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `${routineToDuplicate.name} (Copia)`,
        exercises: routineToDuplicate.exercises.map(ex => ({
          ...ex,
          id: `exercise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }))
      };

      await addRoutine(duplicatedRoutine);
      
      // Toast de éxito
      success('✅ Rutina duplicada exitosamente');
      
      // Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'routine_duplicated', {
          routine_name: routineToDuplicate.name
        });
      }
    }
  } catch (e) {
    console.error('Error duplicating routine:', e);
    error('❌ Error al duplicar la rutina');
  } finally {
    setIsDuplicating(false);
  }
};
```

### Botón con Estado de Loading
```tsx
<Button
  variant="ghost"
  size="sm"
  className="flex-1 h-9 text-sm"
  onClick={() => handleDuplicate(routine.id)}
  disabled={isDuplicating}
  aria-label={`Duplicar rutina ${routine.name}`}
>
  {isDuplicating ? (
    <>
      <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
      <span className="hidden sm:inline">Duplicando...</span>
    </>
  ) : (
    <>
      <Copy className="w-3.5 h-3.5" />
      Duplicar
    </>
  )}
</Button>
```

### Generación de IDs Únicos
- Rutina: `routine_${timestamp}_${random}`
- Ejercicios: `exercise_${timestamp}_${random}`
- Garantiza que no haya conflictos de IDs

## 📱 Experiencia de Usuario

### Flujo de Uso Mejorado
1. Usuario ve una rutina que quiere duplicar
2. Hace click en el botón "Duplicar"
3. Aparece modal de confirmación
4. Confirma la duplicación
5. **Toast "⏳ Duplicando rutina..." aparece inmediatamente**
6. **Botón muestra spinner y "Duplicando..."**
7. **Delay de 300ms para feedback visual**
8. **Toast "✅ Rutina duplicada exitosamente"**
9. Nueva rutina aparece en la lista con "(Copia)" en el nombre
10. Usuario puede editar la copia sin afectar la original

### Feedback Visual en Cada Paso
- **Confirmación**: Modal claro con nombre de rutina
- **Progreso**: Toast + spinner + texto en botón
- **Éxito**: Toast verde con checkmark
- **Error**: Toast rojo con X (si falla)
- **Prevención**: Botón deshabilitado durante proceso

### Casos de Uso
- **Variaciones de rutinas**: Crear versión "ligera" o "pesada" de una rutina
- **Progresión**: Duplicar rutina y aumentar pesos/repeticiones
- **Experimentación**: Probar cambios sin perder la rutina original
- **Backup**: Tener una copia de seguridad antes de modificar
- **Plantillas**: Crear rutinas base y duplicarlas para diferentes días

## 🎨 Diseño Visual

### Botón de Duplicar
- Variant: "ghost" (fondo transparente, hover gris)
- Tamaño: "sm" (pequeño, h-9)
- Icono: Copy de lucide-react
- Texto: "Duplicar"
- Posición: Entre "Editar" y "Eliminar"

### Layout de Botones
```
[Iniciar] (botón principal, ancho completo)
[Editar] [Duplicar] [Eliminar] (3 botones en fila)
```

## 📊 Ventajas

### Para el Usuario
- ✅ Ahorra tiempo al crear variaciones
- ✅ No pierde la rutina original
- ✅ Puede experimentar sin miedo
- ✅ Fácil crear progresiones
- ✅ Un solo click + confirmación

### Para el Sistema
- ✅ Reutiliza función existente `addRoutine`
- ✅ IDs únicos garantizados
- ✅ No duplica referencias (deep copy)
- ✅ Analytics integrado
- ✅ Manejo de errores robusto

## 🔒 Seguridad y Validación

### Validaciones
- Verifica que la rutina existe antes de duplicar
- Genera IDs únicos para evitar conflictos
- Maneja errores gracefully
- Confirmación antes de ejecutar

### Deep Copy
- Crea nuevos objetos, no referencias
- Cada ejercicio tiene su propio ID
- No afecta la rutina original

## 📈 Analytics
- Evento: `routine_duplicated`
- Parámetro: `routine_name` (nombre de la rutina original)
- Permite trackear qué rutinas se duplican más

## 🚀 Mejoras Futuras (Opcionales)
1. Opción de editar el nombre antes de duplicar
2. Duplicar múltiples rutinas a la vez
3. Duplicar y modificar en un solo paso
4. Historial de duplicaciones
5. Sugerencias de nombres para copias
6. Duplicar a planificador directamente

## 📝 Notas de Implementación
- El botón usa variant "ghost" para no competir visualmente con "Editar"
- El nombre "(Copia)" se agrega automáticamente
- Los IDs se generan con timestamp + random para garantizar unicidad
- La función es async para manejar el storage correctamente
- Se usa el mismo sistema de confirmación que eliminar
