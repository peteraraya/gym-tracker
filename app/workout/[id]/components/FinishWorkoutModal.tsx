'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

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
  const hours = Math.floor(proposedDuration / 3600);
  const minutes = Math.floor((proposedDuration % 3600) / 60);
  const seconds = proposedDuration % 60;

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
              <input
                type="number"
                min="0"
                max="23"
                value={hours}
                onChange={(e) => {
                  const h = Math.max(0, Math.min(23, parseInt(e.target.value) || 0));
                  updateDuration(h, minutes, seconds);
                }}
                className="w-full p-2 text-center text-lg font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Minutos */}
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1 text-center">
                Minutos
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => {
                  const m = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                  updateDuration(hours, m, seconds);
                }}
                className="w-full p-2 text-center text-lg font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Segundos */}
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1 text-center">
                Segundos
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => {
                  const s = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                  updateDuration(hours, minutes, s);
                }}
                className="w-full p-2 text-center text-lg font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            {isSaving ? 'Guardando...' : 'Guardar Sesión'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
