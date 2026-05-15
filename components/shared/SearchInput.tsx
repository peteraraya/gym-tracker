'use client';

import { useState, useEffect } from 'react';
import { Search, X } from '@/components/icons/lucide';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  onClear?: () => void;
  autoFocus?: boolean;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = '🔍 Buscar...',
  debounceMs = 0,
  onClear,
  autoFocus = false,
  className = ''
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce logic
  useEffect(() => {
    if (debounceMs === 0) {
      onChange(localValue);
      return;
    }

    const timer = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    onClear?.();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Icon */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <Search className="w-5 h-5" />
      </div>

      {/* Input */}
      <input
        type="search"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full h-12 px-4 pl-12 pr-12 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 transition-all text-base outline-none"
      />

      {/* Clear Button */}
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Limpiar búsqueda"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
