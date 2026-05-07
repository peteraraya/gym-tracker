# 🧠 Sistema Inteligente de Recomendaciones de Ejercicios

## 📅 Fecha: Mayo 5, 2026

---

## 🎯 Objetivo

Implementar un sistema inteligente que pre-configure automáticamente los ejercicios con valores recomendados (series, repeticiones, peso) basados en:
- Perfil del usuario (nivel, objetivo, género, peso corporal)
- Recomendaciones específicas de cada ejercicio
- Mejores prácticas de entrenamiento

---

## ✨ Funcionalidades Implementadas

### **1. Cálculo Inteligente de Peso Inicial**

El sistema calcula el peso inicial recomendado considerando:

**Factores de multiplicación según tipo de ejercicio:**
- **Peso corporal**: 0kg (sin peso adicional)
- **Ejercicios compuestos** (sentadilla, press banca, peso muerto):
  - Principiante: 50% peso corporal (hombres), 35% (mujeres)
  - Intermedio: 75% peso corporal (hombres), 55% (mujeres)
  - Avanzado: 100% peso corporal (hombres), 75% (mujeres)
- **Ejercicios de aislamiento**:
  - Principiante: 15% peso corporal (hombres), 10% (mujeres)
  - Intermedio: 25% peso corporal (hombres), 18% (mujeres)
  - Avanzado: 35% peso corporal (hombres), 25% (mujeres)

**Características:**
- Redondeo a múltiplos de 2.5kg para facilitar carga de discos
- Peso mínimo seguro por tipo de equipamiento
- Fallback a valores seguros si no hay perfil

---

### **2. Repeticiones Según Objetivo**

El sistema ajusta las repeticiones según el objetivo de fitness:

| Objetivo | Repeticiones | Enfoque |
|----------|--------------|---------|
| **Fuerza** | 5 reps | Menos reps, más peso |
| **Hipertrofia** | 10 reps | Rango medio óptimo |
| **Pérdida de peso** | 12 reps | Mayor gasto calórico |
| **Resistencia** | 15 reps | Más reps, menos peso |
| **Fitness general** | 12 reps | Balance general |

**Prioridad:**
1. Recomendación específica del ejercicio
2. Ajuste según objetivo del usuario
3. Valor por defecto según objetivo

---

### **3. Series Según Nivel**

El sistema ajusta el número de series según el nivel de experiencia:

| Nivel | Series | Justificación |
|-------|--------|---------------|
| **Principiante** | 3 series | Volumen moderado para adaptación |
| **Intermedio** | 4 series | Mayor volumen para progreso |
| **Avanzado** | 5 series | Máximo volumen para estímulo |

**Prioridad:**
1. Recomendación específica del ejercicio
2. Ajuste según nivel del usuario
3. Valor por defecto (3 series)

---

### **4. Tiempo de Descanso Según Objetivo**

| Objetivo | Descanso | Razón |
|----------|----------|-------|
| **Fuerza** | 3-5 min | Recuperación completa del sistema nervioso |
| **Hipertrofia** | 60-90 seg | Balance entre fatiga y recuperación |
| **Pérdida de peso** | 30-60 seg | Mantener frecuencia cardíaca elevada |
| **Resistencia** | 30-45 seg | Adaptación metabólica |
| **Fitness general** | 60 seg | Balance general |

---

## 🔧 Implementación Técnica

### **Archivo Principal**
`lib/exerciseRecommendations.ts`

### **Funciones Principales**

#### **1. getExerciseRecommendations()**
```typescript
getExerciseRecommendations(
  exercise: ExerciseTemplate,
  profile: UserProfile | null
): ExerciseRecommendation
```
Retorna recomendaciones completas para un ejercicio.

#### **2. generatePreConfiguredSets()**
```typescript
generatePreConfiguredSets(
  exercise: ExerciseTemplate,
  profile: UserProfile | null
): Array<{ reps: number; weight: number }>
```
Genera un array de sets pre-configurados listos para usar.

#### **3. getRecommendationExplanation()**
```typescript
getRecommendationExplanation(
  exercise: ExerciseTemplate,
  profile: UserProfile | null
): string
```
Genera un mensaje explicativo de las recomendaciones.

#### **4. suggestProgressiveWeight()**
```typescript
suggestProgressiveWeight(
  currentWeight: number,
  setNumber: number,
  totalSets: number,
  goal: FitnessGoal | null
): number
```
Sugiere ajustes de peso para progresión entre series.

---

## 📱 Integración en la App

### **1. RoutineForm (Crear/Editar Rutinas)**

**Ubicación:** `components/RoutineForm.tsx`

**Cambios:**
- Carga del perfil del usuario al montar el componente
- Función `handleSelectExercises` actualizada para usar recomendaciones
- Mensaje informativo al usuario sobre la configuración automática

**Experiencia del usuario:**
1. Usuario selecciona ejercicios
2. Sistema calcula automáticamente:
   - Número de series según nivel
   - Repeticiones según objetivo
   - Peso inicial según peso corporal y nivel
   - Tiempo de descanso según objetivo
3. Usuario ve mensaje: "✨ Ejercicios configurados automáticamente según tu perfil"
4. Usuario puede ajustar valores manualmente si lo desea

---

### **2. Free Workout (Entrenamiento Libre)**

**Ubicación:** `app/workout/free/page.tsx`

**Cambios:**
- Carga del perfil del usuario
- Función `handleAddExercises` actualizada
- Interface `FreeExercise` extendida con campos de recomendaciones
- Mensaje informativo al agregar ejercicios

**Campos agregados a FreeExercise:**
```typescript
interface FreeExercise {
  // ... campos existentes
  recommendedSets?: number;
  recommendedReps?: number;
  recommendedWeight?: number;
}
```

