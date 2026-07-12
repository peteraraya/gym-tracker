'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { NumericInput } from '@/components/ui/NumericInput';
import { WeightSelector } from '@/components/features/workout/WeightSelector';
import SetTypeSelector, { SetTypeBadge } from '@/components/features/workout/SetTypeSelector';
import SetTypeCycleButton from '@/components/features/workout/SetTypeCycleButton';
import { Plus } from '@/components/icons/lucide';
import type { Exercise, SetType, Routine } from '@/types';
import { calculateNextRestTime } from '../utils/workoutCalculations';

interface SeriesTableProps {
  exercise: Exercise;
  exerciseId: string;
  completedSets: number;
  actualReps: number[];
  actualWeights: number[];
  setTypes: string[];
  currentSet: number;
  /** Flags explícitos de completado por serie. Solo se activan al pulsar el botón naranja. */
  completedSetFlags?: boolean[];
  onEditReps: (setIndex: number, reps: number) => void;
  onEditWeight: (setIndex: number, weight: number) => void;
  onEditSetType: (setIndex: number, type: SetType) => void;
  onToggleSetComplete: (setIndex: number, isComplete: boolean) => void;
  onAddSet: () => void;
  onDeleteSet?: (setIndex: number) => void;
  perSetRestOverrides?: {[key: string]: number[]};
  onEditRestTime?: (setIndex: number, restTime: number) => void;
  onApplySmartRest?: () => void;
  smartRestTime?: number;
  routine?: Routine;
  restOverrides?: Record<string, number>;
  useSmartRest?: boolean;
}

/**
 * Tabla de series con edición inline
 * 
 * Responsabilidades:
 * - Mostrar todas las series del ejercicio
 * - Permitir edición inline de reps y peso
 * - Mostrar estado de completado
 * - Permitir agregar series
 */
