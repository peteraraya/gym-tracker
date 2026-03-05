'use client';

import { useState, useEffect, useRef } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';

interface EditValueModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  field: 'reps' | 'weight';
  currentValue: number | '';
  onSave: (value: number) => void;
  historicalWeights?: number[];
}

/**
 * Modal reutilizable para editar reps o peso con teclado numérico
 */
export function EditValueModal({
  isOpen,
  onClose,
  title,
  field,
  currentValue,
  onSave,
  historicalWeights = [],
}: EditValueModalProps) {
  const [tempValue, setTempValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Inicializar valor cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      const value = currentValue === '' || currentValue === 0 ? '' : String(currentValue);
      setTempValue(value);
    }
  }, [isOpen, currentValue]);

  // Auto-focus en el input pero prevenir teclado nativo
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const timer = setTimeout(() => {
        // Focus pero sin mostrar el teclado nativo
        inputRef.current?.focus();
        inputRef.current?.select();
        // Blur inmediatamente para ocultar el teclado pero mantener el cursor
        inputRef.current?.blur();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSave = () => {
    const value = tempValue === '' ? 0 : (field === 'reps' ? parseInt(tempValue) : parseFloat(tempValue));
    
    if (!isNaN(value) && value >= 0) {
      onSave(value);
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleCancel}
      title={title}
    >
      <div className="space-y-3 p-4 pb-2 overflow-x-hidden max-w-full">
        {/* Input editable compacto */}
        <div className="text-center w-full">
          <input
            ref={inputRef}
            type="text"
            inputMode="none"
            value={tempValue}
            onChange={(e) => {
              const value = e.target.value;
              if (field === 'weight') {
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setTempValue(value);
                }
              } else {
                if (value === '' || /^\d+$/.test(value)) {
                  setTempValue(value);
                }
              }
            }}
            onFocus={(e) => {
              e.target.blur(); // Prevenir teclado nativo
            }}
            readOnly
            placeholder={field === 'reps' ? 'Reps' : 'Peso (kg)'}
            className="w-full text-4xl font-bold text-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-300 dark:border-blue-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 py-3 rounded-xl touch-manipulation"
          />
        </div>

        {/* Atajos rápidos para repeticiones */}
        {field === 'reps' && (
          <div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1.5 text-center font-medium">ATAJOS RÁPIDOS</p>
            <div className="grid grid-cols-5 gap-1.5">
              {[8, 10, 12, 15, 20].map((num) => (
                <button
                  key={num}
                  onClick={() => setTempValue(String(num))}
                  className="py-1.5 text-sm font-semibold bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg active:scale-95"
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pesos anteriores y atajos para peso */}
        {field === 'weight' && (
          <>
            {historicalWeights.length > 0 && (
              <div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1.5 text-center font-medium">PESOS ANTERIORES</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {historicalWeights.slice(0, 4).map((weight, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTempValue(String(weight))}
                      className="py-1.5 text-sm font-semibold bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg active:scale-95"
                    >
                      {weight}kg
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1.5 text-center font-medium">INCREMENTOS</p>
              <div className="grid grid-cols-4 gap-1.5">
                {[2.5, 5, 10, 20].map((increment) => (
                  <button
                    key={increment}
                    onClick={() => {
                      const current = parseFloat(tempValue) || 0;
                      setTempValue(String(current + increment));
                    }}
                    className="py-1.5 text-sm font-semibold bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg active:scale-95"
                  >
                    +{increment}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Teclado numérico compacto */}
        <div className="w-full">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1.5 text-center font-medium">TECLADO</p>
          <div className="grid grid-cols-3 gap-2 w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => setTempValue(prev => prev === '0' ? String(num) : prev + num)}
                className="h-14 text-xl font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg active:scale-95 touch-manipulation"
              >
                {num}
              </button>
            ))}
            
            {/* Botón decimal solo para peso */}
            {field === 'weight' ? (
              <button
                onClick={() => {
                  if (!tempValue.includes('.')) {
                    setTempValue(prev => (prev || '0') + '.');
                  }
                }}
                className="h-14 text-xl font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg active:scale-95 touch-manipulation"
              >
                .
              </button>
            ) : (
              <div className="h-14" />
            )}
            
            <button
              onClick={() => setTempValue(prev => prev === '0' ? '0' : prev + '0')}
              className="h-14 text-xl font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg active:scale-95 touch-manipulation"
            >
              0
            </button>
            
            {/* Botón borrar */}
            <button
              onClick={() => setTempValue(prev => prev.length > 1 ? prev.slice(0, -1) : '')}
              className="h-14 text-lg font-bold bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg active:scale-95 touch-manipulation"
            >
              ⌫
            </button>
          </div>
        </div>

        {/* Botones de acción compactos */}
        <div className="grid grid-cols-2 gap-2 pt-2 w-full">
          <button
            onClick={handleCancel}
            className="py-3 text-base font-bold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg active:scale-95 touch-manipulation"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="py-3 text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg active:scale-95 touch-manipulation"
          >
            Guardar
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
