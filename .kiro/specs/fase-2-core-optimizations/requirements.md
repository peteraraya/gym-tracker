# Requisitos: Fase 2 Core Optimizations

## Resumen Ejecutivo

Este documento define los requisitos funcionales y no funcionales para las optimizaciones de Fase 2 de la experiencia de entrenamiento. El objetivo es reducir la fricción durante los entrenamientos mediante cuatro mejoras clave que reducirán clics en 50%, tiempo por serie en 33%, y scroll necesario en 60%.

## Objetivos del Proyecto

### Objetivos Primarios
1. Reducir el scroll vertical en dispositivos móviles en 60%
2. Acelerar el ajuste de pesos con botones de un solo clic
3. Automatizar la sugerencia de pesos basándose en historial
4. Mejorar la eficiencia general del flujo de entrenamiento

### Objetivos Secundarios
1. Mantener toda la funcionalidad existente
2. Preservar la accesibilidad y usabilidad
3. Optimizar el rendimiento en dispositivos móviles
4. Proporcionar feedback claro al usuario

### Métricas de Éxito
- ✅ 50% reducción en clics por serie
- ✅ 33% reducción en tiempo por serie
- ✅ 60% reducción en scroll necesario
- ✅ 80%+ tasa de aceptación de predicciones de peso
- ✅ < 100ms tiempo de respuesta para ajustes rápidos
- ✅ Cero regresiones en funcionalidad existente

## Personas de Usuario

### Persona 1: Carlos - Usuario Móvil en Gimnasio
**Demografía**: 28 años, entrena 4 veces por semana
**Contexto**: Usa la app en el gimnasio desde su teléfono
**Necesidades**:
- Mínimo scroll durante el entrenamiento
- Ajustes rápidos de peso sin abrir menús
- Sugerencias automáticas basadas en sesiones anteriores
**Frustraciones**:
- Demasiado scroll para ver toda la información
- Muchos clics para ajustar pesos
- Tiene que recordar qué peso usó la última vez

### Persona 2: María - Usuaria Avanzada
**Demografía**: 35 años, powerlifter experimentada
**Contexto**: Planifica entrenamientos en desktop, ejecuta en móvil
**Necesidades**:
- Eficiencia máxima durante entrenamientos
- Control total sobre pesos y series
- Progresión automática cuando corresponde
**Frustraciones**:
- Pierde tiempo en tareas repetitivas
- Información innecesaria distrae durante series pesadas

### Persona 3: Juan - Usuario Principiante
**Demografía**: 22 años, 3 meses entrenando
**Contexto**: Necesita guía y estructura
**Necesidades**:
- Sugerencias claras de pesos
- Interfaz simple y no abrumadora
- Feedback sobre su progresión
**Frustraciones**:
- No sabe qué peso usar
- Demasiada información en pantalla lo confunde

## Historias de Usuario

### Historia 1: Tabla de Series Colapsable
**Como** usuario móvil entrenando en el gimnasio  
**Quiero** que la tabla de series esté colapsada por defecto  
**Para** reducir el scroll y enfocarme en la serie actual

**Criterios de Aceptación**:
- [ ] La tabla de series está colapsada por defecto al iniciar ejercicio
- [ ] Se muestra un resumen compacto: "X de Y series completadas"
- [ ] Botón claro "Ver todas las series" para expandir
- [ ] Botón "Ocultar series" cuando está expandida
- [ ] Estado de expansión se mantiene durante el ejercicio actual
- [ ] Estado se resetea (colapsado) al cambiar de ejercicio
- [ ] Animación suave al expandir/colapsar (300ms)
- [ ] Funciona correctamente en móvil y desktop

**Prioridad**: ALTA  
**Estimación**: 1-2 horas  
**Dependencias**: Ninguna

---

### Historia 2: Botones de Ajuste Rápido de Peso
**Como** usuario ajustando pesos durante el entrenamiento  
**Quiero** botones de ajuste rápido (±2.5kg, ±5kg)  
**Para** cambiar el peso con un solo clic sin abrir el selector

**Criterios de Aceptación**:
- [ ] Cuatro botones visibles: -5kg, -2.5kg, +2.5kg, +5kg
- [ ] Botones ubicados debajo de inputs de reps/peso
- [ ] Ajuste inmediato al hacer clic (< 100ms)
- [ ] Feedback visual (animación del botón)
- [ ] Feedback háptico en móviles (vibración 50ms)
- [ ] El peso nunca puede ser negativo (mínimo 0kg)
- [ ] Botones deshabilitados si peso está vacío (se trata como 0)
- [ ] Diseño responsive para móvil (botones táctiles 44x44px mínimo)
- [ ] Funciona con peso actual del selector

