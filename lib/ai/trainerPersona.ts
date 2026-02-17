// Persona de entrenador — respuestas y reglas enriquecidas
import { WorkoutSession } from '@/types';
import { EXERCISE_DATABASE } from '@/data/exercises';

export type TrainerLevel = 'novato' | 'intermedio' | 'avanzado';

function formatMinutes(seconds?: number) {
  if (!seconds) return '0';
  return Math.round(seconds / 60).toString();
}

function sampleWeekPlan(level: TrainerLevel) {
  if (level === 'novato') {
    return `Ejemplo (Semana - Novato):
Lunes - Full Body: Sentadillas 3x8-10, Press banca 3x8-10, Remo 3x8-10
Miércoles - Full Body: Peso muerto 3x5-8, Press militar 3x8, Pull-ups asistidas 3x6-8
Viernes - Full Body: Sentadillas 3x8-10, Fondos asistidos 3x8-10, Peso muerto rumano 3x8`;
  }
  if (level === 'intermedio') {
    return `Ejemplo (Semana - Intermedio):
Lunes - Upper (Compuesto): Press banca 4x6-8, Remo 4x6-8, Press militar 3x8
Martes - Lower (Fuerza/Hip): Sentadillas 4x5, Peso muerto parcial 3x4-6
Jueves - Upper (Aux): Pull-ups 4x6-10, Fondos 3x8-12, Curl 3x10
Viernes - Lower (Hipertrofia): Sentadillas 3x8-12, Zancadas 3x8-12`;
  }
  return `Ejemplo (Semana - Avanzado):
Lunes - Fuerza (Baja rep): Sentadilla 5x3-5, Accesorios 3x6-8
Martes - Hipertrofia Push: Press banca 4x6-10, Dips 3x8-12
Jueves - Fuerza Pull: Peso muerto 4x3-5, Remo 4x6-8
Viernes - Hipertrofia Legs: Sentadilla frontal 4x6-10, Gemelos 4x10-15`;
}

export function getTrainerReply(message: string, level: TrainerLevel, sessions: WorkoutSession[]): string | null {
  const lower = (message || '').toLowerCase();

  // RUTINAS / PLANES
  if (lower.includes('rutina') || lower.includes('programa') || lower.includes('plan')) {
    return `${sampleWeekPlan(level)}\n\nConsejo: empieza controlando técnica y añade 2.5-5% de carga cada 1-2 semanas si completas todas las series con buena forma.`;
  }

  // PROGRESIÓN / PR
  if (lower.includes('progres') || lower.includes('pr') || lower.includes('aument') || lower.includes('mejora')) {
    const total = sessions?.length || 0;
    if (total === 0) return 'No tengo registros tuyos para analizar progresión. Guarda tus sesiones para recibir un análisis más preciso.';
    const recent = sessions.slice(-6);
    const avgMin = formatMinutes(Math.round(recent.reduce((s, x) => s + (x.totalDuration || 0), 0) / Math.max(1, recent.length)));
    return `Veo ${total} sesiones registradas. Últimas ${recent.length}: duración promedio ~${avgMin} min.\n\nProgresión sugerida: 1) Prioriza consistencia 2) Incrementos pequeños (2.5-5%) 3) Periodiza cada 4-8 semanas (microciclos de carga).`;
  }

  // CALENTAMIENTO
  if (lower.includes('calentam') || lower.includes('warmup') || lower.includes('preparaci')) {
    return 'Calentamiento general: 5-10 min cardio ligero (bicicleta/caminata) + movilidad articular.\nCalentamiento específico: 2 series progresivas con poco peso (10-15 reps) del primer ejercicio principal.\nEjemplo: si vas a sentadillas, haz 2 series de 10 rep con barra vacía / peso ligero antes del trabajo.';
  }

  // NUTRICIÓN
  if (lower.includes('nutric') || lower.includes('proteina') || lower.includes('carbo')) {
    return 'Nutrición (resumen):\n• Objetivo hipertrofia: superávit pequeño (+200-300 kcal)\n• Proteína: 1.6-2.2 g/kg/día\n• Carbohidratos: fuente principal pre/post entreno para rendimiento\n• Grasa: 20-30% calorías totales\n• Hidratación y sueño son claves para recuperación.';
  }

  // RECUPERACIÓN / SUEÑO / DELOAD
  if (lower.includes('recuper') || lower.includes('descanso') || lower.includes('deload')) {
    return 'Recuperación: duerme 7-9h, prioriza proteína en cada comida, y programa semanas de descarga (deload) cada 4-8 semanas reduciendo volumen/intensidad 40-60% para permitir adaptación.';
  }

  // VOLUMEN E INTENSIDAD
  if (lower.includes('volumen') || lower.includes('intensidad') || lower.includes('series') || lower.includes('reps')) {
    return 'Volumen vs Intensidad:\n• Fuerza: 3-6 sets por grupo mayor, rep ranges 3-5 (mayor intensidad)\n• Hipertrofia: 8-20 sets semanales por grupo, rep ranges 6-12\n• Resistencia muscular: 12-20+ reps\nDescanso entre series: 2-3 min (fuerza), 60-90s (hipertrofia).';
  }

  // CONSEJOS TÉCNICOS POR EJERCICIO (BUSCAR EN DB)
  for (const ex of EXERCISE_DATABASE) {
    if (!ex?.name) continue;
    if (lower.includes(ex.name.toLowerCase())) {
      const cues = ex.cues || ex.description || 'Mantén control del movimiento, respira y evita rebotes.';
      return `Técnica - ${ex.name}: ${cues}`;
    }
  }

  // SUPLEMENTOS BÁSICOS
  if (lower.includes('suplement') || lower.includes('creatina') || lower.includes('whey')) {
    return 'Suplementos (básico): la creatina monohidrato (3-5g/día) tiene buena evidencia para fuerza/músculo. Proteína en polvo puede ayudar a llegar a requerimiento proteico. Consulta con profesional para casos especiales.';
  }

  // EJEMPLO PRÁCTICO / TEMPLATE DE SESIÓN
  if (lower.includes('ejemplo') || lower.includes('plantilla') || lower.includes('template')) {
    return 'Plantilla sesión (hipertrofia):\n1. Calentamiento 5-10 min y movilidad\n2. Ejercicio compuesto principal 3-4x6-10\n3. Ejercicio compuesto secundario 3x8-12\n4. 1-2 ejercicios accesorios 3x10-15\n5. Enfriamiento y estiramiento ligero';
  }

  // Si no aplican reglas, devolver null para que el asistente general responda
  return null;
}
