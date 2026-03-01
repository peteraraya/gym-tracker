# Sistema de Progresión Avanzado

## Resumen

El sistema de progresión avanzado mejora el algoritmo básico 2-for-2 considerando múltiples factores para hacer recomendaciones más inteligentes y personalizadas sobre cuándo aumentar el peso.

## Mejoras sobre el Sistema Anterior

### Sistema Anterior (2-for-2 básico)
- ✅ Simple y fácil de entender
- ✅ Método probado y seguro
- ❌ No considera fatiga acumulada
- ❌ No analiza volumen total
- ❌ No se adapta a diferentes niveles de experiencia
- ❌ Solo progresión lineal

### Sistema Nuevo (Progresión Avanzada)
- ✅ Mantiene la regla 2-for-2 como base
- ✅ Analiza fatiga acumulada (frecuencia + volumen)
- ✅ Considera tendencia de volumen total
- ✅ Evalúa consistencia del usuario
- ✅ Soporta progresión lineal y ondulada
- ✅ Modo automático que elige la mejor estrategia
- ✅ Niveles de confianza en las recomendaciones

## Factores Analizados

### 1. Regla 2-for-2 (Base)
Mantiene el criterio fundamental:
- Si completas el objetivo de repeticiones en la última serie
- Durante 2 entrenamientos consecutivos
- Entonces es momento de considerar aumentar el peso

### 2. Análisis de Fatiga (0-10 puntos)
Evalúa tres componentes:

**Frecuencia (0-3 puntos)**
- Número de entrenamientos en los últimos 7 días
- Más entrenamientos = más fatiga

**Volumen Acumulado (0-4 puntos)**
- Volumen total (peso × reps × series) en los últimos 7 días
- Mayor volumen = más fatiga

**Tendencia de Rendimiento (0-3 puntos)**
- Si el volumen está disminuyendo = señal de fatiga
- Si está estable o aumentando = buena recuperación

**Interpretación:**
- 0-3: Fatiga baja (verde) - Listo para progresar
- 4-6: Fatiga moderada (amarillo) - Progresar con precaución
- 7-10: Fatiga alta (rojo) - Mantener peso o descargar

### 3. Tendencia de Volumen
Compara el volumen promedio de las últimas 3 sesiones vs las 3-6 anteriores:
- **Aumentando**: Volumen +10% o más (buena señal)
- **Estable**: Volumen ±10% (neutral)
- **Disminuyendo**: Volumen -10% o más (señal de alerta)

### 4. Consistencia (0-100%)
Porcentaje de entrenamientos completados vs esperados en los últimos 30 días:
- Asume 3-4 entrenamientos por semana como ideal (12 en 30 días)
- 70%+: Alta consistencia (verde)
- 50-69%: Consistencia media (amarillo)
- <50%: Baja consistencia (rojo)

## Estrategias de Progresión

### 1. Progresión Lineal
**Cuándo usar:**
- Principiantes e intermedios
- Buena recuperación (fatiga < 7)
- Alta consistencia (>70%)

**Cómo funciona:**
- Aumenta el peso constantemente cuando cumples 2-for-2
- Incremento estándar: 2.5kg aislamiento, 5kg compuestos
- Simple y efectivo para ganancias rápidas

**Ejemplo:**
```
Semana 1: 50kg × 3×10
Semana 2: 50kg × 3×10 ✓ (2-for-2 cumplido)
Semana 3: 52.5kg × 3×10 (aumento)
```

### 2. Progresión Ondulada
**Cuándo usar:**
- Intermedios y avanzados
- Fatiga acumulada (>7)
- Baja consistencia (<60%)
- Necesidad de periodización

**Cómo funciona:**
Ciclo de 3 semanas:
- **Semana 1 (Pesada)**: Peso máximo, volumen normal
- **Semana 2 (Media)**: Mismo peso, más volumen (series/reps)
- **Semana 3 (Ligera)**: -10% peso, descarga activa

**Ejemplo:**
```
Semana 1: 50kg × 3×10 (pesada)
Semana 2: 50kg × 4×10 (media - más volumen)
Semana 3: 45kg × 3×10 (ligera - descarga)
Semana 4: 52.5kg × 3×10 (pesada - aumento)
```

**Beneficios:**
- Mejor recuperación
- Previene sobreentrenamiento
- Permite mayor volumen total a largo plazo
- Reduce riesgo de lesiones

### 3. Modo Automático
**Cómo funciona:**
El sistema elige automáticamente entre lineal y ondulada basándose en:
- Si fatiga > 7 → Ondulada
- Si consistencia < 60% → Ondulada
- Si ambos están bien → Lineal