**Prioridad**: ALTA  
**Estimación**: 1-2 horas  
**Dependencias**: Ninguna

---

### Historia 3: Predicción Inteligente de Pesos
**Como** usuario iniciando una serie  
**Quiero** que el sistema sugiera automáticamente el peso  
**Para** no tener que recordar qué peso usé la última vez

**Criterios de Aceptación**:
- [ ] Para serie 2+: usa peso de la serie anterior en workout actual
- [ ] Para serie 1: usa peso de la última sesión del mismo ejercicio
- [ ] Detecta progresión: si completaste todo bien, sugiere +2.5kg o +5kg
- [ ] Incremento de 5kg para ejercicios compuestos (sentadilla, press banca, peso muerto)
- [ ] Incremento de 2.5kg para ejercicios de aislamiento
- [ ] Fallback a peso configurado en rutina si no hay historial
- [ ] Muestra toast con razonamiento (solo para predicciones de alta confianza)
- [ ] No sobrescribe pesos editados manualmente por el usuario
- [ ] Predicción se recalcula al cambiar de ejercicio
- [ ] Funciona correctamente con historial vacío (sin crashes)

**Prioridad**: MEDIA  
**Estimación**: 2-3 horas  
**Dependencias**: Acceso a sesiones históricas (GymContext)

---

### Historia 4: Modo Enfocado (Opcional)
**Como** usuario que se distrae fácilmente  
**Quiero** un modo de pantalla completa que solo muestre el ejercicio actual  
**Para** mantener el foco durante series pesadas

**Criterios de Aceptación**:
- [ ] Botón toggle "Modo Enfocado" en header o settings
- [ ] Vista de pantalla completa con fondo oscuro
- [ ] Solo muestra: nombre ejercicio, serie actual, timer, inputs
- [ ] Botones grandes para móvil (60x60px mínimo)
- [ ] Timer prominente mostrando tiempo transcurrido
- [ ] Botón "Salir de modo enfocado" siempre visible
- [ ] Tecla Escape también sale del modo enfocado
- [ ] Estado del workout se preserva al entrar/salir
- [ ] Transición suave (< 200ms)
- [ ] Funciona en móvil y desktop

**Prioridad**: BAJA (Opcional)  
**Estimación**: 3-4 horas  
**Dependencias**: Ninguna

## Casos de Uso

### Caso de Uso 1: Colapsar/Expandir Tabla de Series

**Actor**: Usuario entrenando en móvil  
**Precondiciones**: Usuario está en página de workout activo  
**Flujo Principal**:
1. Usuario inicia workout
2. Sistema muestra tabla de series colapsada por defecto
3. Sistema muestra resumen: "0 de 10 series completadas"
4. Usuario ve botón "▶ Ver todas las series (10)"
5. Usuario hace clic en botón
6. Sistema expande tabla con animación suave
7. Sistema muestra todas las series con detalles
8. Botón cambia a "▼ Ocultar series (10)"
9. Usuario hace clic nuevamente
10. Sistema colapsa tabla

**Flujo Alternativo 1**: Usuario cambia de ejercicio
- En paso 7, usuario completa ejercicio y avanza al siguiente
- Sistema resetea estado a colapsado para nuevo ejercicio

**Postcondiciones**: Tabla está en estado colapsado o expandido según última acción del usuario

---

### Caso de Uso 2: Ajuste Rápido de Peso

**Actor**: Usuario ajustando peso durante serie  
**Precondiciones**: Usuario tiene peso actual de 50kg  
**Flujo Principal**:
1. Usuario ve peso actual: 50kg
2. Usuario ve botones: -5kg, -2.5kg, +2.5kg, +5kg
3. Usuario hace clic en "+2.5kg"
4. Sistema actualiza peso a 52.5kg inmediatamente
5. Sistema vibra dispositivo (50ms)
6. Sistema anima botón (feedback visual)
7. Peso actualizado se refleja en selector

**Flujo Alternativo 1**: Ajuste resultaría en peso negativo
- En paso 3, usuario hace clic en "-5kg" con peso actual de 2.5kg
- Sistema establece peso en 0kg (no permite negativos)
- Sistema muestra feedback visual