export function SeriesTable({
  exercise,
  exerciseId,
  completedSets,
  actualReps,
  actualWeights,
  setTypes,
  currentSet,
  completedSetFlags,
  onEditReps,
  onEditWeight,
  onEditSetType,
  onToggleSetComplete,
  onAddSet,
  onDeleteSet,
  perSetRestOverrides,
  onEditRestTime,
  onApplySmartRest,
  smartRestTime,
  routine,
  restOverrides = {},
  useSmartRest = true,
}: SeriesTableProps) {
  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null);
  // ✅ State for mobile editing - one state for all sets
  const [mobileEditingField, setMobileEditingField] = useState<{setIndex: number, field: 'reps' | 'weight'} | null>(null);

  // Mostrar series completadas basadas en el contador explícito `completedSets`.
  // Como fallback, usar el cálculo por `actualReps` si `completedSets` no está disponible.
  const actualCompletedSets = typeof completedSets === 'number'
    ? completedSets
    : actualReps.filter(r => typeof r === 'number' && r > 0).length;

  // Calculate correct rest time for each set using the same logic as the timer
  const getRestTimeForSet = (setIndex: number): number => {
    if (!routine) return exercise.restBetweenSets || 90;
    
    return calculateNextRestTime({
      currentExercise: exercise,
      routine,
      restOverrides,
      perSetOverrides: perSetRestOverrides || {},
      currentSet: setIndex + 1, // setIndex is 0-based, currentSet is 1-based
      useSmartRest
    });
  };

  // Get recommended minimum rest time for the exercise
  const getRecommendedMinRestTime = (): number | null => {
    if (!smartRestTime) return null;
    // Minimum is 80% of smart rest recommendation
    return Math.floor(smartRestTime * 0.8);
  };

  // Check if a rest time is below recommended minimum
  const isBelowMinimum = (restTime: number): boolean => {
    const minRest = getRecommendedMinRestTime();
    return minRest !== null && restTime < minRest;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Series del ejercicio</CardTitle>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {actualCompletedSets} de {exercise.sets.length} series completadas
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Mobile set controls - shown above table */}
          <div className="sm:hidden space-y-2">
              {exercise.sets.map((set, idx) => {
                const setType = setTypes[idx] || 'normal';
                const doneReps = actualReps[idx] ?? null;
                const previousWeight = idx > 0 ? (actualWeights[idx - 1] || exercise.sets[idx - 1]?.weight) : undefined;
                const doneWeight = actualWeights[idx] ?? set.weight ?? previousWeight ?? '';
                // Usar flag explícito de completado si está disponible;
                // solo activado al pulsar el botón naranja.
                const isCompleted = completedSetFlags
                  ? Boolean(completedSetFlags[idx])
                  : typeof actualReps[idx] === 'number' && (actualReps[idx] ?? 0) > 0;
              
              // Skip completed sets in mobile view
              if (isCompleted) return null;
              
              // ✅ Use shared state instead of individual useState per item
              const isEditingReps = mobileEditingField?.setIndex === idx && mobileEditingField?.field === 'reps';
              const isEditingWeight = mobileEditingField?.setIndex === idx && mobileEditingField?.field === 'weight';
              
              return (
                <div key={`mobile-controls-${idx}`} className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 p-3 rounded-lg space-y-3">
                  {/* Serie header with number and info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                        idx === currentSet - 1 ? 'bg-blue-600' : 'bg-gray-400 dark:bg-gray-600'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex items-center gap-1 min-w-0">
                        {/* Reps - clickable */}
                        {isEditingReps ? (
                          <NumericInput
                            value={doneReps ?? set.reps}
                            onChange={(v) => onEditReps(idx, v)}
                            onBlur={() => setMobileEditingField(null)}
                            onKeyDown={(e) => (e as React.KeyboardEvent).key === 'Enter' && setMobileEditingField(null)}
                            autoFocus
                            className="w-10 px-1 py-0.5 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs font-semibold border border-blue-500 text-center"
                          />
                        ) : (
                          <button
                            onClick={() => setMobileEditingField({setIndex: idx, field: 'reps'})}
                            className="px-1.5 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xs font-semibold text-gray-900 dark:text-gray-100"
                          >
                            {doneReps ?? set.reps}
                          </button>
                        )}
                        <span className="text-xs text-gray-600 dark:text-gray-400 shrink-0">reps ×</span>
                        
                        {/* Weight - using WeightSelector */}
                        {isEditingWeight ? (
                          <div className="w-14">
                            <WeightSelector
                              value={doneWeight || set.weight || 0}
                              onChange={(weight) => {
                                onEditWeight(idx, weight);
                                setMobileEditingField(null);
                              }}
                              exerciseId={exerciseId}
                              className="text-xs py-0.5"
                            />
                          </div>
                        ) : (
                          <div>
                            <button
                              onClick={() => setMobileEditingField({setIndex: idx, field: 'weight'})}
                              className="px-1.5 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xs font-semibold text-gray-900 dark:text-gray-100"
                            >
                              {doneWeight || set.weight || 0}
                            </button>
                            {/* Hint cuando no hay peso (simplificado) */}
                            {!(typeof doneWeight === 'number' && doneWeight > 0) && (
                              <div className="mt-1 text-[11px] text-gray-500">
                                <span>Toca para editar el peso</span>
                              </div>
                            )}
                          </div>
                        )}
                        <span className="text-xs text-gray-600 dark:text-gray-400 shrink-0">kg</span>
                      </div>
                    </div>
                    {/* Status checkbox */}
                    <button
                      onClick={() => onToggleSetComplete(idx, !isCompleted)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shrink-0 ${
                        isCompleted
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : null}
                    </button>
                  </div>
                  
                  {/* Type and Rest in a row */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Type selector */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Tipo</span>
                      <SetTypeCycleButton
                        value={setType as SetType}
                        onChange={(type) => onEditSetType(idx, type)}
                        size="sm"
                        showLabel={false}
                      />
                    </div>
                    
                    {/* Rest time selector */}
                    {onEditRestTime && (
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Descanso</span>
                        <select
                          value={getRestTimeForSet(idx)}
                          onChange={(e) => onEditRestTime(idx, parseInt(e.target.value))}
                          className={`px-2 py-1.5 rounded text-xs font-medium border focus:ring-2 focus:ring-blue-500 ${
                            isBelowMinimum(getRestTimeForSet(idx))
                              ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-400 dark:border-orange-600 text-orange-900 dark:text-orange-100'
                              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100'
                          }`}
                          style={{
                            // Forzar fondo blanco en las opciones del dropdown
                            colorScheme: 'light'
                          }}
                        >
                          {Array.from({ length: 61 }, (_, i) => (i + 1) * 5).map(s => {
                            const mins = Math.floor(s / 60);
                            const secs = s % 60;
                            const label = mins > 0 ? `${mins}m ${secs}s` : `${s}s`;
                            const isLow = isBelowMinimum(s);
                            return (
                              <option 
                                key={s} 
                                value={s}
                                className="bg-white text-gray-900"
                                style={{
                                  backgroundColor: isLow ? '#fff3cd' : '#ffffff',
                                  color: '#000000'
                                }}
                              >
                                {isLow ? '⚠️ ' : ''}{label}
                              </option>
                            );
                          })}
                        </select>
                        {isBelowMinimum(getRestTimeForSet(idx)) && (
                          <span className="text-[9px] text-orange-600 dark:text-orange-400 font-medium">
                            ⚠️ Bajo mínimo recomendado
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">Serie</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">Reps</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">Peso (kg)</th>
                <th className="hidden sm:table-cell text-left py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">Descanso (s)</th>
                <th className="hidden sm:table-cell text-left py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">Tipo</th>
                <th className="text-center py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">Estado</th>
                {onDeleteSet && exercise.sets.length > 1 && (
                  <th className="text-center py-2 px-2 font-semibold text-gray-700 dark:text-gray-300 w-12"></th>
                )}
              </tr>
            </thead>
            <tbody>
              {exercise.sets.map((set, idx) => {
                const doneReps = actualReps[idx] ?? null;
                const previousWeight = idx > 0 ? (actualWeights[idx - 1] || exercise.sets[idx - 1]?.weight) : undefined;
                const doneWeight = actualWeights[idx] ?? set.weight ?? previousWeight ?? '';
                const setType = setTypes[idx] || 'normal';
                // Usar flag explícito de completado si está disponible;
                // solo activado al pulsar el botón naranja.
                const isCompleted = completedSetFlags
                  ? Boolean(completedSetFlags[idx])
                  : typeof actualReps[idx] === 'number' && (actualReps[idx] ?? 0) > 0;
                const isCurrent = idx === currentSet - 1;

                return (
                  <tr
                    key={`${exerciseId}-set-${idx}`}
                    className={`border-b border-gray-100 dark:border-gray-800 transition-colors ${
                      isCompleted
                        ? 'bg-green-50 dark:bg-green-900/20'
                        : isCurrent
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-900/50'
                    }`}
                  >
                    {/* Serie */}
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCurrent
                            ? 'bg-blue-600 text-white'
                            : isCompleted
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                        }`}>
                          {idx + 1}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100 hidden sm:inline">
                          Serie {idx + 1}
                        </span>
                      </div>
                    </td>

                    {/* Reps */}
                    <td className="py-3 px-2">
                      {editingSetIndex === idx ? (
                        <NumericInput
                          value={doneReps ?? set.reps}
                          onChange={(v) => onEditReps(idx, v)}
                          onBlur={() => setEditingSetIndex(null)}
                          autoFocus
                          min={0}
                          max={100}
                          className="w-16 text-center"
                        />
                      ) : (
                        <button
                          onClick={() => setEditingSetIndex(idx)}
                          className="px-2 py-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        >
                          {isCompleted ? (
                            <span className="font-semibold text-green-700 dark:text-green-400">{doneReps}</span>
                          ) : (
                            <span className="text-gray-600 dark:text-gray-400">{set.reps}</span>
                          )}
                        </button>
                      )}
                    </td>

                    {/* Peso */}
                    <td className="py-3 px-2">
                      <div className="flex flex-col">
                        <WeightSelector
                          value={doneWeight}
                          onChange={(weight) => onEditWeight(idx, weight)}
                          exerciseId={exerciseId}
                        />
                        {/* Hint cuando no hay peso */}
                        {!(typeof doneWeight === 'number' && doneWeight > 0) && (
                          <div className="mt-1 text-[11px] text-gray-500">
                            {idx > 0 && (actualWeights[idx - 1] || exercise.sets[idx - 1]?.weight) ? (
                              <button
                                onClick={() => onEditWeight(idx, (actualWeights[idx - 1] || exercise.sets[idx - 1]?.weight) as number)}
                                className="text-blue-600 dark:text-blue-400 underline text-[11px]"
                              >
                                Usar anterior {(actualWeights[idx - 1] || exercise.sets[idx - 1]?.weight)}kg
                              </button>
                            ) : (
                              <span>Toca para editar el peso</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Descanso personalizado - Hidden on mobile */}
                    <td className="hidden sm:table-cell py-3 px-2">
                      {onEditRestTime && (
                        <div className="flex flex-col gap-0.5">
                          <select
                            value={getRestTimeForSet(idx)}
                            onChange={(e) => onEditRestTime(idx, parseInt(e.target.value))}
                            className={`w-full px-2 py-1 rounded text-xs border ${
                              isBelowMinimum(getRestTimeForSet(idx))
                                ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-400 dark:border-orange-600 text-orange-900 dark:text-orange-100'
                                : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100'
                            }`}
                            style={{
                              // Forzar fondo blanco en las opciones del dropdown
                              colorScheme: 'light'
                            }}
                          >
                            {Array.from({ length: 61 }, (_, i) => (i + 1) * 5).map(s => {
                              const mins = Math.floor(s / 60);
                              const secs = s % 60;
                              const label = mins > 0 ? `${mins}m ${secs}s` : `${s}s`;
                              const isLow = isBelowMinimum(s);
                              return (
                                <option 
                                  key={s} 
                                  value={s}
                                  className="bg-white text-gray-900"
                                  style={{
                                    backgroundColor: isLow ? '#fff3cd' : '#ffffff',
                                    color: '#000000'
                                  }}
                                >
                                  {isLow ? '⚠️ ' : ''}{label}
                                </option>
                              );
                            })}
                          </select>
                          {isBelowMinimum(getRestTimeForSet(idx)) && (
                            <span className="text-[9px] text-orange-600 dark:text-orange-400 font-medium">
                              ⚠️ Bajo mínimo
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Tipo de serie - Hidden on mobile */}
                    <td className="hidden sm:table-cell py-3 px-2">
                      {isCompleted ? (
                        <SetTypeBadge type={setType as SetType} />
                      ) : (
                        <SetTypeCycleButton
                          value={setType as SetType}
                          onChange={(type) => onEditSetType(idx, type)}
                          size="sm"
                          showLabel={false}
                        />
                      )}
                    </td>

                    {/* Checkbox animado */}
                    <td className="py-3 px-2 text-center">
                      <motion.button
                        onClick={() => onToggleSetComplete(idx, !isCompleted)}
                        whileTap={{ scale: 0.8 }}
                        animate={isCompleted
                          ? { scale: [1, 1.3, 1], backgroundColor: '#22c55e' }
                          : { scale: 1, backgroundColor: '' }
                        }
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? 'bg-green-500 text-white shadow-md shadow-green-400/40'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                        }`}
                      >
                        <AnimatePresence mode="wait">
                          {isCompleted ? (
                            <motion.svg
                              key="checked"
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              transition={{ duration: 0.18, type: 'spring', stiffness: 400 }}
                            >
                              <motion.path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.22, ease: 'easeOut' }}
                              />
                            </motion.svg>
                          ) : (
                            <motion.svg
                              key="unchecked"
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.12 }}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </motion.svg>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </td>

                    {/* Delete button */}
                    {onDeleteSet && exercise.sets.length > 1 && (
                      <td className="py-3 px-2 text-center">
                        <button
                          onClick={() => onDeleteSet(idx)}
                          className="w-6 h-6 rounded-full flex items-center justify-center transition-all bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400"
                          title="Eliminar serie"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Smart rest button */}
        {onApplySmartRest && (
          <button
            onClick={onApplySmartRest}
            disabled={!smartRestTime}
            className={`w-full mb-3 py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
              smartRestTime
                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                : 'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
            }`}
            title={smartRestTime ? 'Aplicar descanso inteligente a todas las series' : 'Descanso inteligente no disponible para este ejercicio'}
          >
            🧠 Aplicar Descanso Inteligente a Todas
            {smartRestTime && (
              <span className="text-xs opacity-75">
                ({(() => {
                  const mins = Math.floor(smartRestTime / 60);
                  const secs = smartRestTime % 60;
                  return mins > 0 ? `${mins}m ${secs}s` : `${smartRestTime}s`;
                })()})
              </span>
            )}
            {!smartRestTime && (
              <span className="text-xs opacity-75">(no configurado)</span>
            )}
          </button>
        )}

        {/* Botón para agregar serie */}
        <button
          onClick={onAddSet}
          className="w-full mt-4 py-3 px-4 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all font-medium flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Agregar Serie
        </button>
        </div>
      </CardContent>
    </Card>
  );
}
