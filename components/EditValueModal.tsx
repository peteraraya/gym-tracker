'use client';

import { useState, useEffect, useCallback } from 'react';
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

function haptic(intensity: 'light' | 'medium' = 'light') {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(intensity === 'light' ? 25 : 55);
  }
}

/**
 * Modal reutilizable para editar reps o peso con teclado numérico estilo calculadora.
 * - El primer dígito tecleado reemplaza el valor actual (no concatena).
 * - Atajos rápidos: guardan y cierran inmediatamente.
 * - Botón ✓ explícito — sin auto-cierre por timer.
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
  const [display, setDisplay] = useState<string>('');
  // replaceNext: el próximo dígito reemplaza todo (comportamiento calculadora)
  const [replaceNext, setReplaceNext] = useState(true);

  const initDisplay = useCallback(() => {
    const v = currentValue === '' || currentValue === 0 ? '' : String(currentValue);
    setDisplay(v);
    setReplaceNext(true);
  }, [currentValue]);

  useEffect(() => {
    if (isOpen) initDisplay();
  }, [isOpen, initDisplay]);

  const numericValue = (): number => {
    if (display === '' || display === '.') return 0;
    const n = field === 'reps' ? parseInt(display) : parseFloat(display);
    return isNaN(n) ? 0 : n;
  };

  const handleDigit = (d: string) => {
    haptic('light');
    setDisplay(prev => {
      if (replaceNext) {
        setReplaceNext(false);
        return d;
      }
      const maxLen = field === 'reps' ? 3 : 5;
      const digits = prev.replace('.', '');
      if (digits.length >= maxLen) return prev;
      return prev === '0' ? d : prev + d;
    });
  };

  const handleDot = () => {
    if (field !== 'weight') return;
    haptic('light');
    setDisplay(prev => {
      if (replaceNext) { setReplaceNext(false); return '0.'; }
      if (prev.includes('.')) return prev;
      return (prev || '0') + '.';
    });
  };

  const handleBackspace = () => {
    haptic('light');
    setDisplay(prev => {
      if (prev.length <= 1) { setReplaceNext(true); return ''; }
      return prev.slice(0, -1);
    });
  };

  const handleClear = () => {
    haptic('medium');
    setDisplay('');
    setReplaceNext(true);
  };

  const handleAdjust = (delta: number) => {
    haptic('medium');
    const current = numericValue();
    const next = Math.max(0, parseFloat((current + delta).toFixed(2)));
    const str = field === 'reps'
      ? String(Math.round(next))
      : (Number.isInteger(next) ? String(next) : String(next));
    setDisplay(str);
    setReplaceNext(false);
  };

  const handleShortcut = (val: number) => {
    haptic('medium');
    onSave(val);
    onClose();
  };

  const handleConfirm = () => {
    const v = numericValue();
    if (v > 0) onSave(v);
    onClose();
  };

  const displayText = display === '' ? '–' : display;
  const isValid = numericValue() > 0;

  const shortcuts: number[] = field === 'reps'
    ? [6, 8, 10, 12, 15, 20]
    : historicalWeights.slice(0, 6);

  const adjustments = field === 'weight'
    ? [{ label: '−5', delta: -5 }, { label: '−2.5', delta: -2.5 }, { label: '+2.5', delta: 2.5 }, { label: '+5', delta: 5 }]
    : [{ label: '−5', delta: -5 }, { label: '−1', delta: -1 }, { label: '+1', delta: 1 }, { label: '+5', delta: 5 }];

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
      <div className="px-3 pb-3 space-y-3">

        {/* Pantalla principal estilo calculadora */}
        <div className="relative flex items-center justify-center bg-gray-900 dark:bg-gray-950 rounded-2xl border border-gray-700 min-h-[72px] px-4">
          <span
            className={`tabular-nums font-bold tracking-tight transition-all ${
              displayText === '–'
                ? 'text-4xl text-gray-500'
                : 'text-5xl text-white'
            }`}
          >
            {displayText}
          </span>
          <span className="absolute right-4 bottom-2.5 text-xs font-semibold text-gray-500 uppercase tracking-widest">
            {field === 'weight' ? 'kg' : 'reps'}
          </span>
          {display && (
            <button
              onClick={handleBackspace}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded-xl active:scale-90 touch-manipulation"
              aria-label="Borrar último"
            >
              ⌫
            </button>
          )}
        </div>

        {/* Fila ajuste ± */}
        <div className="grid grid-cols-4 gap-2">
          {adjustments.map(({ label, delta }) => (
            <button
              key={label}
              onClick={() => handleAdjust(delta)}
              className={`py-3 rounded-xl font-bold text-sm active:scale-95 touch-manipulation border-2 select-none ${
                delta < 0
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                  : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Atajos rápidos / pesos recientes */}
        {shortcuts.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] text-center font-semibold text-gray-400 uppercase tracking-widest">
              {field === 'reps' ? 'Atajos rápidos' : 'Pesos recientes'}
            </p>
            <div className="grid grid-cols-6 gap-1.5">
              {shortcuts.map((val) => (
                <button
                  key={val}
                  onClick={() => handleShortcut(val)}
                  className={`py-2.5 rounded-xl font-bold text-sm active:scale-95 touch-manipulation select-none ${
                    String(val) === display
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => handleDigit(String(n))}
              className="h-14 text-xl font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-xl active:scale-95 touch-manipulation select-none shadow-sm"
            >
              {n}
            </button>
          ))}

          {/* Fila inferior */}
          {field === 'weight' ? (
            <button
              onClick={handleDot}
              disabled={display.includes('.')}
              className="h-14 text-xl font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-xl active:scale-95 touch-manipulation disabled:opacity-30 select-none shadow-sm"
            >
              .
            </button>
          ) : (
            <button
              onClick={handleClear}
              className="h-14 text-sm font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50 rounded-xl active:scale-95 touch-manipulation select-none shadow-sm"
            >
              C
            </button>
          )}

          <button
            onClick={() => handleDigit('0')}
            className="h-14 text-xl font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-xl active:scale-95 touch-manipulation select-none shadow-sm"
          >
            0
          </button>

          <button
            onClick={handleBackspace}
            className="h-14 text-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl active:scale-95 touch-manipulation select-none shadow-sm"
          >
            ⌫
          </button>
        </div>

        {/* Confirmar */}
        <button
          onClick={handleConfirm}
          disabled={!isValid}
          className="w-full py-4 text-xl font-bold rounded-2xl bg-linear-to-r from-blue-500 to-purple-600 text-white shadow-lg active:scale-[0.98] transition-transform disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation select-none"
        >
          ✓ Guardar{isValid ? ` (${display}${field === 'weight' ? ' kg' : ' reps'})` : ''}
        </button>
      </div>
    </BottomSheet>
  );
}