**Flujo Alternativo 2**: Peso está vacío
- En paso 1, peso actual está vacío
- Usuario hace clic en "+5kg"
- Sistema trata peso vacío como 0kg
- Sistema establece peso en 5kg

**Postcondiciones**: Peso actualizado correctamente, nunca negativo

---

### Caso de Uso 3: Predicción de Peso para Primera Serie

**Actor**: Usuario iniciando primera serie de un ejercicio  
**Precondiciones**: Usuario tiene historial de sesiones anteriores  
**Flujo Principal**:
1. Usuario inicia workout y llega a "Press de Banca"
2. Sistema busca última sesión con "Press de Banca"
3. Sistema encuentra sesión de hace 3 días con pesos: [50, 50, 50]kg
4. Sistema verifica: usuario completó 3/3 series con 10 reps cada una
5. Sistema detecta: objetivo era 10 reps, usuario lo logró
6. Sistema calcula: ejercicio compuesto → incremento de 5kg
7. Sistema sugiere: 55kg (50kg + 5kg progresión)
8. Sistema muestra toast: "💡 ¡Progresión! +5kg basado en última sesión"
9. Usuario ve peso sugerido en selector
10. Usuario puede aceptar o modificar

**Flujo Alternativo 1**: No hay historial
- En paso 2, sistema no encuentra sesiones anteriores
- Sistema usa peso configurado en rutina (ej: 40kg)
- Sistema establece peso en 40kg sin toast

**Flujo Alternativo 2**: Usuario no completó todas las series
- En paso 4, usuario solo completó 2/3 series
- Sistema no sugiere progresión
- Sistema usa mismo peso de última sesión (50kg)
- Sistema muestra toast: "Peso de la última sesión"

**Postcondiciones**: Peso sugerido automáticamente, usuario puede modificar

---

### Caso de Uso 4: Predicción de Peso para Series 2+

**Actor**: Usuario completando serie 1 y avanzando a serie 2  
**Precondiciones**: Usuario completó serie 1 con 50kg  
**Flujo Principal**:
1. Usuario completa serie 1 con 50kg y 10 reps
2. Sistema guarda datos de serie 1
3. Usuario avanza a serie 2
4. Sistema detecta: hay peso de serie anterior (50kg)
5. Sistema sugiere: 50kg (mismo peso de serie anterior)
6. Sistema NO muestra toast (comportamiento esperado)
7. Usuario ve peso sugerido en selector

**Flujo Alternativo 1**: Usuario editó peso manualmente
- En paso 3, usuario ya había editado peso de serie 2 a 52.5kg
- Sistema NO sobrescribe el peso editado
- Sistema respeta decisión del usuario

**Postcondiciones**: Peso sugerido basado en serie anterior

---

### Caso de Uso 5: Modo Enfocado

**Actor**: Usuario que quiere eliminar distracciones  
**Precondiciones**: Usuario está en workout activo  
**Flujo Principal**:
1. Usuario hace clic en "🎯 Modo Enfocado"
2. Sistema entra en pantalla completa
3. Sistema muestra fondo oscuro
4. Sistema muestra solo: ejercicio actual, serie, timer, inputs
5. Usuario completa serie en modo enfocado
6. Sistema guarda datos normalmente
7. Usuario hace clic en "Salir de modo enfocado"
8. Sistema vuelve a vista normal
9. Sistema preserva todo el estado del workout

**Flujo Alternativo 1**: Usuario presiona Escape
- En paso 5, usuario presiona tecla Escape
- Sistema sale de modo enfocado
- Continúa en paso 8

**Postcondiciones**: Usuario vuelve a vista normal, datos preservados

## Reglas de Negocio

### RN-001: Peso Mínimo
El peso nunca puede ser negativo. El valor mínimo permitido es 0kg.

**Validación**: `peso >= 0`

### RN-002: Peso Máximo
El peso máximo permitido es 500kg (límite de seguridad).

**Validación**: `peso <= 500`

### RN-003: Incrementos de Peso
Los incrementos estándar son: 2.5kg y 5kg.

**Aplicación**: Botones de ajuste rápido

### RN-004: Progresión Automática
La progresión solo se sugiere si:
- Usuario completó todas las series planificadas
- Promedio de reps >= objetivo de reps
- Hay historial de sesión anterior

**Validación**: 
```
completedSets >= totalSets AND 
avgReps >= targetReps AND 
lastSession exists
```

