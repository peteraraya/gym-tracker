/**
 * Glosario de términos de fitness y entrenamiento
 */

export type GlossaryCategory = 
  | 'basicos'
  | 'metricas'
  | 'entrenamiento'
  | 'tecnicas'
  | 'anatomia'
  | 'nutricion';

export interface GlossaryTerm {
  id: string;
  term: string;
  category: GlossaryCategory;
  definition: string;
  example?: string;
  relatedTerms?: string[];
  icon?: string;
}

export const GLOSSARY_CATEGORIES: Record<GlossaryCategory, { label: string; icon: string; color: string }> = {
  basicos: {
    label: 'Conceptos Básicos',
    icon: '📚',
    color: 'from-blue-500 to-cyan-500'
  },
  metricas: {
    label: 'Métricas y Mediciones',
    icon: '📊',
    color: 'from-purple-500 to-pink-500'
  },
  entrenamiento: {
    label: 'Tipos de Entrenamiento',
    icon: '💪',
    color: 'from-green-500 to-emerald-500'
  },
  tecnicas: {
    label: 'Técnicas Avanzadas',
    icon: '🔥',
    color: 'from-orange-500 to-red-500'
  },
  anatomia: {
    label: 'Anatomía y Músculos',
    icon: '🦴',
    color: 'from-indigo-500 to-purple-500'
  },
  nutricion: {
    label: 'Nutrición',
    icon: '🥗',
    color: 'from-amber-500 to-orange-500'
  }
};

