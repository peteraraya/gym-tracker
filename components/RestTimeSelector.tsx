'use client';

import React from 'react';

interface RestTimeSelectorProps {
  value: number; // Valor en segundos
  onChange: (seconds: number) => void;
  label?: string;
  includeZero?: boolean; // Si incluir 0 como opción
  className?: string;
}

/**
 * Genera las opciones de tiempo de descanso de 0 (o 5) a 300 segundos en incrementos de 5s.
 */
function generateTimeOptions(includeZero: boolean): { value: number; label: string }[] {
  const options: { value: number; label: string }[] = [];

  if (includeZero) {
    options.push({ value: 0, label: '0s (Sin descanso)' });
  }

  for (let s = 5; s <= 300; s += 5) {
    const minutes = Math.floor(s / 60);
    const secs = s % 60;
    let label: string;

    if (minutes === 0) {
      label = `${s}s`;
    } else if (secs === 0) {
      label = `${minutes}:00`;
    } else {
      label = `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    options.push({ value: s, label });
  }

  return options;
}

export const RestTimeSelector: React.FC<RestTimeSelectorProps> = ({
  value,
  onChange,
  label,
  includeZero = true,
  className = '',
}) => {
  const options = generateTimeOptions(includeZero);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
          border-gray-300 dark:border-gray-600
          bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
          cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

/**
 * Versión compacta del selector para usar dentro de formularios de ejercicios.
 */
export const RestTimeSelectorCompact: React.FC<{
  value: number | undefined;
  onChange: (seconds: number | undefined) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, placeholder = 'Usar global', className = '' }) => {
  const options = generateTimeOptions(false);

  return (
    <select
      value={value ?? ''}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === '' ? undefined : parseInt(v));
      }}
      className={`px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-pointer ${className}`}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};