### RN-005: Incremento de Progresión
- Ejercicios compuestos: +5kg
- Ejercicios de aislamiento: +2.5kg

**Ejercicios compuestos**: Sentadilla, Press de Banca, Peso Muerto, Press Militar, Remo con Barra

### RN-006: Prioridad de Predicción
Orden de prioridad para predicción de peso:
1. Peso de serie anterior (si serie > 1)
2. Peso de última sesión con progresión (si aplica)
3. Peso de última sesión sin progresión
4. Peso configurado en rutina

### RN-007: Preservación de Ediciones Manuales
Si el usuario editó manualmente un peso, el sistema NO debe sobrescribirlo con predicciones automáticas.

**Validación**: `userEditedWeight !== undefined AND userEditedWeight !== 0`

### RN-008: Estado de Expansión
El estado de expansión de la tabla se resetea (colapsado) al cambiar de ejercicio.

### RN-009: Feedback Háptico
La vibración háptica solo se activa en dispositivos que la soportan.

**Validación**: `typeof navigator !== 'undefined' && navigator.vibrate`

### RN-010: Confianza de Predicción
Solo se muestran toasts para predicciones de alta confianza.

**Niveles de confianza**:
- Alta: Basado en serie anterior o última sesión
- Media: Basado en rutina con historial parcial
- Baja: Basado solo en rutina sin historial

## Requisitos No Funcionales

### RNF-001: Rendimiento
- Tiempo de respuesta para ajustes rápidos: < 100ms
- Tiempo de cálculo de predicción: < 50ms
- Animación de expansión/colapso: 300ms (suave)
- Transición a modo enfocado: < 200ms

### RNF-002: Usabilidad
- Botones táctiles mínimo 44x44px (iOS) o 48x48dp (Android)
- Contraste de color cumple WCAG AA (4.5:1 mínimo)
- Feedback visual inmediato en todas las acciones
- Mensajes de error claros y accionables

### RNF-003: Compatibilidad
- Funciona en iOS Safari 14+
- Funciona en Android Chrome 90+
- Funciona en desktop Chrome, Firefox, Safari
- Responsive desde 320px de ancho

### RNF-004: Accesibilidad
- Botones tienen labels descriptivos
- Estados de expansión anunciados a lectores de pantalla
- Navegación por teclado funcional
- Contraste de colores adecuado

### RNF-005: Mantenibilidad
- Código modular y reutilizable
- Funciones con responsabilidad única
- Comentarios en lógica compleja
- Tests unitarios para funciones críticas

### RNF-006: Seguridad
- Validación de inputs en cliente y servidor
- Sanitización de datos de usuario
- Manejo seguro de errores (sin exponer detalles internos)
- Límites de caché para evitar exceder localStorage

### RNF-007: Escalabilidad
- Análisis de historial limitado a últimas 10 sesiones
- Caché de predicciones con límite de 100 entradas
- Lazy loading de tabla de series
- Optimización de re-renders con React.memo

## Validaciones y Restricciones

### Validación de Peso
```typescript
function validateWeight(weight: number): number {
  // No negativo
  if (weight < 0) return 0;
  
  // Máximo 500kg
  if (weight > 500) return 500;
  
  // Redondear a 2 decimales
  return Math.round(weight * 100) / 100;
}
```

### Validación de Sesión
```typescript
function validateSession(session: any): session is Session {
  return (
    session &&
    typeof session === 'object' &&
    Array.isArray(session.exercises) &&
    session.exercises.every(ex => 
      typeof ex.exerciseName === 'string' &&
      Array.isArray(ex.actualReps) &&
      Array.isArray(ex.actualWeight)
    )
  );
}
```

### Validación de Predicción
```typescript
function validatePrediction(prediction: WeightPredictionResult): boolean {
  return (
    prediction.predictedWeight >= 0 &&
    prediction.predictedWeight <= 500 &&
    ['high', 'medium', 'low'].includes(prediction.confidence) &&
    ['last_session', 'previous_set', 'routine_default', 'progression'].includes(prediction.source) &&
    typeof prediction.reasoning === 'string' &&
    prediction.reasoning.length > 0
  );
}
```

## Dependencias

### Dependencias Técnicas
- React 18+ (ya instalado)
- TypeScript 5+ (ya instalado)
- Tailwind CSS (ya instalado)
- GymContext para acceso a sesiones
- ToastContext para notificaciones
- WorkoutState hook para estado del workout

