'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { NumericInput } from '@/components/ui/NumericInput';
import { Spinner } from '@/components/ui/Spinner';

interface FinishWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposedDuration: number;
  onDurationChange: (duration: number) => void;
  sessionNotes: string;
  onNotesChange: (notes: string) => void;
  onFinish: (duration: number) => void;
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

  // Sincronizar con el tiempo real cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setLocalHours(Math.floor(proposedDuration / 3600));
      setLocalMinutes(Math.floor((proposedDuration % 3600) / 60));
      setLocalSeconds(proposedDuration % 60);
    }
  }, [isOpen, proposedDuration]);

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
            onClick={() => {
              // Pasar la duración del estado local directamente para evitar race conditions
              const localDuration = localHours * 3600 + localMinutes * 60 + localSeconds;
              onDurationChange(localDuration);
              onFinish(Math.max(localDuration, 60));
            }}
            disabled={isSaving}
            className="flex-1 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="md" />
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
