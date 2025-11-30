import type { WorkoutSession, Routine, UserProfile } from '@/types';

/**
 * Exporta sesiones de entrenamiento a formato CSV
 */
export function exportSessionsToCSV(sessions: WorkoutSession[]): string {
  const headers = [
    'Date',
    'Routine ID',
    'Exercise ID',
    'Exercise Name',
    'Sets Completed',
    'Reps',
    'Weight (kg)',
    'Notes'
  ];

  const rows = sessions.flatMap(session => 
    session.exercises.map(exercise => ({
      date: new Date(session.date).toISOString().split('T')[0],
      routineId: session.routineId,
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.exerciseName || exercise.exerciseId,
      setsCompleted: exercise.completedSets,
      reps: exercise.actualReps.join(';'),
      weights: exercise.actualWeight.join(';'),
      notes: session.notes || ''
    }))
  );

  const csvRows = [
    headers.join(','),
    ...rows.map(row => [
      row.date,
      row.routineId,
      row.exerciseId,
      `"${row.exerciseName}"`,
      row.setsCompleted,
      `"${row.reps}"`,
      `"${row.weights}"`,
      `"${row.notes}"`
    ].join(','))
  ];

  return csvRows.join('\n');
}

/**
 * Exporta rutinas a formato CSV
 */
export function exportRoutinesToCSV(routines: Routine[]): string {
  const headers = [
    'Routine ID',
    'Routine Name',
    'Description',
    'Exercise ID',
    'Exercise Name',
    'Sets',
    'Reps',
    'Weight (kg)',
    'Notes',
    'Rest Between Sets (s)',
    'Rest Between Exercises (s)'
  ];

  const rows = routines.flatMap(routine =>
    routine.exercises.map(exercise => ({
      routineId: routine.id,
      routineName: routine.name,
      description: routine.description || '',
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight || 0,
      notes: exercise.notes || '',
      restBetweenSets: routine.restBetweenSets || 60,
      restBetweenExercises: routine.restBetweenExercises || 120
    }))
  );

  const csvRows = [
    headers.join(','),
    ...rows.map(row => [
      row.routineId,
      `"${row.routineName}"`,
      `"${row.description}"`,
      row.exerciseId,
      `"${row.exerciseName}"`,
      row.sets,
      row.reps,
      row.weight,
      `"${row.notes}"`,
      row.restBetweenSets,
      row.restBetweenExercises
    ].join(','))
  ];

  return csvRows.join('\n');
}

/**
 * Exporta todos los datos a formato JSON
 */
export function exportToJSON(data: {
  sessions: WorkoutSession[];
  routines: Routine[];
  profile?: UserProfile | null;
}): string {
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    app: 'gym-tracker',
    data: {
      sessions: data.sessions,
      routines: data.routines,
      profile: data.profile
    }
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Descarga un archivo en el navegador
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Importa datos desde formato JSON
 */
export function importFromJSON(jsonString: string): {
  sessions: WorkoutSession[];
  routines: Routine[];
  profile?: UserProfile;
} | null {
  try {
    const data = JSON.parse(jsonString);
    
    // Validar estructura
    if (!data.data || !data.data.sessions || !data.data.routines) {
      throw new Error('Invalid JSON structure');
    }

    return {
      sessions: data.data.sessions,
      routines: data.data.routines,
      profile: data.data.profile
    };
  } catch (error) {
    console.error('Error importing JSON:', error);
    return null;
  }
}

/**
 * Convierte formato Strong App a nuestro formato
 * Strong App CSV format: Date,Workout Name,Exercise Name,Set Order,Weight,Reps,Distance,Seconds,Notes,Workout Notes
 */
export function importFromStrongCSV(csvContent: string): WorkoutSession[] {
  const lines = csvContent.split('\n');
  const sessions: Map<string, WorkoutSession> = new Map();

  // Saltar header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',').map(s => s.replace(/^"|"$/g, ''));
    if (parts.length < 6) continue;

    const [dateStr, workoutName, exerciseName, , weightStr, repsStr] = parts;
    
    const sessionKey = `${dateStr}_${workoutName}`;
    
    if (!sessions.has(sessionKey)) {
      sessions.set(sessionKey, {
        id: `imported_${Date.now()}_${Math.random()}`,
        routineId: 'imported',
        date: new Date(dateStr),
        exercises: [],
        notes: workoutName
      });
    }

    const session = sessions.get(sessionKey)!;
    let exercise = session.exercises.find(e => e.exerciseName === exerciseName);

    if (!exercise) {
      exercise = {
        exerciseId: exerciseName.toLowerCase().replace(/\s+/g, '_'),
        exerciseName,
        completedSets: 0,
        actualReps: [],
        actualWeight: []
      };
      session.exercises.push(exercise);
    }

    exercise.completedSets++;
    exercise.actualReps.push(parseInt(repsStr) || 0);
    exercise.actualWeight.push(parseFloat(weightStr) || 0);
  }

  return Array.from(sessions.values());
}

/**
 * Convierte formato Hevy App a nuestro formato
 * Hevy format es similar pero con columnas adicionales
 */
export function importFromHevyCSV(csvContent: string): WorkoutSession[] {
  const lines = csvContent.split('\n');
  const sessions: Map<string, WorkoutSession> = new Map();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',').map(s => s.replace(/^"|"$/g, ''));
    if (parts.length < 5) continue;

    const [dateStr, exerciseName, , weightStr, repsStr] = parts;
    
    const sessionKey = dateStr;
    
    if (!sessions.has(sessionKey)) {
      sessions.set(sessionKey, {
        id: `imported_hevy_${Date.now()}_${Math.random()}`,
        routineId: 'imported_hevy',
        date: new Date(dateStr),
        exercises: [],
        notes: 'Imported from Hevy'
      });
    }

    const session = sessions.get(sessionKey)!;
    let exercise = session.exercises.find(e => e.exerciseName === exerciseName);

    if (!exercise) {
      exercise = {
        exerciseId: exerciseName.toLowerCase().replace(/\s+/g, '_'),
        exerciseName,
        completedSets: 0,
        actualReps: [],
        actualWeight: []
      };
      session.exercises.push(exercise);
    }

    exercise.completedSets++;
    exercise.actualReps.push(parseInt(repsStr) || 0);
    exercise.actualWeight.push(parseFloat(weightStr) || 0);
  }

  return Array.from(sessions.values());
}

/**
 * Detecta el formato de un archivo CSV
 */
export function detectCSVFormat(csvContent: string): 'strong' | 'hevy' | 'gym-tracker' | 'unknown' {
  const firstLine = csvContent.split('\n')[0].toLowerCase();
  
  if (firstLine.includes('workout name') && firstLine.includes('set order')) {
    return 'strong';
  }
  
  if (firstLine.includes('hevy')) {
    return 'hevy';
  }
  
  if (firstLine.includes('routine id') && firstLine.includes('exercise id')) {
    return 'gym-tracker';
  }
  
  return 'unknown';
}

/**
 * Importa CSV detectando automáticamente el formato
 */
export function importCSVAuto(csvContent: string): WorkoutSession[] | null {
  const format = detectCSVFormat(csvContent);
  
  switch (format) {
    case 'strong':
      return importFromStrongCSV(csvContent);
    case 'hevy':
      return importFromHevyCSV(csvContent);
    case 'gym-tracker':
      // Implementar si necesitas importar tu propio formato
      return null;
    default:
      return null;
  }
}
