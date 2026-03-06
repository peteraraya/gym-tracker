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
  
  // Guardar con Enter (para teclados físicos)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };
  
  // Botón de limpiar todo
  const handleClear = () => {
    setTempValue('');
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleCancel}
      title={title}
    >
      <div className="space-y-2 p-3 pb-2 overflow-x-hidden max-w-full" onKeyDown={handleKeyDown}>
        {/* Botones de acción en la parte superior - SIEMPRE VISIBLES */}
        <div className="grid grid-cols-2 gap-2 w-full sticky top-0 bg-white dark:bg-gray-900 z-10 pb-2">
          <button
            onClick={handleCancel}
            className="py-2.5 text-sm font-bold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg active:scale-95 touch-manipulation flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!tempValue || tempValue === '0'}
            className="py-2.5 text-sm font-bold bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg active:scale-95 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Guardar
          </button>
        </div>
        
        {/* Input editable compacto con botón de limpiar */}
        <div className="text-center w-full relative">
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
            className="w-full text-3xl font-bold text-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-300 dark:border-blue-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 py-2 rounded-xl touch-manipulation"
          />
          {/* Botón de limpiar flotante */}
          {tempValue && (
            <button
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full active:scale-95 touch-manipulation"
              aria-label="Limpiar"
            >
              <svg className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Atajos rápidos para repeticiones */}
        {field === 'reps' && (
          <div>
            <p className="text-[9px] text-gray-500 dark:text-gray-400 mb-1 text-center font-medium uppercase tracking-wide">Atajos</p>
            <div className="grid grid-cols-5 gap-1.5">
              {[8, 10, 12, 15, 20].map((num) => (
                <button
                  key={num}
                  onClick={() => setTempValue(String(num))}
                  className={`py-1.5 text-sm font-semibold rounded-lg active:scale-95 ${
                    tempValue === String(num)
                      ? 'bg-blue-500 text-white'
                      : 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                  }`}
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
                <p className="text-[9px] text-gray-500 dark:text-gray-400 mb-1 text-center font-medium uppercase tracking-wide">Anteriores</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {historicalWeights.slice(0, 4).map((weight, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTempValue(String(weight))}
                      className={`py-1.5 text-sm font-semibold rounded-lg active:scale-95 ${
                        tempValue === String(weight)
                          ? 'bg-emerald-500 text-white'
                          : 'bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {weight}kg
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-[9px] text-gray-500 dark:text-gray-400 mb-1 text-center font-medium uppercase tracking-wide">Incrementos</p>
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
          <p className="text-[9px] text-gray-500 dark:text-gray-400 mb-1 text-center font-medium uppercase tracking-wide">Teclado</p>
          <div className="grid grid-cols-3 gap-1.5 w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => setTempValue(prev => prev === '0' ? String(num) : prev + num)}
                className="h-12 text-lg font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg active:scale-95 touch-manipulation select-none"
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
                disabled={tempValue.includes('.')}
                className="h-12 text-lg font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg active:scale-95 touch-manipulation disabled:opacity-30 disabled:cursor-not-allowed"
              >
                .
              </button>
            ) : (
              <button
                onClick={handleClear}
                className="h-12 text-sm font-bold bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-lg active:scale-95 touch-manipulation"
              >
                C
              </button>
            )}
            
            <button
              onClick={() => setTempValue(prev => prev === '0' ? '0' : prev + '0')}
              className="h-12 text-lg font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg active:scale-95 touch-manipulation"
            >
              0
            </button>
            
            {/* Botón borrar */}
            <button
              onClick={() => setTempValue(prev => prev.length > 1 ? prev.slice(0, -1) : '')}
              className="h-12 text-base font-bold bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg active:scale-95 touch-manipulation"
            >
              ⌫
            </button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
