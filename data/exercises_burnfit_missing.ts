import type { ExerciseTemplate } from './exercises';

export const BURNFIT_MISSING: ExerciseTemplate[] = [
  {
    id: 'back-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'back-squat.gif'
  },
  {
    id: 'conventional-deadlift',
    name: "Peso Muerto",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'conventional-deadlift.gif'
  },
  {
    id: 'barbell-bench-press',
    name: "Press de Banca (Barra)",
    muscleGroup: 'pecho',
    equipment: "Barra",
    defaultSets: 4,
    defaultReps: 8,
    image: 'barbell-bench-press.gif'
  },
  {
    id: 'barbell-incline-bench-press',
    name: "Press Inclinado",
    muscleGroup: 'pecho',
    equipment: "Barra",
    defaultSets: 4,
    defaultReps: 8,
    image: 'barbell-incline-bench-press.gif'
  },
  {
    id: 'dumbbell-fly',
    name: "Aperturas con Mancuernas",
    muscleGroup: 'pecho',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'dumbbell-fly.gif'
  },
  {
    id: 'lat-pull-down',
    name: "Jalón al Pecho",
    muscleGroup: 'espalda',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'lat-pull-down.gif'
  },
  {
    id: 'dumbbell-shoulder-press',
    name: "Press de Hombros",
    muscleGroup: 'hombros',
    equipment: "Mancuernas",
    defaultSets: 4,
    defaultReps: 8,
    image: 'dumbbell-shoulder-press.gif'
  },
  {
    id: 'dumbbell-lateral-raise',
    name: "Mancuernas Lateral Elevación (Mancuernas)",
    muscleGroup: 'hombros',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'dumbbell-lateral-raise.gif'
  },
  {
    id: 'dumbbell-front-raise',
    name: "Mancuernas Frontal Elevación (Mancuernas)",
    muscleGroup: 'hombros',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'dumbbell-front-raise.gif'
  },
  {
    id: 'dumbbell-shrug',
    name: "Mancuernas Encogimiento (Mancuernas)",
    muscleGroup: 'hombros',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'dumbbell-shrug.gif'
  },
  {
    id: 'barbell-bicep-curl',
    name: "Curl de Bíceps",
    muscleGroup: 'biceps',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'barbell-bicep-curl.gif'
  },
  {
    id: 'dumbbell-bicep-curl',
    name: "Curl de Bíceps",
    muscleGroup: 'biceps',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'dumbbell-bicep-curl.gif'
  },
  {
    id: 'dumbbell-tricep-extension',
    name: "Extensión de Tríceps",
    muscleGroup: 'triceps',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'dumbbell-tricep-extension.gif'
  },
  {
    id: 'dumbbell-kickback',
    name: "Mancuernas Kickback (Mancuernas)",
    muscleGroup: 'gluteos',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'dumbbell-kickback.gif'
  },
  {
    id: 'dumbbell-wrist-curl',
    name: "Mancuernas Wrist Curl (Mancuernas)",
    muscleGroup: 'biceps',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'dumbbell-wrist-curl.gif'
  },
  {
    id: 'clean',
    name: "Clean",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'clean.gif'
  },
  {
    id: 'clean-jerk',
    name: "Clean Jerk",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'clean-jerk.gif'
  },
  {
    id: 'jerk',
    name: "Jerk",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'jerk.gif'
  },
  {
    id: 'snatch',
    name: "Snatch",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'snatch.gif'
  },
  {
    id: 'barbell-overhead-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Barra",
    defaultSets: 4,
    defaultReps: 8,
    image: 'barbell-overhead-squat.gif'
  },
  {
    id: 'sit-up',
    name: "Sit Up",
    muscleGroup: 'core',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'sit-up.gif'
  },
  {
    id: 'leg-raise',
    name: "Elevación de Piernas",
    muscleGroup: 'core',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'leg-raise.gif'
  },
  {
    id: 'burpee',
    name: "Burpee",
    muscleGroup: 'cardio',
    equipment: "Peso corporal",
    defaultSets: 1,
    defaultReps: 1,
    image: 'burpee.gif'
  },
  {
    id: 'thruster',
    name: "Thruster",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'thruster.gif'
  },
  {
    id: 'bentover-dumbbell-lateral-raise',
    name: "Bentover Mancuernas Lateral Elevación (Mancuernas)",
    muscleGroup: 'hombros',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'bentover-dumbbell-lateral-raise.gif'
  },
  {
    id: 'handstand-push-ups',
    name: "Flexiones",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'handstand-push-ups.gif'
  },
  {
    id: 'air-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'air-squat.gif'
  },
  {
    id: 'treadmill',
    name: "Treadmill",
    muscleGroup: 'cardio',
    equipment: "Trotadora",
    defaultSets: 1,
    defaultReps: 1,
    image: 'treadmill.gif'
  },
  {
    id: 'cycle',
    name: "Cycle",
    muscleGroup: 'cardio',
    equipment: "Peso corporal",
    defaultSets: 1,
    defaultReps: 1,
    image: 'cycle.gif'
  },
  {
    id: 'jump-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'jump-squat.gif'
  },
  {
    id: 'weighted-pull-up',
    name: "Dominadas",
    muscleGroup: 'espalda',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'weighted-pull-up.gif'
  },
  {
    id: 'hindu-push-ups',
    name: "Flexiones",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'hindu-push-ups.gif'
  },
  {
    id: 'handstand',
    name: "Handstand",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'handstand.gif'
  },
  {
    id: 'v-up',
    name: "V Up",
    muscleGroup: 'core',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'v-up.gif'
  },
  {
    id: 'pull-up',
    name: "Dominadas",
    muscleGroup: 'espalda',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'pull-up.gif'
  },
  {
    id: 'seated-row-machine',
    name: "Remo",
    muscleGroup: 'espalda',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'seated-row-machine.gif'
  },
  {
    id: 'weighted-dips',
    name: "Lastradas Dips (Lastradas)",
    muscleGroup: 'pecho',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'weighted-dips.gif'
  },
  {
    id: 'archer-push-ups',
    name: "Flexiones",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'archer-push-ups.gif'
  },
  {
    id: 'dips',
    name: "Dips",
    muscleGroup: 'pecho',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'dips.gif'
  },
  {
    id: 'mountain-climber',
    name: "Mountain Climber",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'mountain-climber.gif'
  },
  {
    id: 'weighted-step-up',
    name: "Lastradas Step Up (Lastradas)",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'weighted-step-up.gif'
  },
  {
    id: 'lunge',
    name: "Zancada",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'lunge.gif'
  },
  {
    id: 'chin-up',
    name: "Dominadas (supinado)",
    muscleGroup: 'espalda',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'chin-up.gif'
  },
  {
    id: 'cable-push-down',
    name: "Cable Empuje Down",
    muscleGroup: 'piernas',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'cable-push-down.gif'
  },
  {
    id: 'step-up',
    name: "Step Up",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'step-up.gif'
  },
  {
    id: 'zercher-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'zercher-squat.gif'
  },
  {
    id: 'hip-adduction-machine',
    name: "Hip Adduction Máquina (Máquina)",
    muscleGroup: 'gluteos',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'hip-adduction-machine.gif'
  },
  {
    id: 'standing-calf-raise',
    name: "Standing Gemelos Elevación",
    muscleGroup: 'gemelos',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'standing-calf-raise.gif'
  },
  {
    id: 'good-morning',
    name: "Good Morning",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'good-morning.gif'
  },
  {
    id: 'barbell-bulgarian-split-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Barra",
    defaultSets: 4,
    defaultReps: 8,
    image: 'barbell-bulgarian-split-squat.gif'
  },
  {
    id: 'dumbbell-bulgarian-split-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Mancuernas",
    defaultSets: 4,
    defaultReps: 8,
    image: 'dumbbell-bulgarian-split-squat.gif'
  },
  {
    id: 'dumbbell-split-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Mancuernas",
    defaultSets: 4,
    defaultReps: 8,
    image: 'dumbbell-split-squat.gif'
  },
  {
    id: 'bodyweight-split-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'bodyweight-split-squat.gif'
  },
  {
    id: 'dumbbell-goblet-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Mancuernas",
    defaultSets: 4,
    defaultReps: 8,
    image: 'dumbbell-goblet-squat.gif'
  },
  {
    id: 'kettlebell-goblet-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Kettlebell",
    defaultSets: 4,
    defaultReps: 8,
    image: 'kettlebell-goblet-squat.gif'
  },
  {
    id: 'dumbbell-lunge',
    name: "Zancada",
    muscleGroup: 'piernas',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'dumbbell-lunge.gif'
  },
  {
    id: 'barbell-hip-thrust',
    name: "Barra Hip Thrust (Barra)",
    muscleGroup: 'gluteos',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'barbell-hip-thrust.gif'
  },
  {
    id: 'incline-dumbbell-fly',
    name: "Aperturas con Mancuernas",
    muscleGroup: 'pecho',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'incline-dumbbell-fly.gif'
  },
  {
    id: 'weighted-push-ups',
    name: "Flexiones",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'weighted-push-ups.gif'
  },
  {
    id: 'close-grip-push-ups',
    name: "Flexiones",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'close-grip-push-ups.gif'
  },
  {
    id: 'incline-dumbbell-bench-press',
    name: "Press de Banca",
    muscleGroup: 'pecho',
    equipment: "Mancuernas",
    defaultSets: 4,
    defaultReps: 8,
    image: 'incline-dumbbell-bench-press.gif'
  },
  {
    id: 'pec-deck-fly-machine',
    name: "Pec Deck Aperturas Máquina (Máquina)",
    muscleGroup: 'pecho',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'pec-deck-fly-machine.gif'
  },
  {
    id: 'incline-bench-press-machine',
    name: "Press Inclinado",
    muscleGroup: 'pecho',
    equipment: "Máquina",
    defaultSets: 4,
    defaultReps: 8,
    image: 'incline-bench-press-machine.gif'
  },
  {
    id: 'weighted-chin-up',
    name: "Dominadas (supinado)",
    muscleGroup: 'espalda',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'weighted-chin-up.gif'
  },
  {
    id: 'barbell-incline-row',
    name: "Remo",
    muscleGroup: 'espalda',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'barbell-incline-row.gif'
  },
  {
    id: 'dumbbell-incline-row',
    name: "Remo",
    muscleGroup: 'espalda',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'dumbbell-incline-row.gif'
  },
  {
    id: 'one-arm-dumbbell-row',
    name: "Remo",
    muscleGroup: 'espalda',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'one-arm-dumbbell-row.gif'
  },
  {
    id: 'barbell-pullover',
    name: "Barra Pullover (Barra)",
    muscleGroup: 'espalda',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'barbell-pullover.gif'
  },
  {
    id: 'weight-hyperextension',
    name: "Weight Hyperextension",
    muscleGroup: 'espalda',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'weight-hyperextension.gif'
  },
  {
    id: 'back-extension',
    name: "Trasera Extensión",
    muscleGroup: 'espalda',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'back-extension.gif'
  },
  {
    id: 'arnold-dumbbell-press',
    name: "Arnold Mancuernas Press (Mancuernas)",
    muscleGroup: 'hombros',
    equipment: "Mancuernas",
    defaultSets: 4,
    defaultReps: 8,
    image: 'arnold-dumbbell-press.gif'
  },
  {
    id: 'shoulder-press-machine',
    name: "Press de Hombros",
    muscleGroup: 'hombros',
    equipment: "Máquina",
    defaultSets: 4,
    defaultReps: 8,
    image: 'shoulder-press-machine.gif'
  },
  {
    id: 'barbell-shrug',
    name: "Barra Encogimiento (Barra)",
    muscleGroup: 'hombros',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'barbell-shrug.gif'
  },
  {
    id: 'face-pull',
    name: "Face Jalón",
    muscleGroup: 'espalda',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'face-pull.gif'
  },
  {
    id: 'cable-reverse-fly',
    name: "Cable Reverse Aperturas",
    muscleGroup: 'pecho',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'cable-reverse-fly.gif'
  },
  {
    id: 'barbell-upright-row',
    name: "Remo",
    muscleGroup: 'hombros',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'barbell-upright-row.gif'
  },
  {
    id: 'dumbbell-upright-row',
    name: "Remo",
    muscleGroup: 'hombros',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'dumbbell-upright-row.gif'
  },
  {
    id: 'ez-bar-upright-row',
    name: "Remo",
    muscleGroup: 'hombros',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'ez-bar-upright-row.gif'
  },
  {
    id: 'dumbbell-hammer-curl',
    name: "Mancuernas Hammer Curl (Mancuernas)",
    muscleGroup: 'biceps',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'dumbbell-hammer-curl.gif'
  },
  {
    id: 'close-grip-bench-press',
    name: "Press de Banca",
    muscleGroup: 'pecho',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'close-grip-bench-press.gif'
  },
  {
    id: 'seated-dumbbell-tricep-extension',
    name: "Extensión de Tríceps",
    muscleGroup: 'triceps',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'seated-dumbbell-tricep-extension.gif'
  },
  {
    id: 'cable-tricep-extension',
    name: "Extensión de Tríceps",
    muscleGroup: 'triceps',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'cable-tricep-extension.gif'
  },
  {
    id: 'ez-bar-wrist-curl',
    name: "Ez Bar Wrist Curl",
    muscleGroup: 'biceps',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'ez-bar-wrist-curl.gif'
  },
  {
    id: 'skull-crusher',
    name: "Skull Crusher",
    muscleGroup: 'triceps',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'skull-crusher.gif'
  },
  {
    id: 'lying-tricep-extension',
    name: "Extensión de Tríceps",
    muscleGroup: 'triceps',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'lying-tricep-extension.gif'
  },
  {
    id: 'crunch',
    name: "Crunch",
    muscleGroup: 'core',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'crunch.gif'
  },
  {
    id: 'heel-touch',
    name: "Heel Touch",
    muscleGroup: 'core',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'heel-touch.gif'
  },
  {
    id: 'hollow-rock',
    name: "Hollow Rock",
    muscleGroup: 'core',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'hollow-rock.gif'
  },
  {
    id: 'hollow-position',
    name: "Hollow Position",
    muscleGroup: 'core',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'hollow-position.gif'
  },
  {
    id: 'dumbbell-side-bend',
    name: "Mancuernas Side Bend (Mancuernas)",
    muscleGroup: 'piernas',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'dumbbell-side-bend.gif'
  },
  {
    id: 'abs-roll-out',
    name: "Abs Roll Out",
    muscleGroup: 'core',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'abs-roll-out.gif'
  },
  {
    id: 'air-bicycle-abs',
    name: "Air Bicycle Abs",
    muscleGroup: 'core',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'air-bicycle-abs.gif'
  },
  {
    id: 'toes-to-bar',
    name: "Pies a la Barra",
    muscleGroup: 'core',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'toes-to-bar.gif'
  },
  {
    id: 'push-press',
    name: "Empuje Press",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'push-press.gif'
  },
  {
    id: 'wallball-shot',
    name: "Wallball Shot",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'wallball-shot.gif'
  },
  {
    id: 'box-jump',
    name: "Salto al Cajón",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'box-jump.gif'
  },
  {
    id: 'jumping-jack',
    name: "Jumping Jack",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'jumping-jack.gif'
  },
  {
    id: 'v-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'v-squat.gif'
  },
  {
    id: 'reverse-v-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'reverse-v-squat.gif'
  },
  {
    id: 't-bar-row-machine',
    name: "Remo",
    muscleGroup: 'espalda',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 't-bar-row-machine.gif'
  },
  {
    id: 'dumbbell-preacher-curl',
    name: "Mancuernas Preacher Curl (Mancuernas)",
    muscleGroup: 'biceps',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'dumbbell-preacher-curl.gif'
  },
  {
    id: 'barbell-preacher-curl',
    name: "Barra Preacher Curl (Barra)",
    muscleGroup: 'biceps',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'barbell-preacher-curl.gif'
  },
  {
    id: 'ez-bar-preacher-curl',
    name: "Ez Bar Preacher Curl",
    muscleGroup: 'biceps',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'ez-bar-preacher-curl.gif'
  },
  {
    id: 'preacher-curl-machine',
    name: "Preacher Curl Máquina (Máquina)",
    muscleGroup: 'biceps',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'preacher-curl-machine.gif'
  },
  {
    id: 'reverse-pec-deck-fly-machine',
    name: "Reverse Pec Deck Aperturas Máquina (Máquina)",
    muscleGroup: 'pecho',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'reverse-pec-deck-fly-machine.gif'
  },
  {
    id: 'hip-abduction-machine',
    name: "Hip Abduction Máquina (Máquina)",
    muscleGroup: 'gluteos',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'hip-abduction-machine.gif'
  },
  {
    id: 'smith-machine-overhead-press',
    name: "Smith Máquina Overhead Press (Máquina)",
    muscleGroup: 'hombros',
    equipment: "Máquina",
    defaultSets: 4,
    defaultReps: 8,
    image: 'smith-machine-overhead-press.gif'
  },
  {
    id: 'glute-kickback-machine',
    name: "Glute Kickback Máquina (Máquina)",
    muscleGroup: 'gluteos',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'glute-kickback-machine.gif'
  },
  {
    id: 'kettlebell-snatch',
    name: "Kettlebell Snatch (Kettlebell)",
    muscleGroup: 'piernas',
    equipment: "Kettlebell",
    defaultSets: 4,
    defaultReps: 8,
    image: 'kettlebell-snatch.gif'
  },
  {
    id: 'bar-muscle-up',
    name: "Bar Muscle Up",
    muscleGroup: 'piernas',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'bar-muscle-up.gif'
  },
  {
    id: 'seated-dips-machine',
    name: "Seated Dips Máquina (Máquina)",
    muscleGroup: 'pecho',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'seated-dips-machine.gif'
  },
  {
    id: 'arm-curl-machine',
    name: "Brazo Curl Máquina (Máquina)",
    muscleGroup: 'biceps',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'arm-curl-machine.gif'
  },
  {
    id: 'high-knee-skip',
    name: "High Knee Skip",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'high-knee-skip.gif'
  },
  {
    id: 'smith-machine-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Máquina",
    defaultSets: 4,
    defaultReps: 8,
    image: 'smith-machine-squat.gif'
  },
  {
    id: 'hack-squat-machine',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Máquina",
    defaultSets: 4,
    defaultReps: 8,
    image: 'hack-squat-machine.gif'
  },
  {
    id: 'mag-grip-lat-pulldown',
    name: "Jalón al Pecho",
    muscleGroup: 'espalda',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'mag-grip-lat-pulldown.gif'
  },
  {
    id: 'abdominal-crunch-machine',
    name: "Crunch",
    muscleGroup: 'core',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'abdominal-crunch-machine.gif'
  },
  {
    id: 'paused-back-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'paused-back-squat.gif'
  },
  {
    id: 'smith-machine-split-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Máquina",
    defaultSets: 4,
    defaultReps: 8,
    image: 'smith-machine-split-squat.gif'
  },
  {
    id: 'smith-machine-row',
    name: "Remo",
    muscleGroup: 'espalda',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'smith-machine-row.gif'
  },
  {
    id: 'low-pulley-cable-fly',
    name: "Low Pulley Cable Aperturas",
    muscleGroup: 'pecho',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'low-pulley-cable-fly.gif'
  },
  {
    id: 'cable-straight-arm-pulldown',
    name: "Cable Straight Brazo Pulldown",
    muscleGroup: 'espalda',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'cable-straight-arm-pulldown.gif'
  },
  {
    id: 'paused-barbell-row',
    name: "Remo",
    muscleGroup: 'espalda',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'paused-barbell-row.gif'
  },
  {
    id: 'paused-sumo-deadlift',
    name: "Peso Muerto",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'paused-sumo-deadlift.gif'
  },
  {
    id: 'lateral-raise-machine',
    name: "Lateral Elevación Máquina (Máquina)",
    muscleGroup: 'hombros',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'lateral-raise-machine.gif'
  },
  {
    id: 'climbing-stairs',
    name: "Climbing Stairs",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'climbing-stairs.gif'
  },
  {
    id: 'smith-machine-deadlift',
    name: "Peso Muerto",
    muscleGroup: 'piernas',
    equipment: "Máquina",
    defaultSets: 4,
    defaultReps: 8,
    image: 'smith-machine-deadlift.gif'
  },
  {
    id: 'paused-deadlift',
    name: "Peso Muerto",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'paused-deadlift.gif'
  },
  {
    id: 'parallel-grip-lat-pulldown',
    name: "Jalón al Pecho",
    muscleGroup: 'espalda',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'parallel-grip-lat-pulldown.gif'
  },
  {
    id: 'jumping-rope',
    name: "Jumping Rope",
    muscleGroup: 'piernas',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'jumping-rope.gif'
  },
  {
    id: 'smith-machine-bench-press',
    name: "Press de Banca",
    muscleGroup: 'pecho',
    equipment: "Máquina",
    defaultSets: 4,
    defaultReps: 8,
    image: 'smith-machine-bench-press.gif'
  },
  {
    id: 'cable-hammer-curl',
    name: "Cable Hammer Curl",
    muscleGroup: 'biceps',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'cable-hammer-curl.gif'
  },
  {
    id: 'spoto-bench-press',
    name: "Press de Banca",
    muscleGroup: 'pecho',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'spoto-bench-press.gif'
  },
  {
    id: 'underhand-lat-pulldown',
    name: "Jalón al Pecho",
    muscleGroup: 'espalda',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'underhand-lat-pulldown.gif'
  },
  {
    id: 'smith-machine-shrug',
    name: "Smith Máquina Encogimiento (Máquina)",
    muscleGroup: 'hombros',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'smith-machine-shrug.gif'
  },
  {
    id: 'trap-bar-deadlift',
    name: "Peso Muerto",
    muscleGroup: 'piernas',
    equipment: "Barra",
    defaultSets: 4,
    defaultReps: 8,
    image: 'trap-bar-deadlift.gif'
  },
  {
    id: 'cable-overhead-tricep-extension',
    name: "Extensión de Tríceps",
    muscleGroup: 'hombros',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'cable-overhead-tricep-extension.gif'
  },
  {
    id: 'dumbbell-snatch',
    name: "Mancuernas Snatch (Mancuernas)",
    muscleGroup: 'piernas',
    equipment: "Mancuernas",
    defaultSets: 4,
    defaultReps: 8,
    image: 'dumbbell-snatch.gif'
  },
  {
    id: 'hammer-bench-press',
    name: "Press de Banca",
    muscleGroup: 'pecho',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'hammer-bench-press.gif'
  },
  {
    id: 'ring-muscle-up',
    name: "Ring Muscle Up",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'ring-muscle-up.gif'
  },
  {
    id: 'double-under',
    name: "Double Under",
    muscleGroup: 'cardio',
    equipment: "Peso corporal",
    defaultSets: 1,
    defaultReps: 1,
    image: 'double-under.gif'
  },
  {
    id: 'seated-calf-raise-machine',
    name: "Seated Gemelos Elevación Máquina (Máquina)",
    muscleGroup: 'gemelos',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'seated-calf-raise-machine.gif'
  },
  {
    id: 'smith-machine-incline-bench-press',
    name: "Press Inclinado",
    muscleGroup: 'pecho',
    equipment: "Máquina",
    defaultSets: 4,
    defaultReps: 8,
    image: 'smith-machine-incline-bench-press.gif'
  },
  {
    id: 'floor-seated-cable-row',
    name: "Remo",
    muscleGroup: 'espalda',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'floor-seated-cable-row.gif'
  },
  {
    id: 'barbell-lunge',
    name: "Zancada",
    muscleGroup: 'piernas',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'barbell-lunge.gif'
  },
  {
    id: 'dumbbell-sumo-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Mancuernas",
    defaultSets: 4,
    defaultReps: 8,
    image: 'dumbbell-sumo-squat.gif'
  },
  {
    id: 'pike-push-ups',
    name: "Flexiones",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'pike-push-ups.gif'
  },
  {
    id: 'assisted-pull-up-machine',
    name: "Dominadas",
    muscleGroup: 'espalda',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'assisted-pull-up-machine.gif'
  },
  {
    id: 'barbell-lateral-lunge',
    name: "Zancada",
    muscleGroup: 'piernas',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'barbell-lateral-lunge.gif'
  },
  {
    id: 'decline-dumbbell-fly',
    name: "Aperturas con Mancuernas",
    muscleGroup: 'pecho',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'decline-dumbbell-fly.gif'
  },
  {
    id: 'weighted-hanging-knee-raise',
    name: "Elevación de Rodillas Colgado",
    muscleGroup: 'core',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'weighted-hanging-knee-raise.gif'
  },
  {
    id: 'assisted-dip-machine',
    name: "Assisted Dip Máquina (Máquina)",
    muscleGroup: 'piernas',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'assisted-dip-machine.gif'
  },
  {
    id: 'barbell-split-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Barra",
    defaultSets: 4,
    defaultReps: 8,
    image: 'barbell-split-squat.gif'
  },
  {
    id: 'dumbbell-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Mancuernas",
    defaultSets: 4,
    defaultReps: 8,
    image: 'dumbbell-squat.gif'
  },
  {
    id: 'barbell-box-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Barra",
    defaultSets: 4,
    defaultReps: 8,
    image: 'barbell-box-squat.gif'
  },
  {
    id: 'snatch-balance',
    name: "Snatch Balance",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'snatch-balance.gif'
  },
  {
    id: 'dumbbell-burpee',
    name: "Burpee",
    muscleGroup: 'cardio',
    equipment: "Mancuernas",
    defaultSets: 1,
    defaultReps: 1,
    image: 'dumbbell-burpee.gif'
  },
  {
    id: 'shoulder-tap',
    name: "Shoulder Tap",
    muscleGroup: 'hombros',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'shoulder-tap.gif'
  },
  {
    id: 'barbell-floor-chest-press',
    name: "Barra Floor Chest Press (Barra)",
    muscleGroup: 'pecho',
    equipment: "Barra",
    defaultSets: 4,
    defaultReps: 8,
    image: 'barbell-floor-chest-press.gif'
  },
  {
    id: 'barbell-standing-calf-raise',
    name: "Barra Standing Gemelos Elevación (Barra)",
    muscleGroup: 'gemelos',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'barbell-standing-calf-raise.gif'
  },
  {
    id: 'dumbbell-leg-curl',
    name: "Mancuernas Pierna Curl (Mancuernas)",
    muscleGroup: 'piernas',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'dumbbell-leg-curl.gif'
  },
  {
    id: 'barbell-decline-bench-press',
    name: "Press Declinado",
    muscleGroup: 'pecho',
    equipment: "Barra",
    defaultSets: 4,
    defaultReps: 8,
    image: 'barbell-decline-bench-press.gif'
  },
  {
    id: 'battling-ropes',
    name: "Battling Ropes",
    muscleGroup: 'piernas',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'battling-ropes.gif'
  },
  {
    id: 'dumbbell-thruster',
    name: "Mancuernas Thruster (Mancuernas)",
    muscleGroup: 'piernas',
    equipment: "Mancuernas",
    defaultSets: 4,
    defaultReps: 8,
    image: 'dumbbell-thruster.gif'
  },
  {
    id: 'ez-bar-front-raise',
    name: "Ez Bar Frontal Elevación",
    muscleGroup: 'hombros',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'ez-bar-front-raise.gif'
  },
  {
    id: 'stiff-leg-deadlift',
    name: "Peso Muerto",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'stiff-leg-deadlift.gif'
  },
  {
    id: 'seated-dumbbell-rear-lateral-raise',
    name: "Seated Mancuernas Rear Lateral Elevación (Mancuernas)",
    muscleGroup: 'hombros',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'seated-dumbbell-rear-lateral-raise.gif'
  },
  {
    id: 'barbell-front-rack-lunge',
    name: "Zancada",
    muscleGroup: 'piernas',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'barbell-front-rack-lunge.gif'
  },
  {
    id: 'bodyweight-overhead-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'bodyweight-overhead-squat.gif'
  },
  {
    id: 'inchworm',
    name: "Inchworm",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'inchworm.gif'
  },
  {
    id: 'barbell-front-raise',
    name: "Barra Frontal Elevación (Barra)",
    muscleGroup: 'hombros',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'barbell-front-raise.gif'
  },
  {
    id: 'barbell-hack-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Barra",
    defaultSets: 4,
    defaultReps: 8,
    image: 'barbell-hack-squat.gif'
  },
  {
    id: 'barbell-jump-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Barra",
    defaultSets: 4,
    defaultReps: 8,
    image: 'barbell-jump-squat.gif'
  },
  {
    id: 'clap-push-ups',
    name: "Flexiones",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'clap-push-ups.gif'
  },
  {
    id: 'incline-push-ups',
    name: "Flexiones",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'incline-push-ups.gif'
  },
  {
    id: 'sumo-deadlift-high-pull',
    name: "Peso Muerto",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'sumo-deadlift-high-pull.gif'
  },
  {
    id: 'lateral-wide-pull-down',
    name: "Lateral Wide Jalón Down",
    muscleGroup: 'espalda',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'lateral-wide-pull-down.gif'
  },
  {
    id: 'clean-high-pull',
    name: "Clean High Jalón",
    muscleGroup: 'espalda',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'clean-high-pull.gif'
  },
  {
    id: 'hang-clean',
    name: "Hang Clean",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'hang-clean.gif'
  },
  {
    id: 'kettlebell-sumo-high-pull',
    name: "Kettlebell Sumo High Jalón (Kettlebell)",
    muscleGroup: 'piernas',
    equipment: "Kettlebell",
    defaultSets: 3,
    defaultReps: 12,
    image: 'kettlebell-sumo-high-pull.gif'
  },
  {
    id: 'snatch-high-pull',
    name: "Snatch High Jalón",
    muscleGroup: 'espalda',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'snatch-high-pull.gif'
  },
  {
    id: 'hang-snatch',
    name: "Hang Snatch",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'hang-snatch.gif'
  },
  {
    id: 'bodyweight-calf-raise',
    name: "Peso corporal Gemelos Elevación",
    muscleGroup: 'gemelos',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'bodyweight-calf-raise.gif'
  },
  {
    id: 'stepmill-machine',
    name: "Stepmill Máquina (Máquina)",
    muscleGroup: 'piernas',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'stepmill-machine.gif'
  },
  {
    id: 'pistol-box-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'pistol-box-squat.gif'
  },
  {
    id: 'reverse-crunch',
    name: "Crunch",
    muscleGroup: 'core',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'reverse-crunch.gif'
  },
  {
    id: 'reverse-barbell-curl',
    name: "Reverse Barra Curl (Barra)",
    muscleGroup: 'biceps',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'reverse-barbell-curl.gif'
  },
  {
    id: 'pilates-jackknife',
    name: "Pilates Jackknife",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'pilates-jackknife.gif'
  },
  {
    id: 'lying-hip-abduction',
    name: "Lying Hip Abduction",
    muscleGroup: 'gluteos',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'lying-hip-abduction.gif'
  },
  {
    id: 'decline-dumbbell-bench-press',
    name: "Press de Banca",
    muscleGroup: 'pecho',
    equipment: "Mancuernas",
    defaultSets: 4,
    defaultReps: 8,
    image: 'decline-dumbbell-bench-press.gif'
  },
  {
    id: 'rkc-plank',
    name: "Plancha",
    muscleGroup: 'core',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'rkc-plank.gif'
  },
  {
    id: 'reverse-barbell-wrist-curl',
    name: "Reverse Barra Wrist Curl (Barra)",
    muscleGroup: 'biceps',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'reverse-barbell-wrist-curl.gif'
  },
  {
    id: 'seated-leg-curl',
    name: "Seated Pierna Curl",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'seated-leg-curl.gif'
  },
  {
    id: 'side-lying-clam',
    name: "Side Lying Clam",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'side-lying-clam.gif'
  },
  {
    id: 'reverse-dumbbell-wrist-curl',
    name: "Reverse Mancuernas Wrist Curl (Mancuernas)",
    muscleGroup: 'biceps',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'reverse-dumbbell-wrist-curl.gif'
  },
  {
    id: 'decline-chest-press-machine',
    name: "Declinado Chest Press Máquina (Máquina)",
    muscleGroup: 'pecho',
    equipment: "Máquina",
    defaultSets: 4,
    defaultReps: 8,
    image: 'decline-chest-press-machine.gif'
  },
  {
    id: 'single-leg-glute-bridge',
    name: "Single Pierna Glute Bridge",
    muscleGroup: 'gluteos',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'single-leg-glute-bridge.gif'
  },
  {
    id: 'dumbbell-romanian-deadlift',
    name: "Peso Muerto",
    muscleGroup: 'piernas',
    equipment: "Mancuernas",
    defaultSets: 4,
    defaultReps: 8,
    image: 'dumbbell-romanian-deadlift.gif'
  },
  {
    id: '45-degree-side-bend',
    name: "45 Degree Side Bend",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: '45-degree-side-bend.gif'
  },
  {
    id: 'underhand-barbell-row',
    name: "Remo",
    muscleGroup: 'espalda',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'underhand-barbell-row.gif'
  },
  {
    id: 'lying-barbell-row',
    name: "Remo",
    muscleGroup: 'espalda',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'lying-barbell-row.gif'
  },
  {
    id: 'incline-dumbbell-twist-press',
    name: "Inclinado Mancuernas Twist Press (Mancuernas)",
    muscleGroup: 'piernas',
    equipment: "Mancuernas",
    defaultSets: 4,
    defaultReps: 8,
    image: 'incline-dumbbell-twist-press.gif'
  },
  {
    id: 'standing-cable-fly',
    name: "Standing Cable Aperturas",
    muscleGroup: 'pecho',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'standing-cable-fly.gif'
  },
  {
    id: 'bodyweight-single-leg-deadlift',
    name: "Peso Muerto",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'bodyweight-single-leg-deadlift.gif'
  },
  {
    id: 'barbell-single-leg-deadlift',
    name: "Peso Muerto",
    muscleGroup: 'piernas',
    equipment: "Barra",
    defaultSets: 4,
    defaultReps: 8,
    image: 'barbell-single-leg-deadlift.gif'
  },
  {
    id: 'kettlebell-deadlift',
    name: "Peso Muerto",
    muscleGroup: 'piernas',
    equipment: "Kettlebell",
    defaultSets: 4,
    defaultReps: 8,
    image: 'kettlebell-deadlift.gif'
  },
  {
    id: 'kettlebell-sumo-deadlift',
    name: "Peso Muerto",
    muscleGroup: 'piernas',
    equipment: "Kettlebell",
    defaultSets: 4,
    defaultReps: 8,
    image: 'kettlebell-sumo-deadlift.gif'
  },
  {
    id: 'dumbbell-sumo-deadlift',
    name: "Peso Muerto",
    muscleGroup: 'piernas',
    equipment: "Mancuernas",
    defaultSets: 4,
    defaultReps: 8,
    image: 'dumbbell-sumo-deadlift.gif'
  },
  {
    id: 'dumbbell-stiff-leg-deadlift',
    name: "Peso Muerto",
    muscleGroup: 'piernas',
    equipment: "Mancuernas",
    defaultSets: 4,
    defaultReps: 8,
    image: 'dumbbell-stiff-leg-deadlift.gif'
  },
  {
    id: 'dumbbell-lateral-lunge',
    name: "Zancada",
    muscleGroup: 'piernas',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'dumbbell-lateral-lunge.gif'
  },
  {
    id: 'kettlebell-lateral-lunge',
    name: "Zancada",
    muscleGroup: 'piernas',
    equipment: "Kettlebell",
    defaultSets: 3,
    defaultReps: 12,
    image: 'kettlebell-lateral-lunge.gif'
  },
  {
    id: 'bodyweight-lateral-lunge',
    name: "Zancada",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'bodyweight-lateral-lunge.gif'
  },
  {
    id: 'single-leg-leg-extension',
    name: "Single Pierna Pierna Extensión",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'single-leg-leg-extension.gif'
  },
  {
    id: 'single-leg-leg-curl',
    name: "Single Pierna Pierna Curl",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'single-leg-leg-curl.gif'
  },
  {
    id: 'single-leg-leg-press',
    name: "Single Pierna Pierna Press",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'single-leg-leg-press.gif'
  },
  {
    id: 'horizontal-leg-press',
    name: "Horizontal Pierna Press",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'horizontal-leg-press.gif'
  },
  {
    id: 'single-leg-horizontal-leg-press',
    name: "Single Pierna Horizontal Pierna Press",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'single-leg-horizontal-leg-press.gif'
  },
  {
    id: 'seated-single-leg-leg-curl',
    name: "Seated Single Pierna Pierna Curl",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'seated-single-leg-leg-curl.gif'
  },
  {
    id: 'nordic-hamstring-curl',
    name: "Nordic Hamstring Curl",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'nordic-hamstring-curl.gif'
  },
  {
    id: 'barbell-sumo-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Barra",
    defaultSets: 4,
    defaultReps: 8,
    image: 'barbell-sumo-squat.gif'
  },
  {
    id: 'kettlebell-sumo-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Kettlebell",
    defaultSets: 4,
    defaultReps: 8,
    image: 'kettlebell-sumo-squat.gif'
  },
  {
    id: 'sumo-air-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'sumo-air-squat.gif'
  },
  {
    id: 'pistol-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'pistol-squat.gif'
  },
  {
    id: 'seated-barbell-shoulder-press',
    name: "Press de Hombros",
    muscleGroup: 'hombros',
    equipment: "Barra",
    defaultSets: 4,
    defaultReps: 8,
    image: 'seated-barbell-shoulder-press.gif'
  },
  {
    id: 'seated-dumbbell-shoulder-press',
    name: "Press de Hombros",
    muscleGroup: 'hombros',
    equipment: "Mancuernas",
    defaultSets: 4,
    defaultReps: 8,
    image: 'seated-dumbbell-shoulder-press.gif'
  },
  {
    id: 'plate-shoulder-press',
    name: "Press de Hombros",
    muscleGroup: 'hombros',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'plate-shoulder-press.gif'
  },
  {
    id: 'tricep-extension-machine',
    name: "Extensión de Tríceps",
    muscleGroup: 'triceps',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'tricep-extension-machine.gif'
  },
  {
    id: 'behind-neck-pulldown',
    name: "Behind Neck Pulldown",
    muscleGroup: 'espalda',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'behind-neck-pulldown.gif'
  },
  {
    id: 'one-arm-cable-pulldown',
    name: "One Brazo Cable Pulldown",
    muscleGroup: 'espalda',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'one-arm-cable-pulldown.gif'
  },
  {
    id: 'one-arm-lateral-wide-pulldown',
    name: "One Brazo Lateral Wide Pulldown",
    muscleGroup: 'espalda',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'one-arm-lateral-wide-pulldown.gif'
  },
  {
    id: 'y-raise',
    name: "Y Elevación",
    muscleGroup: 'hombros',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'y-raise.gif'
  },
  {
    id: 'low-row-machine',
    name: "Remo",
    muscleGroup: 'espalda',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'low-row-machine.gif'
  },
  {
    id: 'one-arm-low-row-machine',
    name: "Remo",
    muscleGroup: 'espalda',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'one-arm-low-row-machine.gif'
  },
  {
    id: 'high-row-machine',
    name: "Remo",
    muscleGroup: 'espalda',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'high-row-machine.gif'
  },
  {
    id: 'underhand-high-row-machine',
    name: "Remo",
    muscleGroup: 'espalda',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'underhand-high-row-machine.gif'
  },
  {
    id: 'one-arm-high-row-machine',
    name: "Remo",
    muscleGroup: 'espalda',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'one-arm-high-row-machine.gif'
  },
  {
    id: 'shrug-machine',
    name: "Encogimiento Máquina (Máquina)",
    muscleGroup: 'hombros',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'shrug-machine.gif'
  },
  {
    id: 'cable-shrug',
    name: "Cable Encogimiento",
    muscleGroup: 'hombros',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'cable-shrug.gif'
  },
  {
    id: 'donkey-kick',
    name: "Donkey Kick",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'donkey-kick.gif'
  },
  {
    id: 'cable-donkey-kick',
    name: "Cable Donkey Kick",
    muscleGroup: 'piernas',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'cable-donkey-kick.gif'
  },
  {
    id: 'cable-side-bend',
    name: "Cable Side Bend",
    muscleGroup: 'piernas',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'cable-side-bend.gif'
  },
  {
    id: 'weighted-decline-crunch',
    name: "Crunch",
    muscleGroup: 'core',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'weighted-decline-crunch.gif'
  },
  {
    id: 'decline-reverse-crunch',
    name: "Crunch",
    muscleGroup: 'core',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'decline-reverse-crunch.gif'
  },
  {
    id: 'decline-sit-up',
    name: "Sit Up",
    muscleGroup: 'core',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'decline-sit-up.gif'
  },
  {
    id: 'weighted-decline-sit-up',
    name: "Sit Up",
    muscleGroup: 'core',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'weighted-decline-sit-up.gif'
  },
  {
    id: 'side-crunch',
    name: "Crunch",
    muscleGroup: 'core',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'side-crunch.gif'
  },
  {
    id: 'deficit-deadlift',
    name: "Peso Muerto",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'deficit-deadlift.gif'
  },
  {
    id: 'turkish-get-up',
    name: "Turkish Get Up",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'turkish-get-up.gif'
  },
  {
    id: 'lunge-twist',
    name: "Zancada",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'lunge-twist.gif'
  },
  {
    id: 'kettlebell-lunge-twist',
    name: "Zancada",
    muscleGroup: 'piernas',
    equipment: "Kettlebell",
    defaultSets: 3,
    defaultReps: 12,
    image: 'kettlebell-lunge-twist.gif'
  },
  {
    id: 'incline-chest-press-machine',
    name: "Inclinado Chest Press Máquina (Máquina)",
    muscleGroup: 'pecho',
    equipment: "Máquina",
    defaultSets: 4,
    defaultReps: 8,
    image: 'incline-chest-press-machine.gif'
  },
  {
    id: 'cable-twist',
    name: "Cable Twist",
    muscleGroup: 'piernas',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'cable-twist.gif'
  },
  {
    id: 'elliptical-machine',
    name: "Elliptical Máquina (Máquina)",
    muscleGroup: 'cardio',
    equipment: "Máquina",
    defaultSets: 1,
    defaultReps: 1,
    image: 'elliptical-machine.gif'
  },
  {
    id: 'cable-internal-rotation',
    name: "Cable Internal Rotation",
    muscleGroup: 'piernas',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'cable-internal-rotation.gif'
  },
  {
    id: 'cable-external-rotation',
    name: "Cable External Rotation",
    muscleGroup: 'piernas',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'cable-external-rotation.gif'
  },
  {
    id: 'one-arm-cable-lateral-raise',
    name: "One Brazo Cable Lateral Elevación",
    muscleGroup: 'hombros',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'one-arm-cable-lateral-raise.gif'
  },
  {
    id: 'one-arm-cable-seated-row',
    name: "Remo",
    muscleGroup: 'espalda',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'one-arm-cable-seated-row.gif'
  },
  {
    id: 'dumbbell-squeeze-press',
    name: "Mancuernas Squeeze Press (Mancuernas)",
    muscleGroup: 'piernas',
    equipment: "Mancuernas",
    defaultSets: 4,
    defaultReps: 8,
    image: 'dumbbell-squeeze-press.gif'
  },
  {
    id: 'one-arm-landmine-press',
    name: "One Brazo Landmine Press",
    muscleGroup: 'hombros',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'one-arm-landmine-press.gif'
  },
  {
    id: 'monster-glute-machine',
    name: "Monster Glute Máquina (Máquina)",
    muscleGroup: 'gluteos',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'monster-glute-machine.gif'
  },
  {
    id: 'abdominal-hip-thrust',
    name: "Abdominal Hip Thrust",
    muscleGroup: 'gluteos',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'abdominal-hip-thrust.gif'
  },
  {
    id: 'weighted-abdominal-hip-thrust',
    name: "Lastradas Abdominal Hip Thrust (Lastradas)",
    muscleGroup: 'gluteos',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'weighted-abdominal-hip-thrust.gif'
  },
  {
    id: 'walking',
    name: "Walking",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'walking.gif'
  },
  {
    id: 'running',
    name: "Running",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'running.gif'
  },
  {
    id: 'bentover-cable-lateral-raise',
    name: "Bentover Cable Lateral Elevación",
    muscleGroup: 'hombros',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'bentover-cable-lateral-raise.gif'
  },
  {
    id: 'one-arm-dumbbell-lateral-raise',
    name: "One Brazo Mancuernas Lateral Elevación (Mancuernas)",
    muscleGroup: 'hombros',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'one-arm-dumbbell-lateral-raise.gif'
  },
  {
    id: 'hand-gripper-exercise',
    name: "Hand Gripper Exercise",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'hand-gripper-exercise.gif'
  },
  {
    id: 'torso-rotation-machine',
    name: "Torso Rotation Máquina (Máquina)",
    muscleGroup: 'piernas',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'torso-rotation-machine.gif'
  },
  {
    id: 'rack-pull',
    name: "Rack Jalón",
    muscleGroup: 'espalda',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'rack-pull.gif'
  },
  {
    id: 'smith-machine-rack-pull',
    name: "Smith Máquina Rack Jalón (Máquina)",
    muscleGroup: 'espalda',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'smith-machine-rack-pull.gif'
  },
  {
    id: 'standing-multi-flight-machine',
    name: "Standing Multi Flight Máquina (Máquina)",
    muscleGroup: 'piernas',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'standing-multi-flight-machine.gif'
  },
  {
    id: 'dumbbell-incline-rear-lateral-raise',
    name: "Mancuernas Inclinado Rear Lateral Elevación (Mancuernas)",
    muscleGroup: 'hombros',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'dumbbell-incline-rear-lateral-raise.gif'
  },
  {
    id: 'kettlebell-shoulder-press',
    name: "Press de Hombros",
    muscleGroup: 'hombros',
    equipment: "Kettlebell",
    defaultSets: 4,
    defaultReps: 8,
    image: 'kettlebell-shoulder-press.gif'
  },
  {
    id: 'one-arm-kettlebell-shoulder-press',
    name: "Press de Hombros",
    muscleGroup: 'hombros',
    equipment: "Kettlebell",
    defaultSets: 4,
    defaultReps: 8,
    image: 'one-arm-kettlebell-shoulder-press.gif'
  },
  {
    id: 'one-arm-dumbbell-incline-lateral-raise',
    name: "One Brazo Mancuernas Inclinado Lateral Elevación (Mancuernas)",
    muscleGroup: 'hombros',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'one-arm-dumbbell-incline-lateral-raise.gif'
  },
  {
    id: 'incline-dumbbell-shoulder-press',
    name: "Press de Hombros",
    muscleGroup: 'hombros',
    equipment: "Mancuernas",
    defaultSets: 4,
    defaultReps: 8,
    image: 'incline-dumbbell-shoulder-press.gif'
  },
  {
    id: 'pendulum-squat-machine',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Máquina",
    defaultSets: 4,
    defaultReps: 8,
    image: 'pendulum-squat-machine.gif'
  },
  {
    id: 'bentover-lateral-raise-machine',
    name: "Bentover Lateral Elevación Máquina (Máquina)",
    muscleGroup: 'hombros',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'bentover-lateral-raise-machine.gif'
  },
  {
    id: 'cable-rope-push-down',
    name: "Cable Rope Empuje Down",
    muscleGroup: 'piernas',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'cable-rope-push-down.gif'
  },
  {
    id: 'linear-hack-squat-machine',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Máquina",
    defaultSets: 4,
    defaultReps: 8,
    image: 'linear-hack-squat-machine.gif'
  },
  {
    id: 'standing-shoulder-press-machine',
    name: "Press de Hombros",
    muscleGroup: 'hombros',
    equipment: "Máquina",
    defaultSets: 4,
    defaultReps: 8,
    image: 'standing-shoulder-press-machine.gif'
  },
  {
    id: 'dumbbell-standing-calf-raise',
    name: "Mancuernas Standing Gemelos Elevación (Mancuernas)",
    muscleGroup: 'gemelos',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'dumbbell-standing-calf-raise.gif'
  },
  {
    id: 'middle-row-machine',
    name: "Remo",
    muscleGroup: 'espalda',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'middle-row-machine.gif'
  },
  {
    id: 'seated-knee-up',
    name: "Seated Knee Up",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'seated-knee-up.gif'
  },
  {
    id: 'side-lying-rear-delt-raise',
    name: "Side Lying Rear Delt Elevación",
    muscleGroup: 'hombros',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'side-lying-rear-delt-raise.gif'
  },
  {
    id: 'side-lying-lateral-raise',
    name: "Side Lying Lateral Elevación",
    muscleGroup: 'hombros',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'side-lying-lateral-raise.gif'
  },
  {
    id: 'back-extension-machine',
    name: "Trasera Extensión Máquina (Máquina)",
    muscleGroup: 'espalda',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'back-extension-machine.gif'
  },
  {
    id: 'barbell-backward-lunge',
    name: "Zancada",
    muscleGroup: 'piernas',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'barbell-backward-lunge.gif'
  },
  {
    id: 'kettlebell-backward-lunge',
    name: "Zancada",
    muscleGroup: 'piernas',
    equipment: "Kettlebell",
    defaultSets: 3,
    defaultReps: 12,
    image: 'kettlebell-backward-lunge.gif'
  },
  {
    id: 'bodyweight-backwar-lunge',
    name: "Zancada",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'bodyweight-backwar-lunge.gif'
  },
  {
    id: 'bench-press-machine',
    name: "Press de Banca",
    muscleGroup: 'pecho',
    equipment: "Máquina",
    defaultSets: 4,
    defaultReps: 8,
    image: 'bench-press-machine.gif'
  },
  {
    id: 'barbell-jm-press',
    name: "Barra Jm Press (Barra)",
    muscleGroup: 'triceps',
    equipment: "Barra",
    defaultSets: 4,
    defaultReps: 8,
    image: 'barbell-jm-press.gif'
  },
  {
    id: 'smith-machine-jm-press',
    name: "Smith Máquina Jm Press (Máquina)",
    muscleGroup: 'triceps',
    equipment: "Máquina",
    defaultSets: 4,
    defaultReps: 8,
    image: 'smith-machine-jm-press.gif'
  },
  {
    id: 'standing-hamstring-curl-machine',
    name: "Standing Hamstring Curl Máquina (Máquina)",
    muscleGroup: 'piernas',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'standing-hamstring-curl-machine.gif'
  },
  {
    id: 'glute-ham-raise',
    name: "Glute Ham Elevación",
    muscleGroup: 'gluteos',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'glute-ham-raise.gif'
  },
  {
    id: 'incline-barbell-front-raise',
    name: "Inclinado Barra Frontal Elevación (Barra)",
    muscleGroup: 'hombros',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'incline-barbell-front-raise.gif'
  },
  {
    id: 'incline-ez-bar-front-raise',
    name: "Inclinado Ez Bar Frontal Elevación",
    muscleGroup: 'hombros',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'incline-ez-bar-front-raise.gif'
  },
  {
    id: 'incline-dumbbell-front-raise',
    name: "Inclinado Mancuernas Frontal Elevación (Mancuernas)",
    muscleGroup: 'hombros',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'incline-dumbbell-front-raise.gif'
  },
  {
    id: 'barbell-incline-front-raise',
    name: "Barra Inclinado Frontal Elevación (Barra)",
    muscleGroup: 'hombros',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'barbell-incline-front-raise.gif'
  },
  {
    id: 'ez-bar-incline-front-raise',
    name: "Ez Bar Inclinado Frontal Elevación",
    muscleGroup: 'hombros',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'ez-bar-incline-front-raise.gif'
  },
  {
    id: 'dumbbell-incline-front-raise',
    name: "Mancuernas Inclinado Frontal Elevación (Mancuernas)",
    muscleGroup: 'hombros',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'dumbbell-incline-front-raise.gif'
  },
  {
    id: 'ez-bar-reverse-curl',
    name: "Ez Bar Reverse Curl",
    muscleGroup: 'biceps',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'ez-bar-reverse-curl.gif'
  },
  {
    id: 'plate-front-raise-with-rotation',
    name: "Plate Frontal Elevación With Rotation",
    muscleGroup: 'hombros',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'plate-front-raise-with-rotation.gif'
  },
  {
    id: 'decline-push-ups',
    name: "Flexiones",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'decline-push-ups.gif'
  },
  {
    id: 'reverse-grip-push-ups',
    name: "Flexiones",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'reverse-grip-push-ups.gif'
  },
  {
    id: 'parallel-grip-pull-up',
    name: "Dominadas",
    muscleGroup: 'espalda',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'parallel-grip-pull-up.gif'
  },
  {
    id: 'parallel-grip-weighted-pull-up',
    name: "Dominadas",
    muscleGroup: 'espalda',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'parallel-grip-weighted-pull-up.gif'
  },
  {
    id: 'ez-bar-tricep-extension',
    name: "Extensión de Tríceps",
    muscleGroup: 'triceps',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'ez-bar-tricep-extension.gif'
  },
  {
    id: 'seated-dumbbell-lateral-raise',
    name: "Seated Mancuernas Lateral Elevación (Mancuernas)",
    muscleGroup: 'hombros',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'seated-dumbbell-lateral-raise.gif'
  },
  {
    id: 'close-grip-smith-machine-bench-press',
    name: "Press de Banca",
    muscleGroup: 'pecho',
    equipment: "Máquina",
    defaultSets: 4,
    defaultReps: 8,
    image: 'close-grip-smith-machine-bench-press.gif'
  },
  {
    id: 'ez-bar-behind-back-wrist-curl',
    name: "Ez Bar Behind Trasera Wrist Curl",
    muscleGroup: 'biceps',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'ez-bar-behind-back-wrist-curl.gif'
  },
  {
    id: 'one-arm-dumbbell-wrist-curl',
    name: "One Brazo Mancuernas Wrist Curl (Mancuernas)",
    muscleGroup: 'biceps',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'one-arm-dumbbell-wrist-curl.gif'
  },
  {
    id: 'one-arm-cable-fly',
    name: "One Brazo Cable Aperturas",
    muscleGroup: 'pecho',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'one-arm-cable-fly.gif'
  },
  {
    id: 'cable-bench-press',
    name: "Press de Banca",
    muscleGroup: 'pecho',
    equipment: "Poleas",
    defaultSets: 4,
    defaultReps: 8,
    image: 'cable-bench-press.gif'
  },
  {
    id: 'one-arm-push-ups',
    name: "Flexiones",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'one-arm-push-ups.gif'
  },
  {
    id: 'one-arm-pull-up',
    name: "Dominadas",
    muscleGroup: 'espalda',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'one-arm-pull-up.gif'
  },
  {
    id: 'stand-to-stand-bridge',
    name: "Stand To Stand Bridge",
    muscleGroup: 'gluteos',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'stand-to-stand-bridge.gif'
  },
  {
    id: 'full-back-bridge',
    name: "Full Trasera Bridge",
    muscleGroup: 'gluteos',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'full-back-bridge.gif'
  },
  {
    id: 'smith-machine-bulgarian-split-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Máquina",
    defaultSets: 4,
    defaultReps: 8,
    image: 'smith-machine-bulgarian-split-squat.gif'
  },
  {
    id: 'alternating-dumbbell-bench-press',
    name: "Press de Banca",
    muscleGroup: 'pecho',
    equipment: "Mancuernas",
    defaultSets: 4,
    defaultReps: 8,
    image: 'alternating-dumbbell-bench-press.gif'
  },
  {
    id: 'belt-squat-machine',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Máquina",
    defaultSets: 4,
    defaultReps: 8,
    image: 'belt-squat-machine.gif'
  },
  {
    id: 'safety-bar-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Barra",
    defaultSets: 4,
    defaultReps: 8,
    image: 'safety-bar-squat.gif'
  },
  {
    id: 'incline-dumbbell-pull-over',
    name: "Inclinado Mancuernas Jalón Over (Mancuernas)",
    muscleGroup: 'espalda',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'incline-dumbbell-pull-over.gif'
  },
  {
    id: 'dumbbell-lying-tricep-extension',
    name: "Extensión de Tríceps",
    muscleGroup: 'triceps',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'dumbbell-lying-tricep-extension.gif'
  },
  {
    id: 'ez-bar-lying-tricep-extension',
    name: "Extensión de Tríceps",
    muscleGroup: 'triceps',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'ez-bar-lying-tricep-extension.gif'
  },
  {
    id: 'feet-up-bench-press',
    name: "Press de Banca",
    muscleGroup: 'pecho',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'feet-up-bench-press.gif'
  },
  {
    id: 'ab-coaster-machine',
    name: "Ab Coaster Máquina (Máquina)",
    muscleGroup: 'core',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'ab-coaster-machine.gif'
  },
  {
    id: 'one-arm-cable-lat-pulldown',
    name: "Jalón al Pecho",
    muscleGroup: 'espalda',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'one-arm-cable-lat-pulldown.gif'
  },
  {
    id: 'reverse-grip-bench-press',
    name: "Press de Banca",
    muscleGroup: 'pecho',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'reverse-grip-bench-press.gif'
  },
  {
    id: 'incline-dumbbell-hammer-curl',
    name: "Inclinado Mancuernas Hammer Curl (Mancuernas)",
    muscleGroup: 'biceps',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'incline-dumbbell-hammer-curl.gif'
  },
  {
    id: 'lying-cable-pull-over',
    name: "Lying Cable Jalón Over",
    muscleGroup: 'espalda',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'lying-cable-pull-over.gif'
  },
  {
    id: 'smith-machine-upright-row',
    name: "Remo",
    muscleGroup: 'hombros',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'smith-machine-upright-row.gif'
  },
  {
    id: 'smith-machine-hip-thrust',
    name: "Smith Máquina Hip Thrust (Máquina)",
    muscleGroup: 'gluteos',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'smith-machine-hip-thrust.gif'
  },
  {
    id: 'smith-machine-behind-neck-press',
    name: "Smith Máquina Behind Neck Press (Máquina)",
    muscleGroup: 'piernas',
    equipment: "Máquina",
    defaultSets: 4,
    defaultReps: 8,
    image: 'smith-machine-behind-neck-press.gif'
  },
  {
    id: 'pause-bench-press',
    name: "Press de Banca",
    muscleGroup: 'pecho',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'pause-bench-press.gif'
  },
  {
    id: 'standing-lateral-raise-machine',
    name: "Standing Lateral Elevación Máquina (Máquina)",
    muscleGroup: 'hombros',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'standing-lateral-raise-machine.gif'
  },
  {
    id: 'dumbbell-skull-crusher',
    name: "Mancuernas Skull Crusher (Mancuernas)",
    muscleGroup: 'triceps',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'dumbbell-skull-crusher.gif'
  },
  {
    id: 'seated-barbell-tricep-extension',
    name: "Extensión de Tríceps",
    muscleGroup: 'triceps',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'seated-barbell-tricep-extension.gif'
  },
  {
    id: 'donkey-calf-raise',
    name: "Donkey Gemelos Elevación",
    muscleGroup: 'gemelos',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'donkey-calf-raise.gif'
  },
  {
    id: 'standing-cable-row',
    name: "Remo",
    muscleGroup: 'espalda',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'standing-cable-row.gif'
  },
  {
    id: 'trap-bar-row',
    name: "Remo",
    muscleGroup: 'espalda',
    equipment: "Barra",
    defaultSets: 4,
    defaultReps: 8,
    image: 'trap-bar-row.gif'
  },
  {
    id: 'trap-bar-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Barra",
    defaultSets: 4,
    defaultReps: 8,
    image: 'trap-bar-squat.gif'
  },
  {
    id: 'trap-bar-overhead-press',
    name: "Trap Bar Overhead Press",
    muscleGroup: 'hombros',
    equipment: "Barra",
    defaultSets: 4,
    defaultReps: 8,
    image: 'trap-bar-overhead-press.gif'
  },
  {
    id: 'bicep-curl-machine',
    name: "Curl de Bíceps",
    muscleGroup: 'biceps',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'bicep-curl-machine.gif'
  },
  {
    id: 'chest-fly-machine',
    name: "Chest Aperturas Máquina (Máquina)",
    muscleGroup: 'pecho',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'chest-fly-machine.gif'
  },
  {
    id: 'dy-row-machine',
    name: "Remo",
    muscleGroup: 'espalda',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'dy-row-machine.gif'
  },
  {
    id: 'dumbbell-front-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Mancuernas",
    defaultSets: 4,
    defaultReps: 8,
    image: 'dumbbell-front-squat.gif'
  },
  {
    id: 'plank-twist',
    name: "Plancha",
    muscleGroup: 'core',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'plank-twist.gif'
  },
  {
    id: 'behind-back-wrist-curl',
    name: "Behind Trasera Wrist Curl",
    muscleGroup: 'biceps',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'behind-back-wrist-curl.gif'
  },
  {
    id: 'tricep-press-machine',
    name: "Tricep Press Máquina (Máquina)",
    muscleGroup: 'triceps',
    equipment: "Máquina",
    defaultSets: 4,
    defaultReps: 8,
    image: 'tricep-press-machine.gif'
  },
  {
    id: 'inner-chest-press-machine',
    name: "Inner Chest Press Máquina (Máquina)",
    muscleGroup: 'pecho',
    equipment: "Máquina",
    defaultSets: 4,
    defaultReps: 8,
    image: 'inner-chest-press-machine.gif'
  },
  {
    id: 'knee-push-ups',
    name: "Flexiones",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'knee-push-ups.gif'
  },
  {
    id: 'one-arm-kettlebell-row',
    name: "Remo",
    muscleGroup: 'espalda',
    equipment: "Kettlebell",
    defaultSets: 3,
    defaultReps: 12,
    image: 'one-arm-kettlebell-row.gif'
  },
  {
    id: 'high-pulley-cable-row',
    name: "Remo",
    muscleGroup: 'espalda',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'high-pulley-cable-row.gif'
  },
  {
    id: 'bosu-single-leg-deadlift',
    name: "Peso Muerto",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'bosu-single-leg-deadlift.gif'
  },
  {
    id: 'bosu-dumbbell-single-leg-deadlift',
    name: "Peso Muerto",
    muscleGroup: 'piernas',
    equipment: "Mancuernas",
    defaultSets: 4,
    defaultReps: 8,
    image: 'bosu-dumbbell-single-leg-deadlift.gif'
  },
  {
    id: 'leverage-squat-machine',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Máquina",
    defaultSets: 4,
    defaultReps: 8,
    image: 'leverage-squat-machine.gif'
  },
  {
    id: 'fire-hydrant',
    name: "Fire Hydrant",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'fire-hydrant.gif'
  },
  {
    id: 'wide-air-squat',
    name: "Sentadilla",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 4,
    defaultReps: 8,
    image: 'wide-air-squat.gif'
  },
  {
    id: 'one-arm-dumbbell-curl',
    name: "One Brazo Mancuernas Curl (Mancuernas)",
    muscleGroup: 'biceps',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'one-arm-dumbbell-curl.gif'
  },
  {
    id: 'one-arm-dumbbell-hammer-curl',
    name: "One Brazo Mancuernas Hammer Curl (Mancuernas)",
    muscleGroup: 'biceps',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'one-arm-dumbbell-hammer-curl.gif'
  },
  {
    id: 'yoga',
    name: "Yoga",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'yoga.gif'
  },
  {
    id: 'reverse-ez-bar-wrist-curl',
    name: "Reverse Ez Bar Wrist Curl",
    muscleGroup: 'biceps',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'reverse-ez-bar-wrist-curl.gif'
  },
  {
    id: 'pseudo-planche-push-ups',
    name: "Flexiones",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'pseudo-planche-push-ups.gif'
  },
  {
    id: 'standing-hip-abduction',
    name: "Standing Hip Abduction",
    muscleGroup: 'gluteos',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'standing-hip-abduction.gif'
  },
  {
    id: 'one-arm-face-pull',
    name: "One Brazo Face Jalón",
    muscleGroup: 'espalda',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'one-arm-face-pull.gif'
  },
  {
    id: 'rotary-calf-machine',
    name: "Rotary Gemelos Máquina (Máquina)",
    muscleGroup: 'gemelos',
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: 12,
    image: 'rotary-calf-machine.gif'
  },
  {
    id: 'ski-ergometer',
    name: "Ski Ergometer",
    muscleGroup: 'cardio',
    equipment: "Peso corporal",
    defaultSets: 1,
    defaultReps: 1,
    image: 'ski-ergometer.gif'
  },
  {
    id: 'kick-boxing',
    name: "Kick Boxing",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'kick-boxing.gif'
  },
  {
    id: 'barbell-incline-rear-delt-row',
    name: "Remo",
    muscleGroup: 'hombros',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'barbell-incline-rear-delt-row.gif'
  },
  {
    id: 'high-pulley-one-arm-cable-row',
    name: "Remo",
    muscleGroup: 'espalda',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'high-pulley-one-arm-cable-row.gif'
  },
  {
    id: 'low-pulley-one-arm-cable-row',
    name: "Remo",
    muscleGroup: 'espalda',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'low-pulley-one-arm-cable-row.gif'
  },
  {
    id: 'kettlebell-single-leg-deadlift',
    name: "Peso Muerto",
    muscleGroup: 'piernas',
    equipment: "Kettlebell",
    defaultSets: 4,
    defaultReps: 8,
    image: 'kettlebell-single-leg-deadlift.gif'
  },
  {
    id: 'mike-tyson-push-ups',
    name: "Flexiones",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'mike-tyson-push-ups.gif'
  },
  {
    id: 'one-arm-kettlebell-swing',
    name: "One Brazo Kettlebell Swing (Kettlebell)",
    muscleGroup: 'piernas',
    equipment: "Kettlebell",
    defaultSets: 3,
    defaultReps: 12,
    image: 'one-arm-kettlebell-swing.gif'
  },
  {
    id: 'low-pulley-cable-rope-row',
    name: "Remo",
    muscleGroup: 'espalda',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'low-pulley-cable-rope-row.gif'
  },
  {
    id: 'seated-cable-rear-lateral-raise',
    name: "Seated Cable Rear Lateral Elevación",
    muscleGroup: 'hombros',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'seated-cable-rear-lateral-raise.gif'
  },
  {
    id: 'cable-rear-lateral-raise',
    name: "Cable Rear Lateral Elevación",
    muscleGroup: 'hombros',
    equipment: "Poleas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'cable-rear-lateral-raise.gif'
  },
  {
    id: 'bird-dog',
    name: "Bird Dog",
    muscleGroup: 'piernas',
    equipment: "Peso corporal",
    defaultSets: 3,
    defaultReps: 12,
    image: 'bird-dog.gif'
  },
  {
    id: 'dumbbell-wrist-supination',
    name: "Mancuernas Wrist Supination (Mancuernas)",
    muscleGroup: 'piernas',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'dumbbell-wrist-supination.gif'
  },
  {
    id: 'dumbbell-wrist-radial-flexion',
    name: "Mancuernas Wrist Radial Flexion (Mancuernas)",
    muscleGroup: 'piernas',
    equipment: "Mancuernas",
    defaultSets: 3,
    defaultReps: 12,
    image: 'dumbbell-wrist-radial-flexion.gif'
  },
  {
    id: 'chest-supported-t-bar-row',
    name: "Remo",
    muscleGroup: 'pecho',
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: 12,
    image: 'chest-supported-t-bar-row.gif'
  },
];
