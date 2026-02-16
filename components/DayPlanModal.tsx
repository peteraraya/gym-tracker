"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { Routine } from '@/types';

type DayPlan = { routines: string[]; blocked?: boolean; note?: string };

interface DayPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateKey: string;
  dayPlan: DayPlan;
  routines: Routine[];
  onAddRoutine: (routineId: string) => void;
  onRemoveRoutine: (routineId: string) => void;
  onToggleBlock: () => void;
  onSaveNote: (note: string) => void;
}

export default function DayPlanModal({
  isOpen,
  onClose,
  dateKey,
  dayPlan,
  routines,
  onAddRoutine,
  onRemoveRoutine,
  onToggleBlock,
  onSaveNote
}: DayPlanModalProps) {
  const [note, setNote] = useState(dayPlan.note || '');
  const [selectedRoutineId, setSelectedRoutineId] = useState('');

  // Formatear fecha para mostrar
  const formatDisplayDate = (key: string) => {
    const [year, month, day] = key.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${dayNames[date.getDay()]}, ${day} de ${monthNames[date.getMonth()]} de ${year}`;
  };

  const availableRoutines = routines.filter(r => !dayPlan.routines.includes(r.id));

  const handleAddRoutine = () => {
    if (selectedRoutineId) {
      onAddRoutine(selectedRoutineId);
      setSelectedRoutineId('');
    }
  };

  const handleSaveNote = () => {
    onSaveNote(note);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={formatDisplayDate(dateKey)}>
      <div className="space-y-6">
        {/* Estado del día */}
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
          <div>
            <div className="font-semibold text-gray-100">
              {dayPlan.blocked ? '🔴 Día de Descanso' : '✅ Día Activo'}
            </div>
            <div className="text-sm text-gray-400">
              {dayPlan.blocked ? 'No se pueden agregar rutinas' : `${dayPlan.routines.length} rutina(s) asignada(s)`}
            </div>
          </div>
          <Button
            variant={dayPlan.blocked ? 'primary' : 'danger'}
            size="sm"
            onClick={onToggleBlock}
          >
            {dayPlan.blocked ? 'Desbloquear' : 'Bloquear'}
          </Button>
        </div>

        {!dayPlan.blocked && (
          <>
            {/* Rutinas asignadas */}
            {dayPlan.routines.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-100 mb-3">Rutinas Asignadas</h4>
                <div className="space-y-2">
                  {dayPlan.routines.map(rid => {
                    const routine = routines.find(r => r.id === rid);
                    if (!routine) return null;
                    return (
                      <div key={rid} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-100">{routine.name}</div>
                          <div className="text-xs text-gray-400">{routine.exercises.length} ejercicios</div>
                        </div>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => onRemoveRoutine(rid)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Agregar rutina */}
            {availableRoutines.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-100 mb-3">Agregar Rutina</h4>
                <div className="flex gap-2">
                  <select
                    value={selectedRoutineId}
                    onChange={(e) => setSelectedRoutineId(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar rutina...</option>
                    {availableRoutines.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.exercises.length} ejercicios)
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="primary"
                    onClick={handleAddRoutine}
                    disabled={!selectedRoutineId}
                  >
                    Agregar
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Nota */}
        <div>
          <h4 className="font-semibold text-gray-100 mb-3">Nota del Día</h4>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Agregar nota (opcional)..."
            rows={3}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="mt-2 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveNote}
            >
              Guardar Nota
            </Button>
          </div>
        </div>

        {/* Botón cerrar */}
        <div className="flex justify-end pt-4 border-t border-gray-700">
          <Button variant="primary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
