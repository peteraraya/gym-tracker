import { useState, useCallback } from 'react';

interface UseNumberInputOptions {
  min?: number;
  max?: number;
  defaultValue?: number;
  allowEmpty?: boolean; // Si permite campo vacío temporalmente
  onValidChange?: (value: number) => void;
}

/**
 * Hook para manejar inputs numéricos con validación en tiempo real
 * - Permite campo vacío mientras el usuario edita
 * - Convierte valores inválidos a 0 internamente
 * - No muestra "0" cuando el campo está vacío
 * - Valida min/max en tiempo real
 */
export function useNumberInput(options: UseNumberInputOptions = {}) {
  const {
    min = 0,
    max,
    defaultValue = 0,
    allowEmpty = true,
    onValidChange
  } = options;

  const [displayValue, setDisplayValue] = useState<string>(
    defaultValue === 0 && allowEmpty ? '' : String(defaultValue)
  );
  const [internalValue, setInternalValue] = useState<number>(defaultValue);
  const [error, setError] = useState<string>('');

  const handleChange = useCallback((value: string) => {
    setDisplayValue(value);

    // Si está vacío
    if (value === '' || value === '-') {
      if (allowEmpty) {
        setInternalValue(0);
        setError('');
        onValidChange?.(0);
      } else {
        setError('Campo requerido');
      }
      return;
    }

    // Parsear valor
    const numValue = parseFloat(value);

    // Si es NaN
    if (isNaN(numValue)) {
      setInternalValue(0);
      setError('Valor inválido');
      return;
    }

    // Validar min
    if (numValue < min) {
      setInternalValue(numValue);
      setError(`Mínimo: ${min}`);
      return;
    }

    // Validar max
    if (max !== undefined && numValue > max) {
      setInternalValue(numValue);
      setError(`Máximo: ${max}`);
      return;
    }

    // Valor válido
    setInternalValue(numValue);
    setError('');
    onValidChange?.(numValue);
  }, [min, max, allowEmpty, onValidChange]);

  const setValue = useCallback((value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) {
      setDisplayValue('');
      setInternalValue(0);
    } else {
      setDisplayValue(String(numValue));
      setInternalValue(numValue);
    }
    setError('');
  }, []);

  const reset = useCallback(() => {
    setDisplayValue(defaultValue === 0 && allowEmpty ? '' : String(defaultValue));
    setInternalValue(defaultValue);
    setError('');
  }, [defaultValue, allowEmpty]);

  return {
    displayValue,
    value: internalValue,
    error,
    handleChange,
    setValue,
    reset,
    isValid: error === ''
  };
}