export const glossaryTerms: GlossaryTerm[] = [
  // CONCEPTOS BÁSICOS
  {
    id: 'serie',
    term: 'Serie',
    category: 'basicos',
    definition: 'Un grupo de repeticiones consecutivas de un ejercicio. Por ejemplo, si haces 10 flexiones, descansas, y luego haces otras 10, has completado 2 series de 10 repeticiones.',
    example: '3 series de 10 repeticiones = hacer el ejercicio 10 veces, descansar, repetir 2 veces más',
    relatedTerms: ['repeticion', 'descanso', 'volumen'],
    icon: '🔢'
  },
  {
    id: 'repeticion',
    term: 'Repetición (Rep)',
    category: 'basicos',
    definition: 'Una ejecución completa de un ejercicio, desde la posición inicial hasta el final del movimiento y de vuelta. También llamada "rep".',
    example: 'En una flexión: bajar hasta el suelo y volver a subir = 1 repetición',
    relatedTerms: ['serie', 'rango-reps'],
    icon: '🔁'
  },
  {
    id: 'descanso',
    term: 'Descanso',
    category: 'basicos',
    definition: 'El tiempo de recuperación entre series o ejercicios. Permite que los músculos se recuperen parcialmente antes de la siguiente serie.',
    example: 'Descanso típico: 60-90 segundos para hipertrofia, 2-5 minutos para fuerza máxima',
    relatedTerms: ['serie', 'recuperacion'],
    icon: '⏱️'
  },
  {
    id: 'rango-reps',
    term: 'Rango de Repeticiones',
    category: 'basicos',
    definition: 'El número de repeticiones realizadas en una serie, que determina el tipo de adaptación muscular.',
    example: '1-5 reps = fuerza, 6-12 reps = hipertrofia, 12-20+ reps = resistencia',
    relatedTerms: ['repeticion', 'hipertrofia', 'fuerza'],
    icon: '📈'
  },
  {
    id: 'calentamiento',
    term: 'Calentamiento',
    category: 'basicos',
    definition: 'Actividad física ligera realizada antes del entrenamiento para preparar el cuerpo, aumentar la temperatura corporal y reducir el riesgo de lesiones.',
    example: '5-10 minutos de cardio ligero + movilidad articular + series de calentamiento con peso ligero',
    relatedTerms: ['movilidad', 'recuperacion'],
    icon: '🔥'
  },
  {
    id: 'enfriamiento',
    term: 'Enfriamiento',
    category: 'basicos',
    definition: 'Actividad ligera al final del entrenamiento para reducir gradualmente la frecuencia cardíaca y ayudar en la recuperación.',
    example: 'Estiramientos estáticos, caminata ligera, foam rolling',
    relatedTerms: ['recuperacion', 'estiramiento'],
    icon: '❄️'
  },
  {
    id: 'forma',
    term: 'Forma / Técnica',
    category: 'basicos',
    definition: 'La manera correcta de ejecutar un ejercicio para maximizar resultados y minimizar riesgo de lesiones.',
    example: 'En sentadillas: espalda recta, rodillas alineadas con pies, bajar hasta paralelo',
    relatedTerms: ['rango-movimiento'],
    icon: '✅'
  },
  {
    id: 'rango-movimiento',
    term: 'Rango de Movimiento (ROM)',
    category: 'basicos',
    definition: 'La distancia completa que una articulación puede moverse durante un ejercicio. ROM completo generalmente produce mejores resultados.',
    example: 'En press de banca: bajar la barra hasta el pecho (ROM completo) vs. media repetición',
    relatedTerms: ['forma'],
    icon: '↔️'
  },

  // MÉTRICAS Y MEDICIONES
  {
    id: '1rm',
    term: '1RM (Una Repetición Máxima)',
    category: 'metricas',
    definition: 'El peso máximo que puedes levantar para una sola repetición con buena técnica. Se usa como referencia para calcular pesos de entrenamiento.',
    example: 'Si tu 1RM en press banca es 100kg, entrenar al 80% = 80kg',
    relatedTerms: ['rpe', 'rir', 'fuerza'],
    icon: '🏋️'
  },
  {
    id: 'rpe',
    term: 'RPE (Rate of Perceived Exertion)',
    category: 'metricas',
    definition: 'Escala del 1-10 que mide qué tan difícil se sintió una serie. 10 = máximo esfuerzo, fallo muscular.',
    example: 'RPE 7 = podrías hacer 3 reps más, RPE 9 = solo 1 rep más, RPE 10 = fallo',
    relatedTerms: ['rir', '1rm', 'intensidad'],
    icon: '📊'
  },
  {
    id: 'rir',
    term: 'RIR (Reps in Reserve)',
    category: 'metricas',
    definition: 'Número de repeticiones que podrías hacer antes de llegar al fallo muscular. Es otra forma de medir intensidad.',
    example: 'RIR 2 = podrías hacer 2 reps más, RIR 0 = fallo muscular',
    relatedTerms: ['rpe', 'fallo-muscular'],
    icon: '🎯'
  },
  {
    id: 'volumen',
    term: 'Volumen de Entrenamiento',
    category: 'metricas',
    definition: 'La cantidad total de trabajo realizado, típicamente calculado como series × repeticiones × peso.',
    example: '3 series × 10 reps × 50kg = 1,500kg de volumen total',
    relatedTerms: ['serie', 'intensidad', 'frecuencia'],
    icon: '📦'
  },
  {
    id: 'intensidad',
    term: 'Intensidad',
    category: 'metricas',
    definition: 'Qué tan pesado es el peso usado, generalmente expresado como porcentaje del 1RM o por RPE/RIR.',
    example: 'Alta intensidad = 85-100% 1RM, Moderada = 70-85%, Baja = <70%',
    relatedTerms: ['1rm', 'rpe', 'volumen'],
    icon: '⚡'
  },
  {
    id: 'frecuencia',
    term: 'Frecuencia',
    category: 'metricas',
    definition: 'Cuántas veces entrenas un músculo o ejercicio por semana.',
    example: 'Frecuencia 2x = entrenar pecho 2 veces por semana',
    relatedTerms: ['volumen', 'recuperacion'],
    icon: '📅'
  },
  {
    id: 'ffmi',
    term: 'FFMI (Fat-Free Mass Index)',
    category: 'metricas',
    definition: 'Índice que mide tu masa muscular relativa a tu altura. Útil para evaluar desarrollo muscular independiente de la grasa corporal.',
    example: 'FFMI 20-22 = buen desarrollo muscular natural, >25 = excepcional',
    relatedTerms: ['imc', 'composicion-corporal'],
    icon: '💪'
  },
  {
    id: 'imc',
    term: 'IMC (Índice de Masa Corporal)',
    category: 'metricas',
    definition: 'Medida que relaciona peso y altura (peso/altura²). Útil como referencia general pero no considera composición corporal.',
    example: 'IMC 18.5-25 = normal, pero un atleta musculoso puede tener IMC alto',
    relatedTerms: ['ffmi', 'composicion-corporal'],
    icon: '⚖️'
  },

  // TIPOS DE ENTRENAMIENTO
  {
    id: 'hipertrofia',
    term: 'Hipertrofia',
    category: 'entrenamiento',
    definition: 'Aumento del tamaño muscular. El objetivo principal del culturismo y entrenamiento estético.',
    example: 'Entrenamiento típico: 3-5 series, 6-12 reps, 60-90s descanso, volumen moderado-alto',
    relatedTerms: ['volumen', 'rango-reps', 'fuerza'],
    icon: '💪'
  },
  {
    id: 'fuerza',
    term: 'Entrenamiento de Fuerza',
    category: 'entrenamiento',
    definition: 'Entrenamiento enfocado en aumentar la capacidad de generar fuerza máxima, no necesariamente tamaño muscular.',
    example: 'Típico: 3-6 series, 1-6 reps, peso alto (85-100% 1RM), descanso largo (3-5 min)',
    relatedTerms: ['1rm', 'intensidad', 'hipertrofia'],
    icon: '🏋️'
  },
  {
    id: 'resistencia',
    term: 'Resistencia Muscular',
    category: 'entrenamiento',
    definition: 'Capacidad de un músculo para realizar contracciones repetidas durante un período prolongado.',
    example: 'Entrenamiento: 2-3 series, 15-20+ reps, peso ligero, descanso corto (30-60s)',
    relatedTerms: ['rango-reps', 'cardio'],
    icon: '🏃'
  },
  {
    id: 'potencia',
    term: 'Potencia',
    category: 'entrenamiento',
    definition: 'Capacidad de generar fuerza rápidamente. Importante para deportes explosivos.',
    example: 'Ejercicios: saltos, lanzamientos, levantamientos olímpicos, sprints',
    relatedTerms: ['fuerza', 'pliometria'],
    icon: '💥'
  },
  {
    id: 'cardio',
    term: 'Cardio / Aeróbico',
    category: 'entrenamiento',
    definition: 'Ejercicio que aumenta la frecuencia cardíaca de forma sostenida, mejorando la salud cardiovascular.',
    example: 'Correr, nadar, ciclismo, remo. LISS (baja intensidad) o HIIT (alta intensidad)',
    relatedTerms: ['hiit', 'resistencia'],
    icon: '❤️'
  },
  {
    id: 'hiit',
    term: 'HIIT (High-Intensity Interval Training)',
    category: 'entrenamiento',
    definition: 'Entrenamiento de intervalos alternando períodos cortos de alta intensidad con recuperación.',
    example: '30 segundos sprint + 30 segundos descanso, repetir 10-20 veces',
    relatedTerms: ['cardio', 'tabata'],
    icon: '🔥'
  },
  {
    id: 'compuesto',
    term: 'Ejercicio Compuesto',
    category: 'entrenamiento',
    definition: 'Ejercicio que trabaja múltiples grupos musculares y articulaciones simultáneamente.',
    example: 'Sentadilla (piernas, core, espalda), Press banca (pecho, hombros, tríceps)',
    relatedTerms: ['aislamiento', 'ejercicio-basico'],
    icon: '🏗️'
  },
  {
    id: 'aislamiento',
    term: 'Ejercicio de Aislamiento',
    category: 'entrenamiento',
    definition: 'Ejercicio que enfoca el trabajo en un solo músculo o grupo muscular.',
    example: 'Curl de bíceps, extensiones de tríceps, elevaciones laterales',
    relatedTerms: ['compuesto'],
    icon: '🎯'
  },
  {
    id: 'ejercicio-basico',
    term: 'Ejercicios Básicos',
    category: 'entrenamiento',
    definition: 'Los ejercicios fundamentales compuestos que forman la base de cualquier programa: sentadilla, peso muerto, press banca, press militar.',
    example: 'Los "Big 4": Sentadilla, Peso Muerto, Press Banca, Press Militar',
    relatedTerms: ['compuesto', 'fuerza'],
    icon: '⭐'
  },

  // TÉCNICAS AVANZADAS
  {
    id: 'superserie',
    term: 'Superserie',
    category: 'tecnicas',
    definition: 'Realizar dos ejercicios consecutivos sin descanso entre ellos. Aumenta intensidad y ahorra tiempo.',
    example: 'Press banca + Remo con barra (músculos antagonistas) o Curl bíceps + Curl martillo (mismo músculo)',
    relatedTerms: ['triserie', 'circuito'],
    icon: '⚡'
  },
  {
    id: 'triserie',
    term: 'Triserie',
    category: 'tecnicas',
    definition: 'Tres ejercicios realizados consecutivamente sin descanso.',
    example: 'Press banca + Aperturas + Flexiones (para pecho)',
    relatedTerms: ['superserie', 'circuito'],
    icon: '🔥'
  },
  {
    id: 'drop-set',
    term: 'Drop Set (Serie Descendente)',
    category: 'tecnicas',
    definition: 'Realizar una serie hasta el fallo, reducir el peso inmediatamente y continuar hasta el fallo nuevamente.',
    example: 'Curl bíceps: 15kg hasta fallo → 10kg hasta fallo → 7.5kg hasta fallo',
    relatedTerms: ['fallo-muscular', 'intensidad'],
    icon: '📉'
  },
  {
    id: 'rest-pause',
    term: 'Rest-Pause',
    category: 'tecnicas',
    definition: 'Realizar una serie hasta el fallo, descansar 10-15 segundos, y continuar con el mismo peso.',
    example: '10 reps hasta fallo → pausa 15s → 3 reps más → pausa 15s → 2 reps más',
    relatedTerms: ['fallo-muscular', 'intensidad'],
    icon: '⏸️'
  },
  {
    id: 'tempo',
    term: 'Tempo',
    category: 'tecnicas',
    definition: 'La velocidad de ejecución de cada fase del ejercicio, expresada en segundos (excéntrica-pausa-concéntrica-pausa).',
    example: 'Tempo 3-1-1-0 = 3s bajar, 1s pausa, 1s subir, sin pausa arriba',
    relatedTerms: ['tut', 'excentrica', 'concentrica'],
    icon: '⏱️'
  },
  {
    id: 'tut',
    term: 'TUT (Time Under Tension)',
    category: 'tecnicas',
    definition: 'Tiempo total que el músculo está bajo tensión durante una serie. Mayor TUT puede aumentar hipertrofia.',
    example: '10 reps × 4 segundos por rep = 40 segundos TUT',
    relatedTerms: ['tempo', 'hipertrofia'],
    icon: '⏳'
  },
  {
    id: 'fallo-muscular',
    term: 'Fallo Muscular',
    category: 'tecnicas',
    definition: 'El punto en el que no puedes completar otra repetición con buena técnica.',
    example: 'Entrenar al fallo ocasionalmente puede ser útil, pero no en todas las series',
    relatedTerms: ['rpe', 'rir', 'drop-set'],
    icon: '🚫'
  },
  {
    id: 'pliometria',
    term: 'Pliometría',
    category: 'tecnicas',
    definition: 'Ejercicios explosivos que utilizan el ciclo de estiramiento-acortamiento para desarrollar potencia.',
    example: 'Saltos al cajón, flexiones con palmada, saltos de profundidad',
    relatedTerms: ['potencia', 'explosividad'],
    icon: '💥'
  },
  {
    id: 'periodizacion',
    term: 'Periodización',
    category: 'tecnicas',
    definition: 'Planificación sistemática del entrenamiento en ciclos para optimizar adaptaciones y prevenir estancamiento.',
    example: 'Mesociclo 1: hipertrofia (8-12 reps) → Mesociclo 2: fuerza (3-6 reps)',
    relatedTerms: ['progresion', 'mesociclo'],
    icon: '📆'
  },
  {
    id: 'progresion',
    term: 'Sobrecarga Progresiva',
    category: 'tecnicas',
    definition: 'Aumentar gradualmente el estrés en el músculo (peso, reps, series, frecuencia) para continuar progresando.',
    example: 'Semana 1: 50kg×10, Semana 2: 50kg×11, Semana 3: 52.5kg×10',
    relatedTerms: ['periodizacion', 'volumen'],
    icon: '📈'
  },

  // ANATOMÍA Y MÚSCULOS
  {
    id: 'excentrica',
    term: 'Fase Excéntrica',
    category: 'anatomia',
    definition: 'La fase de alargamiento del músculo bajo tensión. Generalmente la fase de "bajar" el peso.',
    example: 'En press banca: bajar la barra al pecho. En sentadilla: bajar',
    relatedTerms: ['concentrica', 'tempo'],
    icon: '⬇️'
  },
  {
    id: 'concentrica',
    term: 'Fase Concéntrica',
    category: 'anatomia',
    definition: 'La fase de acortamiento del músculo bajo tensión. Generalmente la fase de "subir" el peso.',
    example: 'En press banca: empujar la barra hacia arriba. En sentadilla: subir',
    relatedTerms: ['excentrica', 'tempo'],
    icon: '⬆️'
  },
  {
    id: 'core',
    term: 'Core',
    category: 'anatomia',
    definition: 'El conjunto de músculos del tronco que estabilizan la columna: abdominales, oblicuos, lumbares, suelo pélvico.',
    example: 'Ejercicios: plancha, dead bug, pallof press, bird dog',
    relatedTerms: ['estabilidad'],
    icon: '🎯'
  },
  {
    id: 'antagonista',
    term: 'Músculos Antagonistas',
    category: 'anatomia',
    definition: 'Músculos que realizan acciones opuestas. Cuando uno se contrae, el otro se relaja.',
    example: 'Bíceps (flexión) y Tríceps (extensión), Pecho (empuje) y Espalda (tirón)',
    relatedTerms: ['superserie'],
    icon: '↔️'
  },
  {
    id: 'estabilizador',
    term: 'Músculos Estabilizadores',
    category: 'anatomia',
    definition: 'Músculos que mantienen la postura y estabilidad durante un ejercicio, aunque no sean el objetivo principal.',
    example: 'En sentadilla: core y erectores espinales estabilizan mientras piernas empujan',
    relatedTerms: ['core', 'compuesto'],
    icon: '⚖️'
  },

  // NUTRICIÓN
  {
    id: 'deficit-calorico',
    term: 'Déficit Calórico',
    category: 'nutricion',
    definition: 'Consumir menos calorías de las que gastas. Necesario para perder grasa corporal.',
    example: 'TDEE 2500 kcal - consumir 2000 kcal = déficit de 500 kcal/día',
    relatedTerms: ['superavit-calorico', 'tdee'],
    icon: '📉'
  },
  {
    id: 'superavit-calorico',
    term: 'Superávit Calórico',
    category: 'nutricion',
    definition: 'Consumir más calorías de las que gastas. Necesario para ganar masa muscular.',
    example: 'TDEE 2500 kcal - consumir 2800 kcal = superávit de 300 kcal/día',
    relatedTerms: ['deficit-calorico', 'tdee', 'volumen-nutricional'],
    icon: '📈'
  },
  {
    id: 'tdee',
    term: 'TDEE (Total Daily Energy Expenditure)',
    category: 'nutricion',
    definition: 'Total de calorías que quemas en un día, incluyendo metabolismo basal, actividad y ejercicio.',
    example: 'BMR 1800 + actividad diaria 500 + ejercicio 200 = TDEE 2500 kcal',
    relatedTerms: ['bmr', 'deficit-calorico', 'superavit-calorico'],
    icon: '🔥'
  },
  {
    id: 'bmr',
    term: 'BMR (Basal Metabolic Rate)',
    category: 'nutricion',
    definition: 'Calorías que tu cuerpo quema en reposo para funciones vitales básicas.',
    example: 'Calculado con fórmulas como Mifflin-St Jeor basadas en peso, altura, edad, sexo',
    relatedTerms: ['tdee'],
    icon: '💤'
  },
  {
    id: 'proteina',
    term: 'Proteína',
    category: 'nutricion',
    definition: 'Macronutriente esencial para construir y reparar tejido muscular. Recomendado: 1.6-2.2g por kg de peso corporal.',
    example: 'Persona de 75kg: 120-165g de proteína al día para hipertrofia',
    relatedTerms: ['macros', 'hipertrofia'],
    icon: '🥩'
  },
  {
    id: 'macros',
    term: 'Macronutrientes (Macros)',
    category: 'nutricion',
    definition: 'Los tres nutrientes principales: proteínas (4 kcal/g), carbohidratos (4 kcal/g), grasas (9 kcal/g).',
    example: 'Distribución típica: 30% proteína, 40% carbos, 30% grasas',
    relatedTerms: ['proteina', 'tdee'],
    icon: '🍽️'
  },
  {
    id: 'volumen-nutricional',
    term: 'Volumen (Bulking)',
    category: 'nutricion',
    definition: 'Fase de superávit calórico para ganar masa muscular, aceptando algo de grasa.',
    example: 'Superávit de 300-500 kcal/día, alta proteína, entrenamiento intenso',
    relatedTerms: ['superavit-calorico', 'definicion'],
    icon: '💪'
  },
  {
    id: 'definicion',
    term: 'Definición (Cutting)',
    category: 'nutricion',
    definition: 'Fase de déficit calórico para perder grasa mientras se mantiene músculo.',
    example: 'Déficit de 300-500 kcal/día, proteína alta, mantener intensidad de entrenamiento',
    relatedTerms: ['deficit-calorico', 'volumen-nutricional'],
    icon: '✂️'
  },
  {
    id: 'ventana-anabolica',
    term: 'Ventana Anabólica',
    category: 'nutricion',
    definition: 'Período post-entrenamiento donde se creía que la síntesis proteica era máxima. Investigación reciente muestra que es menos crítica de lo que se pensaba.',
    example: 'Antes: "debes comer proteína en 30 min". Ahora: la ingesta total diaria es más importante',
    relatedTerms: ['proteina', 'recuperacion'],
    icon: '⏰'
  },

  // OTROS CONCEPTOS
  {
    id: 'recuperacion',
    term: 'Recuperación',
    category: 'basicos',
    definition: 'El proceso de reparación y adaptación muscular que ocurre entre entrenamientos. Tan importante como el entrenamiento mismo.',
    example: 'Incluye: sueño adecuado (7-9h), nutrición, días de descanso, manejo de estrés',
    relatedTerms: ['descanso', 'frecuencia', 'sobreentrenamiento'],
    icon: '😴'
  },
  {
    id: 'sobreentrenamiento',
    term: 'Sobreentrenamiento',
    category: 'basicos',
    definition: 'Estado de fatiga crónica causado por entrenar demasiado sin recuperación adecuada.',
    example: 'Síntomas: fatiga persistente, bajo rendimiento, irritabilidad, lesiones frecuentes',
    relatedTerms: ['recuperacion', 'frecuencia'],
    icon: '⚠️'
  },
  {
    id: 'doms',
    term: 'DOMS (Delayed Onset Muscle Soreness)',
    category: 'basicos',
    definition: 'Dolor muscular que aparece 24-72 horas después del ejercicio, especialmente con movimientos nuevos o excéntricos.',
    example: 'Normal después de entrenar nuevo o intenso. No es indicador de buen entrenamiento.',
    relatedTerms: ['excentrica', 'recuperacion'],
    icon: '😣'
  },
  {
    id: 'movilidad',
    term: 'Movilidad',
    category: 'basicos',
    definition: 'La capacidad de mover una articulación activamente a través de su rango completo de movimiento.',
    example: 'Ejercicios: rotaciones de cadera, dislocaciones de hombro, sentadilla profunda',
    relatedTerms: ['flexibilidad', 'calentamiento'],
    icon: '🤸'
  },
  {
    id: 'flexibilidad',
    term: 'Flexibilidad',
    category: 'basicos',
    definition: 'La capacidad de un músculo para estirarse pasivamente. Diferente de movilidad (activa).',
    example: 'Estiramientos estáticos después del entrenamiento',
    relatedTerms: ['movilidad', 'enfriamiento'],
    icon: '🧘'
  }
];

// Función helper para buscar términos
export function searchTerms(query: string): GlossaryTerm[] {
  const lowerQuery = query.toLowerCase();
  return glossaryTerms.filter(term =>
    term.term.toLowerCase().includes(lowerQuery) ||
    term.definition.toLowerCase().includes(lowerQuery) ||
    term.example?.toLowerCase().includes(lowerQuery)
  );
}

// Función helper para obtener términos por categoría
export function getTermsByCategory(category: GlossaryCategory): GlossaryTerm[] {
  return glossaryTerms.filter(term => term.category === category);
}

// Función helper para obtener término por ID
export function getTermById(id: string): GlossaryTerm | undefined {
  return glossaryTerms.find(term => term.id === id);
}