### Dependencias de Datos
- Sesiones históricas del usuario
- Configuración de rutina actual
- Estado actual del workout
- Datos de ejercicios (nombre, tipo)

### Dependencias de Componentes
- ExerciseCard (a modificar)
- SeriesTable (a modificar)
- WeightSelector (existente)
- Button, Input (UI components)

## Criterios de Aceptación Global

### Funcionalidad
- [ ] Todas las historias de usuario implementadas
- [ ] Todos los casos de uso funcionan correctamente
- [ ] Todas las reglas de negocio se cumplen
- [ ] Todas las validaciones implementadas

### Calidad
- [ ] Cobertura de tests >= 80%
- [ ] Cero regresiones en funcionalidad existente
- [ ] Cero errores en consola
- [ ] Performance cumple requisitos no funcionales

### UX
- [ ] Reducción de 50% en clics medida
- [ ] Reducción de 33% en tiempo por serie medida
- [ ] Reducción de 60% en scroll medida
- [ ] Tasa de aceptación de predicciones >= 80%

### Documentación
- [ ] Código comentado adecuadamente
- [ ] README actualizado
- [ ] Guía de usuario creada
- [ ] Tests documentados

## Plan de Pruebas

### Pruebas Unitarias
- Función `predictWeight()` con diversos escenarios
- Función `handleQuickWeightAdjustment()` con casos límite
- Función `toggleSeriesTableExpansion()` con estados
- Validaciones de peso, sesión, predicción

### Pruebas de Integración
- Flujo completo de workout con predicciones
- Ajustes rápidos durante workout
- Expansión/colapso de tabla durante ejercicio
- Modo enfocado con preservación de estado

### Pruebas de Usuario
- Usuarios reales prueban en gimnasio
- Medición de métricas (clics, tiempo, scroll)
- Feedback cualitativo sobre UX
- Identificación de casos no contemplados

### Pruebas de Rendimiento
- Tiempo de respuesta de ajustes rápidos
- Tiempo de cálculo de predicciones
- Fluidez de animaciones
- Uso de memoria

### Pruebas de Compatibilidad
- iOS Safari (versiones 14, 15, 16)
- Android Chrome (versiones 90, 100, 110)
- Desktop Chrome, Firefox, Safari
- Diferentes tamaños de pantalla (320px - 1920px)

## Riesgos y Mitigaciones

### Riesgo 1: Predicciones Incorrectas
**Probabilidad**: Media  
**Impacto**: Medio  
**Mitigación**: 
- Mostrar razonamiento claro al usuario
- Permitir edición manual fácil
- Recopilar feedback para mejorar algoritmo

### Riesgo 2: Rendimiento en Dispositivos Antiguos
**Probabilidad**: Baja  
**Impacto**: Alto  
**Mitigación**:
- Optimizar cálculos con caché
- Limitar análisis de historial
- Lazy loading de componentes

### Riesgo 3: Confusión con Tabla Colapsada
**Probabilidad**: Baja  
**Impacto**: Bajo  
**Mitigación**:
- Botón de expansión muy visible
- Resumen claro cuando está colapsada
- Onboarding para nuevos usuarios

### Riesgo 4: Regresiones en Funcionalidad Existente
**Probabilidad**: Media  
**Impacto**: Alto  
**Mitigación**:
- Tests de regresión exhaustivos
- Code review cuidadoso
- Despliegue gradual (feature flags)

## Cronograma

### Fase 1: Implementación Alta Prioridad (Días 1-2)
- Día 1 mañana: Tabla colapsable (1-2h)
- Día 1 tarde: Botones ajuste rápido (1-2h)
- Día 2: Predicción inteligente (2-3h)

### Fase 2: Testing y Refinamiento (Día 3)
- Tests unitarios (2h)
- Tests de integración (1h)
- Refinamiento UX (1h)

### Fase 3: Modo Enfocado Opcional (Días 4-5)
- Solo si tiempo permite
- Implementación (3h)
- Testing (1h)

### Total Estimado: 5-10 horas

## Aprobaciones

Este documento requiere aprobación de:
- [ ] Product Owner
- [ ] Tech Lead
- [ ] UX Designer
- [ ] QA Lead

---

**Versión**: 1.0  
**Fecha**: 28 de Febrero, 2026  
**Autor**: Kiro AI Assistant  
**Estado**: Pendiente de Aprobación