**Ideal para:**
- Principiantes que no quieren preocuparse por periodización
- Usuarios que entrenan de forma irregular
- Quienes prefieren que el sistema decida

## Niveles de Confianza

El sistema asigna un nivel de confianza a cada recomendación:

### Alta Confianza (Verde)
Todos estos factores:
- ✓ Cumple 2-for-2
- ✓ Volumen aumentando
- ✓ Fatiga < 5
- ✓ Consistencia > 70%

### Confianza Media (Amarillo)
Condiciones mixtas:
- Cumple 2-for-2 pero fatiga moderada
- O volumen estable
- O consistencia media

### Confianza Baja (Rojo)
Señales de alerta:
- ✗ No cumple 2-for-2
- O fatiga > 7
- O consistencia < 50%
- O volumen disminuyendo

## Uso en la Aplicación

### 1. Configuración
```typescript
import { recommendWeightIncrease } from '@/lib/progression-advanced';

const recommendation = recommendWeightIncrease(
  exerciseId,
  sessions,
  {
    repTarget: 10,
    compound: true,
    strategy: 'auto', // 'linear', 'undulating', 'auto'
    considerFatigue: true,
    considerVolume: true,
    minSessionsForProgression: 2
  }
);
```

### 2. Componente de Configuración
```tsx
import ProgressionSettings from '@/components/ProgressionSettings';

<ProgressionSettings
  currentStrategy="auto"
  onStrategyChange={(strategy) => setStrategy(strategy)}
  considerFatigue={true}
  onFatigueChange={(consider) => setConsiderFatigue(consider)}
  considerVolume={true}
  onVolumeChange={(consider) => setConsiderVolume(consider)}
/>
```

### 3. Visualización de Análisis
```tsx
import ProgressionAnalysis from '@/components/ProgressionAnalysis';

<ProgressionAnalysis
  recommendation={recommendation}
  exerciseName="Press de Banca"
/>
```

## Ejemplos de Casos de Uso

### Caso 1: Principiante Consistente
**Perfil:**
- 2 meses entrenando
- 3-4 sesiones por semana
- Buena recuperación

**Recomendación:**
- Estrategia: Lineal
- Aumentar peso cuando cumple 2-for-2
- Confianza: Alta

### Caso 2: Intermedio con Fatiga
**Perfil:**
- 1 año entrenando
- 5-6 sesiones por semana
- Fatiga acumulada (8/10)

**Recomendación:**
- Estrategia: Ondulada
- Semana de descarga
- Confianza: Media

### Caso 3: Usuario Irregular
**Perfil:**
- Entrena 1-2 veces por semana
- Consistencia 40%
- Sin fatiga

**Recomendación:**
- Estrategia: Ondulada (por baja consistencia)
- Mantener peso, mejorar consistencia primero
- Confianza: Baja

## Migración desde Sistema Anterior

El nuevo sistema es compatible con el anterior:

```typescript
// Sistema anterior (sigue funcionando)
import { recommendWeightIncrease } from '@/lib/progression';

// Sistema nuevo (más opciones)
import { recommendWeightIncrease } from '@/lib/progression-advanced';
```

Ambos retornan una estructura similar, pero el nuevo incluye:
- `confidence`: nivel de confianza
- `factors`: análisis detallado
- `strategy`: estrategia usada

## Próximas Mejoras

### Corto Plazo
- [ ] Integrar con sistema de sugerencias de peso existente
- [ ] Agregar configuración en página de Settings
- [ ] Mostrar análisis en página de progreso

### Medio Plazo
- [ ] Considerar RIR/RPE si el usuario lo registra
- [ ] Análisis de deload automático
- [ ] Predicción de 1RM más precisa

### Largo Plazo
- [ ] Machine learning para personalización
- [ ] Detección de mesetas
- [ ] Recomendaciones de periodización completa

## Referencias

- **Regla 2-for-2**: Método clásico de progresión en fuerza
- **Progresión Ondulada**: Daily Undulating Periodization (DUP)
- **Análisis de Fatiga**: Basado en modelos de fitness-fatigue
- **Volumen Total**: Métrica estándar en ciencia del entrenamiento

## Conclusión

El sistema de progresión avanzado mantiene la simplicidad del 2-for-2 mientras añade inteligencia contextual. Los usuarios pueden elegir entre simplicidad (modo auto) o control total (configuración manual), adaptándose a todos los niveles de experiencia.
