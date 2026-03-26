# Requirements Document

## Introducción

Esta feature implementa indicadores de rendimiento en tiempo real durante el entrenamiento, similar a la aplicación Hevy. El sistema debe mostrar estadísticas actualizadas dinámicamente mientras el usuario completa series, incluyendo volumen total levantado (kg), series completadas y repeticiones totales. Los indicadores deben ser visibles permanentemente durante el entrenamiento y también incluirse en el resumen final.

## Glossario

- **LiveStatsPanel**: Componente visual que muestra las estadísticas en tiempo real durante el entrenamiento
- **WorkoutPage**: Página principal donde se ejecuta el entrenamiento activo
- **WorkoutSummary**: Componente que muestra el resumen completo al finalizar el entrenamiento
- **Serie_Completada**: Una serie de ejercicio donde el usuario ha registrado repeticiones y peso
- **Volumen_Total**: Suma de (repeticiones × peso) de todas las series completadas, expresado en kilogramos
- **useWorkoutState**: Hook de React que gestiona el estado del entrenamiento
- **Sistema_Indicadores**: El sistema completo de tracking y visualización de estadísticas en tiempo real

## Requirements

### Requirement 1: Visualización de Estadísticas en Tiempo Real

**User Story:** Como usuario entrenando, quiero ver mis estadísticas actualizándose en tiempo real, para mantenerme motivado y consciente de mi progreso durante la sesión.

#### Acceptance Criteria

1. THE LiveStatsPanel SHALL mostrar el volumen total levantado en kilogramos
2. THE LiveStatsPanel SHALL mostrar el número total de series completadas
3. THE LiveStatsPanel SHALL mostrar el número total de repeticiones realizadas
4. WHEN el usuario completa una serie, THE Sistema_Indicadores SHALL actualizar todas las estadísticas en menos de 100 milisegundos
5. THE LiveStatsPanel SHALL usar formato numérico con separadores de miles para números mayores a 999
6. THE LiveStatsPanel SHALL ser visible en todo momento durante el entrenamiento activo

### Requirement 2: Cálculo de Volumen Total

**User Story:** Como usuario, quiero que el sistema calcule automáticamente el volumen total levantado, para no tener que hacer cálculos mentales durante el entrenamiento.

#### Acceptance Criteria

1. FOR ALL series completadas, THE Sistema_Indicadores SHALL calcular el volumen como (repeticiones × peso)
2. THE Sistema_Indicadores SHALL sumar el volumen de todas las series completadas de todos los ejercicios
3. WHEN una serie tiene peso cero, THE Sistema_Indicadores SHALL incluir esa serie con volumen cero en el cálculo
4. THE Sistema_Indicadores SHALL redondear el volumen total al número entero más cercano
5. WHEN el usuario edita repeticiones o peso de una serie completada, THE Sistema_Indicadores SHALL recalcular el volumen total inmediatamente

### Requirement 3: Integración en la Página de Entrenamiento

**User Story:** Como usuario, quiero que los indicadores estén integrados naturalmente en la interfaz de entrenamiento, para que no interfieran con mi flujo de trabajo.

#### Acceptance Criteria

1. THE WorkoutPage SHALL mostrar el LiveStatsPanel en una posición fija visible
2. THE LiveStatsPanel SHALL ocupar el ancho completo disponible en dispositivos móviles
3. THE LiveStatsPanel SHALL usar un diseño de tres columnas en pantallas de cualquier tamaño
4. THE LiveStatsPanel SHALL tener un diseño visual distintivo con gradiente de color
5. WHEN el usuario hace scroll, THE LiveStatsPanel SHALL permanecer visible en la parte superior de la página
6. THE LiveStatsPanel SHALL estar posicionado después del header del workout y antes de la lista de ejercicios

### Requirement 4: Estadísticas en el Resumen Final

**User Story:** Como usuario, quiero ver las mismas estadísticas en el resumen final del entrenamiento, para revisar mi rendimiento total antes de guardar la sesión.

#### Acceptance Criteria

1. THE WorkoutSummary SHALL mostrar el volumen total levantado
2. THE WorkoutSummary SHALL mostrar el número total de series completadas
3. THE WorkoutSummary SHALL mostrar el número total de repeticiones realizadas
4. THE WorkoutSummary SHALL mostrar la duración total del entrenamiento
5. THE WorkoutSummary SHALL calcular y mostrar el promedio de repeticiones por serie
6. THE WorkoutSummary SHALL mostrar un desglose por ejercicio con volumen individual
7. FOR ALL ejercicios, THE WorkoutSummary SHALL mostrar series completadas y repeticiones por serie

### Requirement 5: Persistencia de Estadísticas

