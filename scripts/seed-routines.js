require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase credentials. Add SUPABASE_SERVICE_ROLE_KEY to .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const user_id = process.argv[2];
if (!user_id) {
  console.error('Usage: node scripts/seed-routines.js <user_id>');
  console.error('Example: node scripts/seed-routines.js 48T7srRNxO35mAtReK3l2W');
  process.exit(1);
}

const routines = [
  {
    id: 'abb5481a-1064-4f98-afa7-e7cb5829509a',
    name: 'Empuje',
    description: 'Entrenamiento de empuje con mancuernas y barra',
    image: '/images/routines/empuje.jpg',
    restBetweenSets: 60,
    restBetweenExercises: 90,
    createdAt: '2025-03-25T16:16:28.000Z',
    updatedAt: '2025-03-25T16:16:28.000Z',
    exercises: [
      { id: 'e1', name: 'Press de Hombros con Mancuernas', sets: [{ reps: 8, weight: 8, type: 'warmup' }, { reps: 10, weight: 10, type: 'work' }, { reps: 8, weight: 12, type: 'work' }, { reps: 8, weight: 10, type: 'work' }, { reps: 8, weight: 12, type: 'work' }], equipment: 'Mancuernas', notes: 'Tómate un descanso de 1 minuto entre series', restBetweenSets: 60, useSmartRest: false },
      { id: 'e2', name: 'Press Banca con Barra', sets: [{ reps: 8, weight: 35, type: 'warmup' }, { reps: 10, weight: 45, type: 'work' }, { reps: 8, weight: 50, type: 'work' }, { reps: 8, weight: 55, type: 'work' }, { reps: 8, weight: 60, type: 'work' }], equipment: 'Barra', notes: 'Ajusta el peso según tu nivel', restBetweenSets: 60, useSmartRest: false },
      { id: 'e3', name: 'Press Arnold con Mancuernas', sets: [{ reps: 10, weight: 10, type: 'warmup' }, { reps: 10, weight: 12, type: 'work' }, { reps: 8, weight: 14, type: 'work' }, { reps: 8, weight: 12, type: 'work' }, { reps: 8, weight: 14, type: 'work' }], equipment: 'Mancuernas', notes: 'Movimiento fluido de rotación de muñecas', restBetweenSets: 60, useSmartRest: false },
      { id: 'e4', name: 'Press Inclinado con Mancuernas', sets: [{ reps: 10, weight: 10, type: 'warmup' }, { reps: 10, weight: 12, type: 'work' }, { reps: 8, weight: 14, type: 'work' }, { reps: 8, weight: 12, type: 'work' }, { reps: 8, weight: 14, type: 'work' }], equipment: 'Mancuernas', notes: 'Ángulo de 30-45 grados en el banco', restBetweenSets: 60, useSmartRest: false },
      { id: 'e5', name: 'Elevaciones Laterales', sets: [{ reps: 15, weight: 5, type: 'warmup' }, { reps: 15, weight: 10, type: 'work' }, { reps: 12, weight: 12, type: 'work' }, { reps: 12, weight: 12, type: 'work' }, { reps: 12, weight: 12, type: 'work' }], equipment: 'Mancuernas', notes: 'Mantén los codos ligeramente flexionados', restBetweenSets: 45, useSmartRest: false },
      { id: 'e6', name: 'Peso Muerto Húmedo', sets: [{ reps: 8, weight: 60, type: 'warmup' }, { reps: 8, weight: 70, type: 'work' }, { reps: 6, weight: 80, type: 'work' }, { reps: 6, weight: 90, type: 'work' }, { reps: 6, weight: 100, type: 'work' }], equipment: 'Barra', notes: 'Mantén la espalda recta', restBetweenSets: 90, useSmartRest: false }
    ]
  },
  {
    id: '1b717e6c-ce23-434f-9c24-67c3cb2559e5',
    name: 'Tren Superior',
    description: 'Entrenamiento completo de tren superior',
    image: '/images/routines/tren-superior.jpg',
    restBetweenSets: 60,
    restBetweenExercises: 90,
    createdAt: '2025-03-25T16:16:28.000Z',
    updatedAt: '2025-03-25T16:16:28.000Z',
    exercises: [
      { id: 'e1', name: 'Press de Hombros con Barra', sets: [{ reps: 8, weight: 15, type: 'warmup' }, { reps: 10, weight: 20, type: 'work' }, { reps: 8, weight: 25, type: 'work' }, { reps: 8, weight: 20, type: 'work' }, { reps: 8, weight: 25, type: 'work' }], equipment: 'Barra', notes: 'Empuja por encima de tu cabeza', restBetweenSets: 60, useSmartRest: false },
      { id: 'e2', name: 'Press Banca con Barra', sets: [{ reps: 8, weight: 35, type: 'warmup' }, { reps: 10, weight: 45, type: 'work' }, { reps: 8, weight: 50, type: 'work' }, { reps: 8, weight: 55, type: 'work' }, { reps: 8, weight: 60, type: 'work' }], equipment: 'Barra', notes: 'Ajusta el peso según tu nivel', restBetweenSets: 60, useSmartRest: false },
      { id: 'e3', name: 'Press Arnold con Mancuernas', sets: [{ reps: 10, weight: 10, type: 'warmup' }, { reps: 10, weight: 12, type: 'work' }, { reps: 8, weight: 14, type: 'work' }, { reps: 8, weight: 12, type: 'work' }, { reps: 8, weight: 14, type: 'work' }], equipment: 'Mancuernas', notes: 'Movimiento fluido de rotación de muñecas', restBetweenSets: 60, useSmartRest: false },
      { id: 'e4', name: 'Press Inclinado con Mancuernas', sets: [{ reps: 10, weight: 10, type: 'warmup' }, { reps: 10, weight: 12, type: 'work' }, { reps: 8, weight: 14, type: 'work' }, { reps: 8, weight: 12, type: 'work' }, { reps: 8, weight: 14, type: 'work' }], equipment: 'Mancuernas', notes: 'Ángulo de 30-45 grados en el banco', restBetweenSets: 60, useSmartRest: false },
      { id: 'e5', name: 'Curl de Bíceps con Barra', sets: [{ reps: 10, weight: 10, type: 'warmup' }, { reps: 10, weight: 12, type: 'work' }, { reps: 8, weight: 14, type: 'work' }, { reps: 8, weight: 12, type: 'work' }, { reps: 8, weight: 14, type: 'work' }], equipment: 'Barra', notes: 'Flexiona los codos y sube el peso', restBetweenSets: 45, useSmartRest: false },
      { id: 'e6', name: 'Extensión de Tríceps con Cable', sets: [{ reps: 10, weight: 10, type: 'warmup' }, { reps: 10, weight: 12, type: 'work' }, { reps: 8, weight: 14, type: 'work' }, { reps: 8, weight: 12, type: 'work' }, { reps: 8, weight: 14, type: 'work' }], equipment: 'Cable', notes: 'Extiende los brazos hacia arriba', restBetweenSets: 45, useSmartRest: false }
    ]
  },
  {
    id: '854f5c80-c3a6-4b64-b1a4-d0344c9cca68',
    name: 'Pecho',
    description: 'Entrenamiento de pecho',
    image: '/images/routines/pecho.jpg',
    restBetweenSets: 60,
    restBetweenExercises: 90,
    createdAt: '2025-03-25T16:16:28.000Z',
    updatedAt: '2025-03-25T16:16:28.000Z',
    exercises: [
      { id: 'e1', name: 'Press Banca con Barra', sets: [{ reps: 8, weight: 35, type: 'warmup' }, { reps: 10, weight: 45, type: 'work' }, { reps: 8, weight: 50, type: 'work' }, { reps: 8, weight: 55, type: 'work' }, { reps: 8, weight: 60, type: 'work' }], equipment: 'Barra', notes: 'Ajusta el peso según tu nivel', restBetweenSets: 60, useSmartRest: false },
      { id: 'e2', name: 'Press Inclinado con Barra', sets: [{ reps: 8, weight: 35, type: 'warmup' }, { reps: 10, weight: 45, type: 'work' }, { reps: 8, weight: 50, type: 'work' }, { reps: 8, weight: 55, type: 'work' }, { reps: 8, weight: 60, type: 'work' }], equipment: 'Barra', notes: 'Ángulo de 30-45 grados en el banco', restBetweenSets: 60, useSmartRest: false },
      { id: 'e3', name: 'Press Arnold con Mancuernas', sets: [{ reps: 10, weight: 10, type: 'warmup' }, { reps: 10, weight: 12, type: 'work' }, { reps: 8, weight: 14, type: 'work' }, { reps: 8, weight: 12, type: 'work' }, { reps: 8, weight: 14, type: 'work' }], equipment: 'Mancuernas', notes: 'Movimiento fluido de rotación de muñecas', restBetweenSets: 60, useSmartRest: false },
      { id: 'e4', name: 'Press Inclinado con Mancuernas', sets: [{ reps: 10, weight: 10, type: 'warmup' }, { reps: 10, weight: 12, type: 'work' }, { reps: 8, weight: 14, type: 'work' }, { reps: 8, weight: 12, type: 'work' }, { reps: 8, weight: 14, type: 'work' }], equipment: 'Mancuernas', notes: 'Ángulo de 30-45 grados en el banco', restBetweenSets: 60, useSmartRest: false },
      { id: 'e5', name: 'Aperturas con Mancuernas', sets: [{ reps: 10, weight: 10, type: 'warmup' }, { reps: 10, weight: 12, type: 'work' }, { reps: 8, weight: 14, type: 'work' }, { reps: 8, weight: 12, type: 'work' }, { reps: 8, weight: 14, type: 'work' }], equipment: 'Mancuernas', notes: 'Abre y cierra los brazos', restBetweenSets: 60, useSmartRest: false },
      { id: 'e6', name: 'Cruces de Pecho con Cable', sets: [{ reps: 10, weight: 10, type: 'warmup' }, { reps: 10, weight: 12, type: 'work' }, { reps: 8, weight: 14, type: 'work' }, { reps: 8, weight: 12, type: 'work' }, { reps: 8, weight: 14, type: 'work' }], equipment: 'Cable', notes: 'Cruza los brazos frente a ti', restBetweenSets: 60, useSmartRest: false }
    ]
  },
  {
    id: '93797e65-07f9-4ba9-9c9f-bc993bea0723',
    name: 'Pierna',
    description: 'Entrenamiento de piernas',
    image: '/images/routines/pierna.jpg',
    restBetweenSets: 60,
    restBetweenExercises: 90,
    createdAt: '2025-03-25T16:16:28.000Z',
    updatedAt: '2025-03-25T16:16:28.000Z',
    exercises: [
      { id: 'e1', name: 'Sentadilla con Barra', sets: [{ reps: 8, weight: 50, type: 'warmup' }, { reps: 10, weight: 60, type: 'work' }, { reps: 8, weight: 70, type: 'work' }, { reps: 6, weight: 80, type: 'work' }, { reps: 6, weight: 90, type: 'work' }], equipment: 'Barra', notes: 'Baja hasta que los muslos estén paralelos al suelo', restBetweenSets: 90, useSmartRest: false },
      { id: 'e2', name: 'Peso Muerto Húmedo', sets: [{ reps: 8, weight: 60, type: 'warmup' }, { reps: 8, weight: 70, type: 'work' }, { reps: 6, weight: 80, type: 'work' }, { reps: 6, weight: 90, type: 'work' }, { reps: 6, weight: 100, type: 'work' }], equipment: 'Barra', notes: 'Mantén la espalda recta', restBetweenSets: 90, useSmartRest: false },
      { id: 'e3', name: 'Zancadas con Mancuernas', sets: [{ reps: 8, weight: 10, type: 'warmup' }, { reps: 10, weight: 15, type: 'work' }, { reps: 8, weight: 20, type: 'work' }, { reps: 8, weight: 20, type: 'work' }, { reps: 8, weight: 20, type: 'work' }], equipment: 'Mancuernas', notes: 'Da un paso largo y baja', restBetweenSets: 60, useSmartRest: false },
      { id: 'e4', name: 'Prensa de Piernas', sets: [{ reps: 10, weight: 10, type: 'warmup' }, { reps: 10, weight: 12, type: 'work' }, { reps: 8, weight: 14, type: 'work' }, { reps: 8, weight: 12, type: 'work' }, { reps: 8, weight: 14, type: 'work' }], equipment: 'Prensa', notes: 'Baja hasta que las rodillas estén a 90 grados', restBetweenSets: 60, useSmartRest: false },
      { id: 'e5', name: 'Peso Muerto Rumano', sets: [{ reps: 8, weight: 40, type: 'warmup' }, { reps: 10, weight: 50, type: 'work' }, { reps: 8, weight: 60, type: 'work' }, { reps: 6, weight: 70, type: 'work' }, { reps: 6, weight: 80, type: 'work' }], equipment: 'Barra', notes: 'Mantén la barra cerca de las piernas', restBetweenSets: 90, useSmartRest: false },
      { id: 'e6', name: 'Elevación de Talones de Pie', sets: [{ reps: 15, weight: 30, type: 'warmup' }, { reps: 15, weight: 40, type: 'work' }, { reps: 12, weight: 50, type: 'work' }, { reps: 12, weight: 50, type: 'work' }, { reps: 12, weight: 50, type: 'work' }], equipment: 'Mancuerna', notes: 'Sube y baja los talones', restBetweenSets: 45, useSmartRest: false }
    ]
  },
  {
    id: '6d70a23c-a8b1-49e9-b2b3-b438459540df',
    name: 'Espalda',
    description: 'Entrenamiento de espalda',
    image: '/images/routines/espalda.jpg',
    restBetweenSets: 60,
    restBetweenExercises: 90,
    createdAt: '2025-03-25T16:16:28.000Z',
    updatedAt: '2025-03-25T16:16:28.000Z',
    exercises: [
      { id: 'e1', name: 'Dominadas', sets: [{ reps: 8, weight: 0, type: 'warmup' }, { reps: 10, weight: 10, type: 'work' }, { reps: 8, weight: 12, type: 'work' }, { reps: 8, weight: 10, type: 'work' }, { reps: 8, weight: 12, type: 'work' }], equipment: 'Barra', notes: 'Agarre amplio, sube hasta la barbilla', restBetweenSets: 60, useSmartRest: false },
      { id: 'e2', name: 'Remo con Barra', sets: [{ reps: 8, weight: 50, type: 'warmup' }, { reps: 10, weight: 60, type: 'work' }, { reps: 8, weight: 70, type: 'work' }, { reps: 8, weight: 80, type: 'work' }, { reps: 8, weight: 90, type: 'work' }], equipment: 'Barra', notes: 'Jala el peso hasta la cintura', restBetweenSets: 60, useSmartRest: false },
      { id: 'e3', name: 'Peso Muerto Húmedo', sets: [{ reps: 8, weight: 60, type: 'warmup' }, { reps: 8, weight: 70, type: 'work' }, { reps: 6, weight: 80, type: 'work' }, { reps: 6, weight: 90, type: 'work' }, { reps: 6, weight: 100, type: 'work' }], equipment: 'Barra', notes: 'Mantén la espalda recta', restBetweenSets: 90, useSmartRest: false },
      { id: 'e4', name: 'Pull-Up con Barra', sets: [{ reps: 8, weight: 0, type: 'warmup' }, { reps: 10, weight: 10, type: 'work' }, { reps: 8, weight: 12, type: 'work' }, { reps: 8, weight: 10, type: 'work' }, { reps: 8, weight: 12, type: 'work' }], equipment: 'Barra', notes: 'Agarre estrecho, sube hasta la barbilla', restBetweenSets: 60, useSmartRest: false },
      { id: 'e5', name: 'Remo con Mancuernas', sets: [{ reps: 8, weight: 15, type: 'warmup' }, { reps: 10, weight: 20, type: 'work' }, { reps: 8, weight: 25, type: 'work' }, { reps: 8, weight: 20, type: 'work' }, { reps: 8, weight: 25, type: 'work' }], equipment: 'Mancuernas', notes: 'Jala hacia la cadera', restBetweenSets: 60, useSmartRest: false },
      { id: 'e6', name: 'Face Pull con Cable', sets: [{ reps: 10, weight: 10, type: 'warmup' }, { reps: 10, weight: 12, type: 'work' }, { reps: 8, weight: 14, type: 'work' }, { reps: 8, weight: 12, type: 'work' }, { reps: 8, weight: 14, type: 'work' }], equipment: 'Cable', notes: 'Tira hacia la cara', restBetweenSets: 45, useSmartRest: false }
    ]
  },
  {
    id: 'be8bb7fc-7205-477e-bcb6-bb0bf08750c5',
    name: 'Full Body',
    description: 'Entrenamiento completo de cuerpo entero',
    image: '/images/routines/full-body.jpg',
    restBetweenSets: 60,
    restBetweenExercises: 90,
    createdAt: '2025-03-25T16:16:28.000Z',
    updatedAt: '2025-03-25T16:16:28.000Z',
    exercises: [
      { id: 'e1', name: 'Sentadilla con Barra', sets: [{ reps: 8, weight: 50, type: 'warmup' }, { reps: 10, weight: 60, type: 'work' }, { reps: 8, weight: 70, type: 'work' }, { reps: 6, weight: 80, type: 'work' }, { reps: 6, weight: 90, type: 'work' }], equipment: 'Barra', notes: 'Baja hasta que los muslos estén paralelos al suelo', restBetweenSets: 90, useSmartRest: false },
      { id: 'e2', name: 'Press Banca con Barra', sets: [{ reps: 8, weight: 35, type: 'warmup' }, { reps: 10, weight: 45, type: 'work' }, { reps: 8, weight: 50, type: 'work' }, { reps: 8, weight: 55, type: 'work' }, { reps: 8, weight: 60, type: 'work' }], equipment: 'Barra', notes: 'Ajusta el peso según tu nivel', restBetweenSets: 60, useSmartRest: false },
      { id: 'e3', name: 'Remo con Barra', sets: [{ reps: 8, weight: 50, type: 'warmup' }, { reps: 10, weight: 60, type: 'work' }, { reps: 8, weight: 70, type: 'work' }, { reps: 8, weight: 80, type: 'work' }, { reps: 8, weight: 90, type: 'work' }], equipment: 'Barra', notes: 'Jala el peso hasta la cintura', restBetweenSets: 60, useSmartRest: false },
      { id: 'e4', name: 'Press de Hombros con Mancuernas', sets: [{ reps: 8, weight: 8, type: 'warmup' }, { reps: 10, weight: 10, type: 'work' }, { reps: 8, weight: 12, type: 'work' }, { reps: 8, weight: 10, type: 'work' }, { reps: 8, weight: 12, type: 'work' }], equipment: 'Mancuernas', notes: 'Tómate un descanso de 1 minuto entre series', restBetweenSets: 60, useSmartRest: false },
      { id: 'e5', name: 'Peso Muerto Húmedo', sets: [{ reps: 8, weight: 60, type: 'warmup' }, { reps: 8, weight: 70, type: 'work' }, { reps: 6, weight: 80, type: 'work' }, { reps: 6, weight: 90, type: 'work' }, { reps: 6, weight: 100, type: 'work' }], equipment: 'Barra', notes: 'Mantén la espalda recta', restBetweenSets: 90, useSmartRest: false },
      { id: 'e6', name: 'Curl de Bíceps con Barra', sets: [{ reps: 10, weight: 10, type: 'warmup' }, { reps: 10, weight: 12, type: 'work' }, { reps: 8, weight: 14, type: 'work' }, { reps: 8, weight: 12, type: 'work' }, { reps: 8, weight: 14, type: 'work' }], equipment: 'Barra', notes: 'Flexiona los codos y sube el peso', restBetweenSets: 45, useSmartRest: false }
    ]
  }
];

