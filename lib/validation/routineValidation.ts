/**
 * Validación de rutinas
 * 
 * Funciones de validación para asegurar integridad de datos
 * antes de guardar en storage.
 */

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

interface SetData {
    reps?: number;
    weight?: number;
}

interface ExerciseData {
    name?: string;
    sets?: SetData[];
}

interface RoutineData {
    name?: string;
    description?: string;
    exercises?: ExerciseData[];
    restBetweenSets?: number;
    restBetweenExercises?: number;
}

/**
 * Valida los datos de una rutina antes de guardar
 */
export function validateRoutine(data: RoutineData): ValidationResult {
    const errors: string[] = [];

    // Validar nombre
    if (!data.name || data.name.trim().length === 0) {
        errors.push('El nombre de la rutina es requerido');
    } else if (data.name.length > 100) {
        errors.push('El nombre no puede exceder 100 caracteres');
    }

    // Validar descripción (opcional pero con límite)
    if (data.description && data.description.length > 500) {
        errors.push('La descripción no puede exceder 500 caracteres');
    }

    // Validar ejercicios
    if (!data.exercises || data.exercises.length === 0) {
        errors.push('La rutina debe tener al menos un ejercicio');
    } else {
        data.exercises.forEach((ex, idx) => {
            const exerciseNum = idx + 1;

            if (!ex.name || ex.name.trim().length === 0) {
                errors.push(`Ejercicio ${exerciseNum}: nombre requerido`);
            } else if (ex.name.length > 100) {
                errors.push(`Ejercicio ${exerciseNum}: nombre muy largo`);
            }

            if (!ex.sets || ex.sets.length === 0) {
                errors.push(`Ejercicio ${exerciseNum}: debe tener al menos una serie`);
            } else {
                ex.sets.forEach((set, setIdx) => {
                    const setNum = setIdx + 1;

                    if (set.reps !== undefined && set.reps < 0) {
                        errors.push(`Ejercicio ${exerciseNum}, Serie ${setNum}: reps no puede ser negativo`);
                    }
                    if (set.reps !== undefined && set.reps > 1000) {
                        errors.push(`Ejercicio ${exerciseNum}, Serie ${setNum}: reps excede el máximo (1000)`);
                    }
                    if (set.weight !== undefined && set.weight < 0) {
                        errors.push(`Ejercicio ${exerciseNum}, Serie ${setNum}: peso no puede ser negativo`);
                    }
                    if (set.weight !== undefined && set.weight > 10000) {
                        errors.push(`Ejercicio ${exerciseNum}, Serie ${setNum}: peso excede el máximo (10000kg)`);
                    }
                });
            }
        });
    }

    // Validar tiempos de descanso
    if (data.restBetweenSets !== undefined) {
        if (data.restBetweenSets < 0) {
            errors.push('El descanso entre series no puede ser negativo');
        } else if (data.restBetweenSets > 600) {
            errors.push('El descanso entre series no puede exceder 10 minutos');
        }
    }

    if (data.restBetweenExercises !== undefined) {
        if (data.restBetweenExercises < 0) {
            errors.push('El descanso entre ejercicios no puede ser negativo');
        } else if (data.restBetweenExercises > 900) {
            errors.push('El descanso entre ejercicios no puede exceder 15 minutos');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Valida datos de sesión de workout
 */
export function validateSession(data: {
    routineId?: string;
    exercises?: Array<{
        exerciseId?: string;
        actualReps?: number[];
        actualWeight?: number[];
    }>;
}): ValidationResult {
    const errors: string[] = [];

    if (!data.routineId || data.routineId.trim().length === 0) {
        errors.push('ID de rutina requerido');
    }

    if (!data.exercises || data.exercises.length === 0) {
        errors.push('La sesión debe contener al menos un ejercicio');
    } else {
        data.exercises.forEach((ex, idx) => {
            if (!ex.exerciseId) {
                errors.push(`Ejercicio ${idx + 1}: ID requerido`);
            }

            // Verificar que reps y weights tengan la misma longitud
            const repsLen = ex.actualReps?.length || 0;
            const weightsLen = ex.actualWeight?.length || 0;

            if (repsLen !== weightsLen) {
                errors.push(`Ejercicio ${idx + 1}: número de reps y pesos no coincide`);
            }
        });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}
