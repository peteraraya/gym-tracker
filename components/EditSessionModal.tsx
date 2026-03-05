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

  const addSet = (exerciseIndex: number) => {
    const updated = { ...editedSession };
    const exercise = updated.exercises[exerciseIndex];
    
    // Agregar una nueva serie con valores por defecto
    if (!exercise.actualReps) exercise.actualReps = [];
    if (!exercise.actualWeight) exercise.actualWeight = [];
    
    exercise.actualReps.push(0);
    exercise.actualWeight.push(0);
    
    setEditedSession(updated);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updated = { ...editedSession };
    const exercise = updated.exercises[exerciseIndex];
    
    // Eliminar la serie en el índice especificado
    if (exercise.actualReps) {
      exercise.actualReps.splice(setIndex, 1);
    }
    if (exercise.actualWeight) {
      exercise.actualWeight.splice(setIndex, 1);
    }
    
    setEditedSession(updated);
  };

  const updateDuration = (hours: number, minutes: number, seconds: number) => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    setEditedSession({ ...editedSession, totalDuration: totalSeconds });
  };

  const updateNotes = (notes: string) => {
    setEditedSession({ ...editedSession, notes });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="✏️ Editar Sesión"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto p-4">
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
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Ejercicios</h3>
          {editedSession.exercises.map((exercise, exIdx) => {
            const actualReps = exercise.actualReps || [];
            const actualWeights = exercise.actualWeight || [];
            const maxSets = Math.max(actualReps.length, actualWeights.length, 1);
            
            return (
              <div key={`${exercise.exerciseId}-${exIdx}`} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    {exIdx + 1}. {exercise.exerciseName}
                  </h4>
                  <button
                    onClick={() => addSet(exIdx)}
                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                    title="Agregar serie"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Serie
                  </button>
                </div>
                
                <div className="overflow-x-auto">
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
                              type="number"
                              min="0"
                              step="0.5"
                              value={actualWeights[setIdx] || ''}
                              placeholder="0"
                              onChange={(e) => updateExerciseWeight(exIdx, setIdx, parseFloat(e.target.value) || 0)}
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
