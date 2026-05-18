'use client';

import React, { useState, useEffect, useRef } from 'react';

interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  /**
   * Valor controlado. Se acepta `number | ''`. Un valor 0 se muestra como vacío
   * solo si fue el resultado de que el usuario borró el campo (round-trip).
   * En el montaje inicial, 0 se muestra como '0'.
   */
  value: number | '';
  /**
   * Callback con el valor numérico parseado. Recibe `0` cuando el campo se borra.
   */
  onChange: (value: number) => void;
  /** Permite separador decimal (punto o coma). Por defecto: false (solo enteros). */
  allowDecimal?: boolean;
  /** Etiqueta opcional renderizada encima del input. */
  label?: string;
  /** Mensaje de error opcional renderizado debajo del input. */
  error?: string;
}

/**
 * Input numérico controlado que resuelve el bug "se queda el 0 al borrar".
 *
 * Comportamiento:
 * - Muestra el valor inicial tal cual (incluyendo '0').
 * - Cuando el usuario borra el campo, muestra vacío y emite 0 al padre.
 * - Si el padre devuelve 0 (round-trip), NO sobreescribe el display vacío.
 * - Si el padre cambia el valor a uno distinto del último emitido (cambio externo),
 *   sincroniza el display.
 * - Acepta coma o punto como separador decimal (cuando allowDecimal=true).
 * - Rechaza caracteres no numéricos.
 */
export const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  (
    {
      value,
      onChange,
      allowDecimal = false,
      label,
      error,
      className = '',
      onBlur,
      onFocus,
      ...rest
    },
    ref
  ) => {
    const [display, setDisplay] = useState<string>(
      value === '' ? '' : String(value)
    );

    /**
     * Rastreamos el último valor numérico que emitimos para distinguir
     * el "rebote" de nuestro propio onChange del cambio externo/programático.
     */
    const lastEmittedRef = useRef<number>(value === '' ? 0 : (value as number));

    const id = (rest as Record<string, unknown>).id as string | undefined
      || (rest as Record<string, unknown>).name as string | undefined;
    const errorId = id ? `${id}-error` : undefined;

    useEffect(() => {
      const incoming = value === '' ? 0 : (value as number);
      if (incoming !== lastEmittedRef.current) {
        // Cambio externo/programático — sincronizar display
        lastEmittedRef.current = incoming;
        setDisplay(incoming === 0 ? '' : String(incoming));
      }
      // Si incoming === lastEmittedRef, es el rebote de nuestro propio onChange — ignorar
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const pattern = allowDecimal ? /^[0-9]*[.,]?[0-9]*$/ : /^[0-9]*$/;
      if (raw !== '' && !pattern.test(raw)) return; // rechazar caracteres inválidos

      setDisplay(raw);

      if (raw === '' || raw === '.' || raw === ',') {
        lastEmittedRef.current = 0; // esperamos que el padre devuelva 0
        onChange(0);
      } else {
        const normalized = allowDecimal ? raw.replace(',', '.') : raw;
        const num = allowDecimal
          ? parseFloat(normalized)
          : parseInt(normalized, 10);
        if (!isNaN(num)) {
          lastEmittedRef.current = num;
          onChange(num);
        }
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Normalizar display al perder foco (ej: "100." → "100")
      if (display === '.' || display === ',') {
        setDisplay('');
        lastEmittedRef.current = 0;
        onChange(0);
      } else if (display !== '') {
        const normalized = allowDecimal ? display.replace(',', '.') : display;
        const num = allowDecimal
          ? parseFloat(normalized)
          : parseInt(normalized, 10);
        if (!isNaN(num)) {
          const str = String(num);
          if (str !== display) setDisplay(str);
        }
      }
      onBlur?.(e);
    };

    const inputEl = (
      <input
        ref={ref}
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...rest}
        type="text"
        inputMode={allowDecimal ? 'decimal' : 'numeric'}
        value={display}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={onFocus}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
          ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
          bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
          placeholder-gray-400 dark:placeholder-gray-500
          ${className}`}
      />
    );

    if (!label && !error) return inputEl;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
          </label>
        )}
        {inputEl}
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);

NumericInput.displayName = 'NumericInput';