async function seedRoutines() {
  console.log(`Seeding routines for user_id: ${user_id}`);
  let successCount = 0;
  let errorCount = 0;

  for (const routine of routines) {
    try {
      // Check if routine exists
      const { data: existing } = await supabase
        .from('routines')
        .select('id')
        .eq('id', routine.id)
        .single();

      if (!existing) {
        const { data: routineData, error: routineError } = await supabase
          .from('routines')
          .insert({
            id: routine.id,
            user_id: user_id,
            name: routine.name,
            description: routine.description,
            image_url: routine.image,
            rest_between_sets: routine.restBetweenSets,
            rest_between_exercises: routine.restBetweenExercises,
            created_at: routine.createdAt,
            updated_at: routine.updatedAt
          })
          .select()
          .single();

        if (routineError) {
          console.error(`  Error inserting routine "${routine.name}": ${routineError.message}`);
          errorCount++;
          continue;
        }
        console.log(`  Routine "${routine.name}" inserted.`);
      }

      // Delete existing exercises and insert fresh
      const exercisesWithOrder = routine.exercises.map((ex, index) => ({
        routine_id: routine.id,
        name: ex.name,
        sets_data: ex.sets,
        equipment: ex.equipment || null,
        notes: ex.notes || null,
        order_index: index,
        rest_between_sets: ex.restBetweenSets || 60,
        use_smart_rest: ex.useSmartRest || false
      }));

      await supabase.from('exercises').delete().eq('routine_id', routine.id);

      const { error: exercisesError } = await supabase
        .from('exercises')
        .insert(exercisesWithOrder);

      if (exercisesError) {
        console.error(`  Error inserting exercises for "${routine.name}": ${exercisesError.message}`);
        errorCount++;
      } else {
        console.log(`  ${exercisesWithOrder.length} exercises inserted for "${routine.name}".`);
      }

      successCount++;
    } catch (err) {
      console.error(`  Error processing routine "${routine.name}": ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\nDone! Success: ${successCount}, Errors: ${errorCount}`);
  process.exit(errorCount > 0 ? 1 : 0);
}

seedRoutines().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
