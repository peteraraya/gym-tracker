'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { WorkoutSession } from '@/types';

interface EditSessionModalProps {
  session: WorkoutSession | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSession: WorkoutSession) => Promise<void>;
}

export function EditSessionModal({ session, isOpen, onClose, onSave }: EditSessionModalProps) {
  const [editedSession, setEditedSession] = useState<WorkoutSession | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedExerciseIndex, setDraggedExerciseIndex] = useState<number | null>(null);
  const [dragOverExerciseIndex, setDragOverExerciseIndex] = useState<number | null>(null);
  const [weightInputs, setWeightInputs] = useState<{[key: string]: string}>({});
  const [collapsedExercises, setCollapsedExercises] = useState<{[key: number]: boolean}>({});

  useEffect(() => {
    if (session) {
      setEditedSession(JSON.parse(JSON.stringify(session)));
    }
  }, [session]);

  if (!editedSession) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editedSession);
      onClose();
    } catch (error) {
      console.error('Error saving session:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateExerciseReps = (exerciseIndex: number, setIndex: number, value: number) => {
    const updated = { ...editedSession };
    if (!updated.exercises[exerciseIndex].actualReps) {
      updated.exercises[exerciseIndex].actualReps = [];
    }
    updated.exercises[exerciseIndex].actualReps[setIndex] = value;
    setEditedSession(updated);
  };

  const updateExerciseWeight = (exerciseIndex: number, setIndex: number, value: number) => {
    const updated = { ...editedSession };
    if (!updated.exercises[exerciseIndex].actualWeight) {
      updated.exercises[exerciseIndex].actualWeight = [];
    }
    updated.exercises[exerciseIndex].actualWeight[setIndex] = value;
    setEditedSession(updated);
  };

  const toggleExerciseCollapse = (exerciseIndex: number) => {
    setCollapsedExercises(prev => ({
      ...prev,
      [exerciseIndex]: !prev[exerciseIndex]
    }));
  };

  const addSet = (exerciseIndex: number) => {
    const updated = { ...editedSession };
    const exercise = updated.exercises[exerciseIndex];
    
    // Inicializar arrays si no existen
    if (!exercise.actualReps) exercise.actualReps = [];
    if (!exercise.actualWeight) exercise.actualWeight = [];
    
    // Obtener valores de la última serie para copiarlos
    const lastReps = exercise.actualReps.length > 0 
      ? exercise.actualReps[exercise.actualReps.length - 1] 
      : 0;
    const lastWeight = exercise.actualWeight.length > 0 
      ? exercise.actualWeight[exercise.actualWeight.length - 1] 
      : 0;
    
    // Agregar nueva serie con los valores de la última serie
    exercise.actualReps.push(lastReps);
    exercise.actualWeight.push(lastWeight);
    
    setEditedSession(updated);
  };

  const removeExercise = (exerciseIndex: number) => {
    const updated = { ...editedSession };
    
    // No permitir eliminar si solo hay un ejercicio
    if (updated.exercises.length <= 1) {
      return;
    }
    
    // Eliminar el ejercicio
    updated.exercises.splice(exerciseIndex, 1);
    setEditedSession(updated);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updated = { ...editedSession };
    const exercise = updated.exercises[exerciseIndex];
    
    // No permitir eliminar si solo hay una serie
    const maxSets = Math.max(
      exercise.actualReps?.length || 0,
      exercise.actualWeight?.length || 0,
      1
    );
    
    if (maxSets <= 1) {
      return;
    }
    
    // Eliminar la serie
    if (exercise.actualReps && exercise.actualReps.length > setIndex) {
      exercise.actualReps.splice(setIndex, 1);
    }
    if (exercise.actualWeight && exercise.actualWeight.length > setIndex) {
      exercise.actualWeight.splice(setIndex, 1);
    }
    
    setEditedSession(updated);
  };

  const moveExercise = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    const updated = { ...editedSession };
    const [movedExercise] = updated.exercises.splice(fromIndex, 1);
    updated.exercises.splice(toIndex, 0, movedExercise);
    setEditedSession(updated);
  };

  const updateDuration = (hours: number, minutes: number, seconds: number) => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    setEditedSession({ ...editedSession, totalDuration: totalSeconds });
  };

  const updateNotes = (notes: string) => {
    setEditedSession({ ...editedSession, notes });
  };

  const updateDate = (dateString: string) => {
    const date = dateString ? new Date(dateString) : new Date();
    setEditedSession({ ...editedSession, date });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="✏️ Editar Sesión"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto p-4">
        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            📅 Fecha del entrenamiento
          </label>
          <input
            type="date"
            value={editedSession.date ? new Date(editedSession.date).toISOString().split('T')[0] : ''}
            onChange={(e) => updateDate(e.target.value)}
            className="w-full p-3 text-base border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Fecha en que se realizó el entrenamiento
          </p>
        </div>

        {/* Duración */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Duración del entrenamiento
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 text-center">
                Horas
              </label>
              <input
                type="number"
                min="0"
                max="23"
                value={Math.floor((editedSession.totalDuration || 0) / 3600)}
                onChange={(e) => {
                  const hours = Math.max(0, Math.min(23, parseInt(e.target.value) || 0));
                  const minutes = Math.floor(((editedSession.totalDuration || 0) % 3600) / 60);
                  const seconds = (editedSession.totalDuration || 0) % 60;
                  updateDuration(hours, minutes, seconds);
                }}
                className="w-full p-2 text-center text-lg font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 text-center">
                Minutos
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={Math.floor(((editedSession.totalDuration || 0) % 3600) / 60)}
                onChange={(e) => {
                  const minutes = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                  const hours = Math.floor((editedSession.totalDuration || 0) / 3600);
                  const seconds = (editedSession.totalDuration || 0) % 60;
                  updateDuration(hours, minutes, seconds);
                }}
                className="w-full p-2 text-center text-lg font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 text-center">
                Segundos
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={(editedSession.totalDuration || 0) % 60}
                onChange={(e) => {
                  const seconds = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                  const hours = Math.floor((editedSession.totalDuration || 0) / 3600);
                  const minutes = Math.floor(((editedSession.totalDuration || 0) % 3600) / 60);
                  updateDuration(hours, minutes, seconds);
                }}
                className="w-full p-2 text-center text-lg font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Ejercicios */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Ejercicios</h3>
            {editedSession.exercises.length > 1 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                💡 Arrastra para reordenar
              </p>
            )}
          </div>
          {editedSession.exercises.map((exercise, exIdx) => {
            const actualReps = exercise.actualReps || [];
            const actualWeights = exercise.actualWeight || [];
            const maxSets = Math.max(actualReps.length, actualWeights.length, 1);
            const isCollapsed = collapsedExercises[exIdx] || false;
            
            return (
              <div 
                key={`${exercise.exerciseId}-${exIdx}`} 
                draggable={editedSession.exercises.length > 1}
                onDragStart={() => setDraggedExerciseIndex(exIdx)}
                onDragEnd={() => {
                  setDraggedExerciseIndex(null);
                  setDragOverExerciseIndex(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverExerciseIndex(exIdx);
                }}
                onDragLeave={() => setDragOverExerciseIndex(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedExerciseIndex !== null && draggedExerciseIndex !== exIdx) {
                    moveExercise(draggedExerciseIndex, exIdx);
                  }
                  setDraggedExerciseIndex(null);
                  setDragOverExerciseIndex(null);
                }}
                className={`border rounded-lg transition-all ${
                  dragOverExerciseIndex === exIdx && draggedExerciseIndex !== exIdx
                    ? 'border-blue-500 scale-105 shadow-lg bg-blue-50 dark:bg-blue-900/20'
                    : draggedExerciseIndex === exIdx
                    ? 'opacity-50 border-gray-300 dark:border-gray-600'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                } ${editedSession.exercises.length > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
              >
                {/* Header clickeable para collapse */}
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                  onClick={() => toggleExerciseCollapse(exIdx)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {/* Drag handle */}
                    {editedSession.exercises.length > 1 && (
                      <div 
                        className="flex-shrink-0 text-gray-400 dark:text-gray-500 cursor-grab"
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <circle cx="4" cy="4" r="1.5" />
                          <circle cx="4" cy="8" r="1.5" />
                          <circle cx="4" cy="12" r="1.5" />
                          <circle cx="12" cy="4" r="1.5" />
                          <circle cx="12" cy="8" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Icono de collapse/expand */}
                    <div className="flex-shrink-0">
                      <svg 
                        className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {exIdx + 1}. {exercise.exerciseName}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {maxSets} serie{maxSets !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addSet(exIdx);
                      }}
                      className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                      title="Agregar serie"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Serie
                    </button>
                    {editedSession.exercises.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeExercise(exIdx);
                        }}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                        title="Eliminar ejercicio"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Ejercicio
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Contenido colapsable */}
                {!isCollapsed && (
                  <div className="p-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-300 dark:border-gray-600">
                          <th className="text-left py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">#</th>
                          <th className="text-center py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">Reps</th>
                          <th className="text-center py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">Peso (kg)</th>
                          <th className="text-center py-2 px-2 font-semibold text-gray-700 dark:text-gray-300 w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: maxSets }).map((_, setIdx) => (
                          <tr key={setIdx} className="border-b border-gray-200 dark:border-gray-700">
                            <td className="py-2 px-2 text-gray-600 dark:text-gray-400">{setIdx + 1}</td>
                            <td className="py-2 px-2">
                              <input
                                type="number"
                                min="0"
                                value={actualReps[setIdx] || ''}
                                placeholder="0"
                                onChange={(e) => updateExerciseReps(exIdx, setIdx, parseInt(e.target.value) || 0)}
                                onFocus={(e) => e.target.select()}
                                className="w-full p-2 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={weightInputs[`${exIdx}-${setIdx}`] ?? (actualWeights[setIdx] || '')}
                                placeholder="0"
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const key = `${exIdx}-${setIdx}`;
                                  
                                  // Guardar el valor del input tal cual
                                  setWeightInputs(prev => ({ ...prev, [key]: value }));
                                  
                                  // Convertir coma a punto
                                  const normalizedValue = value.replace(',', '.');
                                  
                                  // Si es vacío o solo punto, guardar 0
                                  if (normalizedValue === '' || normalizedValue === '.') {
                                    updateExerciseWeight(exIdx, setIdx, 0);
                                    return;
                                  }
                                  
                                  // Intentar parsear
                                  const numValue = parseFloat(normalizedValue);
                                  if (!isNaN(numValue) && numValue >= 0) {
                                    updateExerciseWeight(exIdx, setIdx, numValue);
                                  }
                                }}
                                onBlur={() => {
                                  // Al perder foco, limpiar el estado local para que use el valor numérico
                                  const key = `${exIdx}-${setIdx}`;
                                  setWeightInputs(prev => {
                                    const newInputs = { ...prev };
                                    delete newInputs[key];
                                    return newInputs;
                                  });
                                }}
                                onFocus={(e) => e.target.select()}
                                className="w-full p-2 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                              />
                            </td>
                            <td className="py-2 px-2">
                              {maxSets > 1 && (
                                <button
                                  onClick={() => removeSet(exIdx, setIdx)}
                                  className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                  title="Eliminar serie"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notas (opcional)
          </label>
          <textarea
            value={editedSession.notes || ''}
            onChange={(e) => updateNotes(e.target.value)}
            rows={3}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Agrega notas sobre esta sesión..."
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            className="flex-1"
            disabled={isSaving}
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
