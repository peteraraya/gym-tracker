'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { BottomSheet } from '@/components/ui/BottomSheet';
import SetTypeCycleButton from '@/components/SetTypeCycleButton';
import type { SetType, Routine } from '@/types';

interface QuickEditModeProps {
  routine: Routine;
  workoutData: {
    completedSets: { [key: string]: number };
    actualReps: { [key: string]: number[] };
    actualWeights: { [key: string]: number[] };
    setTypes: { [key: string]: string[] };
  };
  onEditReps: (exerciseId: string, setIndex: number, reps: number) => void;
  onEditWeight: (exerciseId: string, setIndex: number, weight: number) => void;
  onEditSetType: (exerciseId: string, setIndex: number, type: SetType) => void;
  onToggleSetComplete: (exerciseId: string, setIndex: number, isComplete: boolean) => void;
  onAddSet?: (exerciseId: string) => void;
  onDeleteSet?: (exerciseId: string, setIndex: number) => void;
  onFinishWorkout?: () => void;
}

/**
 * Modo de edición rápida tipo Excel/Hevy
 * Permite ver y editar todos los ejercicios y series en una sola vista
 */
export function QuickEditMode({
  routine,
  workoutData,
  onEditReps,
  onEditWeight,
  onEditSetType,
  onToggleSetComplete,
  onAddSet,
  onDeleteSet,
  onFinishWorkout,
}: QuickEditModeProps) {
  const [editingCell, setEditingCell] = useState<{
    exerciseId: string;
    setIndex: number;
    field: 'reps' | 'weight';
    currentValue: number;
    exerciseName: string;
  } | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [collapsedExercises, setCollapsedExercises] = useState<Set<string>>(new Set());

  // Función para iniciar edición con el valor actual
  const startEditing = (
    exerciseId: string,
    setIndex: number,
    field: 'reps' | 'weight',
    currentValue: number,
    exerciseName: string
  ) => {
    setEditingCell({ exerciseId, setIndex, field, currentValue, exerciseName });
    setTempValue(currentValue === 0 ? '' : String(currentValue));
  };

  // Función para guardar el valor editado
  const saveEdit = () => {
    if (!editingCell) return;
    
    const value = tempValue === '' ? 0 : (editingCell.field === 'reps' ? parseInt(tempValue) : parseFloat(tempValue));
    
    if (!isNaN(value) && value >= 0) {
      if (editingCell.field === 'reps') {
        onEditReps(editingCell.exerciseId, editingCell.setIndex, value);
      } else {
        onEditWeight(editingCell.exerciseId, editingCell.setIndex, value);
      }
    }
    
    setEditingCell(null);
    setTempValue('');
  };

  // Función para cancelar edición
  const cancelEdit = () => {
    setEditingCell(null);
    setTempValue('');
  };

  // Función para toggle collapse de un ejercicio
  const toggleCollapse = (exerciseId: string) => {
    setCollapsedExercises(prev => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId);
      } else {
        newSet.add(exerciseId);
      }
      return newSet;
    });
  };

  // Calcular progreso total - memoizado para evitar recalcular en cada render
  const { totalSets, completedSets, progressPercent } = useMemo(() => {
    const total = routine.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const completed = Object.values(workoutData.actualReps).reduce((sum, reps) => 
      sum + reps.filter(r => r > 0).length, 0
    );
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { totalSets: total, completedSets: completed, progressPercent: percent };
  }, [routine.exercises, workoutData.actualReps]);

  return (
    <div className="space-y-3 pb-32">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-base font-bold mb-0.5">📝 Modo Edición Rápida</h2>
            <p className="text-xs opacity-90">
              Completa o edita cualquier serie directamente
            </p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold">{progressPercent}%</div>
            <div className="text-[10px] opacity-90">{completedSets}/{totalSets} series</div>
          </div>
        </div>
        {/* Barra de progreso */}
        <div className="w-full bg-white/20 rounded-full h-1.5 mt-2">
          <div 
            className="bg-white rounded-full h-1.5 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {routine.exercises.map((exercise, exIdx) => {
        const exerciseId = exercise.id;
        const actualReps = workoutData.actualReps[exerciseId] || [];
        const actualWeights = workoutData.actualWeights[exerciseId] || [];
        const setTypes = workoutData.setTypes[exerciseId] || [];
        
        // Calcular completadas correctamente - solo contar las que tienen reps > 0
        const completedCount = actualReps.filter(r => typeof r === 'number' && r > 0).length;
        const isFullyCompleted = completedCount === exercise.sets.length;
        const isCollapsed = collapsedExercises.has(exerciseId);

        // Auto-colapsar cuando se completa (solo si no está ya colapsado manualmente)
        if (isFullyCompleted && !isCollapsed && completedCount > 0) {
          // Usar setTimeout para evitar actualizar estado durante render
          setTimeout(() => {
            setCollapsedExercises(prev => {
              const newSet = new Set(prev);
              newSet.add(exerciseId);
              return newSet;
            });
          }, 0);
        }

        return (
          <Card key={exerciseId} className="overflow-hidden">
            {/* Header del ejercicio - clickeable para collapse */}
            <button
              onClick={() => toggleCollapse(exerciseId)}
              className="w-full bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 p-2.5 border-b border-gray-200 dark:border-gray-700 hover:from-gray-150 hover:to-gray-100 dark:hover:from-gray-750 dark:hover:to-gray-850 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Icono de collapse */}
                  <svg 
                    className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <div className="text-left">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                      {exIdx + 1}. {exercise.name}
                    </h3>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">
                      {completedCount} de {exercise.sets.length} series completadas
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isFullyCompleted
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : completedCount > 0
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {isFullyCompleted ? '✓' : completedCount > 0 ? '⏳' : '○'} 
                    {completedCount}/{exercise.sets.length}
                  </div>
                </div>
              </div>
            </button>

            {!isCollapsed && (
              <CardContent className="p-0">
              {/* Tabla de series */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-1.5 px-2 font-semibold text-gray-700 dark:text-gray-300 w-8">#</th>
                      <th className="text-center py-1.5 px-2 font-semibold text-gray-700 dark:text-gray-300">Reps</th>
                      <th className="text-center py-1.5 px-2 font-semibold text-gray-700 dark:text-gray-300">Peso</th>
                      <th className="hidden sm:table-cell text-center py-1.5 px-2 font-semibold text-gray-700 dark:text-gray-300">Tipo</th>
                      <th className="text-center py-1.5 px-2 font-semibold text-gray-700 dark:text-gray-300 w-12">✓</th>
                      {onDeleteSet && exercise.sets.length > 1 && (
                        <th className="text-center py-1.5 px-2 font-semibold text-gray-700 dark:text-gray-300 w-8"></th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {exercise.sets.map((set, setIdx) => {
                      const doneReps = actualReps[setIdx];
                      const doneWeight = actualWeights[setIdx];
                      const setType = setTypes[setIdx] || 'normal';
                      const isCompleted = typeof doneReps === 'number' && doneReps > 0;
                      const isEditingReps = editingCell?.exerciseId === exerciseId && editingCell?.setIndex === setIdx && editingCell?.field === 'reps';
                      const isEditingWeight = editingCell?.exerciseId === exerciseId && editingCell?.setIndex === setIdx && editingCell?.field === 'weight';

                      // Valores a mostrar: si está completada usar doneReps/doneWeight, sino usar defaults
                      const displayReps = isCompleted ? doneReps : (doneReps || set.reps);
                      const displayWeight = doneWeight !== undefined ? doneWeight : (set.weight || 0);

                      return (
                        <tr
                          key={`${exerciseId}-${setIdx}`}
                          className={`border-b border-gray-100 dark:border-gray-800 transition-colors ${
                            isCompleted
                              ? 'bg-green-50/50 dark:bg-green-900/10'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-900/30'
                          }`}
                        >
                          {/* Número de serie */}
                          <td className="py-2 px-2">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isCompleted
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                            }`}>
                              {setIdx + 1}
                            </div>
                          </td>

                          {/* Reps - editable */}
                          <td className="py-2 px-2">
                            <button
                              onClick={() => startEditing(exerciseId, setIdx, 'reps', displayReps, exercise.name)}
                              className={`w-full min-h-[44px] px-3 py-2 rounded-lg transition-colors font-bold text-base border-2 ${
                                displayReps === 0
                                  ? 'text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                  : isCompleted
                                  ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700'
                                  : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                              }`}
                            >
                              {displayReps === 0 ? '-' : displayReps}
                            </button>
                          </td>

                          {/* Peso - editable */}
                          <td className="py-2 px-2">
                            <button
                              onClick={() => startEditing(exerciseId, setIdx, 'weight', displayWeight, exercise.name)}
                              className={`w-full min-h-[44px] px-3 py-2 rounded-lg transition-colors font-bold text-sm border-2 ${
                                displayWeight === 0
                                  ? 'text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                  : isCompleted
                                  ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700'
                                  : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                              }`}
                            >
                              {displayWeight === 0 ? '-' : `${displayWeight} kg`}
                            </button>
                          </td>

                          {/* Tipo de serie */}
                          <td className="hidden sm:table-cell py-2 px-2">
                            <div className="flex justify-center">
                              <SetTypeCycleButton
                                value={setType as SetType}
                                onChange={(type) => onEditSetType(exerciseId, setIdx, type)}
                                size="sm"
                                showLabel={false}
                              />
                            </div>
                          </td>

                          {/* Checkbox de completado */}
                          <td className="py-2 px-2">
                            <div className="flex justify-center">
                              <button
                                onClick={() => {
                                  onToggleSetComplete(exerciseId, setIdx, !isCompleted);
                                }}
                                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-sm ${
                                  isCompleted
                                    ? 'bg-green-500 hover:bg-green-600 text-white scale-110'
                                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-400 dark:text-gray-500'
                                }`}
                              >
                                {isCompleted ? (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Delete button */}
                          {onDeleteSet && exercise.sets.length > 1 && (
                            <td className="py-2 px-2">
                              <div className="flex justify-center">
                                <button
                                  onClick={() => onDeleteSet(exerciseId, setIdx)}
                                  className="w-5 h-5 rounded-full flex items-center justify-center transition-all bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400"
                                  title="Eliminar serie"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Botón para agregar serie */}
              {onAddSet && (
                <div className="mt-2 px-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddSet(exerciseId);
                    }}
                    className="w-full py-2 px-3 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all font-medium text-xs flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar Serie
                  </button>
                </div>
              )}
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Botón flotante para finalizar */}
      {onFinishWorkout && (
        <>
          <div className="fixed bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-gray-900 dark:via-gray-900/95 dark:to-transparent pointer-events-none z-20" />
          
          <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-3">
            <button
              onClick={onFinishWorkout}
              disabled={completedSets === 0}
              className={`w-full py-4 text-base font-bold rounded-xl shadow-2xl transition-all duration-200 flex items-center justify-center gap-2 border-2 border-white/20 ${
                completedSets === 0
                  ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white transform hover:scale-[1.02]'
              }`}
            >
              <span className="text-xl">✅</span>
              <div className="flex flex-col items-start">
                <span>Finalizar Entrenamiento</span>
                <span className="text-[10px] font-normal opacity-90">
                  {completedSets} series completadas
                </span>
              </div>
            </button>
          </div>
        </>
      )}

      {/* Modal de edición */}
      <BottomSheet
        isOpen={editingCell !== null}
        onClose={cancelEdit}
        title={editingCell ? `${editingCell.exerciseName} - Serie ${editingCell.setIndex + 1}` : ''}
      >
        {editingCell && (
          <div className="space-y-6 p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {editingCell.field === 'reps' ? 'Repeticiones' : 'Peso (kg)'}
              </p>
              {/* Input editable grande - SIEMPRE VISIBLE Y ENFOCADO */}
              <input
                type="text"
                inputMode={editingCell.field === 'reps' ? 'numeric' : 'decimal'}
                value={tempValue}
                onChange={(e) => {
                  const value = e.target.value;
                  // Permitir solo números y punto decimal para peso
                  if (editingCell.field === 'weight') {
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setTempValue(value);
                    }
                  } else {
                    // Solo números para reps
                    if (value === '' || /^\d+$/.test(value)) {
                      setTempValue(value);
                    }
                  }
                }}
                onFocus={(e) => e.target.select()}
                autoFocus
                placeholder="Escribe aquí"
                className="w-full text-5xl font-bold text-center bg-transparent border-b-4 border-blue-500 dark:border-blue-400 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-colors py-2 mb-2"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Escribe directamente o usa los botones
              </p>
            </div>

            {/* Atajos rápidos para repeticiones comunes */}
            {editingCell.field === 'reps' && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">Atajos rápidos</p>
                <div className="grid grid-cols-5 gap-2">
                  {[8, 10, 12, 15, 20].map((num) => (
                    <button
                      key={num}
                      onClick={() => setTempValue(String(num))}
                      className="py-2 text-sm font-semibold bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pesos anteriores y atajos para peso */}
            {editingCell.field === 'weight' && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">Pesos anteriores</p>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {(() => {
                      // Obtener pesos únicos del ejercicio actual
                      const exercise = routine.exercises.find(ex => ex.id === editingCell.exerciseId);
                      const historicalWeights = exercise?.sets
                        .map(set => set.weight)
                        .filter((w, i, arr) => w && w > 0 && arr.indexOf(w) === i)
                        .sort((a, b) => (b || 0) - (a || 0))
                        .slice(0, 4) || [];
                      
                      return historicalWeights.length > 0 ? historicalWeights.map((weight) => (
                        <button
                          key={weight}
                          onClick={() => setTempValue(String(weight))}
                          className="py-2 text-sm font-semibold bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors"
                        >
                          {weight}kg
                        </button>
                      )) : (
                        <p className="col-span-4 text-xs text-gray-400 text-center py-2">
                          No hay pesos anteriores
                        </p>
                      );
                    })()}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">Incrementos rápidos</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[2.5, 5, 10, 20].map((increment) => (
                      <button
                        key={increment}
                        onClick={() => {
                          const current = parseFloat(tempValue) || 0;
                          setTempValue(String(current + increment));
                        }}
                        className="py-2 text-sm font-semibold bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                      >
                        +{increment}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Teclado numérico personalizado - OPCIONAL */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">Teclado numérico</p>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => setTempValue(prev => prev === '0' ? String(num) : prev + num)}
                    className="h-16 text-2xl font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors active:scale-95"
                  >
                    {num}
                  </button>
                ))}
                
                {/* Botón decimal solo para peso */}
                {editingCell.field === 'weight' ? (
                  <button
                    onClick={() => {
                      if (!tempValue.includes('.')) {
                        setTempValue(prev => (prev || '0') + '.');
                      }
                    }}
                    className="h-16 text-2xl font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors active:scale-95"
                  >
                    .
                  </button>
                ) : (
                  <div className="h-16" />
                )}
                
                <button
                  onClick={() => setTempValue(prev => prev === '0' ? '0' : prev + '0')}
                  className="h-16 text-2xl font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors active:scale-95"
                >
                  0
                </button>
                
                {/* Botón borrar */}
                <button
                  onClick={() => setTempValue(prev => prev.length > 1 ? prev.slice(0, -1) : '')}
                  className="h-16 text-xl font-bold bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-xl transition-colors active:scale-95"
                >
                  ⌫
                </button>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <button
                onClick={cancelEdit}
                className="py-4 text-base font-bold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveEdit}
                className="py-4 text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
