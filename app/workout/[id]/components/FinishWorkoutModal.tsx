'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { NumericInput } from '@/components/ui/NumericInput';

interface FinishWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposedDuration: number;
  onDurationChange: (duration: number) => void;
  sessionNotes: string;
  onNotesChange: (notes: string) => void;
  onFinish: () => void;
  isSaving: boolean;
}

export function FinishWorkoutModal({
  isOpen,
  onClose,
  proposedDuration,
  onDurationChange,
  sessionNotes,
  onNotesChange,
  onFinish,
  isSaving
}: FinishWorkoutModalProps) {
  // Estado local para aislar los inputs del timer del padre que sigue corriendo
  const [localHours, setLocalHours] = useState(() => Math.floor(proposedDuration / 3600));
  const [localMinutes, setLocalMinutes] = useState(() => Math.floor((proposedDuration % 3600) / 60));
  const [localSeconds, setLocalSeconds] = useState(() => proposedDuration % 60);

  const updateDuration = (h: number, m: number, s: number) => {
    const total = h * 3600 + m * 60 + s;
    onDurationChange(Math.max(total, 60)); // Mínimo 1 minuto
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Finalizar Entrenamiento">
      <div className="space-y-6 p-4">
        {/* Duración */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Duración del Entrenamiento
          </label>
          <div className="grid grid-cols-3 gap-3">
            {/* Horas */}
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1 text-center">
                Horas
              </label>
              <NumericInput
                value={localHours}
                onChange={(v) => {
                  const h = Math.max(0, Math.min(23, v));
                  setLocalHours(h);
                  updateDuration(h, localMinutes, localSeconds);
                }}
                className="p-2 text-center text-lg font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Minutos */}
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1 text-center">
                Minutos
              </label>
              <NumericInput
                value={localMinutes}
                onChange={(v) => {
                  const m = Math.max(0, Math.min(59, v));
                  setLocalMinutes(m);
                  updateDuration(localHours, m, localSeconds);
                }}
                className="p-2 text-center text-lg font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Segundos */}
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1 text-center">
                Segundos
              </label>
              <NumericInput
                value={localSeconds}
                onChange={(v) => {
                  const s = Math.max(0, Math.min(59, v));
                  setLocalSeconds(s);
                  updateDuration(localHours, localMinutes, s);
                }}
                className="p-2 text-center text-lg font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Duración calculada automáticamente. Puedes ajustarla si es necesario.
          </p>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Notas de la Sesión (Opcional)
          </label>
          <textarea
            value={sessionNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="¿Cómo te sentiste? ¿Alguna observación?"
            rows={4}
            className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="secondary"
            disabled={isSaving}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={onFinish}
            disabled={isSaving}
            className="flex-1 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Guardando...</span>
              </span>
            ) : (
              'Guardar Sesión'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