---

## 💡 Ejemplos de Uso

### **Ejemplo 1: Usuario Principiante - Objetivo Hipertrofia**

**Perfil:**
- Nivel: Principiante
- Objetivo: Ganar músculo
- Peso: 70kg
- Género: Masculino

**Ejercicio: Press Banca (Compuesto)**

**Recomendaciones generadas:**
- Series: 3 (principiante)
- Repeticiones: 10 (hipertrofia)
- Peso: 35kg (50% de 70kg, redondeado a 2.5kg)
- Descanso: 60-90 seg (hipertrofia)

---

### **Ejemplo 2: Usuario Avanzado - Objetivo Fuerza**

**Perfil:**
- Nivel: Avanzado
- Objetivo: Ganar fuerza
- Peso: 80kg
- Género: Masculino

**Ejercicio: Sentadilla (Compuesto)**

**Recomendaciones generadas:**
- Series: 5 (avanzado)
- Repeticiones: 5 (fuerza)
- Peso: 80kg (100% de 80kg)
- Descanso: 3-5 min (fuerza)

---

### **Ejemplo 3: Usuario Intermedio - Objetivo Resistencia**

**Perfil:**
- Nivel: Intermedio
- Objetivo: Mejorar resistencia
- Peso: 60kg
- Género: Femenino

**Ejercicio: Curl de Bíceps (Aislamiento)**

**Recomendaciones generadas:**
- Series: 4 (intermedio)
- Repeticiones: 15 (resistencia)
- Peso: 10kg (18% de 60kg, redondeado)
- Descanso: 30-45 seg (resistencia)

---

### **Ejemplo 4: Sin Perfil (Usuario Nuevo)**

**Ejercicio: Flexiones (Peso Corporal)**

**Recomendaciones por defecto:**
- Series: 3 (principiante por defecto)
- Repeticiones: 12 (fitness general por defecto)
- Peso: 0kg (peso corporal)
- Descanso: 60 seg (fitness general)

---

## 🎯 Beneficios

### **Para el Usuario**
✅ **Ahorro de tiempo**: No necesita investigar cuántas series/reps hacer
✅ **Seguridad**: Pesos iniciales seguros y apropiados
✅ **Personalización**: Basado en su perfil real
✅ **Educación**: Aprende valores apropiados para su nivel
✅ **Motivación**: Configuración profesional desde el inicio

### **Para la App**
✅ **Mejor UX**: Menos fricción al crear rutinas
✅ **Profesionalismo**: Recomendaciones basadas en ciencia
✅ **Diferenciación**: Funcionalidad única vs competencia
✅ **Retención**: Usuarios ven valor inmediato
✅ **Progresión**: Base para futuras funcionalidades de IA

---

## 🔮 Futuras Mejoras

### **Fase 2: Progresión Automática**
- Sugerir incrementos de peso basados en rendimiento
- Detectar cuando el usuario está listo para más peso
- Periodización automática

### **Fase 3: Aprendizaje Adaptativo**
- Ajustar recomendaciones basadas en historial
- Detectar patrones de rendimiento
- Personalización más profunda

### **Fase 4: Análisis de Fatiga**
- Ajustar volumen según recuperación
- Detectar sobreentrenamiento
- Sugerir deload weeks

---

## 📊 Métricas de Éxito

### **KPIs a Monitorear**
1. **Tasa de adopción**: % de usuarios que usan valores recomendados
2. **Tasa de ajuste**: % de usuarios que modifican valores
3. **Completación de rutinas**: % de rutinas completadas vs abandonadas
4. **Satisfacción**: Feedback de usuarios sobre recomendaciones
5. **Progresión**: Usuarios que incrementan peso/reps con el tiempo

---

## 🧪 Testing

### **Casos de Prueba**

**1. Con perfil completo:**
- ✅ Calcula peso basado en peso corporal
- ✅ Ajusta series según nivel
- ✅ Ajusta reps según objetivo
- ✅ Asigna descanso según objetivo

**2. Sin perfil:**
- ✅ Usa valores por defecto seguros
- ✅ No genera errores
- ✅ Muestra mensaje apropiado

**3. Ejercicios especiales:**
- ✅ Peso corporal: 0kg
- ✅ Barra: mínimo 20kg
- ✅ Mancuernas: mínimo 2.5kg

**4. Redondeo:**
- ✅ Todos los pesos son múltiplos de 2.5kg
- ✅ Facilita carga de discos estándar

---

## 📝 Notas Técnicas

### **Consideraciones de Rendimiento**
- Cálculos son síncronos y rápidos (< 1ms)
- No requiere llamadas a API adicionales
- Perfil se carga una vez al montar componente

### **Manejo de Errores**
- Fallback a valores seguros si falla carga de perfil
- Validación de todos los inputs
- Logs para debugging

### **Compatibilidad**
- Funciona con y sin perfil de usuario
- Compatible con todos los tipos de ejercicios
- No rompe funcionalidad existente

---

## 🎉 Conclusión

El sistema inteligente de recomendaciones transforma la experiencia de crear rutinas de:

**Antes:**
- Usuario debe investigar valores apropiados
- Riesgo de usar pesos incorrectos
- Configuración manual tediosa
- Experiencia genérica

**Después:**
- Configuración automática inteligente
- Valores seguros y personalizados
- Experiencia fluida y rápida
- Sensación de app profesional

---

**Implementado por:** Kiro AI  
**Fecha:** Mayo 5, 2026  
**Versión:** 1.0  
**Estado:** ✅ **COMPLETADO Y FUNCIONAL**