**User Story:** Como usuario, quiero que mis estadísticas se guarden con la sesión, para poder revisar mi rendimiento histórico.

#### Acceptance Criteria

1. WHEN el usuario finaliza el entrenamiento, THE Sistema_Indicadores SHALL incluir el volumen total en los datos guardados
2. THE Sistema_Indicadores SHALL guardar las repeticiones reales de cada serie
3. THE Sistema_Indicadores SHALL guardar los pesos reales de cada serie
4. THE Sistema_Indicadores SHALL guardar el número de series completadas por ejercicio
5. WHEN el usuario cancela el entrenamiento, THE Sistema_Indicadores SHALL descartar todas las estadísticas sin guardar

### Requirement 6: Responsividad y Diseño Visual

**User Story:** Como usuario en dispositivo móvil, quiero que los indicadores sean legibles y atractivos, para tener una buena experiencia visual durante el entrenamiento.

#### Acceptance Criteria

1. THE LiveStatsPanel SHALL usar fuentes de tamaño 2xl (24px) o mayor para los números en móvil
2. THE LiveStatsPanel SHALL usar fuentes de tamaño 3xl (30px) o mayor para los números en desktop
3. THE LiveStatsPanel SHALL usar fuentes tabular-nums para alineación consistente de números
4. THE LiveStatsPanel SHALL usar colores distintivos para cada métrica (azul para volumen, verde para series, púrpura para repeticiones)
5. THE LiveStatsPanel SHALL tener bordes y fondos con gradientes sutiles
6. THE LiveStatsPanel SHALL adaptar el tamaño de texto entre móvil y desktop usando clases responsive

### Requirement 7: Rendimiento y Optimización

**User Story:** Como usuario, quiero que los indicadores se actualicen sin causar lag o retrasos, para mantener una experiencia fluida durante el entrenamiento.

#### Acceptance Criteria

1. THE Sistema_Indicadores SHALL usar React.useMemo para calcular estadísticas
2. THE Sistema_Indicadores SHALL recalcular estadísticas solo cuando cambien completedSets, actualReps o actualWeights
3. THE LiveStatsPanel SHALL renderizar en menos de 16 milisegundos (60 FPS)
4. THE Sistema_Indicadores SHALL evitar re-renders innecesarios del LiveStatsPanel
5. WHEN hay más de 10 ejercicios, THE Sistema_Indicadores SHALL mantener el tiempo de cálculo bajo 50 milisegundos

### Requirement 8: Inicialización y Estado Inicial

**User Story:** Como usuario que inicia un entrenamiento, quiero ver los indicadores desde el principio en cero, para tener claridad del punto de partida.

#### Acceptance Criteria

1. WHEN el usuario inicia un nuevo entrenamiento, THE LiveStatsPanel SHALL mostrar todas las estadísticas en cero
2. WHEN el usuario restaura un entrenamiento guardado, THE LiveStatsPanel SHALL mostrar las estadísticas del progreso guardado
3. THE LiveStatsPanel SHALL ser visible inmediatamente al cargar la página de entrenamiento
4. THE Sistema_Indicadores SHALL inicializar correctamente incluso si no hay ejercicios completados

### Requirement 9: Accesibilidad de Información

**User Story:** Como usuario, quiero que las etiquetas de las estadísticas sean claras, para entender qué representa cada número sin confusión.

#### Acceptance Criteria

1. THE LiveStatsPanel SHALL mostrar la etiqueta "kg levantados" debajo del volumen total
2. THE LiveStatsPanel SHALL mostrar la etiqueta "series" debajo del contador de series
3. THE LiveStatsPanel SHALL mostrar la etiqueta "repeticiones" debajo del contador de repeticiones
4. THE LiveStatsPanel SHALL usar tamaño de fuente xs (12px) o sm (14px) para las etiquetas
5. THE LiveStatsPanel SHALL usar colores de texto con suficiente contraste para legibilidad

### Requirement 10: Integración con Estado del Workout

**User Story:** Como desarrollador, quiero que los indicadores usen el estado centralizado del workout, para mantener consistencia y evitar duplicación de lógica.

#### Acceptance Criteria

1. THE LiveStatsPanel SHALL recibir completedSets desde useWorkoutState
2. THE LiveStatsPanel SHALL recibir actualReps desde useWorkoutState
3. THE LiveStatsPanel SHALL recibir actualWeights desde useWorkoutState
4. THE LiveStatsPanel SHALL recibir la lista de exercises desde la rutina
5. THE Sistema_Indicadores SHALL sincronizar automáticamente con cambios en useWorkoutState
6. THE LiveStatsPanel SHALL ser un componente controlado sin estado interno de estadísticas
